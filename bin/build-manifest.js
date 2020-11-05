/* eslint-env node */
"use strict";

var execSync = require("child_process").execSync;
var fg = require("fast-glob").sync;
var fs = require("fs");
var lowerCase = require("lodash").lowerCase;
var template = require("lodash").template;
var upperFirst = require("lodash").upperFirst;

/**
 * Clean up output to ensure that special terms, acronyms,
 * et cetera are properly formatted.
 *
 * @param {String} str Input string on which to perform find and replace.
 * @return {String} The input string with replacements applied.
 */
var replaceValuesInString = function (str) {
    var replacementPatterns = {
        "a 11 y": "a11y",
        "a 11 Y": "a11y",
        "Aria": "ARIA",
        "Fluid get": "fluid.get",
        "Html 5": "HTML5",
        "infusion": "Infusion",
        "io c": "IoC",
        "Io c": "IoC",
        "Jq unit": "jqUnit",
        "js": "JS",
        "Ui": "UI",
        "Url": "URL"
    };

    Object.entries(replacementPatterns).map(function (pattern) {
        str = str.replace(pattern[0], pattern[1]);
    });
    return str;
};

var normalizeCase = function (str) {
    str = lowerCase(str);
    return upperFirst(str);
};

/**
 * Determine the URL of a demo, example, or test based on file path.
 *
 * @param {String} path The file path of a demo, example, or test.
 *
 * @return {URL} The URL of the demo, example, or test.
 */
var getUrl = function (path) {
    return new URL("https://build-infusion.fluidproject.org/" + path);
};

/**
 * Determine the name of a demo, example, or test based on URL.
 *
 * @param {URL} url The URL of a demo, example, or test.
 *
 * @return {String} The name of the demo, example, or test.
 */
var getName = function (url) {
    var parts = url.pathname.split("/");
    var name, scope = "";

    if (parts[1] === "tests") {
        if (parts.length > 3) {
            // Manual tests follow the pattern /test/manual-tests/(core|framework)/<name>/<scope>/index.html
            if (parts[parts.length - 1] === "index.html") {
                name = parts[4];
                scope = parts[5];
            // Grouped component or framework tests follow the pattern /tests/(component|framework)-tests/<name>/all-tests.html.
            } else if (parts[parts.length - 1] === "all-tests.html") {
                name = parts[3];
                scope = "All tests";
            // Individual component or framework tests follow the pattern /tests/(component|framework)-tests/<name>/html/<scope>-test.html.
            } else if (parts[parts.length - 1].includes("-test.html")) {
                name = parts[3];
                scope = parts[parts.length - 1].replace("-test.html", "");
                if (name.toLowerCase() === scope.toLowerCase()) {
                    // Reset scope if it"s the same as the name.
                    scope = "";
                }
            }
        } else {
            // All tests for the Infusion framework.
            name = "Infusion";
            scope = "All tests";
        }
    } else if (parts[1] === "demos") {
        // Basic dempos follow the pattern /demos/<name>/index.html.
        if (parts.length === 4) {
            name = parts[2];
        // Scoped dempos follow the pattern /demos/<name>/<scope>/index.html.
        } else if (parts.length === 5) {
            name = parts[2];
            scope = parts[3];
        }
    } else if (parts[1] === "examples") {
        // Examples follow the pattern /examples/(components|framework)/<name>/<scope>/index.html.
        name = parts[3];
        scope = parts[4];
    }

    name = normalizeCase(name);
    name = replaceValuesInString(name);

    if (scope !== "") {
        scope = normalizeCase(scope);
        scope = replaceValuesInString(scope);
    }

    return (scope !== "") ? name + ": " + scope : name;
};

/**
 * Add an example, demo, or test to an output object with the URL as the key
 * and the name as the value.
 *
 * @param {String} file The file path of a demo, example, or test.
 * @param {Object} output An existing object to which the item should be appended.
 *
 * @return {Object} The input object with an additional entry, or the unmodified input object.
 */
