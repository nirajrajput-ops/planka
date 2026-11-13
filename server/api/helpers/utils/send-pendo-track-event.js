/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

const { getRemoteAddress } = require('../../../utils/remote-address');

// PLANKA has no account or tenant entity, so every event is attributed to a
// single "system" account unless the caller passes a more specific one.
const DEFAULT_ACCOUNT_ID = 'system';

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

  return Object.keys(context).length > 0 ? context : undefined;
};

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
      const message = await response.text();

      sails.log.error(
        `Pendo track event "${body.event}" failed with status ${response.status} and message: ${message}`,
      );
    }
  } catch (error) {
    sails.log.error(`Pendo track event "${body.event}" failed with error: ${error}`);
  }
}

/**
 * Sends a Pendo Track Event in the background. Never throws and never blocks
 * the caller, so a tracking failure cannot break the request it describes.
 * Does nothing unless PENDO_TRACK_EVENT_SECRET is configured.
 */
module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    // Typed loosely on purpose: a validation error here must never reach the
    // request being tracked.
    visitorId: {
      type: 'ref',
    },
    accountId: {
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
    const { pendoDataHost, pendoTrackEventSecret } = sails.config.custom;

    if (!pendoDataHost || !pendoTrackEventSecret) {
      return;
    }

    try {
      const body = {
        type: 'track',
        event: inputs.event,
        visitorId: inputs.visitorId ? String(inputs.visitorId) : 'system',
        accountId: inputs.accountId ? String(inputs.accountId) : DEFAULT_ACCOUNT_ID,
        timestamp: Date.now(),
        properties: _.omitBy(inputs.properties || {}, _.isUndefined),
        context: buildContext(inputs.request),
      };

      sendTrackEvent(body);
    } catch (error) {
      sails.log.error(`Pendo track event "${inputs.event}" failed with error: ${error}`);
    }
  },
};
