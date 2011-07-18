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
    };
    
    // Locating all of the files at "cssBasePath" and attempting to inject !importants
    // There should be a check to make sure that only css files are run.
    var directory = new File(cssBasePath);
    var files = directory.list();
    
     if (files) {
         for (var i = 0; i < files.length; i++) {
             var fileName = files[i];
             java.lang.System.out.println("\n********\n" + files[i] + "\n********\n");
             
             // harcoding the exclusion of "fss-JSR168Bridge.css" and "fss-transitions.css" which break the !important injection
             if (fileName.indexOf("fss-JSR168Bridge.css") < 0 && fileName.indexOf("fss-transitions.css") < 0) {
                 var readPath = cssBasePath + files[i];
                 var writePath = readPath.replace(".css", "-uio.css");
                 injectImportant(readPath, writePath);
             }
         }
     } else {
         java.lang.System.out.println("Directory Error: There is no directory at path '" + cssBasePath + "'");
     }
})();