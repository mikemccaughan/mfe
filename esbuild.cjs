const { exec } = require('node:child_process');
const path = require('node:path/win32');
const { getNvmRoot, getTscRoot } = require('./getNvmRoot.cjs');
let ranBuild = false;
const entryPoints = [
    'behavior.js',
    'search/frontend/SearchComponent.js',
    'product/frontend/ProductComponent.js',
    'product/frontend/GalleryComponent.js',
    'checkout/frontend/CartComponent.js'
];
const supportedBrowsers = [
    'chrome103', 
    'firefox102', 
    'safari15', 
    'edge103'
];
getTscRoot().then(tscRoot => {
    exec(path.resolve(tscRoot.replace('/c/', '/')), {cwd:__dirname}, (err, stdout, stderr) => {
        if (err) {
            console.error(err.message);
        } else if (!ranBuild) {
            require('esbuild').build({
                entryPoints: entryPoints,
                bundle: true,
                minify: true,
                sourcemap: true,
                allowOverwrite: true,
                target: supportedBrowsers,
                outdir: '.',
                platform: 'browser'
            }).catch(() => process.exit(1));
            require('esbuild').build({
                entryPoints: ['styles.css'],
                bundle: true,
                minify: true,
                sourcemap: true,
                target: supportedBrowsers,
                outfile: 'index.css'
            }).catch(() => process.exit(1));        
            ranBuild = true;
        }
        if (stdout) console.log(stdout);
        if (stderr) console.warn(stderr);
    });    
});
