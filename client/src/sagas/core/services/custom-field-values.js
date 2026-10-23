/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { buildCustomFieldValueId } from '../../../models/CustomFieldValue';
import { createLocalId } from '../../../utils/local-id';
import trackPendoEvent from '../../../utils/pendo';

function* trackCustomFieldValueSet(cardId, customFieldGroupId, customFieldId, isCleared) {
  const customFieldGroup = yield select(selectors.selectCustomFieldGroupById, customFieldGroupId);

  let groupScope = null;
  if (customFieldGroup) {
    groupScope = customFieldGroup.boardId ? 'board' : 'card';
  }

  yield call(trackPendoEvent, 'custom_field_value_set', {
    card_id: cardId,
    custom_field_group_id: customFieldGroupId,
    custom_field_id: customFieldId,
    group_scope: groupScope,
    is_cleared: isCleared,
  });
}

export function* updateCustomFieldValue(cardId, customFieldGroupId, customFieldId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.updateCustomFieldValue({
      ...data,
      cardId,
      customFieldGroupId,
      customFieldId,
    }),
  );

  let customFieldValue;
  try {
    ({ item: customFieldValue } = yield call(
      request,
      api.updateCustomFieldValue,
      cardId,
      customFieldGroupId,
      customFieldId,
      data,
    ));
  } catch (error) {
    yield put(actions.updateCustomFieldValue.failure(localId, error));
    return;
  }

  yield put(actions.updateCustomFieldValue.success(localId, customFieldValue));

  yield call(trackCustomFieldValueSet, cardId, customFieldGroupId, customFieldId, false);
}

export function* handleCustomFieldValueUpdate(customFieldValue) {
  yield put(actions.handleCustomFieldValueUpdate(customFieldValue));
}

export function* deleteCustomFieldValue(cardId, customFieldGroupId, customFieldId) {
  const id = buildCustomFieldValueId({
    cardId,
    customFieldGroupId,
    customFieldId,
  });

  yield put(actions.deleteCustomFieldValue(id));

  let customFieldValue;
  try {
    ({ item: customFieldValue } = yield call(
      request,
      api.deleteCustomFieldValue,
      cardId,
      customFieldGroupId,
      customFieldId,
    ));
  } catch (error) {
    yield put(actions.deleteCustomFieldValue.failure(id, error));
    return;
  }

  yield put(actions.deleteCustomFieldValue.success(customFieldValue));

  // Clearing a field's value (an empty inline edit) goes through the delete endpoint
  yield call(trackCustomFieldValueSet, cardId, customFieldGroupId, customFieldId, true);
}

export function* handleCustomFieldValueDelete(customFieldValue) {
  yield put(actions.handleCustomFieldValueDelete(customFieldValue));
}

export default {
  updateCustomFieldValue,
  handleCustomFieldValueUpdate,
  deleteCustomFieldValue,
  handleCustomFieldValueDelete,
};
