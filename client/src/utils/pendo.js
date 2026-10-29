/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Thin wrapper around the Pendo agent's track API. The agent is optional, so a
// missing or broken agent must never interfere with the application flow.
export const trackPendoEvent = (name, properties) => {
  try {
    if (typeof window !== 'undefined' && window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

// Keeps free-form strings (e.g. server error messages) well under Pendo's
// property size limits.
export const truncatePendoValue = (value, length = 100) =>
  typeof value === 'string' ? value.substring(0, length) : value;
