const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');

const outputs = [
  { format: 'esm', input: 'src/modalr.js', outfile: 'dist/modalr.esm.js' },
  { format: 'iife', input: 'src/iife-wrapper.js', outfile: 'dist/modalr.js' }
];

outputs.forEach(config => {
  esbuild.build({
    format: config.format,
    entryPoints: [config.input],
    outfile: config.outfile,
    bundle: true,
    minify: true,
    target: 'chrome63',
    sourcemap: true,
    plugins: [sveltePlugin({
      compileOptions: { css: true }
    })],
    logLevel: 'info'
  }).catch(() => process.exit(1));
});
