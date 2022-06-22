const nodemailer = require('nodemailer')

//using nodemailer, message is sent to the restaurant
const SendEmail = async(email, subject, text) => {
    try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'temmitayolawal35@gmail.com',
				pass: 'eafnlebrlbotkxtf',
			},
		});

		await transporter.sendMail({
			from: 'temmitayolawal35@gmail.com',
			to: 'temmitayolawal35@gmail.com',
			subject: subject,
			text: text,
		});
	return "Successful"
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
}

module.exports = SendEmail;