const $ = require('jquery');
const Header = require('./views/header.js');


let $app = $('#app')
$app.html(`
  <div class='header'></div>
  <div class='app-body'></div>
`);

new Header($app.find('.header'));