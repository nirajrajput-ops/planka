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

// Boot the Novus by Pendo SDK once with an anonymous visitor. The signed-in user is
// identified later in sagas/core/services/core.js once their profile has loaded.
if (window.pendo) {
  window.pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      // The app uses browser history routing, so the hash never identifies a page. In demo
      // mode the login page reads credentials from the hash (#emailOrUsername=...&password=...),
      // so clear the hash from every URL the SDK records.
      transforms: [{ attr: 'hash', action: 'Clear' }],
    },
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
