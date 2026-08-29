import js from '@eslint/js';
import globals from 'globals';

const solidModules = [
  'src/routes/Cancha/**/*.js',
  'src/routes/Mesa/**/*.js',
  'src/routes/Cliente/**/*.js',
  'src/routes/Empresa/**/*.js',
  'src/routes/Notificaciones/**/*.js',
  'src/routes/Producto/**/*.js',
  'src/routes/Qr/**/*.js',
];

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: solidModules,
    ...js.configs.recommended,
    rules: {
      camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
];