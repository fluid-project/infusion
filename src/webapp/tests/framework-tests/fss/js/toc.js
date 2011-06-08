/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    $().ready(function () {
        var FSSTestTOC = {
            tests: [
                {title: "FSS.Layout.Containers", note: "A test for fixed width containers. Each container should be as wide as the text inside says"},
                {title: "FSS.Layout.Columns", note: "A test for flexible and fixed width columns. Each container should behave as the text inside says. May require adjusting the browser width."},
                {title: "FSS.Layout.Advanced", note: "Tests for different advanced layout modules. Each module should be inspected for inconsistencies and non-uniformity."},
                {title: "FSS.Text.Size", note: "A Test for text size. No two sizes should look alike."},
                {title: "FSS.Text.Spacing", note: "A Test for letter spacing/tracking. No two sizes should look alike."},
                {title: "FSS.Text.Font.Family", note: "A Test for typefaces. Typefaces should match the text name."},
                {title: "FSS.Complete", note: "Complete test page. Includes most FSS feature class names."},
                {title: "FSS.Themes", note: "Test for applying themes to layout helpers and other common FSS elements."}
            ]
        };
    
        // parse the # from the filename
        var uri = ("" + window.location).split("fss/");
        var currentTest = parseInt(uri[1].substr(5, 6), 10);
        var next = '#', prev = '#', totalTests = FSSTestTOC.tests.length, thisTestIndex = currentTest - 1, prevTestIndex = currentTest - 2, nextTestIndex = currentTest;
    
        next = (currentTest < totalTests) ? (currentTest + 1) + "." + FSSTestTOC.tests[nextTestIndex].title.toLowerCase() + '.html' : next;
        prev = (currentTest > 1) ? (currentTest - 1) + "." + FSSTestTOC.tests[prevTestIndex].title.toLowerCase() + '.html' : prev;
        
        
        // LINKS
        $('.options a[href=#prev]').attr('href', prev);
        $('.options a[href=#next]').attr('href', next);    
        
        // HEADING
        $('.options h1').text(FSSTestTOC.tests[thisTestIndex].title);
        
        // NOTES
        $('#note').text(FSSTestTOC.tests[thisTestIndex].note);
        
        // TEST ID
        $('#page').text('Test ' + (currentTest) + ' of ' + totalTests);
        
    });
})(jQuery);