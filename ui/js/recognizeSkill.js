import request from 'superagent';

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
      const form = new FormData();
      form.append('file', blob);
      request.post('/').send(form).end(function (err, charmData) {
        if (err) reject(err);
        resolve(charmData.body);
      });
    });
  });
};