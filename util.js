module.exports = {

  /** Facebook Event Search
   */
  fb_events: function (lat, lng, dist=15) {
    return new Promise(function(resolve, reject) {
      console.log("Searching Facebook..");
      let fbEventSearch = require("facebook-events-by-location-core");
      let es = new fbEventSearch();
      es.search({
        "lat": lat,
        "lng": lng,
        "until": getThisWeek(),
        "distance": Math.ceil(dist*1609.344),
        "accessToken": process.env.FEBL_ACCESS_TOKEN
      }).then(function (events) {
	console.log("Parsing FB Events..");
	events = events.events;
	let results = [];
        for (let i = 0; i < events.length; i++) {
          var evt = events[i];
	  if (evt.isCancelled) continue;
	  var my = {};
	  my.url = "https://www.facebook.com/events/"+evt.id;
	  my.name = evt.name;
	  my.startTime = evt.startTime;
	  my.endTime = evt.endTime;
	  my.category = category_fb(evt.category);
          my.lat = evt.place.location.latitude;
          my.lng = evt.place.location.longitude;
	  my.address = evt.place.location.street;
	  my.distance = parseInt(evt.distance) / 1609.344;
	  results.push(my);
	}
	console.log("Parsing done.");
        resolve(results);
      }).catch(function (error) {
        console.log(JSON.stringify(error));
      });
    });
  },

  /** Eventful Event Search
   */
  ef_events: function (lat, lng, dist=15) {
    return new Promise(function (resolve, reject) {
      console.log("Searching Eventful..");
      let qs = require('querystring');
      let request = require('request');
      let results = [];
      let uri = "http://api.eventful.com/json/events/search?"+
        qs.stringify({
          "where": lat + "," + lng,
          "within": dist,
	  "page_size": 250,
          "app_key": process.env.EVFL_ACCESS_TOKEN
        });
      let items = 0;
      let page = 1;
      let handler = function(err, res, bod) {
        let json = JSON.parse(bod);
        items = json.total_items;
	let events = json.events.event;
        for (var i=0; i<events.length; i++) {
	  evt = events[i];
	  var my = {};
	  my.url = evt.url;          
	  my.name = evt.title;
          my.startTime = evt.start_time;
          my.endTime = evt.stop_time;
          my.category = category_ef(null);
          my.lat = evt.latitude;
          my.lng = evt.longitude;
          my.address = evt.venue_address;
          my.distance = null;
          results.push(my);
	}
	if (results.length < items) {
	  console.log("Recurring: " + results.length + " < " + items);
	  request(uri + "&page_number=" + ++page, handler);
	} else {
	  resolve(results);
	}
      }
      request(uri, handler);
    }).catch(function (err) {
      console.log(err);
    });
  },

  /** EventBrite Event Search
   */
  eb_events: function (lat, lng, dist=15) {
    return new Promise(function (resolve, reject) {
      console.log("Searching Eventbrite..\n");
      let qs = require('querystring');
      let request = require('request');
      let results = [];
      let date = new Date();
      let uri = 'https://www.eventbriteapi.com/v3/events/search/?'+
        qs.stringify({
          "location.latitude": lat,
          "location.longitude": lng,
          "location.within": dist+"mi",
	  "start_date.range_end": new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('.')[0]+"Z", 
          "token": process.env.EVBR_ACCESS_TOKEN
        });
      let items = 0;
      let page = 1;
      let handler = function(err, res, bod) {
	let json = JSON.parse(bod);
	items = json.pagination.object_count;
	let events = json.events;
        for (var i=0; i<events.length; i++) {
	  evt = events[i];
	  var my = {};
	  my.url = evt.url;          
	  my.name = evt.name.text;
          my.startTime = evt.start.local;
          my.endTime = evt.end.local;
          my.category = category_eb(null);
          my.lat = evt.latitude; //FIXME
          my.lng = evt.longitude; //FIXME
          my.address = evt.venue_address; //FIXME
          my.distance = null;
          results.push(my);
	}
	if (results.length < items) {
	  console.log("Recurring: " + results.length + " < " + items);
	  request(uri + "&page=" + ++page, handler);
	} else {
	  resolve(results);
	}
      };
      request(uri, handler);
    }).then(function (body) {
      
    }).catch(function (err) {
      console.log(err);
    });
  }
}

function category_fb(cat) {
  if(cat == "EVENT_MUSIC" || cat == "MUSIC_EVENT") {
    return "MUSIC"; 
  } else if (cat == "") {
    return "SPORTS";
  } else if (cat == "") {
    return "ARTS";
  } else {
    return "OTHER";
  }
}

function category_ef(cat) {
  return "OTHER";
}

function category_eb(cat) {
  return "OTHER";
}

function getThisWeek() {
  let today = new Date();
  let nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);

  return nextWeek.getTime() / 1000;  
}
