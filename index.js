var app = require('express')();
var api = require('./util.js');
var cache = require('./cache.js');

app.use(require('cors')());

app.get('/api/events/:lat-:lng', cache(6000), function(req, res) {
  let lat = req.params.lat;
  let lng = req.params.lng;
  console.log("Request received for lat: " + lat + ", lng: " + lng);
  proms = [];  
  proms.push(api.fb_events(lat, lng));
  proms.push(api.ef_events(lat, lng));  

  Promise.all(proms).then(function(vals) {
    res.send(vals);
  });
});

app.listen(3001);
console.log("Eventist listening on 3001");
