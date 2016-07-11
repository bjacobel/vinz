export default {
  statSync: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn((file, data, callback) => {
    callback();
  }),
  readFileSync: jest.fn(),
  readFile: jest.fn((file, cb) => {
    cb(null, 'FooBarEncrypted');
  })
};
