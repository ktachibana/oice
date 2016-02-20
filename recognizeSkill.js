function blobToBuffer(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();

    reader.addEventListener('loadend', function(event) {
      if (event.error) {
        reject(event.error);
      } else {
        resolve(new Buffer(reader.result));
      }

      reader.removeEventListener('loadend', blobToBuffer, false);
    }, false);

    reader.readAsArrayBuffer(blob);
  });
}

module.exports = function(blob) {
  return new Promise(function(resolve, reject) {
    blobToBuffer(blob).then(function(buffer) {
      var charmData = ipc.sendSync('recognize', buffer);
      resolve(charmData);
    });
  });
};
