const { exec } = require('node:child_process');
const path = require('node:path/win32');
let ranBuild = false;
exec('nvm root', (err, stdout, stderr) => {
    if (err) {
        console.error(err.message);
    } else if (stdout) {
        let nvmRoot = stdout.substring(stdout.indexOf('Root:') + 5, stdout.indexOf('\n', stdout.indexOf('Root:'))).trim();
        exec('nvm current', (err, stdout) => {
            if (err) {
                console.error(err.message);
            } else if (stdout) {
                nvmRoot = path.resolve(nvmRoot, stdout.trim());
                exec(path.resolve(nvmRoot, 'tsc.cmd'), {cwd:__dirname}, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err.message);
                    } else if (!ranBuild) {
                        require('esbuild').build({
                            entryPoints: ['behavior.js','search/frontend/SearchComponent.js','product/frontend/ProductComponent.js','product/frontend/GalleryComponent.js','checkout/frontend/CartComponent.js'],
                            bundle: true,
                            minify: true,
                            sourcemap: true,
                            allowOverwrite: true,
                            target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
                            outdir: '.',
                            platform: "node"
                        }).catch(() => process.exit(1));
                        require('esbuild').build({
                            entryPoints: ['styles.css'],
                            bundle: true,
                            minify: true,
                            sourcemap: true,
                            target: ['chrome103', 'firefox102', 'safari15', 'edge103'],
                            outfile: 'index.css'
                        }).catch(() => process.exit(1));        
                        ranBuild = true;
                    }
                    if (stdout) console.log(stdout);
                    if (stderr) console.warn(stderr);
                });
                                
            }
        })
    }
})
