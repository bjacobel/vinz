import { writeToFile } from './io';

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
    return data.Aliases.filter(x => x.AliasName === 'vinz')[0].AliasArn;
  });
};

const encryptData = (keyArn, secretValue) => {

};

export const encryptAndStore = (kmsClient, secretName, secretValue) => {
  return getVinzKeyArn(kmsClient)
    .then((keyArn) => {
      console.log(keyArn, secretValue)
      encryptData(keyArn, secretValue);
    }).then((encryptedSecret) => {
      writeToFile(encryptedSecret, secretName);
    });
};
