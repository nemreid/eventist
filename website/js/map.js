      // Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
      var map, infoWindow;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 12
        });
        infoWindow = new google.maps.InfoWindow;
          
        // Searchbox Autocomplete & Listener
        var input = document.getElementById('autocomplete');
        autocomplete = new google.maps.places.Autocomplete(input, {});
        autocomplete.bindTo('bounds', map);
        autocomplete.addListener('place_changed', function() {
            console.log("Place changed");
            infoWindow.close();
            var place = autocomplete.getPlace();
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            getEventJsonData(map.getCenter());
        });

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                getEventJsonData(map.getCenter());
                
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }
                                 
      function getEventJsonData(pos) {
        console.log("Getting event data..");
        var url = "http://localhost:3001/api/events/";
        get(url + pos.lat() + "-" + pos.lng(), loadMarkers);
      }

      function drawEventMarkers(events, color) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var latLng = new google.maps.LatLng(event.lat, event.lng);
            var marker = new google.maps.Marker({
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                position: latLng,
                map: map
            });
            let pos = marker.getPosition();
            let contentString = 
                "<div><a href=\"" +
                event.url +
                "\"><h5>" +
                event.name +
                "</h5></a></div>" +
                "<div><p>" +
                event.address +
                "</p></div>" +
                "<div><p>" + 
                new Date(event.startTime).toDateString() +
                ": " +
                new Date(event.startTime).toLocaleTimeString() + 
                (event.endTime != null ? 
                " - " +
                new Date(event.endTime).toLocaleTimeString() : "");
            
            marker.addListener('click', function() {
                infoWindow.setPosition(pos);
                infoWindow.setContent(contentString);
                infoWindow.open(map);
            })
        }
      }

      function loadMarkers(results) {
          results = JSON.parse(results);
          proms = [];
          for (let i = 0; i<results.length; i++) {
            proms.push(new Promise(function (resolve, reject) {
              drawEventMarkers(results[i]);
              resolve();
            }));
          }
          
          Promise.all(proms).then(function() {
              console.log("Populated!");
              // Remove loading indicator
          });
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }

      function get(url, callback) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    callback(xmlHttp.responseText);
            }
            xmlHttp.open("GET", url, true); // true for asynchronous 
            xmlHttp.send(null);
      }