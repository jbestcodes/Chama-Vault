const express = require('express');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.body)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;
      const email = data.customer.email;

      await Subscription.findOneAndUpdate(
        { 'payments.reference': reference }, // optional: check if reference exists inside payments array
        {
          status: 'active',
          'payments.$.status': 'success',
          'payments.$.paid_at': new Date(),
          email,
        },
        { upsert: true }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

module.exports = router;
