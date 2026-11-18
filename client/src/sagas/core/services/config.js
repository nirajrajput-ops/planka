/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { getErrorCode, trackPendoEvent } from '../../../utils/pendo-track';

const SMTP_FAILURE_LOG_PREFIX = '❌';
const SMTP_ERROR_CODE_LOG_PREFIX = '⚠️ Error code:';

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
  let testError;
  try {
    ({
      included: { logs },
    } = yield call(request, api.testSmtpConfig));
  } catch (error) {
    testError = error;
    yield put(actions.testSmtpConfig.failure(error));
  }

  yield put(actions.testSmtpConfig.success(logs));

  // The server answers with logs even when delivery fails, so the logs decide the outcome.
  const smtpLogs = logs || [];
  const isDeliveryFailed = smtpLogs.some((log) => log.startsWith(SMTP_FAILURE_LOG_PREFIX));
  const smtpErrorCodeLog = smtpLogs.find((log) => log.startsWith(SMTP_ERROR_CODE_LOG_PREFIX));

  let errorCode = null;
  if (testError) {
    errorCode = getErrorCode(testError);
  } else if (smtpErrorCodeLog) {
    errorCode = smtpErrorCodeLog.slice(SMTP_ERROR_CODE_LOG_PREFIX.length).trim();
  } else if (isDeliveryFailed) {
    errorCode = 'unknown';
  }

  yield call(trackPendoEvent, 'smtp_test_completed', {
    success: !testError && !isDeliveryFailed,
    log_count: smtpLogs.length,
    error_code: errorCode,
  });
}

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
