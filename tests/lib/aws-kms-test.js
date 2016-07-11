import {
  readFromFile,
  writeToFile
} from '../../src/lib/io';

jest.unmock('../../src/lib/aws-kms');
import kms from '../../src/lib/aws-kms';

describe('aws-kms', () => {
  let kmsClient;
  const notVinzKeyArn = {
    AliasName: 'alias/not-vinz',
    AliasArn: '1234',
    TargetKeyId: 'abcde'
  };
  const vinzKeyArn = {
    AliasName: 'alias/vinz',
    AliasArn: '5678',
    TargetKeyId: 'fghjk'
  };

  beforeEach(() => {
    kmsClient = {
      listAliases: jest.fn((opts, callback) => {
        callback(null, {
          Aliases: [
            notVinzKeyArn,
            vinzKeyArn
          ]
        });
      }),
      encrypt: jest.fn((opts, callback) => {
        callback(null, {
          CiphertextBlob: 'encrypted secret',
          KeyId: vinzKeyArn.aliasArn
        });
      }),
      decrypt: jest.fn((opts, callback) => {
        callback(null, { Plaintext: 'bufferedData' });
      })
    };
  });

  describe('getVinzKeyArn', () => {
    it('returns the vinz key arn when listAliases gets a list of keys', () => {
      return kms.getVinzKeyArn(kmsClient).then((arn) => {
        expect(arn).toEqual(vinzKeyArn.AliasArn);
      });
    });

    it('throws an error when there is no vinz key in the list of keys', () => {
      kmsClient.listAliases = jest.fn((opts, callback) => {
        callback(null, {
          Aliases: [notVinzKeyArn]
        });
      });
      return kms.getVinzKeyArn(kmsClient).catch((err) => {
        expect(err).toEqual(
          Error('No KMS key named "vinz". For more info on setup. see the readme.')
        );
      });
    });

    it('returns a failing promise when listAliases has an error', () => {
      const errMsg = 'listAliases error';
      kmsClient.listAliases.mockImplementationOnce((opts, callback) => {
        callback(errMsg);
      });
      return kms.getVinzKeyArn(kmsClient).catch((err) => {
        expect(err).toEqual(errMsg);
      });
    });
  });

  describe('encryptData', () => {
    it("runs the input data through kmsClient's encryption methods", () => {
      return kms.encryptData(kmsClient, 'arn', 'encrypt me').then((data) => {
        expect(data).toEqual('encrypted secret');
      });
    });

    it('resolves with error when kmsclient has an error', () => {
      kmsClient.encrypt.mockImplementationOnce((opts, callback) => { callback('oops'); });
      return kms.encryptData(kmsClient, 'arn', 'encrypt me').catch((err) => {
        expect(err).toEqual('oops');
      });
    });
  });

  describe('decryptData', () => {
    it("runs input data through KMS's decrypt method", () => {
      return kms.decryptData(kmsClient, 'arn', 'bufferedDataEncrypted').then((data) => {
        expect(data).toEqual('bufferedData');
      });
    });

    it('raises any error from KMS itself', () => {
      kmsClient.decrypt.mockImplementationOnce((opts, callback) => {
        callback('decryption error');
      });
      return kms.decryptData(kmsClient, 'arn', 'bufferedDataEncrypted').catch((err) => {
        expect(err).toEqual('decryption error');
      });
    });
  });

  describe('encryptAndStore', () => {
    beforeEach(() => {
      kms.getVinzKeyArn = jest.fn(() => {
        return new Promise((resolve) => {
          resolve('fake arn');
        });
      });
      kms.encryptData = jest.fn(() => {
        return new Promise((resolve) => {
          resolve('fake encrypted data');
        });
      });
      console.log = jest.fn();
      console.error = jest.fn();
    });

    it('calls encryptData after getVinzKeyArn returns', () => {
      return kms.encryptAndStore(kmsClient, 'superSecretApiKey', 'asdf1234').then(() => {
        expect(kms.encryptData).lastCalledWith(kmsClient, 'fake arn', 'asdf1234');
      });
    });

    it('calls writeToFile with the results of encryptData after that returns', () => {
      return kms.encryptAndStore(kmsClient, 'superSecretApiKey', 'asdf1234').then(() => {
        expect(writeToFile).lastCalledWith('superSecretApiKey', 'fake encrypted data');
      });
    });

    it('writes an error to console if something bad happens', () => {
      kms.encryptData.mockImplementationOnce(() => new Promise((resolve, reject) => reject('eD err')));
      return kms.encryptAndStore(kmsClient, 'superSecretApiKey', 'asdf1234').catch(() => {
        expect(console.error).toBeCalledWith('eD err');
      });
    });
  });

  describe('retrieveAndDecrypt', () => {
    beforeEach(() => {
      kms.getVinzKeyArn = jest.fn(() => new Promise((resolve) => resolve()));
      readFromFile.mockImplementation(() => new Promise((resolve) => resolve()));
      kms.decryptData = jest.fn();
      console.error = jest.fn();
    });

    it('calls decryptData after *both* getVinzKeyArn and readFromFile return', () => {
      const rejectPromise = () => new Promise((resolve, reject) => reject());

      kms.getVinzKeyArn.mockImplementationOnce(rejectPromise);
      readFromFile.mockImplementationOnce(rejectPromise);
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(kms.decryptData).not.toBeCalled();
        expect(console.error).toBeCalled();
      });

      readFromFile.mockImplementationOnce(rejectPromise);
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(kms.decryptData).not.toBeCalled();
        expect(console.error).toBeCalled();
      });

      kms.getVinzKeyArn.mockImplementationOnce(rejectPromise);
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(kms.decryptData).not.toBeCalled();
        expect(console.error).toBeCalled();
      });

      kms.retrieveAndDecrypt(kmsClient, 'FooBar').then(() => {
        expect(kms.decryptData).toBeCalled();
      });
    });

    it('surfaces an error from getVinzKeyArn, readFromFile, or decryptData all in the same place', () => {
      kms.getVinzKeyArn.mockImplementationOnce(() => new Promise((resolve, reject) => reject('getVinzKeyArn err')));
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(console.error).lastCalledWith('getVinzKeyArn err');
      });

      readFromFile.mockImplementationOnce(() => new Promise((resolve, reject) => reject('readFromFile err')));
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(console.error).lastCalledWith('readFromFile err');
      });

      kms.decryptData.mockImplementationOnce(() => new Promise((resolve, reject) => reject('decryptData err')));
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').catch(() => {
        expect(console.error).lastCalledWith('decryptData err');
      });
    });

    it('returns a promise that resolves with the decrypted data', () => {
      kms.decryptData.mockImplementationOnce(() => new Promise((resolve) => resolve('decrypted')));
      kms.retrieveAndDecrypt(kmsClient, 'FooBar').then((data) => {
        expect(data).toEqual('decrypted');
      });
    });
  });
});
