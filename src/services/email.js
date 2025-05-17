    //crete a function to send email

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
        from: '"Stride Test" <stridetestingemail@gmail.com>',
        to: to,
        subject: subject,
        text: text,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email error:', error);
    }
    };

    module.exports = {
    sendEmail,
    };