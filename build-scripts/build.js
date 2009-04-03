/*global importClass, project, Packages */
/*global java, File, BufferedReader, FileReader, LogLevel */
/*global src, include, exclude, newBuildConcat*/

/* 
 * This is a minified version of Douglas Crockford's JSON2.js parser, release in the public domain.
 * http://www.json.org/json2.js
 */
if(!this.JSON){JSON=function(){function f(n){return n<10?"0"+n:n}Date.prototype.toJSON=function(){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function stringify(value,whitelist){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case"string":return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c}c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+value+'"';case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}if(typeof value.toJSON==="function"){return stringify(value.toJSON())}a=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i],whitelist)||"null")}return"["+a.join(",")+"]"}if(whitelist){l=whitelist.length;for(i=0;i<l;i+=1){k=whitelist[i];if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}else{for(k in value){if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}return"{"+a.join(",")+"}"}}return{stringify:stringify,parse:function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==="object"){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n}}}}return filter(k,v)}if(/^[\],:{}\s]*$/.test(text.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof filter==="function"?walk("",j):j}throw new SyntaxError("parseJSON")}}}()};


/*
 * This is the Fluid Infusion dependency manager.
 */

// CODE REVIEW QUESTIONS
/*
 * Remove description tags?

Do we need the environment property?

Is the all file in the right place?   Is it named ok?

Are the descriptions good enough?


File this:
                There is an issue with excluding things in a certain directory and including others
                    - the my infusion javascript file is fine, the issue is with copying the files over.

rename: myFileNames and myDirs
 */

importClass(java.io.BufferedReader);
importClass(java.io.FileReader);
importClass(java.io.File);
importClass(Packages.org.apache.tools.ant.types.LogLevel);

var fluid = fluid || {};
var globalObj = this;

