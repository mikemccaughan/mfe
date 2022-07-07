const { exec } = require('node:child_process');
exec('tsc', {cwd:__dirname}, (err, stdout, stderr) => {
    if (err) console.error(err.message);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
});
require('esbuild').build({
    entryPoints: ['behavior.js','search/frontend/SearchComponent.js'],
    bundle: true,
    minify: true,
    sourcemap: true,
    allowOverwrite: true,
    target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
    outdir: '.'
}).catch(() => process.exit(1));
require('esbuild').build({
    entryPoints: ['styles.css'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
    outfile: 'index.css'
}).catch(() => process.exit(1));
