#! /usr/bin/env node

import commander from 'commander';
import prompt from 'prompt';
import colors from 'colors';

import AWSWithConfig from './lib/aws-config';
import kms from './lib/aws-kms';
import { version } from '../package.json';
import { prepSecretDir } from './lib/io';

export default class CLI {
  parse() {
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
        '-r, --region <region>',
        'Override AWS service region found in env or in ~/.aws',
        /^[a-z]{2}-[a-z]{4,9}-[1-2]$/
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
  }

  encryptByCLI(cmdr = {}) {
    prepSecretDir();

    const AWS = new AWSWithConfig(
      cmdr.accessKeyId,
      cmdr.secretAccessKey,
      cmdr.region,
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
        kms.encryptAndStore(AWS.KMS, cmdr.encrypt, result.secretValue);
      }
    });
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const cli = new CLI();
  cli.parse();
}
