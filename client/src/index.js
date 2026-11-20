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

if (window.pendo) {
  window.pendo.initialize({
    visitor: {
      id: '',
    },
    location: {
      // The demo-mode login page reads credentials from the URL fragment. The app uses
      // browser history routing, so the fragment carries no page identity and is cleared.
      transforms: [{ attr: 'hash', action: 'Clear' }],
    },
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
