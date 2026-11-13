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

// Boot Pendo once with an anonymous visitor. The signed-in user is identified in
// sagas/core/services/core.js once the current user has been fetched.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    // In demo mode the login page pre-fills its form from the URL hash
    // (#emailOrUsername=...&password=...). The app uses browser history, not hash
    // routing, so the hash carries no page identity and can be cleared safely.
    transforms: [{ attr: 'hash', action: 'Clear' }],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
