require('dotenv').config();

var api = require("./util.js");

proms = [];
var lat = 43.5446;
var lng = -96.7311;
proms.push(api.fb_events(lat, lng));
proms.push(api.eb_events(lat, lng));
proms.push(api.ef_events(lat, lng));

Promise.all(proms).then(function(values) {
  console.log(values);
});


