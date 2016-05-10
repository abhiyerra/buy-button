 AWS.config = new AWS.Config({
     accessKeyId: '',  // Change to your ACCESS_KEY_FOR_IAM_USER
     secretAccessKey: '', // Change to your SECRET_KEY_FOR_IAM_USER
     region: 'us-west-2'
 });

 Stripe.setPublishableKey('pk_test_Wl3qsnArSjA9CLXwp8IKPTVm'); // Get a Stripe API key.

 var PurchaseLambdaFunction = 'acksin_store_example-dev';
