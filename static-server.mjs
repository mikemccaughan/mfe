import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import mime from 'mime/lite.js';
const server = http.createServer();
server.on('request', async (req, res) => {
    const url = new URL(req.url, `http://localhost:1234/`);
    const pathPart = url.pathname.at(0) === '/' ? url.pathname.substring(1) : url.pathname;
    console.log(`url.pathname: "${pathPart}"`);
    let localPath = path.resolve(pathPart);
    if (url.pathname.length <= 1) {
        localPath = path.resolve('index.html');
    } 
    if (url.pathname.includes('mongodb') || url.pathname.includes('bson')) {
        localPath = path.resolve(path.join('node_modules', 'bson', 'dist', 'bson.browser.esm.js'));
    }
    if (url.pathname.includes('uuid')) {
        localPath = path.resolve(path.join('node_modules', 'uuid', 'wrapper.js'));
    }
    if (url.pathname.includes('dist/index.js')) {
        localPath = path.resolve(path.join('node_modules', 'uuid', 'dist', 'esm-browseer', 'index.js'));
    }
    if (url.pathname.includes("uuid/dist")) {
        const filename = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
        localPath = path.resolve(path.join('node_modules', 'uuid', 'dist', 'esm-browser', filename));
    }
    console.log(`Attempting to read ${localPath}`);
    try {
        var file = await fs.readFile(localPath, 'utf-8');
        res.writeHead(200, 'OK', {
            'Content-Length': file.length,
            'Content-Type': mime.getType(localPath)
        });
        res.end(file, 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.statusMessage = 'Not found';
        } else {
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';
        }
        res.end();
    }
});
console.log('Listening on http://localhost:1234/');
server.listen(1234);
