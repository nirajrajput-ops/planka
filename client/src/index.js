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

// Boot Novus by Pendo once, as an anonymous visitor. The signed-in user is identified
// later, in the initializeCore saga, once the current user has been fetched.
if (window.pendo) {
  window.pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      // In demo mode the login page is opened with credentials in the fragment
      // (#emailOrUsername=...&password=...). The app uses browser history routing, so the
      // fragment never identifies a page and is cleared from every recorded URL.
      transforms: [
        {
          attr: 'hash',
          action: 'Clear',
        },
      ],
    },
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
