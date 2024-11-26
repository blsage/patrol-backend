  // Replace the hardcoded credentials with environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;