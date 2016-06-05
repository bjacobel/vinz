#! /usr/bin/env node

import commander from 'commander';
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

const vlog = (logMsg) => {
  // Log only if commander.verbose is set.
  if (commander.verbose) {
    console.log(logMsg);
  }
};

const awsAuth = (accessKeyId, secretAccessKey, profile) => {
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
    vlog('Using AWS credentials passed directly to CLI');

    AWS.config.update({
      accessKeyId,
      secretAccessKey
    });
  } else if (awsConfigExists) {
    const customProf = profile === undefined ? 'default' : profile;

    vlog(`Using ~/.aws/credentials with the [${customProf}] profile`);

    const credentials = new AWS.SharedIniFileCredentials({
      profile: customProf
    });

    AWS.config.credentials = credentials;
  } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // Don't need to do anything here, AWS.config will pick these up automatically
    vlog('Using AWS credentials preset in the environment');
  } else {
    console.error(
      'Could not find AWS credentials. See `vinz --help` ' +
      'for more info on your options for specifying credentials.'
    );
    process.exit(1);
  }
};

const getVinzKeyArn = (kms) => {
  return new Promise((resolve, reject) => {
    kms.listAliases({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(data)
        resolve(data);
      }
    });
  }).then((data) => {
    return data;
  });
};

const encryptAndStore = () => {
  const kms = new AWS.KMS();

  return getVinzKeyArn(kms).then((arn) => {
    console.log(arn);
  });
};

(() => {
  commander
    .version('0.0.1')
    .option('-v, --verbose', 'Print extra information')
    .option('-p, --profile [profile]', 'Specify a ~/.aws/credentials profile to use')
    .option('-a, --access-key-id [accessKeyId]', 'Override AWS access key found in env or in ~/.aws')
    .option('-s, --secret-access-key [secretAccessKey]', 'Override AWS secret key found in env or in ~/.aws')
    .option('-e, --encrypt [secretName]', 'Store an encrypted secret in ./secrets/secretName')
    .parse(process.argv);

  if (commander.encrypt) {
    awsAuth(commander.accessKeyId, commander.secretAccessKey, commander.profile);
    encryptAndStore(commander.encrypt);
  } else {
    console.log(
      'No arguments passed. You probably wanted `vinz --encrypt`.\n' +
      'Otherwise, check out `vinz --help`.'
    );
  }
})();

export default {
  awsAuth,
  encryptAndStore,
  getVinzKeyArn
};
