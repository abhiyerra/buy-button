$(document).ready(function() {
    $("#payment-form").submit(function() {
        var $form = $(this);

        // Disable the submit button to prevent repeated clicks
        $form.find('button').prop('disabled', true);

        Stripe.card.createToken($form, function(status, response) {
            var $form = $('#payment-form');

            if (response.error) {
                // Show the errors on the form
                $form.find('.payment-errors').text(response.error.message);
                $form.find('button').prop('disabled', false);
            } else {
                // response contains id and card, which contains additional card details
                var token = response.id;
                // Insert the token into the form so it gets submitted to the server
                $form.append($('<input type="hidden" name="stripeToken" />').val(token));

                var data = {};
                $form.serializeArray().map(function(x) {
                    data[x.name] = x.value;
                });

                var lambda = new AWS.Lambda();
                lambda.invoke({
                    FunctionName: PurchaseLambdaFunction,
                    Payload: JSON.stringify(data)
                }, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        var output = JSON.parse(data.Payload);
                        if (output != null && output.downloadLink) {
                            $("#download-link").html("Download the file at " + output.downloadLink);
                        } else {
                            $("#download-link").html("Purchase Failed");
                        }
                    }
                });
            }
        });

        // Prevent the form from submitting with the default action
        return false;
    })
})
