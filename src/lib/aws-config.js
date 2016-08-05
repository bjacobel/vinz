import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import ini from 'ini';

export default class AWSWithConfig {
  constructor(accessKeyId, secretAccessKey, region, profile) {
    /* Five different kinds of auth can be done, try them in this order:
       - Passed in explicitly (using commander.region, commander.accessKeyId and commander.secretAccessKey)
       - ~/.aws/credentials and ~/.aws/config (using commander.profile)
       - ~/.aws/credentials and ~/.aws/config (using the default profile)
       - env variables (AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)
       - On Lambda (EC2), auth should Just Work™ (due to preprovisioned IAM roles)
    */

    const configExists = this.checkAWSConfigFilesExistence();
    let authMethod;

    if (accessKeyId && secretAccessKey && region) {
      authMethod = 'Using AWS config and credentials explicitly passed';

      AWS.config.update({
        accessKeyId,
        secretAccessKey,
        region
      });
    } else if (configExists) {
      const customProf = profile === undefined ? 'default' : profile;

      authMethod = `Using ~/.aws/config and ~/.aws/credentials with the [${customProf}] profile`;

      const credentials = new AWS.SharedIniFileCredentials({
        profile: customProf
      });

      AWS.config.credentials = credentials;
      AWS.config.update({
        region: this.getRegion(customProf)
      });
    } else if (this.checkProcessEnv()) {
      // in production environments we set credentials using env vars, but region is not set
      // so we must set the region if it's passed and we determine we're using env vars for auth method
      if (region) {
        AWS.config.update({ region });
      }
      authMethod = 'Using AWS config and credentials preset in environment variables';
    }

    if (authMethod) {
      console.log(authMethod);
    } else {
      throw new Error(
        'Could not find AWS config and/or credentials. See `vinz --help` ' +
        'for more info on your options for specifying credentials.'
      );
    }

    this.KMS = new AWS.KMS();
    this.credentials = AWS.config.credentials;
  }

  checkAWSConfigFilesExistence() {
    try {
      fs.statSync(path.join(process.env.HOME, '.aws/config'));
      fs.statSync(path.join(process.env.HOME, '.aws/credentials'));
      return true;
    } catch (e) {
      return false;
    }
  }

  checkProcessEnv() {
    return process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  }

  getRegion(profile) {
    const file = fs.readFileSync(path.join(process.env.HOME, '.aws/config'), 'utf-8');
    const parsedIni = ini.parse(file);
    if (profile === 'default') {
      return parsedIni[profile].region;
    } else {
      return parsedIni[`profile ${profile}`].region;
    }
  }
}
