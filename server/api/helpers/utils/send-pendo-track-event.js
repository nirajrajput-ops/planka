/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

/**
 * Sends a Track Event to the Pendo Track API.
 *
 * Fire-and-forget: failures are logged and never interrupt the calling flow.
 * Nothing is sent unless PENDO_TRACK_EVENT_SECRET is configured.
 *
 * @param {Object} payload - Track API request body.
 * @returns {Promise<void>}
 */
async function sendPendoTrackEvent(payload) {
  try {
    const response = await fetch(`https://${sails.config.custom.pendoDataHost}/data/track`, {
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': sails.config.custom.pendoTrackEventSecret,
      },
      body: JSON.stringify(payload),
      method: 'POST',
      dispatcher: sails.config.custom.outgoingProxy
        ? new ProxyAgent(sails.config.custom.outgoingProxy)
        : undefined,
    });

    if (!response.ok) {
      const message = await response.text();

      sails.log.error(
        `Pendo track event "${payload.event}" failed with status ${response.status} and message: ${message}`,
      );
    }
  } catch (error) {
    sails.log.error(`Pendo track event "${payload.event}" failed with error: ${error}`);
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
      type: 'string',
    },
    properties: {
      type: 'json',
    },
  },

  fn(inputs) {
    if (!sails.config.custom.pendoTrackEventSecret) {
      return;
    }

    sendPendoTrackEvent({
      type: 'track',
      event: inputs.event,
      visitorId: inputs.userId || 'system',
      accountId: sails.config.custom.pendoAccountId || 'system',
      timestamp: Date.now(),
      properties: inputs.properties || {},
    });
  },
};
