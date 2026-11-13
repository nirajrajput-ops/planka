/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import truncate from 'lodash/truncate';
import { call, fork, put, select, take } from 'redux-saga/effects';

import { goToBoard, goToProject } from './router';
import { openModal } from './modals';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import buildSearchParts from '../../../utils/build-search-parts';
import pendoTrack from '../../../utils/pendo-track';
import { createLocalId } from '../../../utils/local-id';
import { rememberBoardView } from '../../../utils/board-view-memory';
import ActionTypes from '../../../constants/ActionTypes';
import ModalTypes from '../../../constants/ModalTypes';
import { BoardContexts } from '../../../constants/Enums';

// Compiled the way the Board model compiles a `/` search, so a pattern the board
// gives up on (and shows no cards for) is reported as an invalid one.
const isRegexValid = (pattern) => {
  try {
    RegExp(pattern, 'i');
  } catch {
    return false;
  }

  return true;
};

export function* createBoard(projectId, { import: boardImport, ...data }) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextBoardPosition, projectId),
  };

  yield put(
    actions.createBoard({
      ...nextData,
      projectId,
      id: localId,
    }),
  );

  // TODO: use race instead
  const watchForCreateBoardActionTask = yield fork(function* watchForCreateBoardAction() {
    yield take(ActionTypes.BOARD_CREATE);
  });

  let board;
  let boardMemberships;

  try {
    ({
      item: board,
      included: { boardMemberships },
    } = yield boardImport
      ? call(
          request,
          api.createBoardWithImport,
          projectId,
          {
            ...nextData,
            importType: boardImport.type,
            importFile: boardImport.file,
          },
          localId,
        )
      : call(request, api.createBoard, projectId, nextData));
  } catch (error) {
    yield put(actions.createBoard.failure(localId, error));

    // The server can turn an import down (an invalid or missing file, an upload
    // over the limit) and nothing on screen says so. The file name stays here.
    if (boardImport) {
      yield call(pendoTrack, 'board_import_completed', {
        importType: boardImport.type,
        outcome: 'failure',
        failureReason:
          error.message &&
          truncate(error.message, {
            length: 100,
          }),
        importFileSize: boardImport.file.size,
        projectId,
      });
    }

    return;
  }

  yield put(actions.createBoard.success(localId, board, boardMemberships));

  if (boardImport) {
    yield call(pendoTrack, 'board_import_completed', {
      importType: boardImport.type,
      outcome: 'success',
      importFileSize: boardImport.file.size,
      projectId,
      boardId: board.id,
    });
  }

  if (watchForCreateBoardActionTask.isRunning()) {
    yield call(goToBoard, board.id);
    yield call(openModal, ModalTypes.BOARD_SETTINGS, {
      id: board.id,
      openPreferences: true,
    });
  }
}

export function* createBoardInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createBoard, projectId, data);
}

export function* handleBoardCreate(board, boardMemberships, requestId) {
  const isExists = yield select(selectors.selectIsBoardWithIdExists, requestId);

  if (!isExists) {
    yield put(actions.handleBoardCreate(board, boardMemberships));
  }
}

export function* fetchBoard(id) {
  yield put(actions.fetchBoard(id));

  let board;
  let users;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;

  try {
    ({
      item: board,
      included: {
        users,
        projects,
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        attachments,
        customFieldGroups,
        customFields,
        customFieldValues,
      },
    } = yield call(request, api.getBoard, id, true));
  } catch (error) {
    yield put(actions.fetchBoard.failure(id, error));
    return;
  }

  yield put(
    actions.fetchBoard.success(
      board,
      users,
      projects,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    ),
  );
}

export function* updateBoard(id, data) {
  yield put(actions.updateBoard(id, data));

  let board;
  try {
    ({ item: board } = yield call(request, api.updateBoard, id, data));
  } catch (error) {
    yield put(actions.updateBoard.failure(id, error));
    return;
  }

  yield put(actions.updateBoard.success(board));
}

export function* updateCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(updateBoard, boardId, data);
}

export function* handleBoardUpdate(board) {
  yield put(actions.handleBoardUpdate(board));
}

export function* moveBoard(id, index) {
  const { projectId } = yield select(selectors.selectBoardById, id);
  const position = yield select(selectors.selectNextBoardPosition, projectId, index, id);

  yield call(updateBoard, id, {
    position,
  });
}

export function* updateBoardContext(id, value) {
  yield put(actions.updateBoardContext(id, value));
}

