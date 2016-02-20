var child = require('child_process');

function blobToBuffer(blob, callback) {
  // Create a file reader instance.
  var reader = new FileReader();

  // Listen to when reading is finished and
  // run the callback with a buffer.
  reader.addEventListener("loadend", function(event) {
    if (event.error) {
      callback(event.error)
    } else {
      callback(null, new Buffer(reader.result))
    }

    // Remove the listener.
    reader.removeEventListener("loadend", blobToBuffer, false)
  }, false);

  // Read the blob as a typed array.
  reader.readAsArrayBuffer(blob);

  return reader;
}

module.exports = function(wavBlog) {
  return new Promise(function (resolve, reject) {
    blobToBuffer(wavBlog, function(err, buffer) {
      var result = child.spawnSync('./recognize.sh', [], { input: buffer });
      if (result.status === 0) {
        resolve(result.stdout.toString());
      } else {
        reject(result.status, result.stdout.toString(), result.stderr.toString());
      }
    });
  })
};
