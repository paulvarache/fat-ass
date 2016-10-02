#!/bin/sh
rm -rf www
mkdir www
node generate.js
cp ./app/style.css ./www/style.css
for d in ./subjects/*/ ; do
    mkdir -p "./www/$d"
    cp -r "${d}www/" "./www/$d" || echo ""
done