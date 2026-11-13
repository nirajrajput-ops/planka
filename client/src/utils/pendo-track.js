/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';

// Reports a Pendo Track Event through the agent's `pendo.track()`.
//
// The agent is not part of this bundle: it is loaded next to it, or not at all.
// So every call has to cope with it being absent, and nothing the agent throws
// may reach the action that is being reported.
//
// Properties that came out `undefined` or `null` are left off instead of sent.
// At every call site they mean "does not apply here" (a link has no file size, a
// search in the archive has no board-wide match count), and an absent property
// says exactly that.
export default (name, properties = {}) => {
  const { pendo } = window;

  if (!pendo || typeof pendo.track !== 'function') {
    return;
  }

  try {
    pendo.track(name, omitBy(properties, isNil));
  } catch {
    /* empty */
  }
};
