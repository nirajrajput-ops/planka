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
import pendo from '../../../utils/pendo';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';

// Queued rather than sent: the visitor is still anonymous here (see utils/pendo). It also has to
// happen before the success action, which ends the login saga and cancels this task with it.
const trackLoginCompleted = (properties) => {
  pendo.whenIdentified(() => {
    pendo.track('login_completed', properties);
  });
};

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

    // A step means the server wants the terms accepted or a TOTP code next, not that it said no
    if (!error.step) {
      pendo.track('login_failed', {
        step: 'credentials',
        errorMessage: error.message || null,
      });
    }

    return;
  }

  yield call(setAccessToken, accessToken);

  trackLoginCompleted({
    completedStep: 'credentials',
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

    pendo.track('login_failed', {
      step: 'terms',
      errorMessage: error.message || null,
    });

    return;
  }

  yield call(setAccessToken, accessToken);

  trackLoginCompleted({
    completedStep: 'terms',
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
    yield put(actions.verifyTotp.failure(error));

    pendo.track('login_failed', {
      step: 'totp',
      errorMessage: error.message || null,
    });

    return;
  }

  yield call(setAccessToken, accessToken);

  trackLoginCompleted({
    completedStep: 'totp',
    trustDevice: !!data.trustDevice,
    // Recovery codes are two groups joined by a dash, TOTP codes are digits only
    usedRecoveryCode: data.code.includes('-'),
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
