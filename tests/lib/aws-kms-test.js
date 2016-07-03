jest.unmock('../../src/lib/aws-kms');

const kms = require('../../src/lib/aws-kms');

describe('module', () => {
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
      })
    };
  });

  describe('encryptAndStore', () => {
    beforeEach(() => {
      kms.getVinzKeyArn = jest.fn(() => new Promise((resolve) => {
        resolve('arn');
      }));
      kms.encryptData = jest.fn(() => new Promise((resolve) => {
        resolve('encrypted');
      }));
    });

    it('calls encryptData after getVinzKeyArn returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        console.log(kms.encryptData.mock)
        expect(kms.encryptData).toBeCalledWith(vinzKeyArn.AliasArn, 'bar');
      });
    });

    it('calls writeToFile with the results of encryptData after that returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        expect(kms.writeToFile).toBeCalledWith('encrypted', 'foo');
      });
    });
  });
});
