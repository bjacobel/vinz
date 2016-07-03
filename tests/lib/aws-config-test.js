jest.unmock('../../src/lib/aws-config');

const fs = require('fs');
const AWS = require('aws-sdk').default;
const AWSWithConfig = require('../../src/lib/aws-config').default;

const accessKeyId = 'accessKeyId';
const secretAccessKey = 'secretAccessKey';

const configExpectations = (config) => {
  expect(config.KMS).toBeDefined();
  expect(config.KMS instanceof AWS.KMS).toBeTruthy();
  expect(config.credentials).toBeDefined();
  expect(config.credentials.accessKeyId).toEqual(accessKeyId);
  expect(config.credentials.secretAccessKey).toEqual(secretAccessKey);
};

describe('aws-config', () => {
  describe('AWSWithConfig', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });

    afterEach(() => {
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
    });

    it('can be instantiated by passing in access and secret keys', () => {
      fs.statSync = jest.fn(() => { throw Error(); });
      const aws = new AWSWithConfig(accessKeyId, secretAccessKey);
      expect(console.log).toBeCalledWith('Using AWS credentials explicitly passed');
      configExpectations(aws);
    });

    it('can be instantiated by passing in a profile', () => {
      fs.statSync = jest.fn(() => true);
      const aws = new AWSWithConfig(null, null, 'asdf');
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'asdf' });
      expect(console.log).toBeCalledWith('Using ~/.aws/credentials with the [asdf] profile');
      configExpectations(aws);
    });

    it('can be instantiated if a default profile exists', () => {
      fs.statSync = jest.fn(() => true);
      const aws = new AWSWithConfig();
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'default' });
      expect(console.log).toBeCalledWith('Using ~/.aws/credentials with the [default] profile');
      configExpectations(aws);
    });

    it('can be instantiated if env vars are set', () => {
      fs.statSync = jest.fn(() => { throw Error(); });
      Object.assign(process.env, {
        AWS_ACCESS_KEY_ID: accessKeyId,
        AWS_SECRET_ACCESS_KEY: secretAccessKey
      });
      const aws = new AWSWithConfig();
      expect(console.log).toBeCalledWith('Using AWS credentials preset in the environment');
      configExpectations(aws);
    });

    it('throws an error if none of the above work', () => {
      fs.statSync = jest.fn(() => { throw Error(); });
      expect(() => new AWSWithConfig()).toThrow(new Error(
        'Could not find AWS credentials. See `vinz --help` ' +
        'for more info on your options for specifying credentials.'
      ));
    });
  });
});
