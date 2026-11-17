/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Novus by Pendo Track Event. The agent is loaded asynchronously from index.html, so the
// call is skipped when it isn't ready yet, and a tracking failure never breaks the app flow.
// Visitor and account are attached by the agent, so they must not be passed as properties.
export const trackEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export const getErrorCode = (error) => (error && error.code) || 'unknown';

export default trackEvent;
