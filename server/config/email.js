import nodemailer from 'nodemailer';

let transporter = null;

// Lazy initialize email transporter (only when first used)
export const getEmailTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }
    return transporter;
};
