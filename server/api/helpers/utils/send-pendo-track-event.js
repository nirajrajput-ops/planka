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

  return _.isEmpty(context) ? undefined : context;
};

/**
 * Sends a Track Event to the Pendo Track API.
 *
 * Fire-and-forget: the request runs in the background and any failure is logged,
 * so analytics can never break or slow down the calling action.
 *
 * @param {string} event - Track Event name registered in Pendo.
 * @param {string} [visitorId] - ID of the user the event belongs to.
 * @param {Object} [properties] - Event metadata.
 * @param {ref} [request] - Incoming request, used for IP and user agent context.
 * @returns {Promise<void>}
 */
async function sendTrackEvent(event, visitorId, properties, request) {
  const { pendoTrackEventSecret, pendoDataHost, pendoAccountId, outgoingProxy } =
    sails.config.custom;

  try {
    const body = JSON.stringify({
      event,
      type: 'track',
      visitorId: visitorId || SYSTEM_ID,
      accountId: pendoAccountId || SYSTEM_ID,
      timestamp: Date.now(),
      properties: properties || {},
      context: buildContext(request),
    });

    const response = await fetch(`https://${pendoDataHost}/data/track`, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': pendoTrackEventSecret,
      },
      dispatcher: outgoingProxy ? new ProxyAgent(outgoingProxy) : undefined,
    });

    if (!response.ok) {
      sails.log.warn(`Pendo track event "${event}" failed with status ${response.status}`);
    }
  } catch (error) {
    sails.log.warn(`Pendo track event "${event}" failed with error: ${error}`);
  }
}

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
    properties: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  fn(inputs) {
    if (!sails.config.custom.pendoTrackEventSecret) {
      return;
    }

    sendTrackEvent(inputs.event, inputs.visitorId, inputs.properties, inputs.request);
  },
};
