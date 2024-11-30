import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Formats a phone number into E.164 standard format.
 * @param phoneNumber - The input phone number string.
 * @returns The formatted phone number in E.164 format.
 * @throws An error if the phone number is invalid.
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
    try {
        const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);

        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new Error('Invalid phone number.');
        }

        const e164PhoneNumber = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);

        return e164PhoneNumber;
    } catch (error) {
        console.error('Error in formatPhoneNumber:', error);
        throw new Error('Invalid phone number format.');
    }
};