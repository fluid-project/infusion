/*
Copyright 2012 OCAD University, Antranig Basman

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/
/* jshint node: true */
/* global global */

(function () {
    "use strict";

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
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
    });

    context.window = context;

    /** Load a standard, non-require-aware Fluid framework file into the Fluid context, given a filename
     * relative to this directory (src/module) **/

    var loadInContext = function (path) {
        var fullpath = buildPath(path);
        var data = fs.readFileSync(fullpath);
        vm.runInContext(data, context, fullpath);
    };

    var loadIncludes = function (path) {
        var includes = require(buildPath(path));
        for (var i = 0; i < includes.length; ++i) {
            loadInContext(includes[i]);
        }
    };

    loadIncludes("includes.json");

    var fluid = context.fluid;
    // FLUID-4913: QUnit calls window.addEventListener on load. We need to add
    // it to the context it will be loaded in.
    context.addEventListener = fluid.identity;
    
    fluid.logObjectRenderChars = 1024;
    
    // Convert an argument intended for console.log in the node environment to a readable form (the
    // default action of util.inspect censors at depth 1)
    fluid.renderLoggingArg = function (arg) {
        var togo = arg && fluid.isPrimitive(arg) ? arg : fluid.prettyPrintJSON(arg);
        if (typeof(togo) === "string" && togo.length > fluid.logObjectRenderChars) {
            togo = togo.substring(0, fluid.logObjectRenderChars) + " .... [output suppressed at " + fluid.logObjectRenderChars + " chars - for more output, increase fluid.logObjectRenderChars]";
        }
        return togo;
    };
    
    // Monkey-patch the built-in fluid.doLog utility to improve its behaviour within node.js - see FLUID-5475
    fluid.doLog = function (args) {
        args = fluid.transform(args, fluid.renderLoggingArg);
        console.log(args.join(""));
    };

    fluid.loadInContext = loadInContext;
    fluid.loadIncludes = loadIncludes;

    /** Load a node-aware JavaScript file using either a supplied or the native
      * Fluid require function. The module name may start with a module reference
      * of the form ${module-name} to indicate a base reference into an already
      * loaded module that was previously registered using fluid.module.register.
      * If the <code>namespace</code> argument is supplied, the module's export
      * object will be written to that path in the global Fluid namespace */

    fluid.require = function (moduleName, foreignRequire, namespace) {
        foreignRequire = foreignRequire || require;
        var resolved = fluid.module.resolvePath(moduleName);
        var module = foreignRequire(resolved);
        if (namespace) {
            fluid.setGlobalValue(namespace, module);
        }
        return module;
    };

    /** Produce a loader object exposing a "require" object which will automatically
     * prefix the supplied directory name to any requested modules before forwarding
     * the operation to fluid.require
     */

    fluid.getLoader = function (dirName, foreignRequire) {
        return {
            require: function (moduleName, namespace) {
                if (moduleName.indexOf("/") > -1) {
                    moduleName = dirName + "/" + moduleName;
                }
                return fluid.require(moduleName, foreignRequire, namespace);
            }
        };
    };

    /**
     * Setup testing environment with jqUnit and IoC Test Utils in node.
     * This function will load everything necessary for running node jqUnit.
     */
    fluid.loadTestingSupport = function () {
        fluid.loadIncludes("devIncludes.json");
    };
    
    fluid.module.register("infusion", path.resolve(__dirname, "../.."), require);
    
    // Export the fluid object into the pan-module node.js global object
    global.fluid = fluid;

    module.exports = fluid;

})();