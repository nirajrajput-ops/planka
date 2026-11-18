/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Novus by Pendo lifecycle calls. The agent itself is loaded by the install
// snippet in `index.html`, which defines `window.pendo` before this code runs.
//
// `initialize` runs exactly once, at app entry, with an anonymous visitor. The
// signed-in user is registered later with `identify`; a second `initialize`
// would be ignored by the SDK.

const getPendo = () => window.pendo;

export const initializePendo = () => {
  const pendo = getPendo();

  if (!pendo) {
    return;
  }

  pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      transforms: [
        // In demo mode the login form reads `emailOrUsername` and `password`
        // from the URL fragment. Routing uses browser history, so the fragment
        // never carries page identity and can be dropped from recorded URLs.
        {
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
};

export const identifyPendoVisitor = (user) => {
  const pendo = getPendo();

  if (!pendo || !user) {
    return;
  }

  pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.name,
      role: user.role,
      username: user.username,
      organization: user.organization,
      language: user.language,
      isDeactivated: user.isDeactivated,
      isDefaultAdmin: user.isDefaultAdmin,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      createdAt: user.createdAt,
      termsAcceptedAt: user.termsAcceptedAt,
      autoLogoutMode: user.autoLogoutMode,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
    },
  });
};

export const clearPendoSession = () => {
  const pendo = getPendo();

  // `clearSession` is not stubbed by the install snippet, so it only exists
  // once the agent script has loaded.
  if (pendo && typeof pendo.clearSession === 'function') {
    pendo.clearSession();
  }
};
