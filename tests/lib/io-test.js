jest.mock('fs');
import fs from 'fs';

import { SECRET_DIR_NAME } from '../../src/constants';

jest.unmock('../../src/lib/io');
import * as io from '../../src/lib/io';

describe('io', () => {
  describe('writeToFile', () => {
    it('writes the second arg to the path at the first arg', () => {
      return io.writeToFile('FooBar', 'bar').then((successMsg) => {
        expect(successMsg).toEqual('success');
      });
    });

    it('handles errors gracefully', () => {
      fs.writeFile.mockImplementationOnce((file, data, callback) => {
        callback('borken');
      });
      console.error = jest.fn();

      return io.writeToFile('FooBar', 'bar').catch((err) => {
        expect(err).toMatch('Error writing to ./secrets/FooBar');
      });
    });
  });

  describe('prepSecretDir', () => {
    afterEach(() => {
      fs.mkdir.mockClear();
    });

    it("creates a ./secrets dir if one doesn't exist", () => {
      fs.statSync.mockImplementationOnce(() => { throw new Error(); });
      io.prepSecretDir();
      expect(fs.mkdir).toBeCalled();
    });

    it('does nothing if ./secrets exists', () => {
      io.prepSecretDir();
      expect(fs.mkdir).not.toBeCalled();
    });
  });

  describe('readFromFile', () => {
    it('retrieves the contents of the file at ./secrets/args[0]', () => {
      return io.readFromFile('FooBar').then((data) => {
        expect(fs.readFile).lastCalledWith(
          `./${SECRET_DIR_NAME}/FooBar`,
          { encoding: 'utf-8' },
          jasmine.any(Function)
        );
        expect(data).toEqual('FooBarEncrypted');
      });
    });

    it('handles errors gracefully', () => {
      fs.readFile.mockImplementationOnce((file, opts, cb) => {
        cb('error from readFile');
      });

      return io.readFromFile('FooBar').catch((err) => {
        expect(fs.readFile).lastCalledWith(
          `./${SECRET_DIR_NAME}/FooBar`,
          { encoding: 'utf-8' },
          jasmine.any(Function)
        );
        expect(err).toEqual('error from readFile');
      });
    });
  });
});
