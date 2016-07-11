import AWSWithConfig from './lib/aws-config';
import { retrieveAndDecrypt } from './lib/aws-kms';

export default class Vinz {
  constructor() {
    this.kmsClient = new AWSWithConfig().KMS;
  }

  get(...secretNames) {
    const promises = [];
    secretNames.forEach((secretName) => {
      promises.push(retrieveAndDecrypt(this.kmsClient, secretName));
    });

    return Promise.all(promises).then((allDecryptedSecrets) => {
      if (allDecryptedSecrets.length === 1) {
        return allDecryptedSecrets[0];
      } else {
        return allDecryptedSecrets;
      }
    });
  }
}
