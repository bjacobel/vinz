import { writeToFile } from './io';

export const getVinzKeyArn = (kmsClient) => {
  return new Promise((resolve, reject) => {
    kmsClient.listAliases({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    const vinzKey = data.Aliases.filter(x => x.AliasName === 'vinz');
    if (vinzKey.length === 0) {
      throw new Error('No KMS key named "vinz". For more info on setup. see the readme.');
    } else {
      return vinzKey[0].AliasArn;
    }
  });
};

export const encryptData = (keyArn, secretValue) => {
  console.log("not mocked")
};

export const encryptAndStore = (kmsClient, secretName, secretValue) => {
  return getVinzKeyArn(kmsClient)
    .then((keyArn) => {
      encryptData(keyArn, secretValue);
    }).then((encryptedSecret) => {
      writeToFile(encryptedSecret, secretName);
    });
};
