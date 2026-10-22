/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Novus by Pendo analytics. The install snippet in index.html defines `window.pendo` and queues
// `initialize` and `identify` until the agent itself has loaded from the CDN. Every call goes
// through here and does nothing when the snippet did not run, so analytics can never get in the
// way of booting, signing in or signing out.

export const initializePendo = () => {
  if (!window.pendo) {
    return;
  }

  window.pendo.initialize({
    // Empty, so the agent picks up the visitor it already knows on this device or starts an
    // anonymous one. The signed-in user is identified once core initialization has fetched them.
    visitor: {
      id: '',
    },
    // In demo mode the login page prefills its form from the fragment
    // (`/login#emailOrUsername=...&password=...`, see components/common/Login/Content.jsx), so the
    // fragment is cleared from every URL the agent records. Routing is path based
    // (createBrowserHistory), so no page is told apart by its fragment.
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

export const identifyPendoVisitor = (user, bootstrap) => {
  if (!window.pendo) {
    return;
  }

  const options = {
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
      autoLogoutMode: user.autoLogoutMode,
      defaultEditorMode: user.defaultEditorMode,
      defaultHomeView: user.defaultHomeView,
      defaultProjectsOrder: user.defaultProjectsOrder,
      enableFavoritesByDefault: user.enableFavoritesByDefault,
      subscribeToOwnCards: user.subscribeToOwnCards,
      subscribeToCardWhenCommenting: user.subscribeToCardWhenCommenting,
      turnOffRecentCardHighlighting: user.turnOffRecentCardHighlighting,
    },
  };

  // There is no organization record: the optional, free-text organization on the profile is the
  // only link between a user and an account, so a user without one is tracked without an account.
  if (user.organization) {
    options.account = {
      id: user.organization,
      name: user.organization,
    };

    // The bootstrap only carries the limit for admins, everyone else leaves it as it is
    if ('activeUsersLimit' in bootstrap) {
      options.account.activeUsersLimit = bootstrap.activeUsersLimit;
    }
  }

  window.pendo.identify(options);
};

// The snippet does not queue `clearSession`, so it only exists once the agent has loaded.
export const clearPendoSession = () => {
  if (window.pendo && typeof window.pendo.clearSession === 'function') {
    window.pendo.clearSession();
  }
};
