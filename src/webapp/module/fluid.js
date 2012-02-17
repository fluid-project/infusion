/*
Copyright 2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/
/*global require, module, console, __dirname*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function () {
    var fs = require("fs"),
        path = require("path"),
        vm = require("vm");

    var getBaseDir = function () {
        return __dirname;
    };

    var buildPath = function (pathSeg) {
        return path.join(getBaseDir(), pathSeg);
    };

    var context = vm.createContext({
        window: {}
    });

    var loadInContext = function (path) {
        var fullpath = buildPath(path);
        var data = fs.readFileSync(fullpath);
        vm.runInContext(data, context, fullpath);
    };

    var includes = fs.readFileSync(buildPath("includes.json"));

    includes = JSON.parse(includes);

    for (var i = 0; i < includes.length; ++i) {
        loadInContext(includes[i]);
    }
    
    var fluid = context.fluid;

    fluid.require = function (moduleName, namespace) {
        namespace = namespace || moduleName;
        var module = require(moduleName);
        fluid.set(context, namespace, module);
        return module;
    };

    module.exports = fluid;

})();