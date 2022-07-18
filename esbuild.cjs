const { exec } = require('node:child_process');
exec('C:\\Users\\michael.mccaughan\\.nvm\\versions\\node\\v16.13.0\\bin\\tsc.cmd', {cwd:__dirname}, (err, stdout, stderr) => {
    if (err) {
        console.error(err.message);
    }
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
}).addListener('exit', (code, signal) => {
    if (code !== 0) {
        process.exit(code);
    }
    require('esbuild').build({
        entryPoints: ['behavior.js','search/frontend/SearchComponent.js','product/frontend/ProductComponent.js','product/frontend/GalleryComponent.js','checkout/frontend/CartComponent.js'],
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
});
