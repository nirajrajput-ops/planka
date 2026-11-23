/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded.
// Tracking must never break the application flow, so every failure is swallowed.
export const trackPendoEvent = (name, properties) => {
  try {
    const { pendo } = window;

    if (pendo && typeof pendo.track === 'function') {
      pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export const truncateForPendo = (value, length = 100) =>
  typeof value === 'string' ? value.slice(0, length) : value;

export default {
  trackPendoEvent,
  truncateForPendo,
};
