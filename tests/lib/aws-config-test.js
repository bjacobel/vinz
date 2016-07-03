jest.mock('aws-sdk');
jest.unmock('../../src/lib/aws-config');

const AWSWithConfig = require('../../src/lib/aws-config');

describe('aws-config', () => {
  describe('AWSWithConfig', () => {
    it('can be instantiated by passing in access and secret keys', () => {
      const aws = new AWSWithConfig();
      expect(aws.kms).toBeDefined();
    });

    it('can be instantiated by passing in a profile', () => {

    });
  });
});
