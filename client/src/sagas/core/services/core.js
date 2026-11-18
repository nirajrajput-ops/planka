/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { removeAccessToken } from '../../../utils/access-token-storage';
import { forgetBoardViews } from '../../../utils/board-view-memory';

export function* initializeCore() {
  const { item: bootstrap } = yield call(request, api.getBootstrap); // TODO: handle error

  yield put(actions.initializeCore.fetchBootstrap(bootstrap));

  const {
    config,
    user,
    board,
    webhooks,
    users,
    projects,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
    notifications,
    notificationServices,
  } = yield call(requests.fetchCore); // TODO: handle error

  // The first point at which the signed-in user is known, both right after logging in and on
  // a reload with a stored access token.
  window.pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.name,
      role: user.role,
      username: user.username,
      organization: user.organization,
      language: user.language,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      autoLogoutMode: user.autoLogoutMode,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      isDeactivated: user.isDeactivated,
      createdAt: user.createdAt,
      // The server's presentOne leaves these two out of /api/users/me, so they stay unset
      // unless the API starts returning them.
      termsAcceptedAt: user.termsAcceptedAt,
      apiKeyCreatedAt: user.apiKeyCreatedAt,
    },
  });

  yield call(i18n.changeLanguage, user.language);
  yield call(i18n.loadCoreLocale);

  yield put(
    actions.initializeCore(
      config,
      user,
      board,
      webhooks,
      users,
      projects,
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
      notifications,
      notificationServices,
    ),
  );
}

export function* changeCoreLanguage(language) {
  yield call(i18n.loadCoreLocale, language);
  yield call(i18n.changeLanguage, language);
}

export function* toggleFavorites(isEnabled) {
  yield put(actions.toggleFavorites(isEnabled));

  const currentUserId = yield select(selectors.selectCurrentUserId);

  try {
    yield call(request, api.updateUser, currentUserId, {
      enableFavoritesByDefault: isEnabled,
    });
  } catch {
    /* empty */
  }
}

export function* toggleEditMode(isEnabled) {
  yield put(actions.toggleEditMode(isEnabled));
}

export function* updateHomeView(value) {
  yield put(actions.updateHomeView(value));

  const currentUserId = yield select(selectors.selectCurrentUserId);

  try {
    yield call(request, api.updateUser, currentUserId, {
      defaultHomeView: value,
    });
  } catch {
    /* empty */
  }
}

export function* logout(revokeAccessToken) {
  yield call(removeAccessToken);
  // Everything this window was holding about the boards it had open. None of it
  // belongs to the next person to sign in here.
  yield call(forgetBoardViews);
  // Nor does the Pendo visitor, so it is reset to a fresh anonymous one. The snippet in
  // index.html doesn't stub clearSession: it only exists once the agent has loaded.
  if (window.pendo.clearSession) {
    window.pendo.clearSession();
  }

  if (revokeAccessToken) {
    yield put(actions.logout.revokeAccessToken());

    try {
      yield call(request, api.deleteCurrentAccessToken);
    } catch {
      /* empty */
    }
  }

  yield put(actions.logout()); // TODO: next url
}

export default {
  initializeCore,
  changeCoreLanguage,
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
};
