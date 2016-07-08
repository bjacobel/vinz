const fs = require('fs');
const prompt = require('prompt').default;
const commander = require('commander').default;
const AWSWithConfig = require('../src/lib/aws-config').default;
const { encryptAndStore } = require('../src/lib/aws-kms');

jest.unmock('../src/cli');
const cli = require('../src/cli');

describe('cli', () => {
  beforeEach(() => {
    Object.assign(fs, {
      statSync: jest.fn(() => true),
      mkdir: jest.fn()
    });
  });

  describe('startCLI', () => {
    it('starts up a Commander interface', () => {
      spyOn(console, 'error');

      process.argv = ['foo', 'bar'];

      cli.startCLI();

      expect(commander.version).toBeCalled();

      expect(commander.option.mock.calls.length).toBe(4);
      ['-p', '-a', '-s', '-e'].forEach((option, i) => {
        expect(commander.option.mock.calls[i]).toMatch(option);
      });

      expect(commander.parse).toBeCalledWith(['foo', 'bar']);
    });

    it('displays an error if nothing is set', () => {
      console.error = jest.fn();

      cli.startCLI();

      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toMatch('No arguments passed.');
    });

    it('calls encryptByCLI if commander.encrypt is set', () => {
      commander.encrypt = true;

      spyOn(cli, 'encryptByCLI');

      cli.startCLI();

      expect(cli.encryptByCLI).toBeCalled();
    });

    it('passes secret keys to encryptByCLI if provided', () => {
      commander.accessKeyId = 'bar';
      commander.secretAccessKey = 'bizz';
      commander.encrypt = true;

      spyOn(cli, 'encryptByCLI');
      cli.startCLI();

      expect(cli.encryptByCLI).toBeCalledWith(jasmine.objectContaining({
        accessKeyId: 'bar',
        secretAccessKey: 'bizz'
      }));
    });
  });

  describe('encryptByCLI', () => {
    it('calls prepSecretDir', () => {
      spyOn(cli, 'prepSecretDir');
      cli.encryptByCLI();
      expect(cli.prepSecretDir).toBeCalled();
    });

    it('creates a new AWSWithConfig', () => {
      const accessKeyId = 'accessKeyId';
      const secretAccessKey = 'secretAccessKey';
      const profile = 'profile';
      const params = {
        accessKeyId,
        secretAccessKey,
        profile
      };
      cli.encryptByCLI(params);
      expect(AWSWithConfig).toBeCalledWith(accessKeyId, secretAccessKey, profile);
    });

    it('prompts for secret value', () => {
      cli.encryptByCLI({ encrypt: 'FooBar' });
      expect(prompt.get).lastCalledWith({
        properties: {
          secretValue: {
            required: true,
            description: "Enter the secret to encrypt as 'FooBar'. (typing hidden)",
            hidden: true
          }
        }
      }, jasmine.any(Function));
    });

    it('calls encryptAndStore after the prompt gets input', () => {
      cli.encryptByCLI({ encrypt: 'FooBar' });
      expect(encryptAndStore).toBeCalledWith(undefined, 'FooBar', 'secretValue');
    });

    it('throws any error from prompt', () => {
      prompt.get = jest.fn((params, cb) => {
        cb('error from prompt');
      });
      expect(() => cli.encryptByCLI()).toThrow(new Error('error from prompt'));
    });
  });

  describe('prepSecretDir', () => {
    it("creates a ./secret dir if one doesn't exist", () => {
      fs.statSync = jest.fn(() => { throw new Error(); });
      cli.prepSecretDir();
      expect(fs.mkdir).toBeCalled();
    });

    it('does nothing if ./secret exists', () => {
      cli.prepSecretDir();
      expect(fs.mkdir).not.toBeCalled();
    });
  });
});
