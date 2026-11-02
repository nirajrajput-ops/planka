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

// The demo-mode login form is pre-filled from credentials in the URL fragment
// (see components/common/Login/Content.jsx). The app does not route on the hash,
// so clearing it keeps those credentials out of every URL Pendo records.
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
