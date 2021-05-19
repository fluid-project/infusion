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

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.dataSource");

    fluid.tests.dataSource.testData = {
        error: {
            message: "Error"
        },
        plain: {
            lowerCase: "hello world",
            upperCase: "HELLO WORLD"
        },
        json: {
            serialized: "{\"value\":\"test\"}",
            object: {"value": "test"},
            transformed: {"remoteValue": "test"}
        }
    };

    fluid.defaults("fluid.tests.dataSource.plainText", {
        gradeNames: ["fluid.dataSource"],
        writableGrade: "fluid.tests.dataSource.plainText.writable",
        components: {
            encoding: {
                type: "fluid.dataSource.encoding.none"
            }
        },
        listeners: {
            "onRead.impl": {
                func: "fluid.tests.dataSource.getInitialPayload"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.plainText.transformed", {
        gradeNames: ["fluid.tests.dataSource.plainText"],
        writableGrade: "fluid.tests.dataSource.plainText.writableTransformed",
        listeners: {
            "onRead.transform": {
                func: "fluid.tests.dataSource.plainText.toUpperCase",
                priority: "after:encoding"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.plainText.writable", {
        gradeNames: ["fluid.dataSource.writable"],
        listeners: {
            "onWrite.impl": {
                func: "fluid.tests.dataSource.write"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.plainText.writableTransformed", {
        gradeNames: ["fluid.tests.dataSource.plainText.writable"],
        listeners: {
            "onWrite.transform": {
                func: "fluid.tests.dataSource.plainText.toLowerCase",
                priority: "before:encoding"
            }
        }
    });

    fluid.tests.dataSource.getInitialPayload = function (payload, options) {
        var promise = fluid.promise();
        var toFail = fluid.get(options, ["directModel", "toFail"]);
        var dataPath = fluid.get(options, ["directModel", "path"]);
        if (toFail) {
            promise.reject(fluid.tests.dataSource.testData.error);
        } else {
            promise.resolve(fluid.get(fluid.tests.dataSource.testData, dataPath));
        }
        return promise;
    };

    fluid.tests.dataSource.write = function (payload, options) {
        var promise = fluid.promise();
        var toFail = fluid.get(options, ["directModel", "toFail"]);
        if (toFail) {
            promise.reject(fluid.tests.dataSource.testData.error);
        } else {
            promise.resolve(payload);
        }
        return promise;
    };

    fluid.tests.dataSource.plainText.toUpperCase = function (payload) {
        return payload.toUpperCase();
    };

    fluid.tests.dataSource.plainText.toLowerCase = function (payload) {
        return payload.toLowerCase();
    };

    fluid.tests.dataSource.toValue = function (model) {
        return {"value": model.remoteValue};
    };

    fluid.tests.dataSource.toRemoteValue = function (model) {
        return {"remoteValue": model.value};
    };

    fluid.defaults("fluid.tests.dataSource.plainText.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            dsRead: {
                type: "fluid.tests.dataSource.plainText"
            },
            dsReadTransformed: {
                type: "fluid.tests.dataSource.plainText.transformed"
            },
            dsReadWrite: {
                type: "fluid.tests.dataSource.plainText",
                options: {
                    writable: true
                }
            },
            dsReadWriteTransformed: {
                type: "fluid.tests.dataSource.plainText.transformed",
                options: {
                    writable: true
                }
            },
            dataSourceTester: {
                type: "fluid.tests.dataSource.plainText.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.plainText.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "DataSource with text/plain encoding",
            tests: [{
                expect: 2,
                name: "Get plain text",
                sequence: [{
                    task: "{dsRead}.get",
                    args: [{"path": ["plain", "lowerCase"]}],
                    resolve: "jqUnit.assertEquals",
                    resolveArgs: ["The plain text should be returned", fluid.tests.dataSource.testData.plain.lowerCase, "{arguments}.0"]
                }, {
                    task: "{dsRead}.get",
                    args: [{"toFail": true, "path": ["plain", "lowerCase"]}],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Get plain text with transformation",
                sequence: [{
                    task: "{dsReadTransformed}.get",
                    args: [{"path": ["plain", "lowerCase"]}],
                    resolve: "jqUnit.assertEquals",
                    resolveArgs: ["The plain text should be returned", fluid.tests.dataSource.testData.plain.upperCase, "{arguments}.0"]
                }, {
                    task: "{dsReadTransformed}.get",
                    args: [{"toFail": true, "path": ["plain", "lowerCase"]}],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Write plain text",
                sequence: [{
                    task: "{dsReadWrite}.set",
                    args: [{}, fluid.tests.dataSource.testData.plain.upperCase],
                    resolve: "jqUnit.assertEquals",
                    resolveArgs: ["The plain text should be returned", fluid.tests.dataSource.testData.plain.upperCase, "{arguments}.0"]
                }, {
                    task: "{dsReadWrite}.set",
                    args: [{"toFail": true}, fluid.tests.dataSource.testData.plain.upperCase],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Write plain text with transformation",
                sequence: [{
                    task: "{dsReadWriteTransformed}.set",
                    args: [{}, fluid.tests.dataSource.testData.plain.upperCase],
                    resolve: "jqUnit.assertEquals",
                    resolveArgs: ["The plain text should be returned", fluid.tests.dataSource.testData.plain.lowerCase, "{arguments}.0"]
                }, {
                    task: "{dsReadWriteTransformed}.set",
                    args: [{"toFail": true}, fluid.tests.dataSource.testData.plain.upperCase],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.dataSource.json", {
        gradeNames: ["fluid.dataSource"],
        listeners: {
            "onRead.impl": {
                func: "fluid.tests.dataSource.getInitialPayload"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.json.transformed", {
        gradeNames: ["fluid.tests.dataSource.json"],
        listeners: {
            "onRead.transform": {
                func: "fluid.tests.dataSource.toRemoteValue",
                priority: "after:encoding"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.json.writable", {
        listeners: {
            "onWrite.impl": {
                func: "fluid.tests.dataSource.write"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.json.writableTransformed", {
        gradeNames: ["fluid.tests.dataSource.json.writable"],
        listeners: {
            "onWrite.transform": {
                func: "fluid.tests.dataSource.toValue",
                priority: "before:encoding"
            }
        }
    });

    fluid.makeGradeLinkage("fluid.tests.dataSource.linkage.json", ["fluid.dataSource.writable", "fluid.tests.dataSource.json"], "fluid.tests.dataSource.json.writable");
    fluid.makeGradeLinkage("fluid.tests.dataSource.linkage.json.transformed", ["fluid.dataSource.writable", "fluid.tests.dataSource.json.transformed"], "fluid.tests.dataSource.json.writableTransformed");

    fluid.defaults("fluid.tests.dataSource.json.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            dsRead: {
                type: "fluid.tests.dataSource.json"
            },
            dsReadTransformed: {
                type: "fluid.tests.dataSource.json.transformed"
            },
            dsReadWrite: {
                type: "fluid.tests.dataSource.json",
                options: {
                    gradeNames: ["fluid.dataSource.writable"]
                }
            },
            dsReadWriteTransformed: {
                type: "fluid.tests.dataSource.json.transformed",
                options: {
                    gradeNames: ["fluid.dataSource.writable"]
                }
            },
            dataSourceTester: {
                type: "fluid.tests.dataSource.json.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.json.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "DataSource with JSON encoding",
            tests: [{
                expect: 2,
                name: "Get JSON",
                sequence: [{
                    task: "{dsRead}.get",
                    args: [{"path": ["json", "serialized"]}],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["A JSON object should be returned", fluid.tests.dataSource.testData.json.object, "{arguments}.0"]
                }, {
                    task: "{dsRead}.get",
                    args: [{"toFail": true, "path": ["json", "serialized"]}],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Get JSON with transformation",
                sequence: [{
                    task: "{dsReadTransformed}.get",
                    args: [{"path": ["json", "serialized"]}],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["A JSON object, with transformations applied, should be returned", fluid.tests.dataSource.testData.json.transformed, "{arguments}.0"]
                }, {
                    task: "{dsReadTransformed}.get",
                    args: [{"toFail": true, "path": ["json", "serialized"]}],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Write JSON",
                sequence: [{
                    task: "{dsReadWrite}.set",
                    args: [{}, fluid.tests.dataSource.testData.json.object],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["A JSON object should be returned", fluid.tests.dataSource.testData.json.object, "{arguments}.0"]
                }, {
                    task: "{dsReadWrite}.set",
                    args: [{"toFail": true}, fluid.tests.dataSource.testData.json.object],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }, {
                expect: 2,
                name: "Write JSON with transformation",
                sequence: [{
                    task: "{dsReadWriteTransformed}.set",
                    args: [{}, fluid.tests.dataSource.testData.json.transformed],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["A JSON object, with transformations applied, should be returned", fluid.tests.dataSource.testData.json.object, "{arguments}.0"]
                }, {
                    task: "{dsReadWriteTransformed}.set",
                    args: [{"toFail": true}, fluid.tests.dataSource.testData.json.transformed],
                    reject: "jqUnit.assertDeepEq",
                    rejectArgs: ["An error object should be returned", fluid.tests.dataSource.testData.error, "{arguments}.0"]
                }]
            }]
        }]
    });

    fluid.test.runTests([
        "fluid.tests.dataSource.plainText.tests",
        "fluid.tests.dataSource.json.tests"
    ]);


})();
