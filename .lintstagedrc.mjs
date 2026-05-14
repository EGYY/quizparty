export default {
  '**/*.{ts,tsx,mts,cts}': ['eslint --fix', 'prettier --write'],
  '**/*.{js,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yaml,yml}': ['prettier --write'],
  '!apps/tv/{android,ios,vendor}/**': [],
};
