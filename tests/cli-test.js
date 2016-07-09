import prompt from 'prompt';
import commander from 'commander';
import AWSWithConfig from '../src/lib/aws-config';
import KMS from '../src/lib/aws-kms';
import { prepSecretDir } from '../src/lib/io';

jest.unmock('../src/cli');
import CLI from '../src/cli';

describe('CLI', () => {
  let cli;

  beforeEach(() => {
    cli = new CLI();
  });

  describe('parse', () => {
    it('starts up a Commander interface', () => {
      spyOn(console, 'error');

      process.argv = ['foo', 'bar'];

      cli.parse();

      expect(commander.version).toBeCalled();

      expect(commander.option.mock.calls.length).toBe(4);
      ['-p', '-a', '-s', '-e'].forEach((option, i) => {
        expect(commander.option.mock.calls[i]).toMatch(option);
      });

      expect(commander.parse).toBeCalledWith(['foo', 'bar']);
    });

    it('displays an error if nothing is set', () => {
      console.error = jest.fn();

      cli.parse();

      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toMatch('No arguments passed.');
    });

    it('calls encryptByCLI if commander.encrypt is set', () => {
      commander.encrypt = true;

      spyOn(cli, 'encryptByCLI');
      cli.parse();

      expect(cli.encryptByCLI).toBeCalled();
    });

    it('passes secret keys to encryptByCLI if provided', () => {
      commander.accessKeyId = 'bar';
      commander.secretAccessKey = 'bizz';
      commander.encrypt = true;

      spyOn(cli, 'encryptByCLI');
      cli.parse();

      expect(cli.encryptByCLI).toBeCalledWith(jasmine.objectContaining({
        accessKeyId: 'bar',
        secretAccessKey: 'bizz'
      }));
    });
  });

  describe('encryptByCLI', () => {
    it('calls prepSecretDir', () => {
      cli.encryptByCLI();
      expect(prepSecretDir).toBeCalled();
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
      const kms = new KMS();
      cli.encryptByCLI({ encrypt: 'FooBar' });
      expect(kms.encryptAndStore).toBeCalledWith(undefined, 'FooBar', 'secretValue');
    });

    it('throws any error from prompt', () => {
      prompt.get.mockImplementationOnce((params, cb) => {
        cb('error from prompt');
      });
      expect(() => cli.encryptByCLI()).toThrow(new Error('error from prompt'));
    });
  });
});
