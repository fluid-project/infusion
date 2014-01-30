/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($, fluid) {

var count = 0;

var generateModel = function (depth) {
    var togo = {};
    togo.thing0 = depth === 0? count++ : generateModel(depth - 1);
    togo.thing1 = depth === 0? count++ : generateModel(depth - 1);  
    return togo;
};

var model = generateModel(5);

var getPath = function (index) {
    var mod = index % 64;
    togo = [];
    while (true) {
        var bit = mod & 1;
        togo.push(bit? "thing1" : "thing0");
        if (mod < 2) {
            break;
        }
        mod = mod >> 1;
    }
    return togo;
};

var makePaths = function () {
    var togo = [];
    for (var i = 0; i < 64; ++ i) {
        var segs = getPath(i);
        togo.push(segs.join("."));
    }
    return togo;
};

var paths = makePaths();

var config = {
    strategies: [fluid.model.funcResolverStrategy, fluid.model.defaultFetchStrategy]
    };

for (var j = 0; j < 5; ++ j) {

    var now = Date.now();
    
    for (var i = 0; i < 200000; ++ i) {
        var path = paths[i % 64];
        var leaf = fluid.get(model, path);
    }
    
    console.log("Concluded in " + (Date.now() - now) + "ms");
}

})(jQuery, fluid);
  