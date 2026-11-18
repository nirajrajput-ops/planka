/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';
import truncate from 'lodash/truncate';
import { call, put, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import trackPendoEvent from '../../../utils/track-pendo-event';
import { AttachmentTypes } from '../../../constants/Enums';
import ToastTypes from '../../../constants/ToastTypes';

export function* createAttachment(cardId, data) {
  const localId = yield call(createLocalId);
  const currentUserId = yield select(selectors.selectCurrentUserId);

  const nextData = {
    ...data,
    name: truncate(data.name, {
      length: 128,
    }),
  };

  yield put(
    actions.createAttachment({
      ...omit(nextData, ['file', 'url']),
      cardId,
      id: localId,
      creatorUserId: currentUserId,
    }),
  );

  const attachmentTrackingProperties = {
    card_id: cardId,
    attachment_type: nextData.type,
    ...(nextData.type === AttachmentTypes.FILE &&
      nextData.file && {
        file_type: nextData.file.type || 'unknown',
        file_size: nextData.file.size,
      }),
  };

  let attachment;
  try {
    ({ item: attachment } = yield nextData.type === AttachmentTypes.FILE
      ? call(request, api.createAttachmentWithFile, cardId, nextData, localId)
      : call(request, api.createAttachment, cardId, nextData));
  } catch (error) {
    yield put(actions.createAttachment.failure(localId, error));

    let toastType;
    if (error.code === 'E_UNPROCESSABLE_ENTITY') {
      if (error.message.startsWith('Upload limit')) {
        toastType = ToastTypes.FILE_IS_TOO_BIG;
      } else if (error.message === 'Storage limit reached') {
        toastType = ToastTypes.NOT_ENOUGH_STORAGE;
      }
    }

    // Pendo: attachment upload failed on the server
    yield call(trackPendoEvent, 'attachment_uploaded', {
      ...attachmentTrackingProperties,
      success: false,
      failure_reason: toastType || (error && error.code) || 'unknown',
    });

    if (toastType) {
      yield call(toast, {
        type: toastType,
      });
    }

    return;
  }

  yield put(actions.createAttachment.success(localId, attachment));

  // Pendo: attachment stored on the server
  yield call(trackPendoEvent, 'attachment_uploaded', {
    ...attachmentTrackingProperties,
    success: true,
  });
}

export function* createAttachmentInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createAttachment, cardId, data);
}

export function* handleAttachmentCreate(attachment, requestId) {
  const isExists = yield select(selectors.selectIsAttachmentWithIdExists, requestId);

  if (!isExists) {
    yield put(actions.handleAttachmentCreate(attachment));
  }
}

export function* updateAttachment(id, data) {
  yield put(actions.updateAttachment(id, data));

  let attachment;
  try {
    ({ item: attachment } = yield call(request, api.updateAttachment, id, data));
  } catch (error) {
    yield put(actions.updateAttachment.failure(id, error));
    return;
  }

  yield put(actions.updateAttachment.success(attachment));
}

export function* handleAttachmentUpdate(attachment) {
  yield put(actions.handleAttachmentUpdate(attachment));
}

export function* deleteAttachment(id) {
  yield put(actions.deleteAttachment(id));

  let attachment;
  try {
    ({ item: attachment } = yield call(request, api.deleteAttachment, id));
  } catch (error) {
    yield put(actions.deleteAttachment.failure(id, error));
    return;
  }

  yield put(actions.deleteAttachment.success(attachment));
}

export function* handleAttachmentDelete(attachment) {
  yield put(actions.handleAttachmentDelete(attachment));
}

export default {
  createAttachment,
  createAttachmentInCurrentCard,
  handleAttachmentCreate,
  updateAttachment,
  handleAttachmentUpdate,
  deleteAttachment,
  handleAttachmentDelete,
};
