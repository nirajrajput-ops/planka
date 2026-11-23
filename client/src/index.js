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

// Boot Pendo once with an anonymous visitor. The core saga identifies the signed-in user.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    // The login page in demo mode reads credentials from the URL hash
    // (components/common/Login/Content.jsx). The app uses browser history, not hash routing,
    // so the fragment carries no page identity and is cleared from recorded URLs.
    transforms: [{ attr: 'hash', action: 'Clear' }],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
