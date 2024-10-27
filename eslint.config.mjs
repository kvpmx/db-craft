// @ts-check

import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-plugin-prettier';

export default withNuxt({
  plugins: { prettier },
  rules: {
    'vue/require-default-prop': 'off',
    'import/consistent-type-specifier-style': 'warn',
  },
});