var addItemToOutput = function (file, output) {
    var url = getUrl(file);
    var name = getName(url);

    // For component and framework tests with scoped tests such as the
    // preferences framework or the reorderer component, we omit scoped tests
    // and only include a link to the full test suite.
    if (file.includes("component-tests") || file.includes("framework-tests")) {
        var allTestsName = name.split(":")[0] + ": All tests";
        if (Object.values(output).includes(allTestsName)) {
            return output;
        }
    }

    output[url.toString()] = name;

    return output;
};

/**
 * Process all files matching a glob pattern, adding them to an object where
 * the key is the URL to the build file and the value is the name of the demo,
 * example, or test.
 *
 * @param {Array} globPattern An array of globs to match.
 *
 * @return {Object} An object of URL / name pairs from the retrieved files.
 */
var processFileGlob = function (globPattern) {
    var output = {};

    var files = fg(globPattern);

    files.sort();
    files.forEach(function (file) {
        output = addItemToOutput(file, output);
    });

    return output;
};

/**
 * Generate the JSON for all demos, examples, and tests.
 *
 * @return {Object} An object of demos, examples, and tests.
 */
var generateJson = function () {
    return {
        "Demos": {
            "Infusion Demos": processFileGlob(["demos/**/index.html"])
        },
        "Examples": {
            "Preferences Framework": processFileGlob(["examples/framework/preferences/*/index.html"]),
            "Infusion JS Framework": processFileGlob(["examples/framework/renderer/*/index.html"]),
            "Infusion Components": processFileGlob(["examples/components/**/index.html"])
        },
        "Tests": {
            "All Infusion Tests": processFileGlob(["tests/all-tests.html"]),
            "Infusion Framework Tests": processFileGlob(["tests/framework-tests/*/all-tests.html", "tests/framework-tests/*/html/*-test.html"]),
            "Infusion Component Tests": processFileGlob(["tests/component-tests/*/all-tests.html", "tests/component-tests/*/html/*-test.html"]),
            "Infusion Manual Tests": processFileGlob(["tests/manual-tests/**/index.html"])
        }
    };
};

/**
 * Write the generated JSON to the filesystem.
 *
 * @param {Object} data The data to write to the filesystem.
 * @param {String} path The path to the output JSON file.
 */
var writeJson = function (data, path) {
    try {
        fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
        console.error(err);
    }
};

/**
 * Write an index file with grouped links to demos, examples and tests to the filesystem.
 *
 * @param {Object} data The JSON data to transfrom into HTML.
 * @param {String} path The path to the output HTML file.
 */
var writeIndex = function (data, path) {
    var revision = execSync("git rev-parse --verify --short HEAD").toString().trim();
    var html = "<!DOCTYPE html>\n";
    html += "<html lang=\"en\">\n";
    html += "<head>\n";
    html += "<meta content=\"width=device-width, initial-scale=1.0\" name=\"viewport\">\n";
    html += "<title>Infusion Build at " + revision + "</title>\n";
    html += "<link rel=\"stylesheet\" type=\"text/css\" href=\"/src/lib/normalize/css/normalize.css\"/>\n";
    html += "</head>\n";
    html += "<body>\n";
    html += "<main id=\"main\">\n";
    html += "<h1>Infusion Build at <a href=\"http://github.com/fluid-project/infusion/commit/" + revision + "/\">" + revision + "</a></h1>\n";
    for (var [key, group] of Object.entries(data)) {
        var heading = template("<h2><%= groupName %></h2>\n");
        html += heading({groupName: key});
        for (var [key, subgroup] of Object.entries(group)) {
            var subheading = template("<h3><%= subgroupName %></h3>\n");
            html += subheading({subgroupName: key});
            html += "<ul>\n";
            for (var [url, name] of Object.entries(subgroup)) {
                var item = template("<li><a href=\"<%= url %>\"><%= name %></a></li>\n");
                html += item({url, name});
            }
            html += "</ul>\n";
        }
    }
    html += "</main>\n";
    html += "</body>\n";
    html += "</html>\n";

    try {
        fs.writeFileSync(path, html);
    } catch (err) {
        console.error(err);
    }
}

var data = generateJson();
writeJson(data, "./build/manifest.json");
writeIndex(data, "./build/index.html");
