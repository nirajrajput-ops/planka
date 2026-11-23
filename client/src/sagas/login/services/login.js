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
import { trackPendoEvent, truncateForPendo } from '../../../utils/pendo';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';

const LoginSteps = {
  AUTHENTICATE: 'authenticate',
  ACCEPT_TERMS: AccessTokenSteps.ACCEPT_TERMS,
  VERIFY_TOTP: AccessTokenSteps.VERIFY_TOTP,
};

// Remembers which extra steps the current sign-in attempt required
const loginFlowState = {
  requiredTermsAcceptance: false,
  requiredTotp: false,
};

const rememberRequiredStep = (error) => {
  if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
    loginFlowState.requiredTermsAcceptance = true;
  } else if (error.step === AccessTokenSteps.VERIFY_TOTP) {
    loginFlowState.requiredTotp = true;
  }
};

// Pendo: sign-in finished and an access token was stored
const trackLoginCompleted = (completedStep) => {
  trackPendoEvent('login_completed', {
    completedStep,
    requiredTermsAcceptance: loginFlowState.requiredTermsAcceptance,
    requiredTotp: loginFlowState.requiredTotp,
    initialLanguage: i18n.resolvedLanguage,
  });
};

// Pendo: a sign-in step was rejected by the server
const trackLoginFailed = (failedStep, error) => {
  rememberRequiredStep(error);

  trackPendoEvent('login_failed', {
    failedStep,
    errorStep: error.step || null,
    errorMessage: truncateForPendo(error.message) || null,
  });
};

export function* initializeLogin() {
  const { item: bootstrap } = yield call(api.getBootstrap); // TODO: handle error

  yield put(actions.initializeLogin(bootstrap));
}

export function* authenticate(data) {
  loginFlowState.requiredTermsAcceptance = false;
  loginFlowState.requiredTotp = false;

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
    yield call(trackLoginFailed, LoginSteps.AUTHENTICATE, error);
    return;
  }

  yield call(setAccessToken, accessToken);
  // Track before the success action, which stops the login watchers
  yield call(trackLoginCompleted, LoginSteps.AUTHENTICATE);
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
    yield call(trackLoginFailed, LoginSteps.ACCEPT_TERMS, error);
    return;
  }

  yield call(setAccessToken, accessToken);
  // Track before the success action, which stops the login watchers
  yield call(trackLoginCompleted, LoginSteps.ACCEPT_TERMS);
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
    yield call(trackLoginFailed, LoginSteps.VERIFY_TOTP, error);
    return;
  }

  yield call(setAccessToken, accessToken);
  // Track before the success action, which stops the login watchers
  yield call(trackLoginCompleted, LoginSteps.VERIFY_TOTP);
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
