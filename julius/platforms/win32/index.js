const child = require('child_process');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = function(voiceBuffer) {
  // juliusにstdin経由で入力してもうまく行かなかった(win版のみ)ためファイルを経由する
  const tmpFile = tmp.fileSync({ prefix: 'charm-', postfix: '.wav' });

  child.spawnSync(
    path.resolve(__dirname, './external/sox-14.4.2/sox.exe'),
    ['-', '-t', '.wav', '-r', '16k', '-b', '16', '-c', '1', tmpFile.name],
    { input: voiceBuffer }
  );

  const juliusResult = child.spawnSync(
    path.resolve(__dirname, './external/julius-4.3.1-win32bin/bin/julius-4.3.1.exe'),
    ['-C', path.resolve(__dirname, '../../charm.jconf'), '-input', 'file'],
    { input: tmpFile.name }
  );

  tmpFile.removeCallback();
  return juliusResult.stdout.toString();
};
