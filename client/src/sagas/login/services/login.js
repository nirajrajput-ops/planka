/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { setAccessToken } from '../../../utils/access-token-storage';
import trackPendoEvent from '../../../utils/pendo';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';

// Known server messages, mapped to stable categories so raw messages are never sent
const ERROR_MESSAGE_TYPE_BY_MESSAGE = {
  'Invalid credentials': 'invalid_credentials',
  'Invalid email or username': 'invalid_email_or_username',
  'Invalid password': 'invalid_password',
  'Admin login required to initialize instance': 'admin_login_required',
  'Email already in use': 'email_already_in_use',
  'Username already in use': 'username_already_in_use',
  'Active users limit reached': 'active_users_limit_reached',
  'Invalid TOTP code': 'invalid_totp_code',
  'Invalid pending token': 'invalid_pending_token',
  'Failed to fetch': 'network_error',
  'Network request failed': 'network_error',
};

const getLoginFailureProperties = (step, error) => ({
  step,
  errorCode: (error && error.code) || 'unknown',
  errorMessageType: (error && ERROR_MESSAGE_TYPE_BY_MESSAGE[error.message]) || 'unknown',
});

export function* initializeLogin() {
  const { item: bootstrap } = yield call(api.getBootstrap); // TODO: handle error

  yield put(actions.initializeLogin(bootstrap));
}

export function* authenticate(data) {
  yield put(actions.authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    let terms;
    if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
      ({ item: terms } = yield call(api.getTerms, i18n.resolvedLanguage));
    }

    // Pending terms acceptance or TOTP challenge are further steps, not failures
    if (
      error.step !== AccessTokenSteps.ACCEPT_TERMS &&
      error.step !== AccessTokenSteps.VERIFY_TOTP
    ) {
      yield call(trackPendoEvent, 'login_failed', getLoginFailureProperties('authenticate', error));
    }

    yield put(actions.authenticate.failure(error, terms));
    return;
  }

  yield call(setAccessToken, accessToken);

  // Logged in with credentials only
  yield call(trackPendoEvent, 'login_completed', {
    completedStep: 'authenticate',
    requiredTermsAcceptance: false,
    requiredTotp: false,
    language: i18n.resolvedLanguage || null,
  });

  yield put(actions.authenticate.success(accessToken));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export function* acceptTerms(signature) {
  yield put(actions.acceptTerms(signature));

  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.acceptTerms, {
      pendingToken,
      signature,
      initialLanguage: i18n.resolvedLanguage,
    }));
  } catch (error) {
    yield put(actions.acceptTerms.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);

  // Logged in after accepting the terms
  yield call(trackPendoEvent, 'login_completed', {
    completedStep: 'accept_terms',
    requiredTermsAcceptance: true,
    requiredTotp: false,
    language: i18n.resolvedLanguage || null,
  });

  yield put(actions.acceptTerms.success(accessToken));
}

export function* cancelTerms() {
  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  yield put(actions.cancelTerms());

  try {
    yield call(api.revokePendingToken, {
      pendingToken,
    });
  } catch (error) {
    yield put(actions.cancelTerms.failure(error));
    return;
  }

  yield put(actions.cancelTerms.success(pendingToken));
}

export function* updateTermsLanguage(value) {
  yield put(actions.updateTermsLanguage(value));

  let terms;
  try {
    ({ item: terms } = yield call(api.getTerms, value));
  } catch (error) {
    yield put(actions.updateTermsLanguage.failure(error));
    return;
  }

  yield put(actions.updateTermsLanguage.success(terms));
}

export function* verifyTotp(data) {
  yield put(actions.verifyTotp(data));

  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.verifyTotp, {
      ...data,
      pendingToken,
    }));
  } catch (error) {
    yield call(trackPendoEvent, 'login_failed', getLoginFailureProperties('verify_totp', error));

    yield put(actions.verifyTotp.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);

  // Logged in after passing the TOTP challenge
  yield call(trackPendoEvent, 'login_completed', {
    completedStep: 'verify_totp',
    requiredTermsAcceptance: false,
    requiredTotp: true,
    language: i18n.resolvedLanguage || null,
  });

  yield put(actions.verifyTotp.success(accessToken));
}

export function* cancelTotpChallenge() {
  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  yield put(actions.cancelTotpChallenge());

  try {
    yield call(api.revokePendingToken, {
      pendingToken,
    });
  } catch (error) {
    yield put(actions.cancelTotpChallenge.failure(error));
    return;
  }

  yield put(actions.cancelTotpChallenge.success());
}

export default {
  initializeLogin,
  authenticate,
  clearAuthenticateError,
  acceptTerms,
  cancelTerms,
  updateTermsLanguage,
  verifyTotp,
  cancelTotpChallenge,
};
