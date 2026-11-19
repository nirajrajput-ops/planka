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

// Boot Novus by Pendo once, with an anonymous visitor. The signed-in user is
// registered later with pendo.identify once the core bootstrap has loaded.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    transforms: [
      // In demo mode the login page reads emailOrUsername and password from the
      // URL fragment. The app routes on the pathname, not the hash, so clearing
      // the fragment keeps those credentials out of recorded URLs.
      {
        attr: 'hash',
        action: 'Clear',
      },
    ],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
