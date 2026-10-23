/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo install snippet in index.html defines `window.pendo` and queues calls
// until the agent script has loaded. Guard every call so the app never breaks
// when the snippet is blocked (e.g. by an ad blocker).
const getPendo = () => window.pendo;

export const initializePendo = () => {
  const pendo = getPendo();

  if (!pendo || typeof pendo.initialize !== 'function') {
    return;
  }

  pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      transforms: [
        // In demo mode the login page pre-fills its form from the URL fragment
        // (`#emailOrUsername=...&password=...`). The app uses browser history routing
        // and never routes on the hash, so the fragment carries no page identity.
        {
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
};

export const identifyPendoUser = (user) => {
  const pendo = getPendo();

  if (!pendo || typeof pendo.identify !== 'function' || !user) {
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
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      termsAcceptedAt: user.termsAcceptedAt,
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

  // `clearSession` is not stubbed by the install snippet, so it only exists once the
  // agent script has loaded.
  if (!pendo || typeof pendo.clearSession !== 'function') {
    return;
  }

  pendo.clearSession();
};
