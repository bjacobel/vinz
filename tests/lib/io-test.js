import fs from 'fs';

jest.unmock('../../src/lib/io');
import * as io from '../../src/lib/io';

describe('io', () => {
  describe('writeToFile', () => {
    it('writes the second arg to the path at the second arg', () => {
      fs.writeFile = jest.fn((file, data, callback) => {
        callback();
      });

      return io.writeToFile('foo/fizz/buzz.txt', 'bar').then((successMsg) => {
        expect(successMsg).toEqual('success');
      });
    });

    it('handles errors gracefully', () => {
      fs.writeFile = jest.fn((file, data, callback) => {
        callback('borken');
      });
      console.error = jest.fn();

      return io.writeToFile('foo/fizz/buzz.txt', 'bar').catch((err) => {
        expect(err).toMatch('Error writing to foo/fizz/buzz.txt');
      });
    });
  });
});
