require('dotenv').config();
const twilio = require('twilio');
const logger = require('./logger');


const sendSMSMessage = async (to, from, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken || !from || !to) {
        logger.info('SMS reminder skipped because Twilio is not fully configured.');
        return { skipped: true };
    }
    try {
        const client = twilio(accountSid, authToken);
        const result = await client.messages.create({
            body: message,
            from: from,
            to: to
        });

        logger.info(`SMS sent to ${to} from SID:${result.sid} successfully`);
        return { skipped: false, sid: result.sid };
    } catch (error) {
        logger.error(`Error sending SMS to ${to} :  ${error.message}`);
        throw new Error(`Failed to send SMS to ${to}`);
    }
}

module.exports = sendSMSMessage;
