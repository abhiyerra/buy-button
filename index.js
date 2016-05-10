console.log('Loading Acksin Store function');

// dependencies
var AWS = require('aws-sdk');

// Get reference to AWS clients
var dynamodb = new AWS.DynamoDB();

// Link generator. Included in the Purchased version.
var download = require('./download.js');

// Invoice email generator. Included in the Purchased version.
var invoice = require('./invoice.js');

var config = require('./config.json');

var stripe = require("stripe")(config.STRIPE_SECRET_KEY);

exports.handler = function(event, context) {
    var stripeToken = event.stripeToken;
    var email = event.email;
    var product = event.product;

    console.log("Received" + email + " " + product +  " " + stripeToken);

    if(product in config.PRODUCTS) {
        var amount = config.PRODUCTS[product].amount;

        console.log(product + " is in our PRODUCTS");
        console.log("" + amount + " is in our amount");

        stripe.customers.create({
            source: stripeToken,
            description: email,
        }).then(function(customer) {
            console.log("Creating the charge");

            return stripe.charges.create({
                amount: amount, // amount in cents, again
                currency: "usd",
                customer: customer.id
            });
        }).then(function(charge) {
            console.log("Adding item to the Table: " + config.STORE_TABLE);

            // Generate a downloadLink to give the user.
            download.getDownloadLink(config.PRODUCTS[product].downloadLink, function(err, url) {
                dynamodb.putItem({
                    TableName: config.STORE_TABLE,
                    Item: {
                        customerId: {
                            S: charge.customer
                        },
                        chargeId: {
                            S: charge.id
                        },
                        email: {
                            S: email
                        },
                        product: {
                            S: product
                        },
                        downloadLink: {
                            S: url
                        },
                        livemode: {
                            BOOL: charge.livemode
                        }
                    }
                }, function(err, data) {
                    if(err != null) {
                        console.log(err)
                        context.fail();
                    } else {
                        console.log("success");

                        invoice.sendInvoiceEmail(email, config.PRODUCTS[product], downloadLink);

                        context.succeed({
                            downloadLink: url
                        });
                    }
                });
            });
        });
    } else {
        context.fail();
    }
}
