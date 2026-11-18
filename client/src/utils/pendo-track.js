/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event through the browser agent. The agent attaches the
// visitor and account on its own, so callers pass only event properties. When
// the agent isn't loaded (no install snippet, blocked by an extension) the call
// is a no-op, and a failure inside the agent never reaches the caller's flow.
export const trackPendoEvent = (name, properties) => {
  try {
    const { pendo } = window;

    if (pendo && typeof pendo.track === 'function') {
      pendo.track(name, properties);
    }
  } catch {
    /* tracking must never break the app */
  }
};

export const getErrorCode = (error) => (error && error.code) || 'unknown';
