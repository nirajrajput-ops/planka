/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Sends a Pendo Track Event when the Pendo agent is loaded on the page.
// Tracking is best effort: a missing agent or a failing call never breaks the app flow.
export const trackPendoEvent = (name, properties) => {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(name, properties);
    }
  } catch {
    /* empty */
  }
};

export const getErrorCode = (error) => (error && error.code) || 'unknown';

export const getErrorMessage = (error) =>
  error && typeof error.message === 'string' ? error.message.slice(0, 100) : null;

// Only the scheme part of a URL is safe to report, the rest can contain credentials.
export const getUrlScheme = (url) => {
  if (typeof url !== 'string') {
    return null;
  }

  const match = url.match(/^([a-z][a-z0-9+.-]{0,31}):/i);

  return match ? match[1].toLowerCase() : null;
};
