import {
  readFromFile,
  writeToFile
} from './io';
import {
  ENCRYPTION_CONTEXT,
  SECRET_DIR_NAME
} from '../constants';

const getVinzKeyArn = (kmsClient) => {
  return new Promise((resolve, reject) => {
    kmsClient.listAliases({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    const vinzKey = data.Aliases.filter(x => x.AliasName === 'alias/vinz');
    if (vinzKey.length === 0) {
      throw new Error('No KMS key named "vinz". For more info on setup. see the readme.');
    } else {
      return vinzKey[0].AliasArn;
    }
  });
};

const encryptData = (kmsClient, keyArn, secretValue) => {
  return new Promise((resolve, reject) => {
    kmsClient.encrypt({
      KeyId: keyArn,
      Plaintext: secretValue,
      EncryptionContext: ENCRYPTION_CONTEXT
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    return data.CiphertextBlob;
  });
};

const decryptData = (kmsClient, keyArn, buffer) => {
  return new Promise((resolve, reject) => {
    kmsClient.decrypt({
      CiphertextBlob: buffer,
      EncryptionContext: ENCRYPTION_CONTEXT
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    return data.Plaintext.toString('utf8');
  });
};

const encryptAndStore = function(kmsClient, secretName, secretValue) {
  return this.getVinzKeyArn(kmsClient)
    .then((keyArn) => {
      return this.encryptData(kmsClient, keyArn, secretValue);
    }).then((encryptedSecret) => {
      return writeToFile(secretName, encryptedSecret);
    }).then(() => {
      console.log(`./${SECRET_DIR_NAME}/${secretName} encrypted and saved.`);
    }).catch((err) => {
      console.error(err);
    });
};

const retrieveAndDecrypt = function(kmsClient, secretName) {
  const arnPromise = this.getVinzKeyArn(kmsClient);
  const bufferPromise = readFromFile(secretName);

  return Promise.all([arnPromise, bufferPromise]).then((resolvedValues) => {
    const [keyArn, buffer] = resolvedValues;
    return this.decryptData(kmsClient, keyArn, buffer);
  }).catch((err) => {
    return console.error(err);
  });
};

export default {
  getVinzKeyArn,
  encryptData,
  encryptAndStore,
  decryptData,
  retrieveAndDecrypt
};
