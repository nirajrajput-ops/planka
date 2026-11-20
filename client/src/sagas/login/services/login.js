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
import { getErrorCode, trackPendoEvent } from '../../../utils/pendo-track';
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
    let terms;
    if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
      ({ item: terms } = yield call(api.getTerms, i18n.resolvedLanguage));
    }

    yield put(actions.authenticate.failure(error, terms));

    // Sign-in failed or stopped at a pending step (terms acceptance or TOTP challenge)
    yield call(trackPendoEvent, 'login_completed', {
      login_step: 'credentials',
      success: false,
      next_step: error.step || null,
      error_code: error.step ? null : getErrorCode(error),
      with_totp: false,
    });

    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticate.success(accessToken));

  // Sign-in succeeded with credentials only
  yield call(trackPendoEvent, 'login_completed', {
    login_step: 'credentials',
    success: true,
    next_step: null,
    with_totp: false,
  });
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

    // Sign-in failed or stopped at another pending step after the terms step
    yield call(trackPendoEvent, 'login_completed', {
      login_step: 'accept_terms',
      success: false,
      next_step: error.step || null,
      error_code: error.step ? null : getErrorCode(error),
      with_totp: false,
    });

    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.acceptTerms.success(accessToken));

  // Sign-in succeeded after accepting the terms
  yield call(trackPendoEvent, 'login_completed', {
    login_step: 'accept_terms',
    success: true,
    next_step: null,
    with_totp: false,
  });
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

    // Sign-in failed at the TOTP challenge
    yield call(trackPendoEvent, 'login_completed', {
      login_step: 'verify_totp',
      success: false,
      next_step: error.step || null,
      error_code: getErrorCode(error),
      with_totp: true,
    });

    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.verifyTotp.success(accessToken));

  // Sign-in succeeded after the TOTP challenge
  yield call(trackPendoEvent, 'login_completed', {
    login_step: 'verify_totp',
    success: true,
    next_step: null,
    with_totp: true,
  });
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
