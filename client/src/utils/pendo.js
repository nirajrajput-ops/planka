/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Novus by Pendo analytics. The snippet in index.html defines `window.pendo` and
// queues `initialize` and `identify` until the agent script has loaded, so both can
// be called right away. `clearSession` is not queued: it only exists once the agent
// has actually loaded, which a content blocker can prevent. Every call is guarded so
// analytics can never stop the app from booting or a logout from completing.

export const initializePendo = () => {
  const { pendo } = window;

  if (!pendo) {
    return;
  }

  pendo.initialize({
    // An empty id lets the agent reuse the visitor it remembers, or start an
    // anonymous one. The signed-in user is attached by `identifyPendoVisitor`.
    visitor: {
      id: '',
    },
    location: {
      // The demo-mode login form takes `emailOrUsername` and `password` from the
      // URL fragment (components/common/Login/Content.jsx). Routing is path-based,
      // so the fragment never identifies a page and is left out of every URL the
      // agent records.
      transforms: [
        {
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
};

// `user` is the current user exactly as returned by `GET /api/users/me`.
export const identifyPendoVisitor = (user) => {
  const { pendo } = window;

  if (!pendo) {
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
      createdAt: user.createdAt,
      isTotpEnabled: user.isTotpEnabled,
      totpEnabledAt: user.totpEnabledAt,
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

// Starts a fresh anonymous visitor, so whoever signs in next in this browser is
// not tracked under the previous user's identity.
export const clearPendoSession = () => {
  const { pendo } = window;

  if (!pendo || typeof pendo.clearSession !== 'function') {
    return;
  }

  pendo.clearSession();
};
