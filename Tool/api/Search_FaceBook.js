const puppeteer = require('puppeteer');

//const HEADLESS = true;
/*
async function Find_Zip_URL(Zip_Code) {

    browser = await puppeteer.launch({ headless: HEADLESS });

    const page = await browser.newPage();

    await page.goto('https://www.facebook.com/marketplace/');

    try {
        await page.type('._58al', Zip_Code);

        const firstElement = 'div.uiContextualLayerPositioner > div.uiContextualLayer > div > div > div > ul > li:nth-child(1)';
        await page.waitForSelector(firstElement);
        await page.click(firstElement);
        await page.waitForNavigation();

        var TargetURL = page.url();
        console.log('New Page URL:', page.url());

    }
    catch {
        console.log('No Zip Code Found');
    }
	await page.close();
	
	await browser.close();
	
	return TargetURL;
}*/

async function Find_Zip_List_URL(Zip_Code_List, Key_Word, Browser_Toggle) {

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

    //const browser = await puppeteer.launch();
    //onst page = await browser.newPage();

    var Zip_Code_List_URLs = [];
    var Zip_Code_List_worked = [];

    console.log("Before Zip Code Function");

    //Zip_Code_List.forEach( async function(Zip_Code){
    for (var Zip_Code of Zip_Code_List) {
        

		const page = await browser.newPage();
        
        await page.goto('https://www.facebook.com/marketplace/');
        
        try {

            // Type zip code into the correct. Current spot: '._58al'
            var Current_Class = '._58al';
            await page.type(Current_Class, Zip_Code);
            console.log("Before first element");

            // Assign for the new pop up
            //const firstElement = 'div.uiContextualLayerPositioner > div.uiContextualLayer > div > div > div > ul > li';
            const firstElement = 'div.uiContextualLayerPositioner > div.uiContextualLayer > div > div > div > ul > li:nth-child(1)';
            
            await page.waitFor(firstElement);
            //await page.waitForSector(firstElement);
            
            // Click inside of the first element
            await page.click(firstElement);
            
            // Wait for page to load
            await page.waitForNavigation();

            console.log('New Page URL:', page.url());

            // Adds URL to list and adds the search query to the URL
            Zip_Code_List_URLs.push(page.url() + `search/?query=${Key_Word}&vertical=C2C&sort=BEST_MATCH`);
            Zip_Code_List_worked.push(Zip_Code);
			// Requested by user
			await page.goto(page.url() + `search/?query=${Key_Word}&vertical=C2C&sort=BEST_MATCH`);
        }
        catch {
            console.log('No Zip Code Found');
        }

    }

    console.log("After Zip Code Function");

    if (Browser_Toggle != "on") {
        await browser.close();
    }

    return [Zip_Code_List_URLs, Zip_Code_List_worked];
}

module.exports = {
    //Find_Zip_URL,
    Find_Zip_List_URL
};