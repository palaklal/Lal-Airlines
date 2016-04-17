(function() {
	var app = angular.module('lalAirlines', []);

	var results = [];
	app.controller('searchController', [ '$http', function($http){
		this.form = {};

		this.searchFlights = (function(){
			console.log(this.form);
			var request = {
			  request: {
			    passengers: {
			      adultCount: 1
			    },
			    slice: [
			      {
			        origin: "BOS",
			        destination: "LAX",
			        date: "2016-04-20"
			      },
			      {
			        origin: "LAX",
			        destination: "BOS",
			        date: "2016-04-20"
			      }
			    ],
			    solutions: 5
			  }
			};
			console.log(request);
			$http({
				url: 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=API_KEY',
				method: 'POST',
				data: request,
				headers: {'Content-Type': 'application/json'}	
			}).then(function(response) {
				console.log("SUCCESS");
				console.log(response.data.trips);
			}, function(response) {
				console.log("ERROR "+response.status);
			});

			this.form = {};
		});
	}]);

	app.controller('flightsController', function(){
		this.empty = false;
	});
})();