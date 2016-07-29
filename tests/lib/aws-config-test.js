jest.mock('fs');
import fs from 'fs';
import AWS from 'aws-sdk-umd';
import ini from 'ini';

jest.unmock('../../src/lib/aws-config');
import AWSWithConfig from '../../src/lib/aws-config';

const accessKeyId = 'accessKeyId';
const secretAccessKey = 'secretAccessKey';
const region = 'us-east-1';

const configExpectations = (config) => {
  expect(config.KMS).toBeDefined();
  expect(config.KMS instanceof AWS.KMS).toBeTruthy();
  expect(config.credentials).toBeDefined();
  expect(config.credentials.accessKeyId).toEqual(accessKeyId);
  expect(config.credentials.secretAccessKey).toEqual(secretAccessKey);
  expect(config.credentials.region).toEqual(region);
};

describe('aws-config', () => {
  describe('AWSWithConfig', () => {
    beforeEach(() => {
      spyOn(console, 'log');
    });

    afterEach(() => {
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_DEFAULT_REGION;

      ini.parse.mockClear();
    });

    it('can be instantiated by passing in access and secret keys', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
      const aws = new AWSWithConfig(accessKeyId, secretAccessKey, region, null);
      expect(console.log).lastCalledWith('Using AWS config and credentials explicitly passed');
      configExpectations(aws);
    });

    it('can be instantiated by passing in a profile', () => {
      const aws = new AWSWithConfig(null, null, null, 'asdf');
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'asdf' });
      expect(ini.parse).toBeCalled();
      expect(console.log).lastCalledWith('Using ~/.aws/config and ~/.aws/credentials with the [asdf] profile');
      configExpectations(aws);
    });

    it('can be instantiated if a default profile exists', () => {
      const aws = new AWSWithConfig();
      expect(AWS.SharedIniFileCredentials).toBeCalledWith({ profile: 'default' });
      expect(ini.parse).toBeCalled();
      expect(console.log).lastCalledWith('Using ~/.aws/config and ~/.aws/credentials with the [default] profile');
      configExpectations(aws);
    });

    it('can be instantiated if env vars are set', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
      Object.assign(process.env, {
        AWS_ACCESS_KEY_ID: accessKeyId,
        AWS_SECRET_ACCESS_KEY: secretAccessKey,
        AWS_DEFAULT_REGION: region
      });
      const aws = new AWSWithConfig();
      expect(console.log).lastCalledWith('Using AWS config and credentials preset in environment variables');
      configExpectations(aws);
    });

    it('can be instantiated if creds are already set when we arrive on the scene (as on Lambda)', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
      AWS.config.credentials = {
        accessKeyId,
        secretAccessKey,
        region
      };

      const aws = new AWSWithConfig();

      configExpectations(aws);
      expect(console.log).lastCalledWith('Using AWS config provided by IAM instance roles');

      delete AWS.config.credentials;
    });

    it('throws an error if none of the above work', () => {
      fs.statSync.mockImplementationOnce(() => { throw Error(); });
      expect(() => new AWSWithConfig()).toThrow(new Error(
        'Could not find AWS config and/or credentials. See `vinz --help` ' +
        'for more info on your options for specifying credentials.'
      ));
    });
  });
});