(function () {
    var modulePrefix = "module_";
    
    var modulePath = function (moduleName) {
        return project.getProperty(modulePrefix + moduleName);
    };

    var parseArgument = function (arg) {
        var retArray = [];
        
        var parsedArg = arg.split(",");
        for (var i = 0; i < parsedArg.length; i++) {
            var str = parsedArg[i].replace(/(^\s+)|(\s+$)/g, "");
            if (str) {
                retArray.push(str);
            }            
        }
        return retArray;
    };
    
    var isDependencyIncluded = function (name, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === name) {
                return true;
            }
        }
        
    	return false;
    };
    
    var asArray = function (jsonProp) {
        if (jsonProp === undefined) {
            return [];
        } else if (typeof(jsonProp) === "string") {
            return [jsonProp];
        }
        
        return jsonProp;
    };
    
    var normalizeDeclaration = function (declaration) {
        declaration.files = asArray(declaration.files);
        declaration.dependencies = asArray(declaration.dependencies);
    };
    
    var assembleDependencyList = function (that, moduleName, prefixStr) {
        var i;
        
        project.log(prefixStr + " Processing module: " + moduleName + " ---", LogLevel.INFO.getLevel());
        project.log("Dependency order so far: " + that.requiredModules, LogLevel.DEBUG.getLevel());
        
        if (isDependencyIncluded(moduleName, that.requiredModules)) {
            return;
        }
        
        var moduleInfo = that.loadDeclarationForModule(moduleName);
        normalizeDeclaration(moduleInfo[moduleName]);
        that.moduleFileTable[moduleName] = moduleInfo[moduleName].files;        
        var moduleDependencies = moduleInfo[moduleName].dependencies;
        
        project.log("Dependencies for " + moduleName + ": ", LogLevel.VERBOSE.getLevel());
        for (i = 0; i < moduleDependencies.length; i++) {
            project.log("  * " + moduleDependencies[i], LogLevel.VERBOSE.getLevel());
        }
        
        for (i = 0; i < moduleDependencies.length; i++) {
            assembleDependencyList(that, moduleDependencies[i], prefixStr + "---");
        }
        
        if (!isDependencyIncluded(moduleName, that.excludedModules)) {
            that.requiredModules.push(moduleName);
        }
    };
    
    var addPathsForModuleFiles = function (targetArray, moduleName, moduleFileTable) {
        var filesForModule = moduleFileTable[moduleName];
        for (var i = 0; i < filesForModule.length; i++) {
            var path = modulePath(moduleName) + File.separator + "js" + File.separator;
            targetArray.push(path + filesForModule[i]);
        }
        
        return targetArray;
    };
        
    fluid.dependencyResolver = function (modulesToInclude, modulesToExclude) {
        var that = {
            requiredModules: [], // A list of modules to be included in dependency order
            moduleFileTable: {}, // A map of the files related to modules
            excludedModules: modulesToExclude  
        };    
        
        that.resolve = function () {
            for (var i = 0; i < modulesToInclude.length; i++) {
                assembleDependencyList(that, modulesToInclude[i], " ---");
            }    
        };
        
        // Not really directories now.
        that.getRequiredDirsAsStr = function () {
            var dirs = "";
            for (var i = 0; i < that.requiredModules.length; i++) {
                dirs += modulePath(that.requiredModules[i]) + 
                    File.separator + "**" + File.separator + "*,";
            }            
            return dirs;
        };
        
        // Perhaps this should return a comma separated string since that's what we actually need?
        that.getAllRequiredFiles = function () {
            var fileList = [];
            for (var i = 0; i < that.requiredModules.length; i++) {
                var currentModule = that.requiredModules[i];
                addPathsForModuleFiles(fileList, currentModule, that.moduleFileTable);
            }
            
            return fileList;
        };
    
        /**
         * Fetches the dependency declaration for the given module name from the file system,
         * parsing it into an object from JSON data.
         * 
         * @param {String} the name of the module
         */
        that.loadDeclarationForModule = function (moduleName) {
            var fullModulePath = src + File.separator + modulePath(moduleName) + 
                File.separator + moduleName + ".json";
            project.log("Declaration file full path: " + fullModulePath, LogLevel.VERBOSE.getLevel());
        
            var moduleInfo = "";
            var rdr = new BufferedReader(new FileReader(new File(fullModulePath)));
            var line = rdr.readLine(); 
            while (line !== null) {
                moduleInfo += line;
                line = rdr.readLine();
            }
            
            project.log("Unparsed JSON: " + moduleInfo, LogLevel.DEBUG.getLevel());
            return JSON.parse(moduleInfo);
        };

        
        /**
         * Prints debugging information for all dependencies.
         */
        that.printDependencies = function () {
            for (var i = 0; i < modulesToInclude.length; i++) {
                var moduleName = modulesToInclude[i];
                project.log("Module " + moduleName);
                
                var moduleInfo = that.loadDeclarationForModule(moduleName);
                project.log(moduleInfo);
            }
        };

        return that;
    };

    var buildAllModuleStr = function () {
        var str = "";
        for (var name in globalObj) {
            if (name.search(modulePrefix) === 0) {
                str += name.slice(modulePrefix.length) + ",";
            }
        }
        return str;
    };
     
    var resolveDependenciesFromArguments = function () {
        if (typeof(include) === "undefined") {
            include = buildAllModuleStr();
        }
        
        project.log("Including modules: " + include, LogLevel.INFO.getLevel());
        
        var excludedFiles = (typeof(exclude) === "undefined") ? [] : parseArgument(exclude);
        project.log("Excluding modules: " + excludedFiles, LogLevel.INFO.getLevel());

        var resolver = fluid.dependencyResolver(parseArgument(include), excludedFiles);
        resolver.resolve();
        
        var fileSet = project.createDataType("fileset");

        project.log("*** All required files: ", LogLevel.VERBOSE.getLevel());
        var allFiles = resolver.getAllRequiredFiles();
        var fileNames = "";
        for (var i = 0; i < allFiles.length; i++) {
            project.log(" * " + allFiles[i], LogLevel.VERBOSE.getLevel());
            fileNames += allFiles[i] + ",";
        }

        project.setProperty("myFileNames", fileNames);
        
        var dirs = resolver.getRequiredDirsAsStr();
        project.log("*** All required directories: " + dirs, LogLevel.VERBOSE.getLevel());
        project.setProperty("myDirs", dirs);
    };
    
    // Run this immediately.
    resolveDependenciesFromArguments();
})();
