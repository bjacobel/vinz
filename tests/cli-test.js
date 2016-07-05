const fs = require('fs');
const prompt = require('prompt').default;
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

    });

    it('displays an error if nothing is set', () => {

    });

    it('calls encryptByCLI if commander.encrypt is set', () => {

    });

    it('passes secret keys to encryptByCLI if provided', () => {

    });

    describe('parameter validation', () => {
      describe('profile', () => {
        it("can't be null", () => {
        });

        it('passes regex when well-formed', () => {
        });

        it('triggers regex failure when poorly formed', () => {
        });
      });

      describe('accessKeyId', () => {
        it("can't be null", () => {
        });

        it('passes regex when well-formed', () => {
        });

        it('triggers regex failure when poorly formed', () => {
        });
      });

      describe('secretAccessKey', () => {
        it("can't be null", () => {
        });

        it('passes regex when well-formed', () => {
        });

        it('triggers regex failure when poorly formed', () => {
        });
      });

      describe('secretName', () => {
        it("can't be null", () => {
        });

        it('passes regex when well-formed', () => {
        });

        it('triggers regex failure when poorly formed', () => {
        });
      });
    });
  });

  describe('encryptByCLI', () => {
    it('calls prepSecretDir', () => {
      cli.encryptByCLI();
      expect(fs.statSync).toBeCalled();
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
      expect(cli.encryptByCLI).toThrow(new Error('error from prompt'));
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
