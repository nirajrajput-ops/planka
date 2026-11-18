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

// Pendo starts once per page load with an anonymous visitor; the signed-in user is identified
// in the initializeCore saga. The URL fragment is dropped from everything it records: in demo
// mode the login page prefills the email/username and password from it, and no route here
// depends on it.
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
