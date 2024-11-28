import { Twilio } from 'twilio';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

const twilioClient = new Twilio(accountSid, authToken);
const phoneUtil = PhoneNumberUtil.getInstance();

export const sendVerificationCode = async (phoneNumber: string) => {
    try {
        const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);
        
        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new Error('Invalid phone number.');
        }

        const e164PhoneNumber = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);

        await twilioClient.verify.v2
            .services(verifyServiceSid)
            .verifications.create({ to: e164PhoneNumber, channel: 'sms' });
    } catch (error) {
        console.error('Error in sendVerificationCode:', error);
        throw new Error((error as Error).message || 'Failed to send verification code.');
    }
};

export const verifyCode = async (phoneNumber: string, code: string) => {
    try {
        const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);
        
        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new Error('Invalid phone number.');
        }

        const e164PhoneNumber = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);

        const verificationCheck = await twilioClient.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({ to: e164PhoneNumber, code });

        return verificationCheck.status === 'approved';
    } catch (error) {
        console.error('Error in verifyCode:', error);
        throw new Error((error as Error).message || 'Failed to verify code.');
    }
};