const config = {
  credentials: null
};

config.update = jest.fn((params) => {
  config.credentials = params;
});

const AWS = {
  config,
  KMS: class KMS {},
  SharedIniFileCredentials: jest.fn(() => {
    return {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    };
  })
};

export default AWS;
