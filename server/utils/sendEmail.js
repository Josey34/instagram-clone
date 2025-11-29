import { getEmailTransporter } from '../config/email.js';

export const sendEmail = async (options) => {
    const transporter = getEmailTransporter();

    const mailOptions = {
        from: `Instagram Clone <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};
