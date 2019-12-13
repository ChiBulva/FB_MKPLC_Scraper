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
var css_global = fs.readFileSync('./assets/css/global.css', 'utf8');

// Old_Searches Path
var Old_Searches_Path = './assets/old_searches';

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
		var Add_Min_Bool = req.query.Add_Min_Bool;
		var Add_Max_Bool = req.query.Add_Max_Bool;

		// Assignmnet of EJS variables for results
		ejs_variables.title = "Results";
		ejs_variables.keyword = Key_Word.replace("+", " ");
		
		var Zip_Code_List = await fs.readFileSync('./assets/variables/Locations_File.txt', 'utf8').toString().split("\n");

		// Reaches to ./api/Search_FaceBook.js to find base URL's for a list of Zips	
		var Results = await Search_FaceBook.Find_Zip_List_URL(Zip_Code_List, Key_Word, Browser_Toggle, req.query.keyword, Add_Min_Bool, Add_Max_Bool);

        // Save File Here From Search
		try {
			await Save_A_Search(Results, req.query.keyword.replace(/ /g, "_"), Add_Min_Bool, Add_Max_Bool);
		}
		catch{
			console.log("Error Saving file");
		}
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

//  Old Searches 
//  Loads:      ./views/old_searches.ejs
//
app.get('/old_searches', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Old Searches";

	// Assign css from here
	ejs_variables.css = css_global;

	var List_Of_Searches = [];


	// Get contents of old Searches file and display them
	await fs.readdirSync(Old_Searches_Path).forEach(file => {
		if (file != ".gitkeep") {
			List_Of_Searches.push([file.replace(/_/g, ' ').replace(".json", ''), file]);
		}
	});

	ejs_variables.List_Of_Searches = List_Of_Searches;

	// Render the ./views/homepage.ejs template usign new ejs object
	res.render('old_searches', ejs_variables);
})

//  Old Searches (Indivudual Page)
//  Loads:      ./views/old_searches_individual.ejs
//
app.get('/old_searches/:old_searche_file', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Old Searches";

	// Assign Name of file based off parameters
	var Search_File_Path = req.params.old_searche_file;

	// Assign css from here
	ejs_variables.css = css_global;

	// TODO: Go grab specific JSON Onject based on name
	var Search_File_Contents = await fs.readFileSync(`./assets/old_searches/${Search_File_Path}`, 'utf8').toString().split("\n");

	ejs_variables.Search_File_Contents = JSON.parse(Search_File_Contents);

	// Render the ./views/homepage.ejs template usign new ejs object
	res.render('old_searches_individual_page', ejs_variables);
})

//  Delete Old Search Files 
//  Loads:      ./views/old_searches.ejs
//
app.get('/delete_old_search/:old_searche_file', async (req, res) => {
	var ejs_variables = {};
	ejs_variables.title = "Old Searches";

	// Assign Name of file based off parameters
	var Search_File_Path = req.params.old_searche_file;

	// Assign css from here
	ejs_variables.css = css_global;

	fs.unlinkSync(`./assets/old_searches/${ Search_File_Path }`, (err) => {
		if (err) {
			console.error(err)
			return
		}

		console.log(`Removed: ${ Search_File_Path }`);
	})

	var List_Of_Searches = [];

	// Get contents of old Searches file and display them
	fs.readdirSync(Old_Searches_Path).forEach(file => {
		if (file != ".gitkeep") {
			List_Of_Searches.push([file.replace(/_/g, ' ').replace(".json", ''), file]);
		}
	});

	ejs_variables.List_Of_Searches = List_Of_Searches;

	// Render the ./views/homepage.ejs template usign new ejs object
	res.render('old_searches', ejs_variables);
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

async function Save_A_Search(Results, Key_Word, Add_Min_Bool, Add_Max_Bool) {

    var dt = new Date();
    var CurDate = dt.getFullYear() + '_' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '_' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
	var CurDate_Slashes = dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();

	var Search_Object_JSON = {}

	Search_Object_JSON.Results = Results;

	Search_Object_JSON.Search = Key_Word;
	Search_Object_JSON.Date = CurDate_Slashes;

	var Add_Min = "";
	var Add_Max = "";

	if (Add_Min_Bool) {
		//console.log("Add_Min_Bool Exists");
		Add_Min = `_${Add_Min_Bool}`;
		Search_Object_JSON.min = Add_Min_Bool;
	}
	if (Add_Max_Bool) {
		//console.log("Add_Max_Bool Exists");
		Add_Max = `_${Add_Max_Bool}`;
		Search_Object_JSON.max = Add_Max_Bool;
	}

	var File_Path = `./assets/old_searches/${Key_Word}${Add_Min}${Add_Max}_${CurDate}.json`

    fs.writeFile(

		File_Path,

		JSON.stringify(Search_Object_JSON),

        await function (err) {
            if (err) {
                console.error('Crap happens');
            }
        }
    );
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(`+  saved as: ./assets/old_searches/${Key_Word}${Add_Min}${Add_Max}_${CurDate}.txt`)
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