/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

const { getRemoteAddress } = require('../../../utils/remote-address');

const SYSTEM_ID = 'system';

const buildContext = (request) => {
  if (!request) {
    return undefined;
  }

  const context = {};

  if (request.ip) {
    context.ip = getRemoteAddress(request);
  }

  if (request.headers && request.headers['user-agent']) {
    context.userAgent = request.headers['user-agent'];
  }

  return context;
};

/**
 * Sends a Pendo Track Event to the Pendo Track API.
 *
 * Fire-and-forget: the request is not awaited, and any failure is only logged,
 * so tracking can never break or slow down the action being tracked.
 * Nothing is sent unless PENDO_TRACK_EVENT_SECRET is configured.
 */
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
      sails.log.error(`Pendo track event "${body.event}" failed with status ${response.status}`);
    }
  } catch (error) {
    sails.log.error(`Pendo track event "${body.event}" failed with error: ${error}`);
  }
}

module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    userId: {
      type: 'ref',
    },
    properties: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  fn(inputs) {
    try {
      const { pendoTrackEventSecret, pendoAccountId } = sails.config.custom;

      if (!pendoTrackEventSecret) {
        return;
      }

      sendTrackEvent({
        type: 'track',
        event: inputs.event,
        visitorId: inputs.userId ? String(inputs.userId) : SYSTEM_ID,
        accountId: pendoAccountId || SYSTEM_ID,
        timestamp: Date.now(),
        properties: inputs.properties || {},
        context: buildContext(inputs.request),
      });
    } catch (error) {
      sails.log.error(`Pendo track event "${inputs.event}" failed with error: ${error}`);
    }
  },
};
