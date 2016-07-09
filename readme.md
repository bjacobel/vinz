#Vinz

[![Build Status](https://travis-ci.org/bjacobel/vinz.svg?branch=master)](https://travis-ci.org/bjacobel/vinz) [![Coverage Status](https://coveralls.io/repos/github/bjacobel/vinz/badge.svg)](https://coveralls.io/repos/github/bjacobel/vinz) [![npm](https://img.shields.io/npm/v/vinz.svg?maxAge=2592000)](https://npmjs.com/package/vinz)

![keymaster](https://gifs.bjacobel.com/keymaster.gif)

> _I am the Keymaster!_

>-- Vinz Clortho, _Ghostbusters_ (1984)


###_Motivation_
Vinz is the keymaster of your AWS Lambda applications. Storing secrets (keys and configuration) in Lambda is difficult out of the box because Lambda has no persistent file system and no notion of environment variables. Vinz aims to make the secret storage and usage process easy for Lambda functions - by storing your secrets encrypted and versioned right alongside your application in its deployment bundle, and providing a simple API for secret decryption and access.

###_Simple Usage_
- Encrypt a secret using the Vinz bash CLI:

        $> vinz --encrypt TwitterSecretKey
        vinz: Enter the secret to encrypt as 'TwitterSecretKey'. (typing hidden):
        secrets/TwitterSecretKey encrypted and saved.

- Decrypt a secret from node:

        const vinz = require('vinz');
        if (!vinz.isAuthenticated) {
          vinz.authenticate();
        }
        console.log(vinz.get('TwitterSecretKey'))

###_Detailed Usage_

#### 1. Set up KMS with a root key
In the AWS console, open up "Identity and Access Management" and click on "Encryption Keys," then click on "Create Key" to set up the root Vinz key.

You must name the key with alias "vinz".

![Create a key](https://i.bjacobel.com/20160531-464t5.png)

Skip step 2 - the only role that should be able to administer the Vinz key is your root account role.

In step 3, you may already have an execution role set up for the Lambda you plan to use Vinz with - if so, grant that role access to use Vinz's key. Otherwise, skip this step. You can change this all later.

![Step 3](https://i.bjacobel.com/20160531-gh9jh.png)

Click "Finish," then when you see the success message you're ready to start using Vinz.

#### 2. Install Vinz

This one's easy: just `npm install -g vinz`.

#### 3. Encrypt your first secret

When it installed itself, Vinz created a CLI for you. Check out its helptext:

    $> vinz --help

      Usage: vinz [options]

      Options:

        -h, --help                                 output usage information
        -V, --version                              output the version number
        -p, --profile <profile>                    Specify a ~/.aws/credentials profile to use
        -a, --access-key-id <accessKeyId>          Override AWS access key found in env or in ~/.aws
        -s, --secret-access-key <secretAccessKey>  Override AWS secret key found in env or in ~/.aws
        -r, --region <region>                      Override AWS region found in env or in ~/.aws
        -e, --encrypt <secretName>                 Store an encrypted secret in ./secrets/secretName

`vinz --encrypt` is the star here - it's the interface you'll use for storing your secrets. First, though, Vinz needs to know about your AWS account.

To pass your AWS credentials and configuration to Vinz, you have three options:

1. Set your AWS credentials in an `~/.aws/credentials` file, and your supplementary config information (i.e., region) in an `~/.aws/config` file. See the [Configuring the AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-config-files) documentation for more.
2. Setting your AWS config with environment variables. To use this method, set the following environment variables:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_DEFAULT_REGION`
3. Pass your configuration in on the command line. This generally isn't recommended, as secrets set on the command line can linger in your `~/.bash_history`, so only use the `--access-key-id`, `--secret-access-key` and `--region` options for Vinz if you have good reason.

Note that Vinz doesn't currently support mixing and matching these options - i.e., you can't set your credentials in `~/.aws/credentials` and your region on the command line.

Once you've got your credentials ready to go, you can encrypt your first secret. Pass the `--encrypt` option to Vinz with the name you'd like your secret to be available in your application as. For example:

	vinz --encrypt TwitterConsumerKey

Vinz will now ask you to enter the value you'd like to encrypt. Typing will be hidden.

	vinz: Enter the secret to encrypt as 'TwitterConsumerKey'. (typing hidden):

Type your secret, press enter, and Vinz will encrypt your secret using AWS KMS and save it at `./secrets/TwitterConsumerKey`. Commit your encrypted secret file to Git and/or include it in your Lambda deployment bundle, and you're ready to start using it in a Node application.

#### 4. Use your secrets in Node
TBD


###_Contributing_
TBD

###_License_
MIT
