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

(function () {
    var injectImportant = function (readPath, writePath) {
        var tg = fluid.build.cssGenerator({
            sheetStore: fluid.build.cssGenerator.rhinoSheetStore(readPath)
        });
        var priorities = {
            "fluid-cssGenerator-allRules": "background-color"
        };
        tg.prioritize(priorities);
        
        // Now that the stylesheet has been prioritized, generate
        // the new stylesheet and write the contents out to a file
        var modifiedStylesheet = tg.generate();
        tg.options.sheetStore.save(modifiedStylesheet, writePath);
    }
    
    var fileNames = cssFileNames.split(" ");
    
    for (var i = 0; i < fileNames.length; i++) {
        var readPath = cssBasePath + fileNames[i];
        var writePath = readPath.replace(".css", "-uio.css");
        injectImportant(readPath, writePath);
    }
})();