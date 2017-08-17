const child_process = require('child_process');
const os = require('os');

child_process.execSync('./install.sh', {cwd: `${__dirname}/${os.platform()}`});
