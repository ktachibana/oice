const julius = require('../julius');

module.exports = function(buffer) {
  return new Promise(function(resolve, reject) {
    const output = julius(buffer);

    var pattern = /sentence1: <s> (.+) <\/s>/;
    var match = pattern.exec(output);
    if (!match) {
      resolve(null);
      return;
    }
    var sentence = match[1];
    var words = sentence.split(/\s+/);
    var skills = [];
    while (words[0] != 'slot' && words.length) {
      var route = words.shift();
      var sign = ((['+', '-'].indexOf(words[0]) != -1) ? words.shift() : '');
      var point = parseInt(sign + words.shift());

      skills.push({route: route, point: point});
    }
    var slot = parseInt(words.pop() || 0);
    var charm = {skills: skills, slot: slot};
    resolve(charm);
  });
};

