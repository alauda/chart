const gulp = require('gulp');
const rollup = require('rollup');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const resolve = require('rollup-plugin-node-resolve');
const pkg = require('../../package.json');

const peers = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const rollupConfig = rollup.defineConfig({
  input: 'src/index.ts',
  external: peers,
  plugins: [
    typescript({
      tsconfigDefaults: {
        compilerOptions: {
          plugins: [
            { transform: 'typescript-transform-paths' },
            {
              transform: 'typescript-transform-paths',
              afterDeclarations: true,
            },
          ],
        },
      },
      typescript: require('ttypescript'),
      lib: ['es5', 'es6', 'dom'],
      target: 'es5',
      cacheDir: 'node_modules/rollup/.cache',
    }),
  ],
});

gulp.task('build', async function () {
  const bundle = await rollup.rollup(rollupConfig);

  bundle.write({
    file: pkg.main,
    format: 'esm',
    name: 'alauda-chart',
  });
  bundle.write({
    file: 'dist/chart.min.js',
    format: 'esm',
    plugins: [terser(), resolve()],
    sourcemap: 'true',
    name: 'alauda-chart',
  });
});
