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

// Boot Novus by Pendo once with an anonymous visitor. The signed-in user is identified
// in the core saga after the current user is fetched.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    // In demo mode the login page reads `emailOrUsername` and `password` from the URL hash.
    // The app uses browser history routing, so the hash carries no page identity.
    transforms: [{ attr: 'hash', action: 'Clear' }],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
