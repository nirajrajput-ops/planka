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
// once the core data is fetched. The app routes with browser history, so the hash carries no
// page identity. In demo mode it can carry login credentials (see Login/Content.jsx), so it is
// cleared from every URL the SDK records.
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
