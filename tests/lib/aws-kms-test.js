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

    });
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

    xit('calls encryptData after getVinzKeyArn returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        expect(kms.encryptData).toBeCalledWith(vinzKeyArn.AliasArn, 'bar');
      });
    });

    xit('calls writeToFile with the results of encryptData after that returns', () => {
      return kms.encryptAndStore(kmsClient, 'foo', 'bar').then(() => {
        expect(kms.writeToFile).toBeCalledWith('encrypted', 'foo');
      });
    });
  });
});
