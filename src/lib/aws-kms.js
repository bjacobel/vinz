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
    return data.Aliases.filter(x => x.AliasName === 'vinz')[0].AliasArn;
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
