"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = void 0;
const google_libphonenumber_1 = require("google-libphonenumber");
const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
/**
 * Formats a phone number into E.164 standard format.
 * @param phoneNumber - The input phone number string.
 * @returns The formatted phone number in E.164 format.
 * @throws An error if the phone number is invalid.
 */
const formatPhoneNumber = (phoneNumber) => {
    try {
        const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);
        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new Error('Invalid phone number.');
        }
        const e164PhoneNumber = phoneUtil.format(parsedNumber, google_libphonenumber_1.PhoneNumberFormat.E164);
        return e164PhoneNumber;
    }
    catch (error) {
        console.error('Error in formatPhoneNumber:', error);
        throw new Error('Invalid phone number format.');
    }
};
exports.formatPhoneNumber = formatPhoneNumber;
