const child = require('child_process');
const path = require('path');

module.exports = function(audioFilePath) {
  const juliusResult = child.spawnSync(
    path.resolve(__dirname, 'julius.sh'),
    [audioFilePath],
    { cwd: __dirname }
  );
  return juliusResult.stdout.toString();
};
