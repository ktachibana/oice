const path = require('path');
const fs = require('fs');
const julius = require('./index');

const wavFile = path.resolve(process.argv[2]);
console.log(julius(fs.readFileSync(wavFile)));
