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

// Boot Pendo once with an anonymous visitor. The signed-in user is identified after core data loads.
// The app routes on the path (browser history), so the hash carries no page identity. In demo mode
// the login page reads credentials from the hash, so clear it from every URL Pendo records.
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
