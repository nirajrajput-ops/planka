/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo agent is loaded by the install snippet in index.html, which defines `window.pendo`.

export const initializePendo = () => {
  if (!window.pendo) {
    return;
  }

  window.pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      transforms: [
        {
          // In demo mode the login page pre-fills its form from the URL fragment
          // (`/login#emailOrUsername=...&password=...`). The app routes on the path,
          // never on the fragment, so clearing it keeps credentials out of recorded URLs.
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
};

export const identifyPendoVisitor = (user) => {
  if (!window.pendo) {
    return;
  }

  window.pendo.identify({
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
  if (!window.pendo || typeof window.pendo.clearSession !== 'function') {
    return;
  }

  window.pendo.clearSession();
};
