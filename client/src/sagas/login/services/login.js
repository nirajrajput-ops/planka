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

const PASSWORD_STEP = 'password';

// Pendo: an access token was issued and saved at the given login step
function* trackSignInSuccess(completionStep) {
  yield call(trackPendoEvent, 'user_signed_in', {
    completionStep,
    requiredTotp: completionStep === AccessTokenSteps.VERIFY_TOTP,
    requiredTermsAcceptance: completionStep === AccessTokenSteps.ACCEPT_TERMS,
    success: true,
  });
}

// Pendo: sign-in failed at the given login step
function* trackSignInFailure(failureStep) {
  yield call(trackPendoEvent, 'user_signed_in', {
    success: false,
    failureStep,
  });
}

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

    yield put(actions.authenticate.failure(error, terms));

    // A pending step (TOTP or terms) is not a failure: sign-in continues at that step
    if (!error.step) {
      yield call(trackSignInFailure, PASSWORD_STEP);
    }

    return;
  }

  yield call(setAccessToken, accessToken);
  // Tracked before the success action: it ends the login saga and cancels this task
  yield call(trackSignInSuccess, PASSWORD_STEP);
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
    yield call(trackSignInFailure, AccessTokenSteps.ACCEPT_TERMS);
    return;
  }

  yield call(setAccessToken, accessToken);
  // Tracked before the success action: it ends the login saga and cancels this task
  yield call(trackSignInSuccess, AccessTokenSteps.ACCEPT_TERMS);
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
    yield put(actions.verifyTotp.failure(error));
    yield call(trackSignInFailure, AccessTokenSteps.VERIFY_TOTP);
    return;
  }

  yield call(setAccessToken, accessToken);
  // Tracked before the success action: it ends the login saga and cancels this task
  yield call(trackSignInSuccess, AccessTokenSteps.VERIFY_TOTP);
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
