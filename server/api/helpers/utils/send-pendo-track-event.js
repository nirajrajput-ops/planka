/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ProxyAgent } = require('undici');

async function sendTrackEvent(body) {
  try {
    const response = await fetch(`https://${sails.config.custom.pendoDataHost}/data/track`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': sails.config.custom.pendoTrackEventSecret,
      },
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

/**
 * Sends a server-side Pendo Track Event (fire-and-forget).
 *
 * Tracking never blocks or breaks the calling flow: the request is not awaited,
 * failures are only logged, and nothing is sent unless PENDO_TRACK_EVENT_SECRET is set.
 *
 * Planka has no account/tenant concept, so the project (top-level workspace) the event
 * belongs to is used as the Pendo account. Events outside of any project use "system".
 */
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
    project: {
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
      sendTrackEvent({
        type: 'track',
        event: inputs.event,
        visitorId: inputs.user && inputs.user.id ? String(inputs.user.id) : 'system',
        accountId: inputs.project && inputs.project.id ? String(inputs.project.id) : 'system',
        timestamp: Date.now(),
        properties: _.omitBy(inputs.properties || {}, _.isUndefined),
      });
    } catch (error) {
      sails.log.warn(`Pendo track event "${inputs.event}" failed with error: ${error}`);
    }
  },
};
