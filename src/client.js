import AWSWithConfig from './lib/aws-config';
import { retrieveAndDecrypt } from './lib/aws-kms';

export default class Vinz {
  constructor() {
    this.kmsClient = new AWSWithConfig().KMS;
  }

  get(secretName) {
    return retrieveAndDecrypt(this.kmsClient, secretName);
  }

  getAll(secretNames) {
    const promises = [];
    secretNames.forEach((secretName) => {
      promises.push(retrieveAndDecrypt(this.kmsClient, secretName));
    });

    return Promise.all(promises);
  }
}
