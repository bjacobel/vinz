jest.mock('fs');
import fs from 'fs';

jest.unmock('../../src/lib/io');
import * as io from '../../src/lib/io';

describe('io', () => {
  describe('writeToFile', () => {
    it('writes the second arg to the path at the first arg', () => {
      return io.writeToFile('foo/fizz/buzz.txt', 'bar').then((successMsg) => {
        expect(successMsg).toEqual('success');
      });
    });

    it('handles errors gracefully', () => {
      fs.writeFile.mockImplementationOnce((file, data, callback) => {
        callback('borken');
      });
      console.error = jest.fn();

      return io.writeToFile('foo/fizz/buzz.txt', 'bar').catch((err) => {
        expect(err).toMatch('Error writing to foo/fizz/buzz.txt');
      });
    });
  });

  describe('prepSecretDir', () => {
    afterEach(() => {
      fs.mkdir.mockClear();
    });

    it("creates a ./secret dir if one doesn't exist", () => {
      fs.statSync.mockImplementationOnce(() => { throw new Error(); });
      io.prepSecretDir();
      expect(fs.mkdir).toBeCalled();
    });

    it('does nothing if ./secret exists', () => {
      io.prepSecretDir();
      expect(fs.mkdir).not.toBeCalled();
    });
  });
});
