var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "xbee2fa@gmail.com",
        pass: "xbeexbee"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "xbee2fa@gmail.com", // sender address
    to: "sahil29@gmail.com", // list of receivers
    subject: "Your 2-factor authentication code", // Subject line
    text: "123456"
};

// send mail with defined transport object
module.exports = smtpTransport;

/*smtpTransport.sendMail(mailOptions, function(error, response){
    if (error) {
        console.log(error);
    } else {
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    smtpTransport.close(); // shut down the connection pool, no more messages
});*/