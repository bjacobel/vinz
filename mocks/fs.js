export default {
  statSync: jest.fn(() => true),
  mkdir: jest.fn(),
  writeFile: jest.fn((file, data, callback) => {
    callback();
  })
};
