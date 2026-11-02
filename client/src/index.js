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

// Boot Pendo exactly once with an anonymous visitor; the signed-in user is identified later.
// In demo mode the login page reads credentials from the URL hash (see Login/Content.jsx), and
// the app uses browser (path-based) routing, so the hash carries no page identity and is
// cleared from every URL Pendo records.
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
