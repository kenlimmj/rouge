import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'lib/rouge.js',
  output: [
    {
      file: 'dist/rouge.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/rouge.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      presets: [['@babel/preset-env', { targets: { node: '14' } }]],
      plugins: ['@babel/plugin-transform-flow-strip-types'],
    }),
    terser(),
  ],
};
