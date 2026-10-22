/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Novus by Pendo. The agent is loaded by the snippet in index.html, which also
// defines `window.pendo` and queues `initialize` and `identify` until the agent
// has arrived. Analytics must never be the reason the app fails to start or a
// user fails to sign out, so every call here is skipped when Pendo is missing.

export const initializePendo = () => {
  if (!window.pendo) {
    return;
  }

  window.pendo.initialize({
    // Anonymous until the signed-in user is known. An empty id lets the agent
    // pick up the visitor it remembered from an earlier visit, if any.
    visitor: {
      id: '',
    },
    // The agent records the full URL with every event. In demo mode the login
    // page reads `emailOrUsername` and `password` from the fragment (see
    // components/common/Login/Content.jsx). Nothing in the app routes on the
    // hash — pages are told apart by their path alone — so the fragment is
    // dropped from every recorded URL. The address bar, and what the login page
    // reads out of it, are left alone.
    location: {
      transforms: [
        {
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
};

// `user` is the current user as returned by GET /users/me
export const identifyPendoVisitor = (user) => {
  if (!window.pendo) {
    return;
  }

  window.pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.name,
      username: user.username,
      role: user.role,
      organization: user.organization,
      language: user.language,
      createdAt: user.createdAt,
      isDeactivated: user.isDeactivated,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      // The server leaves this out of API responses, so it stays empty until it does not
      termsAcceptedAt: user.termsAcceptedAt,
      autoLogoutMode: user.autoLogoutMode,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
    },
  });
};

// `clearSession` is not one of the calls the snippet queues, so it only exists
// once the agent has loaded. If it never did, there is no session to clear.
export const clearPendoSession = () => {
  if (!window.pendo || !window.pendo.clearSession) {
    return;
  }

  window.pendo.clearSession();
};
