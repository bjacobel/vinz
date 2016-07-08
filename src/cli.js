#! /usr/bin/env node

import commander from 'commander';
import prompt from 'prompt';
import colors from 'colors';
import path from 'path';
import fs from 'fs';

import AWSWithConfig from './lib/aws-config';
import { encryptAndStore } from './lib/aws-kms';
import { version } from '../package.json';


export const prepSecretDir = () => {
  const secretsDir = path.join(process.cwd(), 'secrets');
  try {
    fs.statSync(secretsDir);
  } catch (e) {
    fs.mkdir(secretsDir);
  }
};

export const encryptByCLI = function(cmdr = {}) {
  this.prepSecretDir();

  const AWS = new AWSWithConfig(
    cmdr.accessKeyId,
    cmdr.secretAccessKey,
    cmdr.profile
  );

  prompt.message = colors.green('vinz');
  prompt.start();
  prompt.get({
    properties: {
      secretValue: {
        required: true,
        description: `Enter the secret to encrypt as '${cmdr.encrypt}'. (typing hidden)`,
        hidden: true
      }
    }
  }, (err, result) => {
    if (err) {
      throw new Error(err);
    } else {
      encryptAndStore(AWS.KMS, cmdr.encrypt, result.secretValue);
    }
  });
};

export const startCLI = function() {
  commander
    .version(version)
    .option(
      '-p, --profile <profile>',
      'Specify a ~/.aws/credentials profile to use',
      /^(\w+)$/
    )
    .option(
      '-a, --access-key-id <accessKeyId>',
      'Override AWS access key found in env or in ~/.aws',
      /^([A-Z0-9]+)$/
    )
    .option(
      '-s, --secret-access-key <secretAccessKey>',
      'Override AWS secret key found in env or in ~/.aws',
      /^([A-Za-z0-9\\]+)$/
    )
    .option(
      '-e, --encrypt <secretName>',
      'Store an encrypted secret in ./secrets/secretName',
      /^([^\0\/]+)$/i
    )
    .parse(process.argv);

  if (commander.encrypt) {
    this.encryptByCLI(commander);
  } else {
    console.error(
      'No arguments passed. You probably wanted `vinz --encrypt`.\n' +
      'Otherwise, check out `vinz --help`.'
    );
  }
};

if (require.main === module) {
  startCLI();
}
