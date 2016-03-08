const child = require('child_process');
const path = require('path');

module.exports = function(audioFilePath) {
  // stdin経由だとうまく行かなかった(win版特有の症状)ためファイルを経由する
  child.spawnSync(
    path.resolve(__dirname, 'sox-14.4.2/sox.exe'),
    [audioFilePath, '-t', '.wav', '-r', '16k', '-b', '16', '-c', '1', 'out.wav'] // TODO: tempfile
  );

  const juliusResult = child.spawnSync(
    path.resolve(__dirname, 'julius-4.3.1-win32bin/bin/julius-4.3.1.exe'),
    ['-C', path.resolve(__dirname, '../../charm.jconf'), '-input', 'file'],
    { input: 'out.wav' }
  );
  return juliusResult.stdout.toString();
};
