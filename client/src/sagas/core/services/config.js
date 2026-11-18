/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import trackPendoEvent from '../../../utils/track-pendo-event';

export function* updateConfig(data) {
  yield put(actions.updateConfig(data));

  let config;
  try {
    ({ item: config } = yield call(request, api.updateConfig, data));
  } catch (error) {
    yield put(actions.updateConfig.failure(error));
    return;
  }

  yield put(actions.updateConfig.success(config));
}

export function* handleConfigUpdate(config) {
  yield put(actions.handleConfigUpdate(config));
}

export function* testSmtpConfig() {
  yield put(actions.testSmtpConfig());

  let logs;
  let isRequestFailed = false;
  try {
    ({
      included: { logs },
    } = yield call(request, api.testSmtpConfig));
  } catch (error) {
    isRequestFailed = true;
    yield put(actions.testSmtpConfig.failure(error));
  }

  // Pendo: SMTP test returned, the server marks a failed send with a "❌" log line
  yield call(trackPendoEvent, 'smtp_test_completed', {
    success: !isRequestFailed && !!logs && !logs.some((log) => log.startsWith('❌')),
    logs_count: logs ? logs.length : 0,
  });

  yield put(actions.testSmtpConfig.success(logs));
}

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
