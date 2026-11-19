/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded on the page.
// Tracking is best effort and must never interrupt the application flow.
export const pendoTrack = (eventName, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(eventName, properties);
    }
  } catch {
    /* empty */
  }
};

export const getErrorCode = (error) => (error && error.code) || 'unknown';

export default pendoTrack;
