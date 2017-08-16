const express = require('express');
const bodyParser = require('body-parser');
const recognizeSkill = require('./recognizeSkill');

const app = express();

app.use(express.static('ui'));
app.use(bodyParser.raw({limit: '5mb', type: '*/*'}));

app.post('/recognize', (req, res) => {
  recognizeSkill(req.body).then((charm) => {
    res.json(charm);
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
