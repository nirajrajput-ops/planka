/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

/**
 * Posts a Track Event to the Pendo Track API. Failures are logged and never thrown,
 * so tracking cannot break the request that triggered it.
 *
 * @param {string} url - Pendo Track API endpoint.
 * @param {string} secret - Pendo track event secret (integration key).
 * @param {Object} body - Track Event payload.
 * @returns {Promise<void>}
 */
async function postTrackEvent(url, secret, body) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': secret,
      },
      body: JSON.stringify(body),
      method: 'POST',
      dispatcher: sails.config.custom.outgoingProxy
        ? new ProxyAgent(sails.config.custom.outgoingProxy)
        : undefined,
    });

    if (!response.ok) {
      sails.log.warn(`Pendo track event "${body.event}" failed with status ${response.status}`);
    }
  } catch (error) {
    sails.log.warn(`Pendo track event "${body.event}" failed with error: ${error}`);
  }
}

module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
    },
    user: {
      type: 'ref',
    },
    properties: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const { pendoTrackEventSecret, pendoDataHost, pendoAccountId } = sails.config.custom;

    // Tracking is opt-in: nothing is sent unless the secret is configured.
    if (!pendoTrackEventSecret) {
      return;
    }

    try {
      const properties = _.omitBy(inputs.properties || {}, _.isUndefined);

      if (inputs.user && inputs.user.role && _.isUndefined(properties.user_role)) {
        properties.user_role = inputs.user.role;
      }

      postTrackEvent(`https://${pendoDataHost}/data/track`, pendoTrackEventSecret, {
        properties,
        type: 'track',
        event: inputs.event,
        visitorId: inputs.user && inputs.user.id ? String(inputs.user.id) : 'system',
        accountId: pendoAccountId || 'system',
        timestamp: Date.now(),
      });
    } catch (error) {
      sails.log.warn(`Pendo track event "${inputs.event}" could not be sent: ${error}`);
    }
  },
};
