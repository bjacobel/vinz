export default {
  parse: jest.fn(() => {
    return {
      default: { region: 'us-east-1' },
      asdf: { region: 'us-east-1' }
    };
  })
};
