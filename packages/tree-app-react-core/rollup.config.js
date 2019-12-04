import typescript from 'rollup-plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'build/index.js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    nodeResolve({
      only: [/^(?!(react|react-dom))/],
    }),
    commonjs({
      namedExports: {
        'node_modules/react/index.js': [
          'createContext',
          'createElement',
          'useContext',
          'useEffect',
          'useReducer',
        ],
        'node_modules/react-dom/index.js': [
          'render'
        ],
      }
    }),
  ],
};
