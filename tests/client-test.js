import AWSWithConfig from '../src/lib/aws-config';
import { retrieveAndDecrypt } from '../src/lib/aws-kms';

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
    beforeEach(() => {
      retrieveAndDecrypt.mockImplementation(() => new Promise((resolve) => resolve()));
    });

    it('returns the decrypted value of a secret in the ./secret dir', () => {
      retrieveAndDecrypt.mockImplementationOnce(() => new Promise((resolve) => resolve('foobar')));
      return vinz.get('FooBar').then((FooBar) => {
        expect(FooBar).toEqual('foobar');
      });
    });

    it('returns the decrypted value of multiple secrets', () => {
      retrieveAndDecrypt
        .mockImplementationOnce(() => new Promise((resolve) => resolve('foo')))
        .mockImplementationOnce(() => new Promise((resolve) => resolve('bar')))
        .mockImplementationOnce(() => new Promise((resolve) => resolve('foobar')));

      return vinz.get('Foo', 'Bar', 'FooBar').then((secrets) => {
        const [Foo, Bar, FooBar] = secrets;
        expect(Foo).toEqual('foo');
        expect(Bar).toEqual('bar');
        expect(FooBar).toEqual('foobar');
      });
    });
  });
});
