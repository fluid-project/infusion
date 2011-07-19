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
    
    /* 
     * This is a minified version of Douglas Crockford's JSON2.js parser, release in the public domain.
     * http://www.json.org/json2.js
     */
    if(!this.JSON){JSON=function(){function f(n){return n<10?"0"+n:n}Date.prototype.toJSON=function(){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function stringify(value,whitelist){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case"string":return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c}c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+value+'"';case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}if(typeof value.toJSON==="function"){return stringify(value.toJSON())}a=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i],whitelist)||"null")}return"["+a.join(",")+"]"}if(whitelist){l=whitelist.length;for(i=0;i<l;i+=1){k=whitelist[i];if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}else{for(k in value){if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}return"{"+a.join(",")+"}"}}return{stringify:stringify,parse:function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==="object"){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n}}}}return filter(k,v)}if(/^[\],:{}\s]*$/.test(text.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof filter==="function"?walk("",j):j}throw new SyntaxError("parseJSON")}}}()};
    
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
        var readText = "";
        
        while (line !== null) {
            readText += line;
            readText += lineSeparator;
            line = reader.readLine();
        }
        
        return readText;
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