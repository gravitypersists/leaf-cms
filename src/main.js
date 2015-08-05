const $ = require('jquery');
const React = require('react');
const Header = require('./components/header');
const LeafBrowser = require('./views/leafbrowser');
const LeafCanvas = require('./views/leaf-canvas');

let $app = $('#app');

$app.html(`
  <div class='header'></div>
  <div class='app-body'>
    <div class='leafbrowser'></div>
    <div class='leaf-canvas-container'>
      <div class='leaf-canvas'><div>
    </div>
  </div>
`);

React.render(<Header />, $app.find('.header')[0]);
new LeafBrowser($app.find('.leafbrowser'));
new LeafCanvas($app.find('.leaf-canvas'));