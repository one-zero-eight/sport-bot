import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'dist',
  platform: 'node',
  clean: true,
  minify: false,
  splitting: false,
  sourcemap: false,
})
