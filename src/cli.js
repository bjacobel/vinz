#! /usr/bin/env node

import AWSWithConfig from './lib/aws-config';
import { encryptAndStore } from './lib/aws-kms';
import commander from 'commander';
import prompt from 'prompt';
import colors from 'colors/safe';

export const encryptByCLI = (cmdr) => {
  const AWS = new AWSWithConfig(
    cmdr.accessKeyId,
    cmdr.secretAccessKey,
    cmdr.profile
  );

  prompt.message = colors.green(cmdr.encrypt);
  prompt.start();
  prompt.get({
    properties: {
      secretValue: {
        required: true,
        description: `Enter the value to encrypt as ${cmdr.encrypt}. Typing will be hidden`,
        hidden: true
      }
    }
  }, (err, result) => {
    encryptAndStore(AWS.KMS, cmdr.encrypt, result.secretValue);
  });
};

export const startCLI = () => {
  commander
    .version('0.0.1')
    .option('-p, --profile <profile>', 'Specify a ~/.aws/credentials profile to use')
    .option('-a, --access-key-id <accessKeyId>', 'Override AWS access key found in env or in ~/.aws')
    .option('-s, --secret-access-key <secretAccessKey>', 'Override AWS secret key found in env or in ~/.aws')
    .option('-e, --encrypt <secretName>', 'Store an encrypted secret in ./secrets/secretName')
    .parse(process.argv);

  if (commander.encrypt) {
    encryptByCLI(commander);
  } else {
    console.error(
      'No arguments passed. You probably wanted `vinz --encrypt`.\n' +
      'Otherwise, check out `vinz --help`.'
    );
  }
};

startCLI();
