const cfg = require('config');
const express = require('express');
const { read } = require('fs-jetpack');


const app = express();
const pkg = read('package.json', 'json');

app.set('view engine', 'pug');
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.render('index', {
    min: cfg.dictionary['length'].min,
    max: cfg.dictionary['length'].max,
  });
});

app.listen(cfg.app.port, () => {
  console.log(`${pkg.name} v${pkg.version} listening on port ${cfg.app.port}`);
});
