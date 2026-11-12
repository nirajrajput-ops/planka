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

// Boot Novus by Pendo once with an anonymous visitor. The signed-in user is identified later,
// once the core data (including the current user) has been fetched.
// In demo mode the login page reads credentials from the URL hash
// (#emailOrUsername=...&password=...). The app routes on the pathname, not the hash,
// so the hash is cleared from every recorded URL.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    transforms: [{ attr: 'hash', action: 'Clear' }],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
