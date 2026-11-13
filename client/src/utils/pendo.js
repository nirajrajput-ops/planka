/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// A thin wrapper around the Pendo agent (`window.pendo`) for Track Events.
//
// Every call is a no-op until the Pendo snippet is on the page, and nothing in here is allowed
// to throw: a missing, blocked or broken agent must never get in the way of the action being
// tracked.

const track = (eventName, properties) => {
  try {
    const { pendo } = window;

    if (pendo && typeof pendo.track === 'function') {
      pendo.track(eventName, properties);
    }
  } catch {
    /* empty */
  }
};

// On /login the Pendo visitor is still anonymous, so anything tracked while signing in would
// land on the wrong visitor. Such work is handed to `whenIdentified` and held here until
// `markIdentified` runs, once core initialization has loaded the signed-in user: the first
// point at which the visitor can be identified as them. Signing in and core initialization
// share one page load, so an in-memory queue is enough.

let isIdentified = false;
const callbacksAwaitingIdentify = [];

const whenIdentified = (callback) => {
  if (isIdentified) {
    callback();
  } else {
    callbacksAwaitingIdentify.push(callback);
  }
};

const markIdentified = () => {
  isIdentified = true;

  callbacksAwaitingIdentify.splice(0).forEach((callback) => {
    callback();
  });
};

export default {
  track,
  whenIdentified,
  markIdentified,
};
