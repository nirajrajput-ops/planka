/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event. The Pendo agent is loaded outside the bundle (if
// at all), so the global is looked up on every call, and any failure is
// swallowed — analytics must never get in the way of the app itself.
const trackEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default trackEvent;
