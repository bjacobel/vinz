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
    return data;
  });
};

export const encryptAndStore = (kmsClient, secretName, secretValue) => {
  return getVinzKeyArn(kmsClient)
    .then((keyArn) => {
      encryptData(keyArn, secretValue);
    }).then((encryptedSecret) => {
      writeToFile(encryptedSecret, secretName);
    });
};
