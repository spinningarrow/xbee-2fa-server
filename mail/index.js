var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
// Address and password are from environment variables
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: process.env.MAILER_ADDRESS,
        pass: process.env.MAILER_PASS
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "XBee 2FA <xbee2fa@gmail.com>", // sender address
    generateTextFromHTML: true,
};

// send mail with defined transport object
module.exports = {
    options: mailOptions,
    smtpTransport: smtpTransport
};