const nodemailer = require('nodemailer')
require('dotenv').config()

//using nodemailer, message is sent to the restaurant
const SendEmail = async( subject, text, to) => {
    try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: to,
			subject: subject,
			html: text,
		});
	return "Successful"
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
}

module.exports = SendEmail;