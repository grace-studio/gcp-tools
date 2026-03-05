import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/services/index.ts',
    'src/utils/index.ts',
    'src/types/index.ts',
  ],
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  dts: true,
  outDir: 'lib',
  clean: true,
  target: false,
});
