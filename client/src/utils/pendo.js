/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo agent is loaded by the install snippet in index.html, which defines window.pendo.

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
          // In demo mode the login page reads emailOrUsername and password from the URL hash.
          // The app uses browser history routing, so the hash carries no page identity.
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
      id: String(user.id),
      email: user.email,
      full_name: user.name,
      username: user.username,
      role: user.role,
      organization: user.organization,
      language: user.language,
      isDeactivated: user.isDeactivated,
      createdAt: user.createdAt,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      termsAcceptedAt: user.termsAcceptedAt,
      passwordChangedAt: user.passwordChangedAt,
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

  if (!pendo || typeof pendo.clearSession !== 'function') {
    return;
  }

  pendo.clearSession();
};
