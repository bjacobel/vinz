import AWSWithConfig from '../src/lib/aws-config';

jest.unmock('../src/client.js');
import Vinz from '../src/client';

describe('client', () => {
  let vinz;

  beforeEach(() => {
    vinz = new Vinz();
  });

  describe('constructor', () => {
    it('does AWS auth on instantiation', () => {
      expect(AWSWithConfig).toBeCalled();
    });

    it('gets a KMS client created', () => {
      AWSWithConfig.prototype.KMS = {};

      vinz = new Vinz();

      expect(vinz.kmsClient).toBeDefined();
    });

    it('has a get method', () => {
      expect(vinz.get).toBeDefined();
    });
  });

  describe('get', () => {
    it('returns the decrypted value of a secret in the ./secret dir', () => {
      expect(true).not.toBeTruthy();
    });

    it("raises an error when the requested secret isn't in the secret dir", () => {
      expect(true).not.toBeTruthy();
    });
  });

  describe('getAll', () => {
    it('returns the decrypted value of multiple secrets', () => {
      expect(true).not.toBeTruthy();
    });

    it('handles errors gracefully', () => {
      expect(true).not.toBeTruthy();
    });

    it("doesn't return until all are ready", () => {
      expect(true).not.toBeTruthy();
    });
  });
});
