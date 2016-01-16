//
var steps=[];
var testindex = 0;
var loadInProgress = false;

// 
var args = require('system').args;
var report = args[1];
var url = args[2];
var token = args[3];
var pageLoadTime = args[4];
var user = {
    "username": "print",
    "roles": [ "USER" ]
}

// set token
user.token = token;

// token = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaWQiOiI1Njk3MzUzM2U2NzgwMzYzMzFjOTY2ZDciLCJpYXQiOjE0NTI3NTEzOTN9.7Drz7e8PADCnhTy-cTsGH5G8SMpxjbLJM94GQWXM0UI

/*********SETTINGS*********************/
var webPage = require('webpage');
var page = webPage.create();
page.settings.javascriptEnabled = true;
page.viewportSize = { width: 1024, height: 1448 };
page.settings.loadImages = true; //Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

console.log('All settings loaded, start with execution');
page.onConsoleMessage = function(msg) {
    console.log(msg);
};
/**********DEFINE STEPS THAT FANTOM SHOULD DO***********************/
steps = [

    // Step 1 - Set localStorage
    function(){
        //
        console.log('Step 1 - Set localStorage');
        //
        page.open(url, function(status){
            page.evaluate(function(user){
                // localStorage.clear();
                localStorage.setItem('auth_token', JSON.stringify(user));
            }, user);
        });
    },

    // Step 2 - Open ReportHub home page
    function(){
        // //
        console.log('Step 2 - Open ReportHub home page');
        //
        page.open(url, function(status){});
    }

];
/**********END STEPS THAT FANTOM SHOULD DO***********************/

//Execute steps one by one
interval = setInterval(executeRequestsStepByStep, 100);

function executeRequestsStepByStep(){
    if (loadInProgress == false && typeof steps[testindex] == "function") {
        //console.log("step " + (testindex + 1));
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        print();
        return;
    }
}

function print(){
    window.setTimeout(function () {
        console.log("Step 7 - Update page layout for print");
        page.evaluate(function(){
            
            // hide side nav
            $(".side-nav").css({ 'width': '0px' });
            // hide footer
            $("#ngm-menu-footer-1").css({ 'display': 'none' });
            $("#ngm-menu-footer-2").css({ 'display': 'none' });
            // left/right padding
            $("#ngm-report").css({ 'padding-left': '90px' });
            $("#ngm-report").css({ 'padding-right': '90px' });
            // hide download btn
            $("#ngm-report-download").css({ 'display': 'none' });
            // title size adjustment
            $("#ngm-report-title").css({ 'font-size': '3.1rem' });
            // position date range 
            $("#ngmDateContainer-0").css({ 'margin-top': '-54px', 'margin-left': '74%' });
            $("#ngmDateContainer-1").css({ 'margin-top': '-54px' });

            // include avatar
            // $("#ngm-print-avatar").css({ 'display': 'block' });

            // fix layout issue - for each row
            $('.row.ng-isolate-scope').each(function(i, row){
                // for each widget
                $(row).children().each(function(j, w){
                    // if col is not full length
                    if ($(w).attr('class').search('l12') === -1) {
                        // get width
                        var width = ((parseInt($(w).attr('class').slice(-1)) / 12) * 100).toFixed(2);
                        // update widget width
                        $(w).css({ 'width': width + '%' });
                    }
                });
            });
            // hide map controls
            $(".leaflet-control-container").css({ 'display': 'none' });
            // display download date
            $("#ngm-report-extracted").css({ 'display': 'block' });
        });
        
        // Create pdf
        // page.render('/home/ubuntu/nginx/www/ngm-reportPrint/pdf/report_' + Math.round(new Date() / 1000) + '.pdf');
        page.render('/home/ubuntu/nginx/www/ngm-reportPrint/pdf/' + report + '.pdf');
        
        phantom.exit();

    }, pageLoadTime);
}

/**
 * These listeners are very important in order to phantom work properly. Using these listeners, we control loadInProgress marker which controls, weather a page is fully loaded.
 * Without this, we will get content of the page, even a page is not fully loaded.
 */
page.onLoadStarted = function() {
    loadInProgress = true;
    console.log('Loading started');
};
page.onLoadFinished = function() {
    loadInProgress = false;
    console.log('Loading finished');
};
page.onConsoleMessage = function(msg) {
    console.log(msg);
};