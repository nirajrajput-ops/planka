/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Thin, failure-safe wrapper around the Pendo agent's Track Event API.
// The agent is optional: when it isn't loaded on the page this is a no-op,
// and a tracking failure must never break the flow that triggered it.
export const trackEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default trackEvent;
