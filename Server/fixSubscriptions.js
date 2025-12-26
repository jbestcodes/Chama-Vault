// scripts/verifySubscriptions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaystackService from '../services/paystackService.js';
import Subscription from '../models/Subscription.js';
import Member from '../models/Member.js';

dotenv.config();

// Connect to your MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const verifyPendingSubscriptions = async () => {
  try {
    // Get all subscriptions that are not active
    const pendingSubs = await Subscription.find({ status: { $ne: 'active' } });

    console.log(`🔍 Found ${pendingSubs.length} pending subscriptions.`);

    for (let sub of pendingSubs) {
      const reference = sub.reference;
      const memberId = sub.member_id;

      console.log(`Verifying subscription: ${reference} for member: ${memberId}`);

      const result = await PaystackService.verifySubscription(reference);

      if (result.success) {
        // Update the subscription
        await Subscription.findByIdAndUpdate(sub._id, {
          status: 'active',
          paidAt: new Date(),
          email: result.customer.email
        });

        console.log(`Subscription ${reference} marked as active.`);

        // Optionally, update member features if needed
        await Member.findByIdAndUpdate(memberId, {
          hasActiveSubscription: true
        });
      } else {
        console.log(` Subscription ${reference} not verified. Reason: ${result.error || 'Payment failed'}`);
      }
    }

    console.log(' Verification complete.');
    process.exit(0); // Exit the script
  } catch (error) {
    console.error(' Error verifying subscriptions:', error);
    process.exit(1);
  }
};

verifyPendingSubscriptions();

