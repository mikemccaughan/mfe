require('esbuild').build({
    entryPoints: ['behavior.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
    outfile: 'index.js'
}).catch(() => process.exit(1));
require('esbuild').build({
    entryPoints: ['styles.css'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
    outfile: 'index.css'
}).catch(() => process.exit(1));
