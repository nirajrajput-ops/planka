/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

const SYSTEM_ID = 'system';

async function sendTrackEvent(payload) {
  const { pendoDataHost, pendoTrackEventSecret, outgoingProxy } = sails.config.custom;

  try {
    const response = await fetch(`https://${pendoDataHost}/data/track`, {
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': pendoTrackEventSecret,
      },
      body: JSON.stringify(payload),
      method: 'POST',
      dispatcher: outgoingProxy ? new ProxyAgent(outgoingProxy) : undefined,
    });

    if (!response.ok) {
      sails.log.warn(`Pendo track event "${payload.event}" failed with status ${response.status}`);
    }
  } catch (error) {
    sails.log.warn(`Pendo track event "${payload.event}" failed with error: ${error}`);
  }
}

/**
 * Sends a server-side Pendo Track Event without blocking the caller.
 * Does nothing when PENDO_TRACK_EVENT_SECRET is not set.
 */
module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    visitorId: {
      type: 'ref',
    },
    accountId: {
      type: 'ref',
    },
    properties: {
      type: 'ref',
    },
  },

  fn(inputs) {
    if (!sails.config.custom.pendoTrackEventSecret) {
      return;
    }

    sendTrackEvent({
      type: 'track',
      event: inputs.event,
      visitorId: _.isNil(inputs.visitorId) ? SYSTEM_ID : String(inputs.visitorId),
      accountId: _.isNil(inputs.accountId) ? SYSTEM_ID : String(inputs.accountId),
      timestamp: Date.now(),
      properties: _.omitBy(inputs.properties || {}, _.isUndefined),
    });
  },
};
