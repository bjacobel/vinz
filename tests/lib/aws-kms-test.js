jest.unmock('../../src/lib/aws-kms');

const kms = require('../../src/lib/aws-kms');

describe('module', () => {
  let kmsClient;
  beforeEach(() => {
    kmsClient = {
      listAliases: jest.fn((opts, callback) => {
        callback(null, {
          Aliases: [
            {
              AliasName: 'not vinz',
              AliasArn: '1234',
              TargetKeyId: 'abcde'
            },
            {
              AliasName: 'vinz',
              AliasArn: '5678',
              TargetKeyId: 'fghjk'
            }
          ]
        });
      })
    };
  });

  describe('encryptAndStore', () => {
    // beforeEach(() => {
    //   kms.getVinzKeyArn = jest.fn(() => new Promise(() => 'arn'));
    //   kms.encryptData = jest.fn(() => new Promise(() => 'encrypted'));
    // });

    it('calls encryptData after getVinzKeyArn returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        expect(kms.encryptData).toBeCalledWith('arn', 'bar');
      });
    });

    it('calls writeToFile with the results of encryptData after that returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        expect(kms.writeToFile).toBeCalledWith('encrypted', 'foo');
      });
    });
  });
});
