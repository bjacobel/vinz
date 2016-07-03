const start = jest.fn();
const get = jest.fn((params, cb) => {
  cb(null, { secretValue: 'secretValue' });
});

export default {
  start,
  get
};
