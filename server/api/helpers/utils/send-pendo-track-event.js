/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

// PLANKA has no account / tenant concept, so events are attributed to a
// single instance-level account unless the caller provides one.
const DEFAULT_ACCOUNT_ID = 'system';

async function sendTrackEvent(body) {
  const { pendoDataHost, pendoTrackEventSecret, outgoingProxy } = sails.config.custom;

  try {
    const response = await fetch(`https://${pendoDataHost}/data/track`, {
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': pendoTrackEventSecret,
      },
      body: JSON.stringify(body),
      method: 'POST',
      dispatcher: outgoingProxy ? new ProxyAgent(outgoingProxy) : undefined,
    });

    if (!response.ok) {
      sails.log.warn(`Pendo track event "${body.event}" failed with status ${response.status}`);
    }
  } catch (error) {
    sails.log.warn(`Pendo track event "${body.event}" failed with error: ${error}`);
  }
}

/**
 * Sends a server-side Track Event to Pendo (fire-and-forget).
 * Does nothing unless PENDO_TRACK_EVENT_SECRET is configured, and never throws,
 * so tracking can't break the calling flow.
 */
module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    visitorId: {
      type: 'string',
      allowNull: true,
    },
    accountId: {
      type: 'string',
      allowNull: true,
    },
    properties: {
      type: 'json',
    },
  },

  fn(inputs) {
    if (!sails.config.custom.pendoTrackEventSecret) {
      return;
    }

    sendTrackEvent({
      type: 'track',
      event: inputs.event,
      visitorId: inputs.visitorId || 'system',
      accountId: inputs.accountId || DEFAULT_ACCOUNT_ID,
      timestamp: Date.now(),
      properties: _.omitBy(inputs.properties || {}, _.isUndefined),
    });
  },
};
