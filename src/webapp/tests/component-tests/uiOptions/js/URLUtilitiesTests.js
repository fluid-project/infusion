/*
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        var testURLs = jqUnit.testCase("URLUtilities Tests");

        var testRelPath = function (options, key) {
            testURLs.test("Expand Path " + key, function() {
                var actual =  fluid.url.computeRelativePrefix(options.outerLoc, options.iframeLoc, options.relPath);
                jqUnit.assertEquals("Relative path computed", options.expected, actual);
            });
        };
    
        var tests = [{
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "../../../../components/uiOptions/html/",
            expected: ""
        },
        {
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "../../../../components/uiOptions/html/extra/",
            expected: "extra/"
        },
        {
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "../../../../components/uiOptions/html/extra/extra2/",
            expected: "extra/extra2/"
        },
        {
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "a/b/g/",
            expected: "../../../demos/uiOptions/FatPanelUIOptions/html/a/b/g/"
        },
        {
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "/a/b/g/",
            expected: "/a/b/g/"
        },
        {
            iframeLoc: "file:///E:/Source/gits/infusion-master/src/webapp/components/uiOptions/html/FatPanelUIOptionsFrame.html",
            outerLoc: "file:///E:/Source/gits/infusion-master/src/webapp/demos/uiOptions/FatPanelUIOptions/html/uiOptions.html",
            relPath: "http://localhost:8888/wordpress/wp-content/themes/FSSFive/infusion/components/uiOptions/html/",
            expected: "http://localhost:8888/wordpress/wp-content/themes/FSSFive/infusion/components/uiOptions/html/"
        }
        ]
        fluid.each(tests, function(test, key) {
            testRelPath(test, key);
        });
        
    });
    
})(jQuery);
