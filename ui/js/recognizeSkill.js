import $ from 'jquery';

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
      $.ajax({
          url: '/',
          type: 'POST',
          data: form,
          dataType: 'json',
          processData: false,
          contentType: false
        }
      ).then(function (charmData, _, xhr) {
        if (xhr.status == 204) resolve(null);
        resolve(charmData);
      });
    });
  });
};
