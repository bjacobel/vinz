jest.mock('fs');
import fs from 'fs';
import AWS from 'aws-sdk';

jest.unmock('../../src/lib/aws-config');
import AWSWithConfig from '../../src/lib/aws-config';

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
      spyOn(console, 'log');
    });

    afterEach(() => {
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
    });

    it('can be instantiated by passing in access and secret keys', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
      const aws = new AWSWithConfig(accessKeyId, secretAccessKey);
      expect(console.log).toBeCalledWith('Using AWS credentials explicitly passed');
      configExpectations(aws);
    });

    it('can be instantiated by passing in a profile', () => {
      const aws = new AWSWithConfig(null, null, 'asdf');
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'asdf' });
      expect(console.log).toBeCalledWith('Using ~/.aws/credentials with the [asdf] profile');
      configExpectations(aws);
    });

    it('can be instantiated if a default profile exists', () => {
      const aws = new AWSWithConfig();
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'default' });
      expect(console.log).toBeCalledWith('Using ~/.aws/credentials with the [default] profile');
      configExpectations(aws);
    });

    it('can be instantiated if env vars are set', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
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
