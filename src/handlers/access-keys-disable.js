/**
 * A Lambda function that logs the payload received from a CloudWatch scheduled event.
 */
exports.eventHandler = async (event, context) => {
    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
// Set the region
    AWS.config.update({region: 'eu-central-1'});

// Create the IAM service object
    var iam = new AWS.IAM({apiVersion: '2010-05-08'});

    let users = await iam.listUsers().promise();
    for (const user of users.Users) {
        if ( 'PasswordLastUsed' in user){
            console.log(`The user ${user.UserName} is an admin user so disable the access key`);
            let param = {
                MaxItems: 5,
                UserName: user.UserName
            };
            let accessKeys = await iam.listAccessKeys(param).promise();
            for (const accessKey of accessKeys.AccessKeyMetadata) {
                if ( 'AccessKeyId' in accessKey){
                   let updateAccessKey = {
                        AccessKeyId: accessKey.AccessKeyId,
                        Status: 'Inactive',
                        UserName: user.UserName
                    };
                    console.log(`Disabling admin key: ${accessKey.AccessKeyId} for user ${user.UserName}`);
                    await iam.updateAccessKey(updateAccessKey).promise()
                }
            }
        }
    }
}
