"use strict";
const handlebars = require('handlebars');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const SUBJECTS_PATH = './subjects/';

handlebars.registerHelper('filesize', function(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
});

function execPromise (cmd, opts) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve(stdout);
        });
    });
}

function renderIndex (data) {
    return new Promise((resolve, reject) => {
        let template, content;
        fs.readFile('./app/index.hbs', (err, source) => {
            if (err) {
                return reject(err);
            }
            source = source.toString();
            template = handlebars.compile(source);
            content = template(data);
            fs.writeFile('./www/index.html', content, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    })
}

function readSize (file) {
    return execPromise(`cat ${file} | wc -c`).then(stdout => {
        return parseInt(stdout);
    });
}

function readGzippedSize (file) {
    return execPromise(`gzip -c ${file} | wc -c`).then(stdout => {
        return parseInt(stdout);
    });
}

fs.readdir(SUBJECTS_PATH, (err, files) => {
    let tasks;
    if (err) {
        throw err;
    }
    files = files.filter(file => {
        return fs.lstatSync(path.join(SUBJECTS_PATH, file)).isDirectory() && fs.existsSync(path.join(SUBJECTS_PATH, file, 'build.sh'));
    });
    tasks = files.map(file => {
        let subjectDir = path.join(__dirname, SUBJECTS_PATH, file);
        return execPromise('npm install', {
            cwd: path.join(SUBJECTS_PATH, file)
        }).then(_ => {
            let packageJson = require(path.join(subjectDir, 'package.json'))
            return Promise.all([
                readSize(path.join(subjectDir, 'www/bundle.js')),
                readGzippedSize(path.join(subjectDir, 'www/bundle.js')),
                readSize(path.join(subjectDir, 'app', packageJson.componentPath))
            ]).then(sizes => {
                return {
                    id: file,
                    name: packageJson.description,
                    bundleSize: sizes[0],
                    bundleGzippedSize: sizes[1],
                    componentSize: sizes[2]
                }
            });
        });
    });
    Promise.all(tasks).then(results => {
        results = results.sort((a, b) => a.bundleGzippedSize - b.bundleGzippedSize);
        rimraf.sync('./www');
        mkdirp.sync('./www');
        return renderIndex({ subjects: results });
    }).then(() => {
        console.log('done');
    }).catch(e => {
        console.log(e);
    })
});