/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import store from './store';
import history from './history';
import Root from './components/common/Root';

import './i18n';

// Boot Novus by Pendo once with an anonymous visitor. The signed-in user is identified in
// sagas/core/services/core.js once the current user is fetched.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    transforms: [
      {
        // In demo mode the login form prefills credentials from the URL fragment
        // (#emailOrUsername=...&password=...). The app doesn't route on the hash, so clearing it
        // keeps those values out of every recorded URL.
        attr: 'hash',
        action: 'Clear',
      },
    ],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
