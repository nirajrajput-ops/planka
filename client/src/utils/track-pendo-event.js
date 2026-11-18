/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded.
// Tracking must never break the app flow, so missing agents and agent errors are ignored.
export default (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};
