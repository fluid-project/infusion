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

    includes = JSON.parse(includes)

    for (var i = 0; i < includes.length; ++i) {
        loadInContext(includes[i]);
    };
    
    var fluid = context.fluid;

    fluid.require = function (moduleName, namespace) {
        namespace = namespace || moduleName;
        var module = require(moduleName);
        console.log("Setting ", namespace, " to ", module);
        fluid.set(context, namespace, module);
        return module;
    };

    module.exports = fluid;

})();