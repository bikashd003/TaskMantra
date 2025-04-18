module.exports = {
  hooks: {
    'pre-commit': 'bun lint-staged',
    'pre-push': 'bun run check-all',
  },
};
