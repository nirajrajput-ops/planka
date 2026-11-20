/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded on the page.
// Tracking is best effort, so a missing agent or a tracking error never breaks the app flow.
export const trackPendoEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export const getErrorCode = (error) => (error && error.code) || 'unknown';

export default trackPendoEvent;
