/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Novus by Pendo lifecycle helpers. The install snippet in index.html defines
// `window.pendo` and loads the agent from the CDN. Every helper checks for the
// method it needs first, so a blocked agent never breaks the app.

const getPendo = () => (typeof window === 'undefined' ? undefined : window.pendo);

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
        // In demo mode the login page prefills its form from the URL fragment
        // (`#emailOrUsername=...&password=...`), so the fragment can carry
        // credentials. The app routes on the pathname only (createBrowserHistory),
        // so the fragment carries no page identity and is cleared from every
        // recorded URL.
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

  if (!user || !pendo || typeof pendo.identify !== 'function') {
    return;
  }

  pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.name,
      username: user.username,
      role: user.role,
      organization: user.organization,
      language: user.language,
      isDeactivated: user.isDeactivated,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      termsAcceptedAt: user.termsAcceptedAt,
      createdAt: user.createdAt,
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

  if (!pendo || typeof pendo.clearSession !== 'function') {
    return;
  }

  pendo.clearSession();
};
