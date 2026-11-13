/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { trackPendoEvent } from '../../../utils/pendo';

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
  let isSuccessful = true;
  try {
    ({
      included: { logs },
    } = yield call(request, api.testSmtpConfig));
  } catch (error) {
    isSuccessful = false;
    yield put(actions.testSmtpConfig.failure(error));
  }

  yield put(actions.testSmtpConfig.success(logs));

  // The server responds normally even when sending fails, reporting the outcome in the logs
  yield call(trackPendoEvent, 'smtp_config_tested', {
    success: isSuccessful && !!logs && logs.some((line) => line.startsWith('✅')),
    logsCount: logs ? logs.length : 0,
  });
}

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
