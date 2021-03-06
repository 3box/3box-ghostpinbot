module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    "no-underscore-dangle": 'off',
    "no-await-in-loop": 'off',
    "no-case-declarations": 'off',
    "no-console": 'off',
    "class-methods-use-this": 'off',
  },
};
