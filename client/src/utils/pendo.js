/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event. Does nothing when the Pendo agent isn't loaded, and never throws,
// so analytics can't break the flow that reports it.
// eslint-disable-next-line import/prefer-default-export
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
