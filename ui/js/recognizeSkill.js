function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('loadend', event => {
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

module.exports = function (blob) {
  return new Promise((resolve, reject) => {
    blobToBuffer(blob).then(buffer => {
      fetch('/recognize', {
        method: 'POST',
        body: buffer,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      }).then((res) => {
        resolve(res.json());
      });
    });
  });
};
