var AWS = require('aws-sdk');

var s3 = new AWS.S3();

exports.getDownloadLink = function(existingLink, fn) {
    var params = {
        Bucket: existingLink.s3Bucket,
        Key: existingLink.s3Key,
        Expires: 259200 // 3 day link.
    };

    s3.getSignedUrl('putObject', params, fn);
}
