import { writeToFile } from '../../src/lib/io';

jest.unmock('../../src/lib/aws-kms');
import * as kms from '../../src/lib/aws-kms';

describe('aws-kms', () => {
  let kmsClient;
  const notVinzKeyArn = {
    AliasName: 'not vinz',
    AliasArn: '1234',
    TargetKeyId: 'abcde'
  };
  const vinzKeyArn = {
    AliasName: 'vinz',
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
      kmsClient.listAliases = jest.fn((opts, callback) => {
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
      kmsClient.encrypt = jest.fn((opts, callback) => { callback('oops'); });
      return kms.encryptData(kmsClient, 'arn', 'encrypt me').catch((err) => {
        expect(err).toEqual('oops');
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
    });

    it('calls encryptData after getVinzKeyArn returns', () => {
      return kms.encryptAndStore(kmsClient, 'superSecretApiKey', 'asdf1234').then(() => {
        expect(kms.encryptData).toBeCalledWith(kmsClient, 'fake arn', 'asdf1234');
      });
    });

    it('calls writeToFile with the results of encryptData after that returns', () => {
      return kms.encryptAndStore(kmsClient, 'superSecretApiKey', 'asdf1234').then(() => {
        expect(writeToFile).toBeCalledWith('superSecretApiKey', 'fake encrypted data');
      });
    });
  });
});
