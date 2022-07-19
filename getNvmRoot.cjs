const { exec } = require('node:child_process');
const util = require('node:util');
const path = require('node:path/win32');
async function getNvmRoot() {
    return new Promise((resolve, reject) => {
        let nvmRoot;
        exec('nvm which current', {cwd:'~/.nvm'}, (err, stdout, stderr) => {
            if (err) {
                console.error(err.message);
                reject(err.message);
            } else if (stdout) {
                nvmRoot = path.resolve(stdout.trim());
                resolve(nvmRoot);
            }
        });
    });
}
async function getTscRoot() {
    const execp = util.promisify(exec);
    return execp('which tsc', { encoding: 'utf8' }).then(({ stdout, stderr }) => {
        if (stderr) {
            console.error(stderr);
        } else if (stdout) {
            return stdout.trim();
        }
    });
}
module.exports = { getNvmRoot, getTscRoot };