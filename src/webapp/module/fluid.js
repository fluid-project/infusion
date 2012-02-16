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
        var data = fs.readFileSync(buildPath(path));
        vm.runInContext(data, context);
    };

    var includes = fs.readFileSync(buildPath("includes.json")),
        i;

    includes = JSON.parse(includes)

    for (i = 0; i < includes.length; ++i) {
        loadInContext(includes[i]);
    }
    
    var fluid = context.fluid;

    fluid.require = function (module) {
        context[module] = require(module);
        return context[module];
    };

    module.exports = fluid;

})();