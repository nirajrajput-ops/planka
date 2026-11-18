/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded. Tracking is best-effort:
// a missing agent or an agent error must never break the application flow.
const trackPendoEvent = (name, properties = {}) => {
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
