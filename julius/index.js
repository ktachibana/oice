const os = require('os');
module.exports = require('./platforms/' + os.platform());
