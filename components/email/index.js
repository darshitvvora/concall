const nodeMailer = require('nodemailer');
const config = require('../../config');

const transport = nodeMailer.createTransport({
    // host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    // secure: config.SMTP_SECURE,
    ignoreTLS: config.SMTP_IGNORETLS,
});

transport.send = (options) => transport.sendMail(options);

module.exports = {
    transport,
};