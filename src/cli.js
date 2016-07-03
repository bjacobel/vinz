#! /usr/bin/env node

import AWSWithConfig from './lib/aws-config';
import { encryptAndStore } from './lib/aws-kms';
import commander from 'commander';
import prompt from 'prompt';
import colors from 'colors/safe';

commander
  .version('0.0.1')
  .option('-v, --verbose', 'Print extra information')
  .option('-p, --profile <profile>', 'Specify a ~/.aws/credentials profile to use')
  .option('-a, --access-key-id <accessKeyId>', 'Override AWS access key found in env or in ~/.aws')
  .option('-s, --secret-access-key <secretAccessKey>', 'Override AWS secret key found in env or in ~/.aws')
  .option('-e, --encrypt <secretName>', 'Store an encrypted secret in ./secrets/secretName')
  .parse(process.argv);

if (commander.encrypt) {
  const AWS = new AWSWithConfig(
    commander.accessKeyId,
    commander.secretAccessKey,
    commander.profile
  );

  prompt.message = colors.green(commander.encrypt);
  prompt.start();
  prompt.get({
    properties: {
      secretValue: {
        required: true,
        description: `Enter the value to encrypt as ${commander.encrypt}. Typing will be hidden`,
        hidden: true
      }
    }
  }, (err, result) => {
    encryptAndStore(AWS.KMS, commander.encrypt, result.secretValue);
  });
} else {
  console.error(
    'No arguments passed. You probably wanted `vinz --encrypt`.\n' +
    'Otherwise, check out `vinz --help`.'
  );
}
