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

importClass(java.io.BufferedReader);
importClass(java.io.BufferedWriter);
importClass(java.io.FileReader);
importClass(java.io.FileWriter);
importClass(java.io.File);
importClass(java.lang.StringBuilder);
importClass(java.lang.System);

var fluid = fluid || {};
fluid.build = fluid.build || {};

(function () {

    /*******************************************
     * Rhino-based strategy for loading styles *
     *******************************************/
     
     fluid.build.cssGenerator.rhinoSheetStore = function (stylesheetPath) {
         var that = {
             path: stylesheetPath
         };

         that.load = function () {
             var reader = new BufferedReader(new FileReader(new File(that.path)));
             
             var line = null;
             var lineSeparator = System.getProperty("line.separator");
             var cssText = new StringBuilder();
             
             while((line = reader.readLine()) != null) {
                 cssText.append(line);
                 cssText.append(lineSeparator);
             }
             return cssText.toString();
         };

         that.save = function (prioritizedStylesheet, writePath) {
             var writePath = writePath || that.path;
             var writer = new BufferedWriter(new FileWriter(writePath));
             writer.write(prioritizedStylesheet);
             writer.close();
         };

         return that;
     };
})();
