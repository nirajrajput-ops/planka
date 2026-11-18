/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is present on the page.
// Analytics is strictly best-effort: a missing agent, or one that throws,
// must never interrupt the flow that reported the event.
//
// Event names are matched by Pendo exactly as written, so callers pass them
// verbatim. Never include secrets, tokens or personal details in properties.

const pendoTrack = (eventName, properties) => {
  try {
    const { pendo } = window;

    if (pendo && typeof pendo.track === 'function') {
      pendo.track(eventName, properties);
    }
  } catch {
    /* tracking failures are deliberately ignored */
  }
};

export default pendoTrack;
