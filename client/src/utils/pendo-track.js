/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded on the page. The
// agent attaches the visitor and account itself, so callers only pass event
// specific properties. Tracking must never break the app, so a missing agent
// or an agent error is ignored.
const pendoTrack = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default pendoTrack;
