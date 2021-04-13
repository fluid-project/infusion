#! /usr/bin/env node

/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* eslint-env node */
"use strict";

const build = {};
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

/**
 * Command line arguments processed into an object.
 *
 * @typedef {Object} ArgV
 * @property {String} execPath - The process.execPath.
 *                               See: https://nodejs.org/docs/latest/api/process.html#process_process_execpath
 * @property {String} execFile - Path to the file being executed.
 *                                   enclosing DOM element
 * @property {Array} files - An array of file paths.
 * @property {String} [include] - (optional) A comma separated string of modules to be included.
 * @property {String} [exclude] - (optional) A comma separated string of modules to be excluded.
 */

/**
 * Processes the argv command line arguments into an object. Options are expected to be key/value pairs in the format of
 * `--key="value"`. If no value is provided the option is set to `undefined`. Arguments provides which are not options
 * (i.e. don't start with `--`) are treated as file paths and compiled into a `files` array.
 *
 * see: https://nodejs.org/docs/latest/api/process.html#process_process_argv
 *
 * @return {ArgV} - the CLI arguments as an object
 */
build.getCLI = () => {
    let args = {
        execPath: process.argv[0],
        execFile: process.argv[1],
        files: []
    };

    process.argv.forEach((val, index) => {
        if (index > 1) {
            // capture options
            if (val.startsWith("--")) {
                let opt = val.slice(2).split("=");
                args[opt[0]] = opt[1];
            // assemble list of file names
            } else {
                args.files.push(val);
            }
        }
    });

    // expand glob patterns
    args.files = fg.sync(args.files);

    return args;
};

/**
 * Filters a provided array, `toFilter`, by removing the common values found in the set of other provided arrays.
 * That is, only includes vaues unique to the `toFilter` array.
 *
 * @param {Array} toFilter - the array to filter. Only values that are not found in subsequent arrays will be returned.
 * @param  {...Array} arrays - the arrays to filter `toFilter` with.
 * @return {Array} - the filtered array.
 */
build.arrayFilter = (toFilter, ...arrays) => {
    let filter = (accumulator, current) => accumulator.filter(val => !current.includes(val));

    return arrays.reduce(filter, toFilter);
};

/**
 * Reads in a JSON file and returns an object.
 * @param {String} path - the file path for the JSON file to read in.
 * @param {Object} [options] - (optional) options to pass down to `fs.readFileSync`
 * @return {Object} - the JSON file as an object
 */
build.readJSON = (path, options) => {
    let data = fs.readFileSync(path, options);
    return JSON.parse(data);
};

/**
 *
 * @param {String} filePath - basepath of file to use to source the directory path
 * @param  {...String} paths - additional paths to augment the directory path found from the `filePath`
 * @return {String} - the directory path
 */
build.getDir = (filePath, ...paths) => {
    var basePath = path.dirname(filePath);
    return path.join.apply(null, [basePath, ...paths]);
};

/**
 *
 * @param {Array} files - The set of file paths to the package.json files to source the Infusion modules from.
 * @return {Object} - An object keyed off the package names, and containing the package info for each package.
 *                     Additionally a `dir` property is added for each, to identity the path to the packages directory.
 */
build.gatherPackages = files => {
    let modules = {};
    files.forEach(filePath => {
        var modulePackage = build.readJSON(filePath);
        if (modulePackage.packages) {
            modulePackage.packages.forEach(pack => {
                modules[pack.name] = {...pack, ...{dir: build.getDir(filePath, pack.infusion.dir || "")}};
            });
        } else {
            modules[modulePackage.name] = {...modulePackage, ...{dir: build.getDir(filePath, modulePackage.infusion.dir || "")}};
        }
    });
    return modules;
};

/**
 * Returns the set of requested modules/packages based on their dependency requirements. If the include options is
 * provided only the requested modules will be returned. If the exclude option is provied, the exclude modules will be
 * removed.
 * @param {Object} packages - All available packages
 * @param {String[]} [include] - (optional) an array of module names to include
 * @param {String[]} [exclude] - (optional) an array of module names to exclude
 * @throws {Error} - If an `include` or dependency cannot be located in the `packages`
 * @return {Object} - An object with the modules sorted based on dependency.
 */
build.sortModules = (packages, include, exclude = []) => {
    let modules = {};
    include = include || Object.keys(packages);
    let toInclude = build.arrayFilter(include, exclude);

    toInclude.forEach(moduleName => {
        if (!packages[moduleName]) {
            throw new Error(`The "${moduleName}" Infusion module could not be found. Either the related package.json file could not be located or the package name is invalid.`);
        }

        let dependencies = packages[moduleName].dependencies;
        if (dependencies) {
            let dependsOn = build.sortModules(packages, Object.keys(dependencies), exclude);
            modules = {...modules, ...dependsOn};
        }
        modules[moduleName] = packages[moduleName];
    });

    return modules;
};

/**
 * Assembles the sorted file and directory paths for the requested modules.
 * @param {String[]} files - the set of files to source the module/package information from
 * @param {Object} [options] - (optional) options to determine which modules are included
 * @param {String[]} [options.include] - An array of module names to include
 * @param {String[]} [options.exclude] - An array of module names to exclude
 * @return {Object} - an object containing arrays, `files` and `dirs`, of the sorted paths.
 */
build.getModulePaths = (files, options = {}) => {
    const packages = build.gatherPackages(files);
    let include = options.include && options.include.split(",").map(name => name.trim());
    let exclude = options.exclude && options.exclude.split(",").map(name => name.trim());
    let paths = {
        files: [],
        dirs: []
    };

    let sortedModules = build.sortModules(packages, include, exclude);
    for (let moduleName in sortedModules) {
        let mod = sortedModules[moduleName];
        paths.dirs.push(path.join(mod.dir, "**/*"));
        if (mod.infusion && mod.infusion.jsCommonFiles) {
            let files = mod.infusion.jsCommonFiles.map(filePath => path.join(mod.dir, filePath));
            paths.files = [...paths.files, ...files];
        }
    }

    return paths;
};

module.exports = build;

if (require.main === module) {
    let args = build.getCLI();
    args = {
        ...{
            include: process.env.FL_INCLUDE,
            exclude: process.env.FL_EXCLUDE,
            output: process.env.FL_OUTPUT
        }, ...args
    };
    let modulePaths = build.getModulePaths(args.files, args);

    if (args.output === "dirs") {
        process.stdout.write(modulePaths.dirs.join(" "));
    } else {
        process.stdout.write(modulePaths.files.join(" "));
    }
}
