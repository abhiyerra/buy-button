var AWS = require('aws-sdk');

var ses = new AWS.SES();

exports.sendInvoiceEmail = function(email, product, downloadLink) {
    ses.sendEmail({
        Source: config.FROM_EMAIL,
        Destination: {
            ToAddresses: [
                email
            ],
            BccAddresses: [
                config.FROM_EMAIL
            ]
        },
        Message: {
            Subject: {
                Data: "Acksin Purchase Confirmation"
            },
            Body: {
                // Html: {
                //     Data: '<html><head>'
                //         + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                //         + '<title>Acksin Purchase Confirmation</title>'cksin
                //         + '</head><body>'
                //         + 'Please <a href="' + verificationLink + '">click here to verify your email address</a> or copy & paste the following link in a browser:'
                //         + '<br><br>'
                //         + '<a href="' + verificationLink + '">' + verificationLink + '</a>'
                //         + '</body></html>'
                Text: {
                    Data: "Acksin Purchase Confirmation\n"
                        + ""
                        + "Product: " + product.name
                        + "\n"
                        + "Amount Billed: " + product.amount / 100.0
                        + "\n"
                        + "Download Link: " + downloadLink
                        + "\n\n\n"
                        + "Thank You.\n\n"
                        + "Acksin Team"
                }
            }
        }
    }, function(err, data) {
        if(err) {
            console.log(err, err.stack); // an error occurred
        } else {
            console.log(data);           // successful response
        }
    });
}
