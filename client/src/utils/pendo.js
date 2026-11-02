/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo agent is loaded by the install snippet in index.html, which exposes `window.pendo`.
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
        // In demo mode the login form pre-fills `emailOrUsername` and `password` from the URL
        // fragment. The app uses browser (path-based) routing, so the fragment never carries page
        // identity and can be cleared from recorded URLs entirely.
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
      updatedAt: user.updatedAt,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      autoLogoutMode: user.autoLogoutMode,
    },
  });
};

export const clearPendoSession = () => {
  const pendo = getPendo();

  // `clearSession` is not stubbed by the install snippet, so it only exists once the agent has loaded.
  if (!pendo || typeof pendo.clearSession !== 'function') {
    return;
  }

  pendo.clearSession();
};
