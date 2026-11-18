/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import pendo from '../../../utils/pendo';

const SMTP_SUCCESS_LOG = '✅ Email sent successfully.';
const SMTP_FAILURE_LOG = '❌ Failed to send email.';
const SMTP_ERROR_CODE_LOG_REGEX = /Error code: (\S+)/;

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
  let requestError;
  try {
    ({
      included: { logs },
    } = yield call(request, api.testSmtpConfig));
  } catch (error) {
    requestError = error;
    yield put(actions.testSmtpConfig.failure(error));
  }

  // Pendo: SMTP test finished (the server reports delivery success or failure in the logs)
  let outcome;
  let errorCode = null;
  if (requestError) {
    outcome = 'request_failed';
    errorCode = requestError.code || null;
  } else if (logs && logs.includes(SMTP_FAILURE_LOG)) {
    outcome = 'delivery_failed';

    const errorCodeLog = logs.find((log) => SMTP_ERROR_CODE_LOG_REGEX.test(log));
    if (errorCodeLog) {
      [, errorCode] = errorCodeLog.match(SMTP_ERROR_CODE_LOG_REGEX);
    }
  } else if (logs && logs.includes(SMTP_SUCCESS_LOG)) {
    outcome = 'success';
  } else {
    outcome = 'unknown';
  }

  pendo.track('smtp_test_completed', {
    outcome,
    logsCount: logs ? logs.length : 0,
    errorCode,
  });

  yield put(actions.testSmtpConfig.success(logs));
}

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
