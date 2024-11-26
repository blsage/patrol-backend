import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

const twilioClient = new Twilio(accountSid, authToken);

export const sendVerificationCode = async (phoneNumber: string) => {
    await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
};

export const verifyCode = async (phoneNumber: string, code: string) => {
    const verificationCheck = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: phoneNumber, code });

    return verificationCheck.status === 'approved';
};