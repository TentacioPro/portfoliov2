module.exports = {
  root: true,
  env: { node: true, browser: true, es2022: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', 'node_modules', 'tools/writer/index.html'],
};
