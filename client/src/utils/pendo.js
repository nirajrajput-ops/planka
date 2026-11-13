/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Best-effort Pendo Track Event. Analytics must never break the app, so a
// missing agent (e.g. Pendo not installed or blocked) or a throwing agent is
// silently ignored.
const trackPendoEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default trackPendoEvent;
