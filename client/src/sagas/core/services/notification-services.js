/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import pendoTrack from '../../../utils/pendo-track';
import { createLocalId } from '../../../utils/local-id';

// Which channel an Apprise URL points at (tgram, slack, discord, mailto, ...).
// Everything after the scheme can hold tokens and credentials, so the scheme is
// all that is ever read out of it, and only in the `scheme://` shape.
const getServiceScheme = (url) => {
  const match = /^([a-z][a-z0-9+.-]{0,31}):\/\//i.exec(url);

  return match ? match[1].toLowerCase() : null;
};

export function* createNotificationServiceInCurrentUser(data) {
  const localId = yield call(createLocalId);
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(
    actions.createNotificationService({
      ...data,
      id: localId,
      userId: currentUserId,
    }),
  );

  let notificationService;
  try {
    ({ item: notificationService } = yield call(
      request,
      api.createUserNotificationService,
      currentUserId,
      data,
    ));
  } catch (error) {
    yield put(actions.createNotificationService.failure(localId, error));
    return;
  }

  yield put(actions.createNotificationService.success(localId, notificationService));

  const notificationServiceIds = yield select(selectors.selectNotificationServiceIdsForCurrentUser);

  yield call(pendoTrack, 'notification_service_added', {
    scope: 'user',
    serviceScheme: getServiceScheme(data.url),
    format: data.format,
    serviceCount: notificationServiceIds && notificationServiceIds.length,
  });
}

export function* createNotificationServiceInBoard(boardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createNotificationService({
      ...data,
      boardId,
      id: localId,
    }),
  );

  let notificationService;
  try {
    ({ item: notificationService } = yield call(
      request,
      api.createBoardNotificationService,
      boardId,
      data,
    ));
  } catch (error) {
    yield put(actions.createNotificationService.failure(localId, error));
    return;
  }

  yield put(actions.createNotificationService.success(localId, notificationService));

  const notificationServiceIds = yield select(
    selectors.selectNotificationServiceIdsByBoardId,
    boardId,
  );

  yield call(pendoTrack, 'notification_service_added', {
    scope: 'board',
    serviceScheme: getServiceScheme(data.url),
    format: data.format,
    serviceCount: notificationServiceIds && notificationServiceIds.length,
    boardId,
  });
}

export function* handleNotificationServiceCreate(notificationService) {
  yield put(actions.handleNotificationServiceCreate(notificationService));
}

export function* updateNotificationService(id, data) {
  yield put(actions.updateNotificationService(id, data));

  let notificationService;
  try {
    ({ item: notificationService } = yield call(request, api.updateNotificationService, id, data));
  } catch (error) {
    yield put(actions.updateNotificationService.failure(id, error));
    return;
  }

  yield put(actions.updateNotificationService.success(notificationService));
}

export function* handleNotificationServiceUpdate(notificationService) {
  yield put(actions.handleNotificationServiceUpdate(notificationService));
}

export function* testNotificationService(id) {
  yield put(actions.testNotificationService(id));

  let notificationService;
  try {
    ({ item: notificationService } = yield call(request, api.testNotificationService, id));
  } catch (error) {
    yield put(actions.testNotificationService.failure(id, error));
    return;
  }

  yield put(actions.testNotificationService.success(notificationService));
}

export function* deleteNotificationService(id) {
  yield put(actions.deleteNotificationService(id));

  let notificationService;
  try {
    ({ item: notificationService } = yield call(request, api.deleteNotificationService, id));
  } catch (error) {
    yield put(actions.deleteNotificationService.failure(id, error));
    return;
  }

  yield put(actions.deleteNotificationService.success(notificationService));
}

export function* handleNotificationServiceDelete(notificationService) {
  yield put(actions.handleNotificationServiceDelete(notificationService));
}

export default {
  createNotificationServiceInCurrentUser,
  createNotificationServiceInBoard,
  handleNotificationServiceCreate,
  updateNotificationService,
  handleNotificationServiceUpdate,
  testNotificationService,
  deleteNotificationService,
  handleNotificationServiceDelete,
};