export function* updateContextInCurrentBoard(value) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(updateBoardContext, boardId, value);
}

export function* updateBoardView(id, value) {
  const board = yield select(selectors.selectBoardById, id);

  // Written down so a reload comes back to it. Stored against the context it
  // was chosen in, since that is what makes it meaningful — see
  // `utils/board-view-memory`.
  if (board) {
    yield call(rememberBoardView, id, board.context, value);
  }

  yield put(
    actions.updateBoard(id, {
      view: value,
    }),
  );
}

export function* updateViewInCurrentBoard(value) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(updateBoardView, boardId, value);
}

function* trackBoardCardsSearched(value, source) {
  const board = yield select(selectors.selectCurrentBoard);

  if (!board) {
    return;
  }

  const filterUserIds = yield select(selectors.selectFilterUserIdsForCurrentBoard);
  const filterLabelIds = yield select(selectors.selectFilterLabelIdsForCurrentBoard);
  const filterListIds = yield select(selectors.selectFilterListIdsForCurrentBoard);

  const filterExcludedLabelIds = yield select(
    selectors.selectFilterExcludedLabelIdsForCurrentBoard,
  );

  // Only the board context has every card in memory. The archive and the trash
  // fetch theirs from the server, so there is no count to read at this point.
  let matchedCardCount;
  if (board.context === BoardContexts.BOARD) {
    const filteredCardIds = yield select(selectors.selectFilteredCardIdsForCurrentBoard);
    matchedCardCount = filteredCardIds.length;
  }

  const isRegex = value.startsWith('/');

  // The length and the mode go out, the query itself never does.
  yield call(pendoTrack, 'board_cards_searched', {
    boardId: board.id,
    boardView: board.view,
    boardContext: board.context,
    searchMode: isRegex ? 'regex' : 'text',
    queryLength: value.length,
    ...(isRegex
      ? {
          isValidRegex: isRegexValid(value.substring(1)),
        }
      : {
          termCount: buildSearchParts(value).length,
        }),
    matchedCardCount,
    activeFilterCount:
      filterUserIds.length +
      filterLabelIds.length +
      filterExcludedLabelIds.length +
      filterListIds.length +
      (board.filterNoMember ? 1 : 0),
    source,
  });
}

export function* searchInCurrentBoard(value, source) {
  const { boardId } = yield select(selectors.selectPath);
  const currentListId = yield select(selectors.selectCurrentListId);

  yield put(actions.searchInBoard(boardId, value, currentListId));

  // Read after the store update, so the match count is the one now on screen.
  if (source && value.trim()) {
    yield call(trackBoardCardsSearched, value, source);
  }
}

export function* deleteBoard(id) {
  const currentBoard = yield select(selectors.selectCurrentBoard);

  yield put(actions.deleteBoard(id));

  if (currentBoard && id === currentBoard.id) {
    yield call(goToProject, currentBoard.projectId);
  }

  let board;
  try {
    ({ item: board } = yield call(request, api.deleteBoard, id));
  } catch (error) {
    yield put(actions.deleteBoard.failure(id, error));
    return;
  }

  yield put(actions.deleteBoard.success(board));
}

export function* handleBoardDelete(board) {
  const { boardId } = yield select(selectors.selectPath);

  yield put(actions.handleBoardDelete(board));

  if (board.id === boardId) {
    yield call(goToProject, board.projectId);
  }
}

export function* setNoMemberToFilterInCurrentBoard() {
  const { boardId } = yield select(selectors.selectPath);
  yield put({
    type: ActionTypes.NO_MEMBER_TO_BOARD_FILTER_SET,
    payload: { boardId },
  });
}

export function* removeNoMemberFromFilterInCurrentBoard() {
  const { boardId } = yield select(selectors.selectPath);
  yield put({
    type: ActionTypes.NO_MEMBER_FROM_BOARD_FILTER_REMOVE,
    payload: { boardId },
  });
}

export default {
  createBoard,
  createBoardInCurrentProject,
  handleBoardCreate,
  fetchBoard,
  updateBoard,
  updateCurrentBoard,
  handleBoardUpdate,
  moveBoard,
  updateBoardContext,
  updateContextInCurrentBoard,
  updateBoardView,
  updateViewInCurrentBoard,
  searchInCurrentBoard,
  deleteBoard,
  handleBoardDelete,
  setNoMemberToFilterInCurrentBoard,
  removeNoMemberFromFilterInCurrentBoard,
};
