#!/bin/bash
rm -rf www
mkdir www
./node_modules/.bin/vulcanize app/index.html --strip-comments | ./node_modules/.bin/crisper --script-in-head=false -h ./www/index.html -j ./www/bundle.js
./node_modules/.bin/uglifyjs ./www/bundle.js -o ./www/bundle.js