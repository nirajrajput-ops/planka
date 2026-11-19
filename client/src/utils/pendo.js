/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo install snippet in index.html defines `window.pendo` and queues calls
// until the agent script has loaded.
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
        {
          // The app uses browser history and never routes on the hash. In demo mode the
          // login page prefills `emailOrUsername` and `password` from the fragment, so
          // keep the fragment out of every recorded URL.
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
      createdAt: user.createdAt,
      isDeactivated: user.isDeactivated,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      termsAcceptedAt: user.termsAcceptedAt,
      isDefaultAdmin: user.isDefaultAdmin,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      autoLogoutMode: user.autoLogoutMode,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
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
