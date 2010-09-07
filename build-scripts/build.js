/* 
 * This is a minified version of Douglas Crockford's JSON2.js parser, release in the public domain.
 * http://www.json.org/json2.js
 */
if(!this.JSON){JSON=function(){function f(n){return n<10?"0"+n:n}Date.prototype.toJSON=function(){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function stringify(value,whitelist){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case"string":return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c}c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+value+'"';case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}if(typeof value.toJSON==="function"){return stringify(value.toJSON())}a=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i],whitelist)||"null")}return"["+a.join(",")+"]"}if(whitelist){l=whitelist.length;for(i=0;i<l;i+=1){k=whitelist[i];if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}else{for(k in value){if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}return"{"+a.join(",")+"}"}}return{stringify:stringify,parse:function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==="object"){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n}}}}return filter(k,v)}if(/^[\],:{}\s]*$/.test(text.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof filter==="function"?walk("",j):j}throw new SyntaxError("parseJSON")}}}()};


/*
 * This is the Fluid Infusion dependency manager.
 */

/*global importClass, Packages */
/*global java, File, BufferedReader, FileReader, LogLevel */

importClass(java.io.BufferedReader);
importClass(java.io.FileReader);
importClass(java.io.File);
importClass(Packages.org.apache.tools.ant.types.LogLevel);

var fluid = fluid || {};
var globalObj = this;

