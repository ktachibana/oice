const path = require('path');
const julius = require('./index');

console.log(julius(path.resolve(process.argv[2])));
