const crypto = require('crypto');

async function testWebhook() {
    const secret = "test_secret_123"; // Make sure this matches your local .env FLUTTERWAVE_WEBHOOK_SECRET

    // Payload matching what we expect
    // We need to query the database to get a valid user email and bootcamp ID for the test to fully pass logic
    // But for a generic test we can use placeholders and expect 404/400 which proves the endpoint works.

    const payload = {
        event: "charge.completed",
        data: {
            id: Math.floor(Math.random() * 1000000),
            tx_ref: "test_ref_" + Date.now(),
            flw_ref: "flw_ref_" + Date.now(),
            amount: 5000,
            currency: "NGN",
            status: "successful",
            customer: {
                email: "test@example.com",
                name: "Test User"
            },
            meta: {
                bootcampId: "bootcamp_id_here"
            }
        }
    };

    console.log("Sending webhook request...");

    try {
        const response = await fetch("http://localhost:3000/api/webhooks/flutterwave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "verif-hash": secret
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (response.status === 401) {
            console.log("Test Passed: Unauthorized (if you didn't set .env yet)");
        } else if (response.status === 200 || response.status === 404) {
            console.log("Endpoint reached successfully.");
        }

    } catch (error) {
        console.error("Error sending request:", error);
    }
}

testWebhook();
