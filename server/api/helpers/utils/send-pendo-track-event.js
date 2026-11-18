/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

const SYSTEM_ID = 'system';

const toId = (value) => (_.isNil(value) || value === '' ? SYSTEM_ID : String(value));

async function postTrackEvent(body) {
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
 * Sends a Pendo Track Event in the background (fire-and-forget).
 * Does nothing unless PENDO_TRACK_EVENT_SECRET is configured, and never throws,
 * so tracking can't break the request that triggered it.
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

    try {
      postTrackEvent({
        type: 'track',
        event: inputs.event,
        visitorId: toId(inputs.visitorId),
        accountId: toId(inputs.accountId || sails.config.custom.pendoAccountId),
        timestamp: Date.now(),
        properties: _.omitBy(inputs.properties || {}, _.isUndefined),
      });
    } catch (error) {
      sails.log.warn(`Pendo track event "${inputs.event}" failed with error: ${error}`);
    }
  },
};
