const authenticate = () => {

};

const get = (secretName) => {

};

const init = () => {
  const KMS = new AWS.KMS();

  this.isAuthenticated = false;
  this.authenticate = authenticate;
  this.get = get;
};

export default init;
