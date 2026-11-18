/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Thin wrapper around the Pendo agent so Track Events never break the app flow.
// It is a no-op when the agent isn't loaded (e.g. self-hosted installs without Pendo).
const track = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export default {
  track,
};
