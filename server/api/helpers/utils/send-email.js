/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    transporter: {
      type: 'ref',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    subject: {
      type: 'string',
      required: true,
    },
    html: {
      type: 'string',
      required: true,
    },
    userId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const { userId, ...mailOptions } = inputs;

    try {
      const info = await inputs.transporter.sendMail(mailOptions);

      sails.log.info(`Email sent: ${info.messageId}`);

      sails.helpers.utils.sendPendoTrackEvent.with({
        event: 'Email notification sent',
        visitorId: userId,
      });
    } catch (error) {
      sails.log.error(`Error sending email: ${error}`);
    }
  },
};
