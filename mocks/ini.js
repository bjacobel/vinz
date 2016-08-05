export default {
  parse: jest.fn(() => {
    return {
      default: { region: 'us-east-1' },
      'profile asdf': { region: 'us-east-1' }
    };
  })
};
