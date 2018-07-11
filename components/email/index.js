import nodemailer from 'nodemailer';
import config from '../../config';

const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
    }
});

transport.send = (options) => transport.sendMail(options);

export default transport;