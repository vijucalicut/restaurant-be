


const twilio = require('twilio');

// Twilio credentials (add to .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client;

if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ WhatsApp service initialized');
  } catch (error) {
    console.log('⚠️ WhatsApp service initialization failed:', error.message);
    client = null;
  }
} else {
  console.log('⚠️ WhatsApp service not configured - using simulation mode');
}

// Send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  try {
    if (!client) {
      console.log('WhatsApp message (simulated):', message);
      return { success: true, simulated: true };
    }

    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`
    });

    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
}

// Send booking confirmation
async function sendBookingConfirmation(phone, bookingDetails) {
  const message = `🎉 Booking Confirmed!

Restaurant: ${bookingDetails.restaurantName}
Table: ${bookingDetails.tableNumber}
Date: ${bookingDetails.date}
Time: ${bookingDetails.timeSlot}
Guests: ${bookingDetails.numberOfGuests}
Token: ${bookingDetails.token}

Status: Confirmed
Please arrive 10 minutes early.`;

  return await sendWhatsAppMessage(phone, message);
}

// Send queue notification
async function sendQueueNotification(phone, queueDetails) {
  const message = `📋 You're in the Queue!

Restaurant: ${queueDetails.restaurantName}
Position: ${queueDetails.position}
Estimated wait: ${queueDetails.estimatedWait} minutes

We'll notify you when a table becomes available.
Token: ${queueDetails.token}`;

  return await sendWhatsAppMessage(phone, message);
}

// Send status update
async function sendStatusUpdate(phone, statusDetails) {
  let message = '';

  switch (statusDetails.status) {
    case 'confirmed':
      message = `✅ Your booking is now confirmed!

Restaurant: ${statusDetails.restaurantName}
Table: ${statusDetails.tableNumber}
Date: ${statusDetails.date}
Time: ${statusDetails.timeSlot}`;
      break;

    case 'completed':
      message = `🎊 Thank you for dining with us!

Restaurant: ${statusDetails.restaurantName}
We hope you enjoyed your meal. Please rate us on our app!`;
      break;

    case 'rejected':
      message = `❌ Booking Update

Your booking for ${statusDetails.restaurantName} on ${statusDetails.date} has been cancelled.
Please try booking again or contact support.`;
      break;

    default:
      message = `📱 Booking Status Update

Restaurant: ${statusDetails.restaurantName}
Status: ${statusDetails.status}
Date: ${statusDetails.date}`;
  }

  return await sendWhatsAppMessage(phone, message);
}

// Process WhatsApp booking request
async function processWhatsAppBooking(phone, message) {
  // Simple parsing - in production, use NLP or structured commands
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
    // Extract booking details from message
    // This is a simplified example - use proper NLP in production
    return {
      action: 'booking_request',
      phone,
      message: message
    };
  }

  return { action: 'unknown', phone, message };
}

module.exports = {
  sendWhatsAppMessage,
  sendBookingConfirmation,
  sendQueueNotification,
  sendStatusUpdate,
  processWhatsAppBooking
};
