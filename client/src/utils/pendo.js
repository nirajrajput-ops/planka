/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Fail-safe wrapper around the Pendo agent's track call. The agent is loaded
// outside of this bundle (if at all), so it is looked up at call time, and any
// failure is swallowed — analytics must never break the application flow.
export const trackPendoEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default {
  trackPendoEvent,
};
