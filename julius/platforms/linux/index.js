const child = require('child_process');
const path = require('path');

module.exports = function(voiceBuffer) {
  const juliusResult = child.spawnSync(
    path.resolve(__dirname, 'julius.sh'),
    [],
    { input: voiceBuffer, cwd: __dirname }
  );
  return juliusResult.stdout.toString();
};
