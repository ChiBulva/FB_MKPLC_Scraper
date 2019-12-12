/*  /
 * /
 */
/*************************************************************************************************************************
 *  Program:    Facebook scraper
 *  Objective:  Find facebook adds faster for a client
 *  Language:   Node.js (JavaScript), Html, Css
 *  
 *  Links:  ./api/*
 *          ./views/variables/*
 *          ./views/css/*
 * 
 *************************************************************************************************************************/

/*  /   Modules created by Travis C. J. Gray for personal use in this applicaiton
 * /
 */
//const Zip_Code_Functions = require('./api/Zip_Code_Functions.js');
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

// include css here 
var css_global =  fs.readFileSync('./assets/css/global.css', 'utf8');

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
    ejs_variables.title = "Homepage";

    // Assign css from here
    ejs_variables.css = css_global;

	try{
		ejs_variables.List_Of_Zips = await fs.readFileSync('./assets/variables/Locations_File.txt', 'utf8').toString().split("\n");
		ejs_variables.Files_Exist = "yes";
	}
	catch {
			
	}
	
    // Render the ./views/homepage.ejs template usign new ejs object
	res.render('homepage', ejs_variables);
})

//  Help Screen
//  Loads:      ./views/help.ejs
//
app.get('/help', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Help";

	// Assign css from here
	ejs_variables.css = css_global;

	// Render the ./views/homepage.ejs template usign new ejs object
	res.render('help', ejs_variables);
})

//  Results from Homepage
//  Loads:      ./views/results.ejs
//
app.get('/results', async (req, res) => {
	req.setTimeout(500000);
    // Reserve a variable to pass arguments for the EJS component
	var ejs_variables = {};

    // Assign css from here
	ejs_variables.css = css_global;

	try {

		try {
			ejs_variables.List_Of_Zips = await fs.readFileSync('./assets/variables/Locations_File.txt', 'utf8').toString().split("\n");
			ejs_variables.Files_Exist = "yes";
		}
		catch {

		}

		// Grabs viarables passed in through the URL
		var Key_Word = req.query.keyword.replace(/ /g, "+");
		var Browser_Toggle = req.query.browser_toggle;

		// Assignmnet of EJS variables for results
		ejs_variables.title = "Results";
		ejs_variables.keyword = Key_Word.replace("+", " ");

		var Zip_Code_List = await fs.readFileSync('./assets/variables/Locations_File.txt', 'utf8').toString().split("\n");

		// Reaches to ./api/Search_FaceBook.js to find base URL's for a list of Zips	
		var Results = await Search_FaceBook.Find_Zip_List_URL(Zip_Code_List, Key_Word, Browser_Toggle);

        // Save File Here From Search
        await Save_A_Search(Results[0], Key_Word);

		// Adds the new URL list to ejs item
        ejs_variables.Base_URL_List = Results[0]; // Base_URL_List
        ejs_variables.Zip_Code_List = Results[1]; // Zip_Code_List
		ejs_variables.results = Results;
	}
	catch{

	}
    // Render the ./views/results.ejs template usign new ejs object
	res.render('homepage', ejs_variables);

})

//  Upload Files 
//  Loads:      ./views/upload_files.ejs
//
app.get('/upload_files', async (req, res) => {
    var ejs_variables = {};
    ejs_variables.title = "upload_files";

    // Assign css from here
    ejs_variables.css = css_global;

    // Render the ./views/homepage.ejs template usign new ejs object
    res.render('upload_files', ejs_variables);
})

//  File upload
//  Loads:      ./views/successful_upload.ejs or ./views/unsuccessful_upload.ejs
//
app.post('/upload', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Successful Upload";

	// Assign css from here
	ejs_variables.css = css_global;

	//let uploadPath;
	let Locations_File
	let Locations_FilePath

	if (!req.files || Object.keys(req.files).length === 0) {
		ejs_variables.title = "Un-Successful Upload";		
		res.render('unsuccessful_upload', ejs_variables)
	}

	Locations_File = req.files.Locations_File;

	Locations_FilePath = __dirname + '/assets/variables/Locations_File.txt';
	
	Locations_File.mv(Locations_FilePath, function(err) {
		if (err) {
			ejs_variables.title = "Un-Successful Upload";
			res.render('unsuccessful_upload', ejs_variables)
		}
	});

	res.render('successful_upload', ejs_variables)
});

async function Save_A_Search(List_Of_URLs, Key_Word) {
    Key_Word = Key_Word.replace('+', '_');
    var dt = new Date();
    var CurDate = dt.getFullYear() + '_' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '_' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();

    fs.writeFile(

        `./assets/old_searches/${Key_Word}_${CurDate}.txt`,

        List_Of_URLs.toString().replace(',','\n'),

        await function (err) {
            if (err) {
                console.error('Crap happens');
            }
        }
    );
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(`+  saved as: ./assets/old_searches/${Key_Word}_${CurDate}.txt`)
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
}

//Run application on a specific port
app.listen(port, () => {
	
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
	console.log(`+  Facebook tool application listening on port ${port}!`)
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
	console.log("     1. Open Google Chrome Browser                     +");
	console.log("     2. Navigate to: ");
	console.log(`              localhost:${port}/homepage`);
	console.log("+                                                      +");
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
});