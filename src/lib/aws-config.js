import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

export default class AWSWithConfig {
  constructor(accessKeyId, secretAccessKey, profile) {
    /* Four different kinds of auth can be done, try them in this order:
       - Passed in explicitly (using commander.accessKeyId and commander.secretAccessKey)
       - ~/.aws/credentials (using commander.profile)
       - ~/.aws/credentials (using the default profile)
       - env variables (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)
    */
    let awsConfigExists = false;

    try {
      fs.statSync(path.join(process.env.HOME, '.aws/credentials'));
      awsConfigExists = true;
    } catch (e) {
      // Don't do anything, we'll fall through to a different auth option below
    }

    if (accessKeyId && secretAccessKey) {
      console.debug('Using AWS credentials explicitly passed');

      AWS.config.update({
        accessKeyId,
        secretAccessKey
      });
    } else if (awsConfigExists) {
      const customProf = profile === undefined ? 'default' : profile;

      console.debug(`Using ~/.aws/credentials with the [${customProf}] profile`);

      const credentials = new AWS.SharedIniFileCredentials({
        profile: customProf
      });

      AWS.config.credentials = credentials;
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      // Don't need to do anything here, AWS.config will pick these up automatically
      console.debug('Using AWS credentials preset in the environment');
    } else {
      console.error(
        'Could not find AWS credentials. See `vinz --help` ' +
        'for more info on your options for specifying credentials.'
      );
      process.exit(1);
    }

    this.KMS = new AWS.KMS();
  }
}
