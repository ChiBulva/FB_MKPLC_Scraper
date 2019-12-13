const puppeteer = require('puppeteer');

// Takes a lsit of Zip codes and finds URL's to Facebook marketplace querys
//
//async function Find_Zip_List_URL(Zip_Code_List, Key_Word, Browser_Toggle, Key_Word_Spaces) {
async function Find_Zip_List_URL(Zip_Code_List, Key_Word, Browser_Toggle, Key_Word_Spaces, Add_Min_Bool, Add_Max_Bool) {

    if (Browser_Toggle == "on") {
        var chromium_args = {
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null // full screen
        };
    } else {
        var chromium_args = {
            "headless": true,
            "args": ["--fast-start", "--disable-extensions", "--no-sandbox"],
            "ignoreHTTPSErrors": true
        };
    }

    const browser = await puppeteer.launch(chromium_args);

    var Zip_Code_List_URLs = [];
    var Zip_Code_List_worked = [];

    console.log("\n************");
    console.log(`*`);
    console.log(`* Start of the new search for: ${Key_Word_Spaces}`);
    console.log(`*`);

    //Zip_Code_List.forEach( async function(Zip_Code){
    for (var Zip_Code of Zip_Code_List) {

		const page = await browser.newPage();
        
        await page.goto('https://www.facebook.com/marketplace/');
        
        try {

            // Type zip code into the correct. Current spot: '._58al'
            var Current_Class = '._58al';
            await page.type(Current_Class, Zip_Code);

            // Assign for the new pop up
            const firstElement = 'div.uiContextualLayerPositioner > div.uiContextualLayer > div > div > div > ul > li:nth-child(1)';
            
            await page.waitFor(firstElement);
            //await page.waitForSector(firstElement);
            
            // Click inside of the first element
            await page.click(firstElement);
            
            // Wait for page to load
            await page.waitForNavigation();

            var Add_Min = "";
            var Add_Max = "";

            if (Add_Min_Bool) {
                //console.log("Add_Min_Bool Exists");
                Add_Min = `&minPrice=${Add_Min_Bool}`;
            }
            if (Add_Max_Bool) {
                //console.log("Add_Max_Bool Exists");
                Add_Max = `&maxPrice=${Add_Max_Bool}`;
            }

            var URL_To_Add = page.url() + `search/?query=${Key_Word}${Add_Min}${Add_Max}&vertical=C2C&sort=BEST_MATCH`;

            console.log('* New Page URL:\n*\t', URL_To_Add);
            
            // Adds URL to list and adds the search query to the URL
            Zip_Code_List_URLs.push(URL_To_Add);
            Zip_Code_List_worked.push(Zip_Code);

			// Requested by user
            await page.goto(URL_To_Add);
        }
        catch {
            console.log('No Zip Code Found');
        }

    }

    console.log("*");
    console.log("************");

    // Closes the browser at the end of search if toggle is off
    if (Browser_Toggle != "on") {
        await browser.close();
    }

    // Returns new data to the index.js server
    return [Zip_Code_List_URLs, Zip_Code_List_worked];
}

// Allows me to call functions from this file in the index.js file
module.exports = {
    Find_Zip_List_URL
};