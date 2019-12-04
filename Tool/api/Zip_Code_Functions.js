const Zip_Code_Library = require('zipcodes');

function ZipGivenCity(City, State){
    // Fetches a zipcode given a City name and State
    var Zip_Info = Zip_Code_Library.lookupByName(City, State);

	return Zip_Info;
}

function CityGivenZip(Zip_Code){
    // Fetches a json object given a zipcode
    var Zip_Info = Zip_Code_Library.lookup(Zip_Code);

	return Zip_Info;
}

function GetAllZipsInRadius(Zip_Code, Distance){
	// Finds all zips within 'Distance' from given zip
	var Zip_List = Zip_Code_Library.radius(Zip_Code, Distance);
	
	return Zip_List;
}

//var rad = zipcodes.radius(95014, 50);

module.exports = {
    ZipGivenCity,
	CityGivenZip,
	GetAllZipsInRadius
};