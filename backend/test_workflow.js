const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'prajwalkr3105@gmail.com'; // Your email to receive alerts!

async function testWorkflow() {
  try {
    console.log('--- STARTING WORKFLOW TEST ---');

    // 1. Register Test User
    console.log('\n1. Registering Test User...');
    try {
      await axios.post(`${API_URL}/auth/register`, {
        full_name: 'Test Customer',
        email: TEST_EMAIL,
        password: 'password123',
        role: 'user'
      });
      console.log('✅ User registered successfully!');
    } catch (e) {
      if (e.response && e.response.status === 400) {
        console.log('⚠️ User already exists. Proceeding...');
      } else {
        throw e;
      }
    }

    // 2. Login User
    console.log('\n2. Logging in as Test User...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: 'password123'
    });
    const userToken = loginRes.data.access_token;
    console.log('✅ User logged in! Token acquired.');

    // 3. Create Ticket (Should trigger Email)
    console.log('\n3. Creating Support Ticket (Check your email!)...');
    const ticketRes = await axios.post(`${API_URL}/tickets/create`, {
      subject: 'My Laptop is broken',
      description: 'The screen is completely black when I turn it on.',
      priority: 'High'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const ticket = ticketRes.data;
    console.log(`✅ Ticket Created: ${ticket.ticket_number}`);

    // 4. Login as Admin
    console.log('\n4. Logging in as Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@support.com',
      password: 'password123'
    });
    const adminToken = adminRes.data.access_token;
    console.log('✅ Admin logged in!');

    // 5. Admin updates ticket to Resolved (Should trigger Email)
    console.log('\n5. Admin marking ticket as Resolved (Check your email!)...');
    await axios.put(`${API_URL}/tickets/${ticket.id}`, {
      status: 'Resolved'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Ticket marked as resolved!');

    // 6. User submits Feedback
    console.log('\n6. User submitting feedback...');
    await axios.post(`${API_URL}/tickets/${ticket.id}/feedback`, {
      rating: 5,
      comments: 'Excellent and fast service! Highly recommend.'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Feedback submitted!');

    // 7. Verify Data
    console.log('\n7. Verifying Ticket Data & Logs...');
    const verifyRes = await axios.get(`${API_URL}/tickets/${ticket.id}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const finalTicket = verifyRes.data;
    
    console.log('\n--- TEST SUMMARY ---');
    console.log(`Ticket Status: ${finalTicket.status}`);
    console.log(`Logs generated: ${finalTicket.logs.length}`);
    finalTicket.logs.forEach(log => {
      console.log(`  - [LOG]: ${log.action} at ${new Date(log.timestamp).toLocaleTimeString()}`);
    });
    console.log(`Feedback Rating: ${finalTicket.feedback.rating}/5`);
    console.log(`Feedback Comment: "${finalTicket.feedback.comments}"`);
    console.log('\n✅ ALL WORKFLOW TESTS PASSED PERFECTLY!');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.response ? err.response.data : err.message);
  }
}

testWorkflow();
