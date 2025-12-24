// Test webhook functionality
const axios = require('axios');

async function testWebhook() {
    try {
        const webhookUrl = 'http://localhost:5000/api/subscriptions/webhook';
        const testPayload = {
            event: 'charge.success',
            data: {
                reference: 'test_ref_123',
                subscription_code: 'test_sub_456',
                amount: 10000
            }
        };

        console.log('Testing webhook with payload:', JSON.stringify(testPayload, null, 2));

        const response = await axios.post(webhookUrl, testPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        console.log('Webhook response:', response.status, response.data);

    } catch (error) {
        console.error('Webhook test failed:', error.message);
        console.error('Full error:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

testWebhook();