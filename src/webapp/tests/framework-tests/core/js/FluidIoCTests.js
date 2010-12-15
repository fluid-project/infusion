/*
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, expect*/


fluid.registerNamespace("fluid.testUtils");

(function ($) {

    fluid.defaults("fluid.testUtils.testComponent", {
        default1: "testComponent value",
        components: {
            test2: {
                type: "fluid.testUtils.testComponent2",
                options: {
                    value: "Original default value"
                }
            }
        }
    });

    fluid.defaults("fluid.testUtils.testComponent2", {
        components: {
            sub1: {
                type: "fluid.testUtils.subComponent"
            },
            sub2: {
                type: "fluid.testUtils.subComponent",
                options: {
                    value: "Subcomponent 2 default"
                }
            }
        }
    });

    fluid.demands("fluid.testUtils.testComponent2", "fluid.testUtils.testComponent", 
        ["{testComponent}.container", 
         {"default1": "{testComponent}.options.default1"}
        ]);


    // Somehow we sort of have to write this. Perhaps "component grading" will make it
    // possible to guess instantiation signatures
    fluid.demands("fluid.testUtils.modelComponent", "fluid.testUtils.dependentModel",
      [fluid.COMPONENT_OPTIONS]);

    fluid.defaults("fluid.testUtils.modelComponent", {
        mergePolicy: {
            model: "preserve"
        }
    });


    fluid.defaults("fluid.testUtils.dependentModel", {
        mergePolicy: {
            model: "preserve"
        },
        components: {
            modelComponent: {
                type: "fluid.testUtils.modelComponent",
                options: {
                    model: "{dependentModel}.options.model"
                }
            }
        }
    });

    fluid.defaults("fluid.testUtils.fluid3818head", {
        components: {
            child: {
                type: "fluid.testUtils.fluid3818child",
                options: {
                    value: "{environmentalValue}.derived"
                }
            }  
        }
    });

    fluid.defaults("fluid.testUtils.thatStackHead", {
        headValue: "headValue",
        components: {
            child1: {
                type: "fluid.testUtils.thatStackTail",
                options: {
                    invokers: {
                        getHeadValue: {
                            funcName: "fluid.identity",
                            args: "{child2}.options.headValue"
                        }
                    }
                }
            },
            child2: {
                type: "fluid.testUtils.thatStackTail",
                options: {
                    headValue: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "fluid.identity",
                            args: "{thatStackHead}.headValue"
                        }
                    }
                }
            }
        }
    });

    fluid.makeComponents({
        "fluid.testUtils.testComponent":      "fluid.standardComponent",
        "fluid.testUtils.testComponent2":     "fluid.standardComponent",
        "fluid.testUtils.testOrder":          "fluid.standardComponent", 
        "fluid.testUtils.subComponent":       "fluid.standardComponent",
        "fluid.testUtils.invokerComponent":   "fluid.littleComponent",
        "fluid.testUtils.invokerComponent2":  "fluid.littleComponent",
        "fluid.testUtils.modelComponent":     "fluid.littleComponent",
        "fluid.testUtils.dependentModel":     "fluid.littleComponent",
        "fluid.testUtils.multiResolution":    "fluid.littleComponent",
        "fluid.testUtils.multiResSub":        "fluid.littleComponent",
        "fluid.testUtils.multiResSub2":       "fluid.littleComponent",
        "fluid.testUtils.multiResSub3":       "fluid.littleComponent",
        "fluid.testUtils.defaultInteraction": "fluid.littleComponent",
        "fluid.testUtils.popup":              "fluid.littleComponent",
        "fluid.testUtils.fluid3818head":      "fluid.littleComponent",
        "fluid.testUtils.fluid3818child":     "fluid.littleComponent",
        "fluid.testUtils.thatStackHead":      "fluid.littleComponent",
        "fluid.testUtils.thatStackTail":      "fluid.littleComponent"
        // TODO: GRADES
        //"fluid.testUtils.resultsPager":       "fluid.littleComponent"
    });

    fluid.defaults("fluid.testUtils.invokerComponent", {
        template: "Every {0} has {1} {2}(s)",
        invokers: {
            render: {
                funcName: "fluid.formatMessage",
                args: ["{invokerComponent}.options.template", "@0"] 
            }
        },
        events: {
            testEvent: null
        }
    });
    
    fluid.defaults("fluid.testUtils.invokerComponent2", {
        template: "Every {0} has {1} {2}(s)",
        invokers: {
            render: "stringRenderer"
        },
        events: {
            testEvent: null
        }
    });
    
    fluid.demands("stringRenderer", "fluid.testUtils.invokerComponent2", {
        funcName: "fluid.formatMessage",
        args: ["{invokerComponent2}.options.template", "@0"]       
    });

    fluid.demands("sub1", "fluid.testUtils.testComponent2",
    ["{testComponent2}.container", {"crossDefault": "{testComponent2}.sub2.options.value"}]
    );

    fluid.demands("sub2", "fluid.testUtils.testComponent2",
    ["{testComponent2}.container", fluid.COMPONENT_OPTIONS]);


    fluid.defaults("fluid.testUtils.multiResolution", {
        components: {
            resSub: {
                type: "fluid.testUtils.multiResSub"
            }
        }  
    });

    fluid.demands("fluid.testUtils.staticResolution", [], 
        {funcName: "fluid.identity",
         args: "{fluid.testUtils.localFiles}"
        });

    fluid.demands("fluid.testUtils.multiResSub", "fluid.testUtils.multiResolution",
       {funcName: "fluid.testUtils.multiResSub"
       }); // TODO: should this really be necessary?  
       // Perhaps there should be a standard demands "valence" of 1 assigned to the "defaults" configuration. 

    fluid.demands("fluid.testUtils.multiResSub", ["fluid.testUtils.multiResolution", "fluid.testUtils.localFiles"],
        {
            funcName: "fluid.testUtils.multiResSub2",
            args: {
                localKey1: "localValue1",
                localKey2: "localValue2"
            }  
        });
    
    fluid.demands("fluid.testUtils.multiResSub", ["fluid.testUtils.multiResolution", "fluid.testUtils.localFiles", "fluid.testUtils.localTest"],
        {
            funcName: "fluid.testUtils.multiResSub3",
            parent: ["fluid.testUtils.multiResolution", "fluid.testUtils.localFiles"],
            args: [{
                localKey1: "testValue1"
            }, null 
            ]
        });
    
    fluid.defaults("fluid.testUtils.defaultInteraction", {
        components: {
            popup: {
                type: "fluid.testUtils.popup"
            }
        }  
    });

    fluid.defaults("fluid.testUtils.popup", {
        resources: {
            template: {
                forceCache: true,
                url: "../html/AutocompleteAddPopup.html"
            }
        }
    });

    fluid.demands("fluid.testUtils.popup", "fluid.testUtils.localTest", 
        {
        args: {
            resources: {
                template: {
                    url: "../../html/AutocompleteAddPopup.html"
                }
            }
        }
    });

    fluid.defaults("fluid.testUtils.stackThroughInvoke", {
        components: {
            resultsPager: {
                type: "fluid.testUtils.resultsPager",
                options: {
                    dataModel: "{stackThroughInvoke}.model",
                    dataOffset: "results",
                    modelFilter: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "fluid.testUtils.makeModelFilter",
                            args: ["{stackThroughInvoke}"]
                        }
                    }
                }
            }
        }
    });

    fluid.testUtils.makeModelFilter = function (parentThat) {
        return function () {
            return {value: parentThat.model.value + 1};
        };
    };

    fluid.testUtils.resultsPager = function (options) {
        var that = fluid.initLittleComponent("fluid.testUtils.resultsPager", options);
        fluid.initDependents(that);
        return that;
    };

    fluid.testUtils.stackThroughInvoke = function (container, options) {
        var that = fluid.initView(options.targetTypeName || "fluid.testUtils.stackThroughInvoke", container, options);
        that.model = {value: 3};
        that.testFluid3721 = null;
        fluid.initDependents(that);
        return that;
    };

    var fluidIoCTests = new jqUnit.TestCase("Fluid IoC Tests");

    fluid.setLogging(true);

    fluidIoCTests.test("construct", function () {
        expect(2);
        var that = fluid.testUtils.testComponent("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "testComponent value", that.test2.options.default1);
    });

    fluidIoCTests.test("crossConstruct", function () {
        expect(2);
        var that = fluid.testUtils.testComponent2("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "Subcomponent 2 default", that.sub1.options.crossDefault);
    });

    fluidIoCTests.test("invokers", function () {
        expect(2);
        var that = fluid.testUtils.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("invokers with demands", function () {
        expect(2);
        var that = fluid.testUtils.invokerComponent2();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("Aliasing expander test", function () {
        expect(3);
        var model = {};
        var that = fluid.testUtils.dependentModel({model: model});
        jqUnit.assertValue("Constructed", that);
        model.pollute = 3;
        jqUnit.assertEquals("Transit 1", 3, that.options.model.pollute);
        jqUnit.assertEquals("Transit 1", 3, that.modelComponent.options.model.pollute);
    });

    
    fluidIoCTests.test("Multi-resolution test", function () {
        var that = fluid.testUtils.multiResolution();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Standard subcomponent", "fluid.testUtils.multiResSub", that.resSub.typeName);
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.testUtils.localFiles");
            var that2 = fluid.testUtils.multiResolution();
            jqUnit.assertValue("Constructed", that2);
            var type2 = "fluid.testUtils.multiResSub2";
            jqUnit.assertEquals("\"Local\" subcomponent", type2, that2.resSub.typeName);
            var localDemandOptions = $.extend({}, fluid.demands("fluid.testUtils.multiResSub", 
                ["fluid.testUtils.multiResolution", "fluid.testUtils.localFiles"]).args, {targetTypeName: type2});
            jqUnit.assertDeepEq("\"Local\" subcomponent options", localDemandOptions, that2.resSub.options);
        
            fluid.staticEnvironment.testEnvironment = fluid.typeTag("fluid.testUtils.localTest");
            var that3 = fluid.testUtils.multiResolution();
            jqUnit.assertValue("Constructed", that3);
            var type3 = "fluid.testUtils.multiResSub3";
            jqUnit.assertEquals("\"Test\" subcomponent", type3, that3.resSub.typeName);
            var expectedOptions = {
                localKey1: "testValue1",
                localKey2: "localValue2"
    //             targetTypeName: type3 // This floats about a bit as we change policy on "typeName"
            };
            jqUnit.assertDeepEq("\"Test\" subcomponent merged options", expectedOptions, that3.resSub.options);

        }
        finally {
            delete fluid.staticEnvironment.testEnvironment;
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluidIoCTests.test("Static resolution test", function () {
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.testUtils.localFiles");
                
            var staticRes = fluid.invoke("fluid.testUtils.staticResolution");
            jqUnit.assertNotUndefined("Resolved value from static environment", staticRes);
        }
        finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluidIoCTests.test("Default interaction test", function () {
        var that = fluid.testUtils.defaultInteraction();
        jqUnit.assertValue("Constructed", that);
        var standardDefaults = fluid.copy(fluid.defaults("fluid.testUtils.popup"));
        jqUnit.assertDeepEq("Default options", standardDefaults, that.popup.options);
    
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.testUtils.localTest");
            var demands = fluid.demands("fluid.testUtils.popup", "fluid.testUtils.localTest");
            var that2 = fluid.testUtils.defaultInteraction();
            standardDefaults.targetTypeName = "fluid.testUtils.popup"; // TODO: this floats about a bit 
            var mergedDefaults = $.extend(true, standardDefaults, demands.args);
            jqUnit.assertDeepEq("Merged options", mergedDefaults, that2.popup.options);
        }
        finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluid.registerNamespace("fluid.testUtils.envTests");

    fluid.testUtils.envTests.config = {
        viewURLTemplate: "http://titan.atrc.utoronto.ca:5984/%dbName/%view",        
        views: {
            exhibitions: "_design/exhibitions/_view/browse"
        }
    };

    fluidIoCTests.test("Environmental Tests II - FLUID-3818", function () {
        var component = fluid.withEnvironment({
            environmentalValue: {
                typeName: "environmentalValue", 
                derived: "derivedValue"
            }
        }, function () {
            return fluid.testUtils.fluid3818head();
        });
        jqUnit.assertValue("child component constructed", component.child);
        jqUnit.assertEquals("Resolved environmental value", "derivedValue", component.child.options.value);
    });

    fluidIoCTests.test("Environmental Tests", function () {
        var urlBuilder = {
            type: "fluid.stringTemplate",
            template: "{config}.viewURLTemplate", 
            mapper: {
                dbName: "${{params}.db}_exhibitions",
                view: "{config}.views.exhibitions" 
            }
        };
  
        fluid.withEnvironment({
            params: {db: "mccord"}, 
            config: fluid.testUtils.envTests.config
        }, function () {
            var resolved = fluid.resolveEnvironment(urlBuilder);
            var required = {
                type: "fluid.stringTemplate",
                template: "http://titan.atrc.utoronto.ca:5984/%dbName/%view", 
                mapper: {
                    dbName: "mccord_exhibitions",
                    view: "_design/exhibitions/_view/browse" 
                }
            };
            jqUnit.assertDeepEq("Resolved Environment", required, resolved);  
        });
    });

    var buildUrl = function (recordType) { 
        return "../data/" + recordType + ".json";
    };

    fluid.demands("fluid.testUtils.stackThroughInvokeDeferred", [], 
       {funcName: "fluid.testUtils.stackThroughInvoke",
        args: ["@0", "@1"]});
    
    fluid.demands("fluid.testUtils.stackThroughInvoke", [], 
      ["@0", "@1"]);


    fluid.defaults("fluid.testUtils.stackThroughInvoke", {
        components: {
            resultsPager: {
                type: "fluid.testUtils.resultsPager",
                options: {
                    dataModel: "{stackThroughInvoke}.model",
                    dataOffset: "results",
                    modelFilter: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "fluid.testUtils.makeModelFilter",
                            args: ["{stackThroughInvoke}"]
                        }
                    }
                }
            }
        }
    });

    fluidIoCTests.test("thatStack through deferredCall Tests, proleptic ginger nicknames", function () {
        function test(compName) {
            var defTest = fluid.invoke(compName, ["#pager-top", {targetTypeName: compName}]);
            jqUnit.assertValue("Constructed " + compName, defTest);
            var filtered = defTest.resultsPager.options.modelFilter();
            jqUnit.assertDeepEq("Filtered " + compName, filtered, {value: 4});
        }
        test("fluid.testUtils.stackThroughInvoke");
    
        var adjust = fluid.copy(fluid.defaults("fluid.testUtils.stackThroughInvoke"));
        var expander = adjust.components.resultsPager.options.modelFilter.expander;
        expander.type = "fluid.deferredInvokeCall";
        expander.args[0] = "{stackThroughInvokeDeferred}";
    
        fluid.defaults("fluid.testUtils.stackThroughInvokeDeferred", adjust);

        test("fluid.testUtils.stackThroughInvokeDeferred");
    });

    fluidIoCTests.test("thatStack tests", function () {
        var component = fluid.testUtils.thatStackHead();
        var value = component.child1.getHeadValue();
        jqUnit.assertValue("Correctly resolved head value through invoker", fluid.defaults("fluid.testUtils.thatStackHead").headValue, value);
    });


    fluid.demands("fluid.testUtils.freeTarget1", [], 
      { funcName: "fluid.identity",
        args: ["@0", "@1"]});
    
    fluidIoCTests.test("Test Invoke Preservation", function () {
        var model = {};
        var returned = fluid.invoke("fluid.testUtils.freeTarget1", model);
        jqUnit.assertEquals("Identical model reference", model, returned);
    });

    var makeArrayExpander = function (recordType) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType), 
            disposer: function (model) {
                return {
                    items: model,
                    selectionIndex: -1
                };
            },
            options: {
                async: false
            },
            fetchKey: recordType
        });
    };

    fluidIoCTests.test("Deferred expander Tests", function () {
        var pageBuilder = {
            uispec: {
                objects: "These Objects",
                proceduresIntake: "Are Intake"
            }
        };
    
        var dependencies = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        makeArrayExpander("objects"),
                        "{pageBuilder}.uispec.objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [
                    ".intake-records-group",
                    makeArrayExpander("intake"),
                    "{pageBuilder}.uispec.proceduresIntake",
                    "stringOptions"
                ]
            }
        };
        
        var resourceSpecs = {};
    
        var expanded;
    
        fluid.withEnvironment({
            resourceSpecCollector: resourceSpecs,
            pageBuilder: pageBuilder
        }, function () {
            expanded = fluid.expander.expandLight(dependencies);
        });
    
        var func = function () {}; // dummy function to compare equality
    
        var requiredSpecs = {
            objects: {
                href: "../data/objects.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            },
            intake: {
                href: "../data/intake.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            }
        };
    
        jqUnit.assertDeepEq("Accumulated resourceSpecs", requiredSpecs, resourceSpecs);
    
        var expectedRes = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        {items: [1, 2, 3],
                         selectionIndex: -1},
                        "These Objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [
                    ".intake-records-group",
                    {
                        items: [4, 5, 6],
                        selectionIndex: -1
                    },
                    "Are Intake",
                    "stringOptions"
                ]
            }
        };
    
        fluid.fetchResources(resourceSpecs, function () {
            jqUnit.assertUndefined("No fetch error", resourceSpecs.objects.fetchError);
            jqUnit.assertValue("Request completed", resourceSpecs.objects.completeTime);
            jqUnit.assertDeepEq("Resolved model", expectedRes, expanded);
        });
    });

})(jQuery); 
