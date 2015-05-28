const $ = require('jquery');
const Header = require('./views/header');
const LeafBrowser = require('./views/leafbrowser');

let $app = $('#app');

$app.html(`
  <div class='header'></div>
  <div class='app-body'>
    <div class='leafbrowser'></div>
  </div>
`);

new Header($app.find('.header'));
new LeafBrowser($app.find('.leafbrowser'));