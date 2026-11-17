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

// Boot Novus by Pendo once with an anonymous visitor. The signed-in user is identified later in
// sagas/core/services/core.js. In demo mode the login page reads credentials from the URL hash
// (components/common/Login/Content.jsx), and the app doesn't route on the hash, so the fragment
// is cleared from every URL the SDK records.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    transforms: [
      {
        attr: 'hash',
        action: 'Clear',
      },
    ],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
