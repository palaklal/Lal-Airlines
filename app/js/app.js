(function() {
	var app = angular.module('lalAirlines', []);

	var results = [];
	app.controller('searchController', function(){
		this.form = {};

		this.searchFlights = (function(){
			console.log(this.form);
			this.form = {};
		});
	});
})();