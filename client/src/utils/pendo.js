/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The Pendo install snippet in index.html defines window.pendo and queues calls until the agent
// script loads. clearSession is not part of that queue, so it is only called once the agent exists.

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
      // The application routes on the pathname only. The fragment is used by the demo mode
      // sign-in form to prefill credentials (#emailOrUsername=...&password=...), so it is never
      // recorded.
      transforms: [
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

  if (!pendo || typeof pendo.identify !== 'function' || !user) {
    return;
  }

  pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      organization: user.organization,
      language: user.language,
      isDeactivated: user.isDeactivated,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
      createdAt: user.createdAt,
      termsAcceptedAt: user.termsAcceptedAt,
      passwordChangedAt: user.passwordChangedAt,
      apiKeyCreatedAt: user.apiKeyCreatedAt,
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
