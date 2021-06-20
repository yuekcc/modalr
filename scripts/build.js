const { build, cliopts } = require('estrella');
const sveltePlugin = require('esbuild-svelte');

const [opts] = cliopts.parse(
  ['format', 'Setup package format', '<iife|esm>'],
  ['outfile', 'Setup output file', '<file>'],
  ['input', 'Setup entry file', '<file>'],
);
const format = opts.format;
const outfile = opts.outfile;
const input = opts.input;

build({
  entry: input || 'src/index.js',
  outfile: outfile || 'dist/index.js',
  format: format || 'esm',
  bundle: true,
  minify: false,
  target: 'chrome63',
  sourcemap: true,
  plugins: [
    sveltePlugin({
      compileOptions: { css: true },
    }),
  ],
});
