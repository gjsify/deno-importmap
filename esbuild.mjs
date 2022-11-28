import { build } from 'esbuild';
import { readFile } from 'fs/promises';
import { extname, dirname } from 'path';

const pkg = JSON.parse(
    await readFile(
      new URL('./package.json', import.meta.url), 'utf8'
    )
);

if (!pkg.main && !pkg.module) {
    throw new Error("package.json: The main or module property is required!");
}

const baseConfig = {
    platform: 'node',
    entryPoints: ['mod.ts'],
    bundle: true,
    minify: false,
    external: [],
    plugins: []
}

// CJS
if (pkg.main) {
    build({
        ...baseConfig,
        outdir: dirname(pkg.main),
        format: 'cjs',
        outExtension: {'.js': extname(pkg.main)},
        platform: "node",
    });    
}

// ESM
if (pkg.module) {
    build({
        ...baseConfig,
        outdir: dirname(pkg.module),
        format: 'esm',
        outExtension: {'.js': extname(pkg.module)},
    });
}

// Test
build({
    ...baseConfig,
    entryPoints: ['run-tests.ts', 'test.ts'],
    outdir: '.',
    format: 'esm',
    outExtension: {'.js': '.mjs'},
});