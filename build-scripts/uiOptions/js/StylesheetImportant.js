/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid = fluid || {};

(function () {
    var injectImportant = function (readPath, writePath) {
        var sheetStore = fluid.build.cssGenerator.rhinoSheetStore(readPath);
        var generator = fluid.build.cssGenerator({
            sheetStore: sheetStore
        });
        
        generator.processRules([
            {
                type: fluid.build.cssGenerator.prioritize,
                options: {
                    "fluid-cssGenerator-allRules": "background-color"
                }
            },
            {
                type: fluid.build.cssGenerator.rewriteSelector,
                options: {
                    match: "fl-theme-",
                    replace: "fl-theme-uio-"
                }
            }
        ]);
        
        // Now that the stylesheet has been prioritized, generate
        // the new stylesheet and write the contents out to a file
        var modifiedStylesheet = generator.generate();
        sheetStore.save(modifiedStylesheet, writePath);
    };

    // loop through files to run !important injection on
    var files = fluid.build.readJSONFile(importantInjectionModule).files;
    
    var generateWritePath = function (originalPath) {
        var startIdx = Math.max(originalPath.lastIndexOf("/"), 0);
        var fileName = originalPath.substring(startIdx);
        
        return fssImportant + fileName.replace(".css", "-uio.css");
    };
     
    for (var i = 0; i < files.length; i++) {
        var filePath = files[i];
        fluid.build.log("Generating an !important theme for " + files[i]);
        injectImportant(filePath, generateWritePath(filePath));
     }
})();
