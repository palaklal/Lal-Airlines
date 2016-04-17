(function() {
	var app = angular.module('lalAirlines', []);

	var results = []; //array to store all the flights matching user's search criteria
	app.controller('searchController', [ '$http', '$filter', function($http, $filter){ //controller for search form
		this.form = {};
		this.searchFlights = (function(){
			//convert HTML dates to date format the API requires
			this.form.startDate = $filter('date')(this.form.startDate, 'yyyy-MM-dd');
			this.form.endDate = $filter('date')(this.form.endDate, 'yyyy-MM-dd');

			console.log(this.form);
			var request = { //request body for http.post to Google Flights QPX API
			  request: {
			    passengers: {
			      adultCount: this.form.num
			    },
			    slice: [
			      {
			        origin: this.form.origin,
			        destination: this.form.destination,
			        date: this.form.startDate + ""
			      },
			      {
			        origin: this.form.destination,
			        destination: this.form.origin,
			        date: this.form.endDate + ""
			      }
			    ],
			    maxPrice: "USD" + this.form.max
			  }
			};
			console.log(request);
			$http({ //http post to Google QPX API to receive all the flights that match user's search criteria
				url: 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=API_KEY',
				method: 'POST',
				data: request,
				headers: {'Content-Type': 'application/json'}	
			}).then(function(response) {
				console.log("SUCCESS");
				var flights = response.data.trips.tripOption;
				//console.log(flights);
				for (var flight in flights) { //iterate through every possible itinerary 
					if (flights.hasOwnProperty(flight)) {
						var itinerary = { }; //data structure for each itinerary to push onto forms
						itinerary.price = flights[flight].pricing[0].saleTotal;
						itinerary.roundtrip = [];
						for (var f = 0; f < flights[flight].slice.length; f++) {
							var oneWay = []; //from ORIGIN to DESTINATION flight
							for (var s = 0; s < flights[flight].slice[f].segment.length; s++) { //each leg of that flight
								var segment = flights[flight].slice[f].segment[s]; 

								var stop = {};
								stop.carrier = segment.flight.carrier;
								stop.flightNumber = segment.flight.number;
								stop.departureTime = segment.leg[0].departureTime;
								stop.arrivalTime = segment.leg[0].arrivalTime;
								stop.origin = segment.leg[0].origin;
								stop.destination = segment.leg[0].destination;
								oneWay.push(stop);
							}
						itinerary.roundtrip.push(oneWay);
						}
					}
				results.push(itinerary);
				console.log(results);
				}
			}, function(response) {
				console.log("ERROR: "+response.status);
			});
			console.log(results);
			this.form = {};
		});
	}]);

	app.controller('flightsController', function(){
		this.empty = true;
		if (results.length) {
			this.empty = false;
		}
	});
})();