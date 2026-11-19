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
import { getErrorCode, pendoTrack } from '../../../utils/pendo-track';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';

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
    // Pendo: the server rejected the credentials or sent the visitor to another login step
    yield call(pendoTrack, 'login_failed', {
      error_step: (error && error.step) || 'rejected',
      error_code: getErrorCode(error),
      flow: 'credentials',
    });

    let terms;
    if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
      ({ item: terms } = yield call(api.getTerms, i18n.resolvedLanguage));
    }

    yield put(actions.authenticate.failure(error, terms));
    return;
  }

  yield call(setAccessToken, accessToken);

  // Pendo: an access token was issued directly from credentials
  yield call(pendoTrack, 'login_succeeded', {
    completion_step: 'credentials',
    terms_accepted: false,
    totp_verified: false,
    language: i18n.resolvedLanguage,
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

  // Pendo: an access token was issued after the visitor accepted the terms
  yield call(pendoTrack, 'login_succeeded', {
    completion_step: 'accept_terms',
    terms_accepted: true,
    totp_verified: false,
    language: i18n.resolvedLanguage,
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
    // Pendo: the server rejected the TOTP challenge
    yield call(pendoTrack, 'login_failed', {
      error_step: (error && error.step) || 'rejected',
      error_code: getErrorCode(error),
      flow: 'verify_totp',
    });

    yield put(actions.verifyTotp.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);

  // Pendo: an access token was issued after the visitor passed the TOTP challenge
  yield call(pendoTrack, 'login_succeeded', {
    completion_step: 'verify_totp',
    terms_accepted: false,
    totp_verified: true,
    language: i18n.resolvedLanguage,
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
