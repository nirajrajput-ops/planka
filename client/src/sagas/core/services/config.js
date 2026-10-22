/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import pendo from '../../../utils/pendo';

const SMTP_ERROR_CODE_LOG_PREFIX = '⚠️ Error code: ';

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
  try {
    ({
      included: { logs },
    } = yield call(request, api.testSmtpConfig));
  } catch (error) {
    yield put(actions.testSmtpConfig.failure(error));

    // The request itself failed, so no test email went out
    pendo.track('smtp_test_completed', {
      delivered: false,
      errorCode: error.code || null,
    });
  }

  yield put(actions.testSmtpConfig.success(logs));

  // The server answers 200 either way and reports the outcome only in the logs. A failed request
  // above also falls through to here, without logs, and has already been tracked.
  if (logs) {
    const config = yield select(selectors.selectConfig);
    const errorCodeLog = logs.find((log) => log.startsWith(SMTP_ERROR_CODE_LOG_PREFIX));

    pendo.track('smtp_test_completed', {
      delivered: logs.includes('✅ Email sent successfully.'),
      errorCode: errorCodeLog ? errorCodeLog.slice(SMTP_ERROR_CODE_LOG_PREFIX.length) : null,
      smtpSecure: config ? config.smtpSecure : null,
      smtpPort: config ? config.smtpPort : null,
    });
  }
}

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
