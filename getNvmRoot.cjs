const { exec } = require('node:child_process');
const path = require('node:path/win32');
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
                return nvmRoot;