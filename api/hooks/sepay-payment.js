const webhookHandler = require('../pay/webhook');

/**
 * SePay Official Webhook Endpoint (matching /hooks/sepay-payment convention)
 * https://payment.sorae.tokyo/hooks/sepay-payment
 * https://sorae.tokyo/hooks/sepay-payment
 */
module.exports = async (req, res) => {
  return webhookHandler(req, res);
};
