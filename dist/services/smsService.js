"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCode = exports.sendVerificationCode = void 0;
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const twilioClient = new twilio_1.Twilio(accountSid, authToken);
const sendVerificationCode = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    yield twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
});
exports.sendVerificationCode = sendVerificationCode;
const verifyCode = (phoneNumber, code) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationCheck = yield twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: phoneNumber, code });
    return verificationCheck.status === 'approved';
});
exports.verifyCode = verifyCode;
