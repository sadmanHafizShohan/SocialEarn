import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'api', 'apps-script'] },
  js.configs.recommended,
  { files: ['src/**/*.{js,jsx}'], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }, ...reactHooks.configs['recommended-latest'], plugins: { 'react-refresh': reactRefresh }, rules: { 'react-refresh/only-export-components': 'off', 'no-unused-vars': 'off', 'no-undef': 'off' } }
];