(function () {
    var modulePrefix = "module_";
    var customJsFileName = "MyInfusion.js";
    var allJsFileName = "InfusionAll.js";

    /**
     * Returns the filename for the concatenated javascript file based on whether a filename was passed in and
     * whether a full build is or a custom build is done.
     * @param {Object} nameArg
     * @param {Object} includeArg
     * @param {Object} excludeArg
     */
    var jsFileName = function (nameArg, includeArg, excludeArg) {
        if (nameArg) {
            return nameArg;
        } 
        
        return (includeArg || excludeArg ? customJsFileName : allJsFileName);
    };

    var setProperty = function (name, value) {
        globalObj.project.setProperty(name, value);
        logInfo("Setting property " + name + " to " + value);
    };

    var modulePath = function (moduleName) {
        return globalObj.project.getProperty(modulePrefix + moduleName);
    };

    /**
     * Finds all the modules based on the convention of the module property prefix and 
     * returns them as a comma delimited string
     */
    var allModules = function () {
        var str = "";
        for (var name in globalObj) {
            if (name.search(modulePrefix) === 0) {
                str += name.slice(modulePrefix.length) + ",";
            }
        }
        return str;
    };

    var logVerbose = function (str) {
        globalObj.project.log(str, LogLevel.VERBOSE.getLevel());
    };

    var logInfo = function (str) {
        globalObj.project.log(str, LogLevel.INFO.getLevel());
    };

    var logDebug = function (str) {
        globalObj.project.log(str, LogLevel.DEBUG.getLevel());
    };
    
    /**
     * Turns a comma delimitied string into an array
     * 
     * @param {String} arg
     */
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
    
    /**
     * Turns a comma delimited string into an array of module names. Uses all modules if none are passed in.
     * 
     * @param {String} includeArg
     */
    var parseModulesToInclude = function (includeArg) {
        if (typeof(includeArg) === "undefined") {
            includeArg = allModules();
        }
        
        logInfo("Including modules: " + includeArg);
        
        return parseArgument(includeArg);
    };
    
    var isDependencyIncluded = function (name, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === name) {
                return true;
            }
        }
        
    	return false;
    };
    
    /**
     * Returns an array containing the value if it is a string or the value otherwise
     * 
     * @param {Object} value
     */
    var asArray = function (value) {
        if (value === undefined) {
            return [];
        } else if (typeof(value) === "string") {
            return [value];
        }
        
        return value;
    };
    
    var normalizeDeclaration = function (declaration) {
        declaration.files = asArray(declaration.files);
        declaration.dependencies = asArray(declaration.dependencies);
    };
    
    /**
     * Logs dependencies for the module
     * 
     * @param {Object} moduleName
     * @param {Object} moduleDependencies
     */
    var logDependencies = function (moduleName, moduleDependencies) {      
        logVerbose("Dependencies for " + moduleName + ": ");
        for (var i = 0; i < moduleDependencies.length; i++) {
            logVerbose("  * " + moduleDependencies[i]);
        }
    };
    
    /**
     * Builds the moduleJSFileTable, and the requiredModules list for the moduleName passed in
     * 
     * @param {Object} that
     * @param {Object} moduleName
     * @param {Object} prefixStr
     */
    var assembleDependencyList = function (that, moduleName, prefixStr) {        
        logInfo(prefixStr + " Processing module: " + moduleName);
        logDebug("Dependency order so far: " + that.requiredModules);
        
        if (isDependencyIncluded(moduleName, that.requiredModules)) {
            return;
        }
        
        var moduleInfo = that.loadDeclarationForModule(moduleName);
        normalizeDeclaration(moduleInfo[moduleName]);
        that.moduleJSFileTable[moduleName] = moduleInfo[moduleName].files;  
        var moduleDependencies = moduleInfo[moduleName].dependencies;
        logDependencies(moduleName, moduleDependencies);

        for (var i = 0; i < moduleDependencies.length; i++) {
            assembleDependencyList(that, moduleDependencies[i], prefixStr + "    ");
        }
        
        if (!isDependencyIncluded(moduleName, that.excludedModules)) {
            that.requiredModules.push(moduleName);
        }
    };
    
    /**
     * Returns a comma delimited list of paths, including the specified directory, for the files related to the moduleName passed in.
     * 
     * @param {Object} moduleName
     * @param {Object} moduleFileTable
     * @param {Object} dir
     */
    var pathsForModuleFiles = function (moduleName, moduleFileTable, dir) {
        var pathsStr = "";
        var filesForModule = moduleFileTable[moduleName];
        for (var i = 0; i < filesForModule.length; i++) {
            var path = modulePath(moduleName) + File.separator + dir + File.separator;
            pathsStr += path + filesForModule[i] + ",";
        }
        
        return pathsStr;
    };
    
    /**
         * Returns the list of all the files required (from requiredModules), as a comma delimited string.
         * These files are scoped to the moduleFileTable passed, and the paths contain the directory specified.
         * 
         * @param {Object} moduleFileTable
         * @param {Object} dir
         */
        var getAllRequiredFiles = function (requiredModules, moduleFileTable, dir) {
            var fileStr = "";
            for (var i = 0; i < requiredModules.length; i++) {
                var currentModule = requiredModules[i];
                fileStr += pathsForModuleFiles(currentModule, moduleFileTable, dir);
            }

            logVerbose("*** All required files: " + fileStr);
            return fileStr;
        };
        
        /**
         * Builds up the regular expression to find the requiredModules from the moduleFileTable
         * 
         * @param {Object} regExpStart
         * @param {Object} regExpEnd
         * @param {Object} requiredModules
         * @param {Object} moduleFileTable
         */
        var buildRegExpression = function (regExpStart, regExpEnd, requiredModules, moduleFileTable) {
            var regStart = regExpStart;
            var regEnd = regExpEnd;
            var regExpStr = "";
            var convertedStr = "";
            for (var i = 0; i < requiredModules.length; i++) {
                var currentModule = requiredModules[i];
                var currentFiles = moduleFileTable[currentModule];
                
                for (var j = 0; j < currentFiles.length; j++) {
                    if (regExpStr) {
                        regExpStr += "|";
                    }
                    convertedStr = currentFiles[j].replace(/\./g, "\\."); //this is to escape the "." character which is a wildcard in ant regex.
                    regExpStr += (regStart + convertedStr + regEnd);
                }
            }
            return regExpStr;
        };
        
    /**
     * Resolves dependencies for the modules passed in. 
     * Uses the module properties from build.properties to find the dependency declarations for a module. 
     * 
     * @param {Array} modulesToInclude
     * @param {Array} modulesToExclude
     */    
    fluid.dependencyResolver = function (modulesToInclude, modulesToExclude) {
        var that = {
            requiredModules: [], // A list of modules to be included in dependency order
            moduleJSFileTable: {}, // A map of the files related to modules
            excludedModules: modulesToExclude  
        };    
        
        var resolve = function () {
            for (var i = 0; i < modulesToInclude.length; i++) {
                assembleDependencyList(that, modulesToInclude[i], "   ");
            }    
        };
        
        /**
         * Returns the list of all required module directories as a comma-delimited string of file selectors.
         */
        that.getRequiredDirectories = function () {
            var dirs = "";
            for (var i = 0; i < that.requiredModules.length; i++) {
                dirs += modulePath(that.requiredModules[i]) + 
                    File.separator + "**" + File.separator + "*,";
            }
            
            logVerbose("*** All required directories: " + dirs);
            return dirs;
        };
        
        /**
         * Returns the list of all the javascript files required as a comma delimited string.
         */
        that.getAllRequiredJSFiles = function () {
            return getAllRequiredFiles(that.requiredModules, that.moduleJSFileTable, "js");
        };
        
        /**
         * Builds up the regular expression needed to find the files that are included in single js file
         */
        that.buildJSRegExpression = function () {
            var obj = globalObj.project;
            return buildRegExpression(obj.getProperty("regexStartJS"), obj.getProperty("regexEndJS"), that.requiredModules, that.moduleJSFileTable);
        };
        
        /**
         * Builds up the regular expression needed to find the files that are included in single js file, to replace the first occurence with the single js file
         */
        that.buildJSReplaceRegExpression = function () {
            var obj = globalObj.project;
            return buildRegExpression(obj.getProperty("replaceRegexStartJS"), obj.getProperty("replaceRegexEndJS"), that.requiredModules, that.moduleJSFileTable);
        };
    
        /**
         * Fetches the dependency declaration for the given module name from the file system,
         * parsing it into an object from JSON data.
         * 
         * @param {String} the name of the module
         * @return {Object} a dependency declaration object
         */
        that.loadDeclarationForModule = function (moduleName) {
            var fullModulePath = globalObj.src + File.separator + modulePath(moduleName) + 
                File.separator + moduleName + "Dependencies.json";
            logVerbose("Declaration file full path: " + fullModulePath);
        
            var moduleInfo = "";
            var rdr = new BufferedReader(new FileReader(new File(fullModulePath)));
            var line = rdr.readLine(); 
            while (line !== null) {
                moduleInfo += line;
                line = rdr.readLine();
            }
            
            logDebug("Unparsed JSON: " + moduleInfo);
            return JSON.parse(moduleInfo);
        };

        resolve();
        return that;
    };
    
    /**
     * Kicks off dependency resolution 
     * Results in setting five ant properties: allRequiredFiles, requiredDirectoriesSelector, jsRegExp, jsReplaceRegExp, and jsfile
     */
    var resolveDependenciesFromArguments = function () {
        var excludedFiles = (typeof(globalObj.exclude) === "undefined") ? [] : parseArgument(globalObj.exclude);
        logInfo("Excluding modules: " + excludedFiles);

        var resolver = fluid.dependencyResolver(parseModulesToInclude(globalObj.include), excludedFiles);
        
        var jsFile = jsFileName(globalObj.jsfilename, globalObj.include, globalObj.exclude);
        
        setProperty("allRequiredJSFiles", resolver.getAllRequiredJSFiles(resolver.moduleJSFileTable));
        setProperty("requiredDirectoriesSelector", resolver.getRequiredDirectories());
        setProperty("jsRegExp", resolver.buildJSRegExpression());
        setProperty("jsReplaceRegExp", resolver.buildJSReplaceRegExpression());
        setProperty("jsfile", jsFile);        
    };
    
    // Run this immediately.
    resolveDependenciesFromArguments();
})();
