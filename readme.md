#vinz

[![Build Status](https://travis-ci.org/bjacobel/vinz.svg?branch=master)](https://travis-ci.org/bjacobel/vinz) [![Coverage Status](https://coveralls.io/repos/github/bjacobel/vinz/badge.svg)](https://coveralls.io/repos/github/bjacobel/vinz) [![npm](https://img.shields.io/npm/v/vinz.svg?maxAge=2592000)](https://npmjs.com/package/vinz)

![keymaster](https://gifs.bjacobel.com/keymaster.gif)

> _I am the Keymaster!_

>-- Vinz Clortho, _Ghostbusters_ (1984)


###_Motivation_
`Vinz` is the keymaster of your AWS Lambda applications. Storing secrets (keys and configuration) in Lambda is difficult out of the box, given Lambda has no persistent file system and no notion of environment variables. `Vinz` aims to make the secret storage and usage process easy for Lambda functions - by storing your secrets encrypted and versioned right alongside your application in its deployment bundle, and providing a simple API for secret decryption and access.

###_Simple Usage_
- Encrypt a secret using the `vinz` bash CLI:

        $> vinz --encrypt TwitterSecretKey
        Enter the secret to encrypt as 'TwitterSecretKey' (typing hidden):
        secrets/TwitterSecretKey encrypted and saved.

- Decrypt a secret from node:

        const vinz = require('vinz');
        if (!vinz.isAuthenticated) {
          vinz.authenticate();
        }
        console.log(vinz.get('TwitterSecretKey'))

###_Detailed Usage_

#### 1. Set up KMS with a root key
In the AWS console, open up "Identity and Access Management" and click on "Encryption Keys," then click on "Create Key" to set up the root `vinz` key.

You must name the key with alias "vinz".

![Create a key](https://i.bjacobel.com/20160531-464t5.png)

Skip step 2 - the only role that should be able to administer the `vinz` key is your root account role.

In step 3, you may already have an execution role set up for the Lambda you plan to use `vinz` with - if so, grant that role access to use `vinz`'s key. Otherwise, skip this step. You can change this all later.

![Step 3](https://i.bjacobel.com/20160531-gh9jh.png)

Click "Finish," then when you see the success message you're ready to start using `vinz`.

#### 2. Install `vinz`

This one's easy: just `npm install -g vinz`.

#### 3. Encrypt your first secret

When it installed itself, `vinz` created a CLI for you. Check out its helptext:

```
$> vinz --help
```

###_Contributing_
TBD

###_License_
MIT
