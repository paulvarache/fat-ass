#!/bin/sh
rm -rf www
mkdir www
./node_modules/.bin/webpack --config webpack.config.js
cp app/index.html www/index.html
./node_modules/.bin/uglifyjs www/bundle.js -o www/bundle.js