/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded on the page.
// Tracking must never break the application flow, so a missing agent or a
// failing call is ignored.
const trackPendoEvent = (name, properties) => {
  try {
    const { pendo } = window;

    if (pendo && typeof pendo.track === 'function') {
      pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default trackPendoEvent;
