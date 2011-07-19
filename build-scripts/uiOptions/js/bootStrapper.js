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

(function () {
    
    var log = function (str) {
        java.lang.System.out.println(str);
    };
    
    /**
     * Reads in the contents of the file at the specified path and returns a string representation of it.
     *
     * @param {String} path
     */
    var read = function (path) {
        
        var reader = new BufferedReader(new FileReader(new File(path)));
        var line = reader.readLine();
        var lineSeparator = System.getProperty("line.separator");
        var readText = new StringBuilder();
        
        while (line !== null) {
            readText.append(line);
            readText.append(lineSeparator);
            line = reader.readLine();
        }
        
        return readText.toString();
    };
    
    /**
     * Writes a string of data to the file at the specified path
     *
     * @param {String} path
     * @param {String} text
     */
    var write = function (path, writeText) {
        var writer = new BufferedWriter(new FileWriter(path));
        writer.write(writeText);
        writer.close();
    };
    
    /**
     * Loads a JSON file by calling JSON.parse on the contents returned by the file at the specified path
     *
     * @param {String} path
     */
    var readJSON = function (path) {
        return JSON.parse(read(path));
    };
    
    /**
     * Loads a js file by calling eval on the contents returned by the file at the specified path
     *
     * @param {String} path
     */
    var loadJS = function (path) {
        var fileText = read(path);
        log("Text to be evaled" + fileText);
        eval(String(fileText));
    };
    
    /**
     * Loads a set of js files by calling eval on the contents returned by the files at the specified paths
     *
     * @param {String} paths, a ", " separated string
     */
    var loadJSFiles = function (paths) {
        var filePaths = paths.split(", ");
        
        for (var i = 0; i < filePaths.length; i++) {
            loadJS(filePaths[i]);
        }
    };
    
    loadJSFiles(jsFiles);
    
})();