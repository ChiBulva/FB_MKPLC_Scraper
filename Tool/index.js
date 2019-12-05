/*  /
 * /
 */
/*************************************************************************************************************************
 *  Program:    Facebook scraper
 *  Objective:  Find facebook adds faster for a client
 *  Language:   Node.js (JavaScript), Html, Css
 *  
 *  Links:  ./api/*
 *          ./views/*
 * 
 *************************************************************************************************************************/

/*  /   Modules created by Travis C. J. Gray for personal use in this applicaiton
 * /
 */
const Zip_Code_Functions = require('./api/Zip_Code_Functions.js');
const Search_FaceBook = require('./api/Search_FaceBook.js');

/*  /   Modules from different NPM/Node.js librarys
 * /    Install with: npm install
 */
const express = require('express');                             //  EX
const bodyParser = require('body-parser');                      //  BP
const fileUpload = require('express-fileupload');
var fs = require('fs');

const app = express();                                          //  EX

app.use(bodyParser.json());                                     //  BP  ->  support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));             //  BP

app.use(fileUpload());

//   This is the port that the application will run on
//
const port = 3000;

/*  /   Sets the application to use the view folder, and enable EJS (Embedded JavaScript)
 * /    
 */
app.set('view engine', 'ejs');

/*  /   API calls 
 * /
 */
 
//  Homepage 
//  Loads:      ./views/homepage.ejs
//
app.get('/homepage', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "homepage";

	try{
		ejs_variables.List_Of_Zips = await fs.readFileSync('./assets/Locations_File.txt','utf8');
		ejs_variables.Files_Exist = "yes";
	}
	catch {
			
	}
    // Optinal Print for error handling 
	//console.log(testURL);

	console.log(ejs_variables);
	
    // Render the ./views/homepage.ejs template usign new ejs object
	res.render('homepage', ejs_variables);
})

//  Upload Files 
//  Loads:      ./views/upload_files.ejs
//
app.get('/upload_files', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "upload_files";

    // Optinal Print for error handling 
	//console.log(testURL);

    // Render the ./views/homepage.ejs template usign new ejs object
	res.render('upload_files', ejs_variables);
})

//  Results from Homepage
//  Loads:      ./views/results.ejs
//
app.get('/results', async (req, res) => {

    // Reserve a variable to pass arguments for the EJS component
	var ejs_variables = {};

    // Grabs viarables passed in through the URL
    var Key_Word = req.query.keyword.replace(/ /g, "+");
	var Zip_Code = req.query.zipcode;
	var Radius = req.query.radius;

    /* --> */
    // Assignmnet of EJS variables for results
	ejs_variables.title = "homepage";
	ejs_variables.keyword = Key_Word;
	ejs_variables.zipcode = Zip_Code;
	ejs_variables.radius = Radius;

    // These three variables have to exist to result in a radius
    /*if (Key_Word) {

        // Reaches out to ./api/Zip_Code_Functions.js to collect all zipcodes within a range
		var Zip_Code_List = await Zip_Code_Functions.GetAllZipsInRadius(Zip_Code, Radius);;

        // Adds the new list to ejs item
        ejs_variables.Zip_Code_List = Zip_Code_List;

        // Optinal Print for error handling 
        //console.log(ejs_variables);
    }*/
		
	var Zip_Code_List = await fs.readFileSync('./assets/Locations_File.txt','utf8').toString().split("\n");
	
    /* <-- */

    // Reaches to ./api/Search_FaceBook.js to find base URL's for a list of Zips	
    var Base_URL_List = await Search_FaceBook.Find_Zip_List_URL(Zip_Code_List, Key_Word);

    // Adds the new URL list to ejs item
	ejs_variables.Base_URL_List = Base_URL_List;

    // Optinal Print for error handling 
	//console.log(Base_URL_List);

    // Render the ./views/results.ejs template usign new ejs object
	res.render('results', ejs_variables);
})



// File upload
//app.post('/upload', function(req, res) {
app.post('/upload', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Successful Upload";
	
	//let uploadPath;
	let Locations_File
	let Locations_FilePath

	if (!req.files || Object.keys(req.files).length === 0) {
		ejs_variables.title = "Un-Successful Upload";		
		res.render('unsuccessful_upload', ejs_variables)
	}

	console.log('req.files >>>', req.files); // eslint-disable-line

	Locations_File = req.files.Locations_File;

	Locations_FilePath = __dirname + '/assets/Locations_File.txt';
	
	Locations_File.mv(Locations_FilePath, function(err) {
		if (err) {
			ejs_variables.title = "Un-Successful Upload";
			res.render('unsuccessful_upload', ejs_variables)
		}
	});

	res.render('successful_upload', ejs_variables)
});

//Run application on a specific port
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

/*
 * 
 *  CODE Graveyard 
 * 
 * /

// Used for finding Zipcodes

/*
var Print = "True"; // Can be toggled

var City = process.argv[2];
var State = process.argv[3];
var Zip_Code = process.argv[4];

console.log("ZipGivenCity:\n")
console.log(Zip_Code_Functions.ZipGivenCity(City, State));

console.log("CityGivenZip:\n")
console.log(Zip_Code_Functions.CityGivenZip(Zip_Code));

console.log("GetAllZipsInRadius:\n")
console.log(Zip_Code_Functions.GetAllZipsInRadius(Zip_Code, 25));
*/

// Found this after assignment of variables in results

/*
	//Zip_Code_List.forEach(function(value){
	//	console.log(value);
	//});


	//Zip_Code_List.forEach(function(value){
	//	console.log(value);
	//});

	//var testURL = await Search_FaceBook.Find_Zip_URL(Zip_Code);
	//ejs_variables.firstURL = testURL;
*/
