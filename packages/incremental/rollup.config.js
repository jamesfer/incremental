import typescript from 'rollup-plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'build/index.js',
    format: 'esm',
    sourcemap: true,
    compact: true,
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
  ],
};
