module.exports = {
  rules: [
    {
      validation: 'camelCase',
      patterns: ['*/**'],
    },
    {
      validation: 'ignore',
      patterns: [
        '*/**/typings/*',
        '__tests__/**/*',
        'docker-compose.yml',
        '**/LICENSE.md',
        '**/README.md',
      ],
    },
  ],
};
