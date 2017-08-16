const julius = require('../julius');

module.exports = function(buffer) {
  return new Promise(function(resolve, reject) {
    const output = julius(buffer);

    const pattern = /sentence1: <s> (.+) <\/s>/;
    const match = pattern.exec(output);
    if (!match) {
      resolve(null);
      return;
    }
    const sentence = match[1];
    const words = sentence.split(/\s+/);
    const skills = [];
    while (words[0] !== 'slot' && words.length) {
      const route = words.shift();
      const sign = ((['+', '-'].indexOf(words[0]) !== -1) ? words.shift() : '');
      const point = parseInt(sign + words.shift());

      skills.push({route: route, point: point});
    }
    const slot = parseInt(words.pop() || 0);
    const charm = {skills: skills, slot: slot};
    resolve(charm);
  });
};

