(function() {
	var app = angular.module('lalAirlines', []);
	results = [];
	app.controller('searchController', [ '$http', '$filter', function($http, $filter){ //controller for search form and results
		this.form = {};
		this.results = []; //array to store all the flights matching user's search criteria
		this.searchFlights = (function(){
			//convert HTML dates to date format the API requires
			this.form.startDate = $filter('date')(this.form.startDate, 'yyyy-MM-dd');

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
			      }
			    ]
			  }
			};
			if (this.form.endDate) { //this isn't a required field so check if it's been flled out first and then add to request
				this.form.endDate = $filter('date')(this.form.endDate, 'yyyy-MM-dd');
				var returningJourney = {
			        origin: this.form.destination,
			        destination: this.form.origin,
			        date: this.form.endDate + ""
			    }
				request.request.slice.push(returningJourney);
			}
			if (this.form.max) { //if user set a maximum ticket price, add to request
				request.request.maxPrice = "USD" + this.form.max;
			}

			$http({ //http post to Google QPX API to receive all the flights that match user's search criteria
				url: 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=API_KEY',
				method: 'POST',
				data: request,
				headers: {'Content-Type': 'application/json'}	
			}).then(function(response) {
				console.log("SUCCESS");
				var flights = response.data.trips.tripOption;
				for (var flight in flights) { //iterate through every possible itinerary 
					if (flights.hasOwnProperty(flight)) {
						var itinerary = { }; //data structure for each itinerary to push onto forms
						itinerary.price = "Price: " + flights[flight].pricing[0].saleTotal;
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
						oneWay.startDate = flights[flight].slice[f].segment[0].leg[0].departureTime; //start date for entire one-way journey
						oneWay.arrivalDate = flights[flight].slice[f].segment[flights[flight].slice[f].segment.length - 1].leg[0].arrivalTime; //arrival date for entire one-way journey
						oneWay.numberOfStops = flights[flight].slice[f].segment.length;
						itinerary.roundtrip.push(oneWay);
						}
					}
				results.push(itinerary);
				}
			}, function(response) {
				console.log("ERROR: "+response.status);
				//trick to force error back to frontend
				var error = {};
				error.price = "There was an error in your request! Please try again later!";
				results.push(error);
			});
			this.results = results;
			this.form = {}; //reset form
		});
	}]);
})();