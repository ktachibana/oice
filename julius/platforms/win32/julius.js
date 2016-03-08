const child = require('child_process');
const path = require('path');
const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = function(audioFilePath) {
  // stdin経由だとうまく行かなかった(win版特有の症状)ためファイルを経由する
  const tmpFile = tmp.fileSync({ prefix: 'charm-', postfix: '.wav' });

  child.spawnSync(
    path.resolve(__dirname, 'sox-14.4.2/sox.exe'),
    [audioFilePath, '-t', '.wav', '-r', '16k', '-b', '16', '-c', '1', tmpFile.name]
  );

  const juliusResult = child.spawnSync(
    path.resolve(__dirname, 'julius-4.3.1-win32bin/bin/julius-4.3.1.exe'),
    ['-C', path.resolve(__dirname, '../../charm.jconf'), '-input', 'file'],
    { input: tmpFile.name }
  );

  tmpFile.removeCallback();
  return juliusResult.stdout.toString();
};
