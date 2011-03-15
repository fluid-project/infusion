/*
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {

    fluid.defaults("fluid.tests.testComponent", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        default1: "testComponent value",
        components: {
            test2: {
                type: "fluid.tests.testComponent2",
                options: {
                    value: "Original default value"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.testComponent2", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            sub1: {
                type: "fluid.tests.subComponent"
            },
            sub2: {
                type: "fluid.tests.subComponent",
                options: {
                    value: "Subcomponent 2 default"
                }
            }
        }
    });

    fluid.demands("fluid.tests.testComponent2", "fluid.tests.testComponent", 
        ["{testComponent}.container", 
         {"default1": "{testComponent}.options.default1"}
        ]);


    // Somehow we sort of have to write this. Perhaps "component grading" will make it
    // possible to guess instantiation signatures
    //fluid.demands("fluid.tests.modelComponent", "fluid.tests.dependentModel",
    //  [fluid.COMPONENT_OPTIONS]);

    fluid.defaults("fluid.tests.modelComponent", {
        gradeNames: "modelComponent",
        mergePolicy: {
            model: "preserve"
        }
    });


    fluid.defaults("fluid.tests.dependentModel", {
        mergePolicy: {
            model: "preserve"
        },
        components: {
            modelComponent: {
                type: "fluid.tests.modelComponent",
                options: {
                    model: "{dependentModel}.options.model"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid3818head", {
        components: {
            child: {
                type: "fluid.tests.fluid3818child",
                options: {
                    value: "{environmentalValue}.derived"
                }
            }  
        }
    });

    fluid.defaults("fluid.tests.thatStackHead", {
        headValue: "headValue",
        components: {
            child1: {
                type: "fluid.tests.thatStackTail",
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
                type: "fluid.tests.thatStackTail",
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

    fluid.defaults("fluid.tests.reinstantiation", {
        headValue: "headValue",
        components: {
            child1: {
                type: "fluid.tests.reinsChild",
                options: {
                    components: {
                        instantiator: "{instantiator}",
                        child2: {
                            type: "fluid.tests.reinsChild2",
                            options: {
                                value: "{reinstantiation}.options.headValue",
                                components: {
                                    child3: {
                                        type: "fluid.tests.reinsChild2",
                                        options: {
                                            value: "{reinstantiation}.options.headValue"
                                        }
                                    }  
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.demands("fluid.tests.reinsChild2", "fluid.tests.reinstantiation",
       [fluid.COMPONENT_OPTIONS, "{reinstantiation}.options.headValue"] 
    );
    
    fluid.tests.reinsChild2 = function(options, otherValue) {
        var that = fluid.initLittleComponent("fluid.tests.reinsChild2", options);
        fluid.initDependents(that);
        that.otherValue = otherValue;
        return that;
    };

    fluid.makeComponents({
        "fluid.tests.testOrder":          "fluid.viewComponent", 
        "fluid.tests.subComponent":       "fluid.viewComponent",
        "fluid.tests.invokerComponent":   "fluid.littleComponent",
        "fluid.tests.invokerComponent2":  "fluid.littleComponent",
        "fluid.tests.modelComponent":     "fluid.littleComponent",
        "fluid.tests.dependentModel":     "fluid.littleComponent",
        "fluid.tests.multiResolution":    "fluid.littleComponent",
        "fluid.tests.multiResSub":        "fluid.littleComponent",
        "fluid.tests.multiResSub2":       "fluid.littleComponent",
        "fluid.tests.multiResSub3":       "fluid.littleComponent",
        "fluid.tests.defaultInteraction": "fluid.littleComponent",
        "fluid.tests.popup":              "fluid.littleComponent",
        "fluid.tests.fluid3818head":      "fluid.littleComponent",
        "fluid.tests.fluid3818child":     "fluid.littleComponent",
        "fluid.tests.thatStackHead":      "fluid.littleComponent",
        "fluid.tests.thatStackTail":      "fluid.littleComponent",
        "fluid.tests.reinstantiation":    "fluid.littleComponent",
        "fluid.tests.reinsChild":         "fluid.littleComponent"
        //"fluid.tests.reinsChild2":        "fluid.littleComponent",
        // TODO: GRADES
        //"fluid.tests.resultsPager":       "fluid.littleComponent"
    });

    fluid.defaults("fluid.tests.invokerComponent", {
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
    
    fluid.defaults("fluid.tests.invokerComponent2", {
        template: "Every {0} has {1} {2}(s)",
        invokers: {
            render: "stringRenderer"
        },
        events: {
            testEvent: null
        }
    });
    
    fluid.demands("stringRenderer", "fluid.tests.invokerComponent2", {
        funcName: "fluid.formatMessage",
        args: ["{invokerComponent2}.options.template", "@0"]       
    });

    fluid.demands("sub1", "fluid.tests.testComponent2",
    ["{testComponent2}.container", {"crossDefault": "{testComponent2}.sub2.options.value"}]
    );

    fluid.demands("sub2", "fluid.tests.testComponent2",
    ["{testComponent2}.container", fluid.COMPONENT_OPTIONS]);


    fluid.defaults("fluid.tests.multiResolution", {
        components: {
            resSub: {
                type: "fluid.tests.multiResSub"
            }
        }  
    });

    fluid.demands("fluid.tests.staticResolution", [], 
        {funcName: "fluid.identity",
         args: "{fluid.tests.localFiles}"
        });

    fluid.demands("fluid.tests.multiResSub", "fluid.tests.multiResolution",
       {funcName: "fluid.tests.multiResSub"
       }); // TODO: should this really be necessary?  
       // Perhaps there should be a standard demands "valence" of 1 assigned to the "defaults" configuration. 

    fluid.demands("fluid.tests.multiResSub", ["fluid.tests.multiResolution", "fluid.tests.localFiles"],
        {
            funcName: "fluid.tests.multiResSub2",
            args: {
                localKey1: "localValue1",
                localKey2: "localValue2"
            }  
        });
    
    fluid.demands("fluid.tests.multiResSub", ["fluid.tests.multiResolution", "fluid.tests.localFiles", "fluid.tests.localTest"],
        {
            funcName: "fluid.tests.multiResSub3",
            parent: ["fluid.tests.multiResolution", "fluid.tests.localFiles"],
            args: [{
                localKey1: "testValue1"
            }, null 
            ]
        });
    
    fluid.defaults("fluid.tests.defaultInteraction", {
        components: {
            popup: {
                type: "fluid.tests.popup"
            }
        }  
    });

    fluid.defaults("fluid.tests.popup", {
        resources: {
            template: {
                forceCache: true,
                url: "../html/AutocompleteAddPopup.html"
            }
        }
    });

    fluid.demands("fluid.tests.popup", "fluid.tests.localTest", 
        {
        args: {
            resources: {
                template: {
                    url: "../../html/AutocompleteAddPopup.html"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.stackThroughInvoke", {
        components: {
            resultsPager: {
                type: "fluid.tests.resultsPager",
                options: {
                    dataModel: "{stackThroughInvoke}.model",
                    dataOffset: "results",
                    modelFilter: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "fluid.tests.makeModelFilter",
                            args: ["{stackThroughInvoke}"]
                        }
                    }
                }
            }
        }
    });

    fluid.tests.makeModelFilter = function (parentThat) {
        return function () {
            return {value: parentThat.model.value + 1};
        };
    };

    fluid.tests.resultsPager = function (options) {
        var that = fluid.initLittleComponent("fluid.tests.resultsPager", options);
        fluid.initDependents(that);
        return that;
    };

    fluid.tests.stackThroughInvoke = function (container, options) {
        var that = fluid.initView(options.targetTypeName || "fluid.tests.stackThroughInvoke", container, options);
        that.model = {value: 3};
        that.testFluid3721 = null;
        fluid.initDependents(that);
        return that;
    };

    var fluidIoCTests = new jqUnit.TestCase("Fluid IoC Tests");

    fluid.setLogging(true);

    fluidIoCTests.test("construct", function () {
        expect(2);
        var that = fluid.tests.testComponent("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "testComponent value", that.test2.options.default1);
    });

    fluidIoCTests.test("crossConstruct", function () {
        expect(2);
        var that = fluid.tests.testComponent2("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "Subcomponent 2 default", that.sub1.options.crossDefault);
    });

    fluidIoCTests.test("invokers", function () {
        expect(2);
        var that = fluid.tests.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("invokers with demands", function () {
        expect(2);
        var that = fluid.tests.invokerComponent2();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("Aliasing expander test", function () {
        expect(3);
        var model = {};
        var that = fluid.tests.dependentModel({model: model});
        jqUnit.assertValue("Constructed", that);
        model.pollute = 3;
        jqUnit.assertEquals("Transit 1", 3, that.options.model.pollute);
        jqUnit.assertEquals("Transit 1", 3, that.modelComponent.options.model.pollute);
    });

    
    fluidIoCTests.test("Multi-resolution test", function () {
        var that = fluid.tests.multiResolution();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Standard subcomponent", "fluid.tests.multiResSub", that.resSub.typeName);
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localFiles");
            var that2 = fluid.tests.multiResolution();
            jqUnit.assertValue("Constructed", that2);
            var type2 = "fluid.tests.multiResSub2";
            jqUnit.assertEquals("\"Local\" subcomponent", type2, that2.resSub.typeName);
            var localDemandOptions = $.extend({}, fluid.demands("fluid.tests.multiResSub", 
                ["fluid.tests.multiResolution", "fluid.tests.localFiles"]).args, {targetTypeName: type2});
            jqUnit.assertDeepEq("\"Local\" subcomponent options", localDemandOptions, that2.resSub.options);
        
            fluid.staticEnvironment.testEnvironment = fluid.typeTag("fluid.tests.localTest");
            var that3 = fluid.tests.multiResolution();
            jqUnit.assertValue("Constructed", that3);
            var type3 = "fluid.tests.multiResSub3";
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
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localFiles");
                
            var staticRes = fluid.invoke("fluid.tests.staticResolution");
            jqUnit.assertNotUndefined("Resolved value from static environment", staticRes);
        }
        finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluidIoCTests.test("Basic interaction between defaults and demands", function () {
        var that = fluid.tests.defaultInteraction();
        jqUnit.assertValue("Constructed", that);
        var standardDefaults = fluid.copy(fluid.defaults("fluid.tests.popup"));
        jqUnit.assertDeepEq("Default options", standardDefaults, that.popup.options);
    
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localTest");
            var demands = fluid.demands("fluid.tests.popup", "fluid.tests.localTest");
            var that2 = fluid.tests.defaultInteraction();
            standardDefaults.targetTypeName = "fluid.tests.popup"; // TODO: this floats about a bit 
            var mergedDefaults = $.extend(true, standardDefaults, demands.args);
            jqUnit.assertDeepEq("Merged options", mergedDefaults, that2.popup.options);
        }
        finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluid.registerNamespace("fluid.tests.envTests");

    fluid.tests.envTests.config = {
        viewURLTemplate: "http://titan.atrc.utoronto.ca:5984/%dbName/%view",        
        views: {
            exhibitions: "_design/exhibitions/_view/browse"
        }
    };

    fluidIoCTests.test("Environmental Tests II - FLUID-3818", function () {
        var component = fluid.withEnvironment({
            environmentalValue: $.extend(fluid.typeTag("environmentalValue"),
            { 
                derived: "derivedValue"
            })
        }, function () {
            return fluid.tests.fluid3818head();
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
            config: fluid.tests.envTests.config
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

    fluid.demands("fluid.tests.stackThroughInvokeDeferred", [], 
       {funcName: "fluid.tests.stackThroughInvoke",
        args: ["@0", "@1"]});
    
    fluid.demands("fluid.tests.stackThroughInvoke", [], 
      ["@0", "@1"]);


    fluid.defaults("fluid.tests.stackThroughInvoke", {
        components: {
            resultsPager: {
                type: "fluid.tests.resultsPager",
                options: {
                    dataModel: "{stackThroughInvoke}.model",
                    dataOffset: "results",
                    modelFilter: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "fluid.tests.makeModelFilter",
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
        test("fluid.tests.stackThroughInvoke");
    
        var adjust = fluid.copy(fluid.defaults("fluid.tests.stackThroughInvoke"));
        var expander = adjust.components.resultsPager.options.modelFilter.expander;
        expander.type = "fluid.deferredInvokeCall";
        expander.args[0] = "{stackThroughInvokeDeferred}";
    
        fluid.defaults("fluid.tests.stackThroughInvokeDeferred", adjust);

        test("fluid.tests.stackThroughInvokeDeferred");
    });

    fluidIoCTests.test("thatStack tests", function () {
        var component = fluid.tests.thatStackHead();
        var value = component.child1.getHeadValue();
        jqUnit.assertValue("Correctly resolved head value through invoker", fluid.defaults("fluid.tests.thatStackHead").headValue, value);
    });


    fluid.demands("fluid.tests.freeTarget1", [], 
      { funcName: "fluid.identity",
        args: ["@0", "@1"]});
    
    fluidIoCTests.test("Test Invoke Preservation", function () {
        var model = {};
        var returned = fluid.invoke("fluid.tests.freeTarget1", model);
        jqUnit.assertEquals("Identical model reference", model, returned);
    });
    
    fluid.tests.listenerHolder = function() {
        var that = fluid.initLittleComponent("fluid.tests.listenerHolder");
        that.listener = function(value) {
            that.value = value;
        };
        return that;
    };
    
    fluid.defaults("fluid.tests.eventParent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent: null  
        },
        components: {
            eventChild: {
                type: "fluid.tests.eventChild"
            },
            listenerHolder: {
                type: "fluid.tests.listenerHolder"
            }
        }
    });
    
    fluid.defaults("fluid.tests.eventChild", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent: "{eventParent}.events.parentEvent",
            boiledParent: {
                event: "{eventParent}.events.parentEvent",
                args: ["{eventParent}", "{eventChild}", "{arguments}.0"]
            },
            boiledLocal: {
                event: "localEvent"
            },
            localEvent: null
        },
        listeners: {
            "{eventParent}.events.parentEvent": "{eventParent}.listenerHolder.listener"  
        }
    });
    
    fluid.demands("boiledLocal", "fluid.tests.eventChild", 
      ["{arguments}.0", "{eventChild}"]);
    
    fluidIoCTests.test("FLUID-4135 event injection and boiling", function() {
        var that = fluid.tests.eventParent();
        var child = that.eventChild;
        expect(9);
        jqUnit.assertValue("Child component constructed", child);
        var origArg0 = "Value";

        that.events.parentEvent.addListener(function(arg0) {
            jqUnit.assertEquals("Plain transmission of argument", origArg0, arg0);
        });
        child.events.boiledParent.addListener(function(argParent, argChild, arg0) {
            jqUnit.assertEquals("Injection of resolved parent", that, argParent);
            jqUnit.assertEquals("Injection of self", child, argChild);
            jqUnit.assertEquals("Transmission of original arg0", origArg0, arg0);
        });
        child.events.parentEvent.fire(origArg0);
        jqUnit.assertEquals("Value received in cross-tree injected listener", origArg0, that.listenerHolder.value);
        
        child.events.localEvent.addListener(function(arg0) {
            jqUnit.assertEquals("Plain transmission of argument", origArg0, arg0);
        })
        child.events.boiledLocal.addListener(function(arg0, argChild) {
            jqUnit.assertEquals("Transmission of original arg0", origArg0, arg0);
            jqUnit.assertEquals("Injection of self via demands block", child, argChild);
        });
        child.events.localEvent.fire(origArg0);
    });
    
    function checkValue(message, root, value, paths) {
        fluid.each(paths, function(path) {
            jqUnit.assertEquals(message + " transmitted from root", value, fluid.get(root, path));
        }); 
    }
    
    fluidIoCTests.test("FLUID-4055 reinstantiation test", function() {
        var reins = fluid.tests.reinstantiation();
        var origID = reins.child1.child2.id;
        var instantiator = reins.child1.instantiator;
        var expectedPaths = ["child1.child2.options.value", "child1.child2.otherValue", 
            "child1.child2.child3.options.value", "child1.child2.child3.otherValue"]
        checkValue("Original value", reins, reins.options.headValue, expectedPaths);
        reins.options.headValue = "headValue2"; // in poor style, modify options to verify reexpansion
        reins.child1.options.components.child2 = fluid.copy(fluid.defaults("fluid.tests.reinstantiation").components.child1.options.components.child2);
        instantiator.clearComponent(reins.child1, "child2");
        fluid.initDependent(reins.child1, "child2", instantiator);
        jqUnit.assertNotEquals("Child2 reinstantiated", origID, reins.child1.child2.id);
        checkValue("Changed value", reins, "headValue2", expectedPaths);
    });
    
    fluid.defaults("fluid.tests.mergeChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        mergePolicy: {
            dangerousParams: "noexpand"  
        }
    });
    
    fluid.defaults("fluid.tests.mergeComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            mergeChild: {
                type: "fluid.tests.mergeChild",
                options: {
                    dangerousParams: "{mergeComponent}.nothingUseful"
                }
            }
        }  
    });
    
    fluidIoCTests.test("FLUID-4129 merge policy for component options", function() {
        var mergeComp = fluid.tests.mergeComponent();
        var defs = fluid.defaults("fluid.tests.mergeComponent");
        jqUnit.assertEquals("Dangerous parameters unexpanded",
            defs.components.mergeChild.options.dangerousParams, 
            mergeComp.mergeChild.options.dangerousParams);
    });
    
    fluid.defaults("fluid.tests.defferedInvoke", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    fluid.defaults("fluid.tests.defferedInvokeParent", {
        gradeNames: ["fluid.littleComponent"],
        child: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "fluid.tests.defferedInvoke",
                args: {
                    test: "test option"
                }
            }
        }
    });
    fluid.tests.defferedInvokeParent = fluid.littleComponent("fluid.tests.defferedInvokeParent");
    fluid.demands("fluid.tests.defferedInvoke", "fluid.tests.testContext", {
        mergePaths: ["{options}", {
            test: "test option from demands"
        }]
    });
    
    fluidIoCTests.test("Deferred invoked creator function", function() {
        var parent = fluid.tests.defferedInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option", parent.options.child.options.test);
    });
    fluidIoCTests.test("Deferred invoked creator function with demands", function() {
        fluid.staticEnvironment.currentTestEnvironment = fluid.typeTag("fluid.tests.testContext");
        var parent = fluid.tests.defferedInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option from demands", parent.options.child.options.test);
    });

    
    fluid.defaults("fluid.tests.mergePaths", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        headOption: "headValue1",
        components: {
            child: {
                type: "fluid.tests.mergePathsChild",
                options: {
                    childOption1: "directValue1",
                    childOption2: "directValue2"
                }
            },
            viewChild: {
                type: "fluid.tests.mergePathsViewChild",
                options: {
                    childOption1: "directValue1",
                    childOption2: "{mergePaths}.options.headOption"
                }
            }
        }  
    });
    
    fluid.defaults("fluid.tests.mergePathsChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.defaults("fluid.tests.mergePathsViewChild", {
        gradeNames: ["fluid.viewComponent", "autoInit"]  
    });
    
    fluid.demands("fluid.tests.mergePathsChild", "fluid.tests.mergePaths", {
        options: {
            mergePaths: [
                "{options}", {childOption1: "demandValue1"}, {childOption3: "{mergePaths}.options.headOption"}
                ]
        }
    });
    
    fluid.demands("fluid.tests.mergePathsViewChild", "fluid.tests.mergePaths", [
        "#pager-top", {
            mergePaths: ["{options}", { 
                model:   "{mergePaths}.model", 
                applier: "{mergePaths}.options.applier" 
            }
            ]
        }
    ]);
    
    fluidIoCTests.test("FLUID-4130 mergePaths for demanded component options", function() {
        var model = {key: "Head model"};
        var mergePaths = fluid.tests.mergePaths({model: model});
        var expected = {
            childOption1: "demandValue1",
            childOption2: "directValue2",
            childOption3: "headValue1"
        };
        jqUnit.assertDeepEq("Direct options overriden by demands", 
           expected, fluid.filterKeys(mergePaths.child.options, ["childOption1", "childOption2", "childOption3"]));
        jqUnit.assertEquals("Model delivered directly through mergePaths in demands block for full args (FLUID-4142)", 
            mergePaths.model, mergePaths.viewChild.model);
        var expected2 = {
            childOption1: "directValue1",
            childOption2: "headValue1"
        }
        jqUnit.assertDeepEq("Options delivered from subcomponent defaults through mergePaths",
            expected2, fluid.filterKeys(mergePaths.viewChild.options, ["childOption1", "childOption2"]));
    });
    
    fluid.defaults("fluid.tests.circularity", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            instantiator: "{instantiator}",
            child1: {
                type: "fluid.tests.circChild"
            }
        }
    });
    
    fluid.defaults("fluid.tests.circChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        mergePolicy: {
            instantiator: "noexpand"
        }
    });
    
    fluid.demands("fluid.tests.circChild", "fluid.tests.circularity",
        [{
        instantiator: "{circularity}.instantiator"  
        }] 
    );
    
    fluidIoCTests.test("Tree circularity test", function() {
        try {
            fluid.pushSoftFailure(true);
            expect(3);
            var circular = fluid.tests.circularity();
            // if this test fails, the browser will bomb with a stack overflow 
            jqUnit.assertValue("Circular test delivered instantiator", circular.child1.options.instantiator);
            
            var rawDefaults = fluid.rawDefaults("fluid.tests.circChild");
            delete rawDefaults.mergePolicy;
            try {
                var circular2 = fluid.tests.circularity();
            }
            catch (e) {
                jqUnit.assertTrue("Exception caught in circular instantiation", true);
            }
            try {
                fluid.expandOptions(circular, circular);
            }
            catch (e) {
                jqUnit.assertTrue("Exception caught in circular expansion", true);
            }
        }
        finally {
            fluid.pushSoftFailure(-1);  
        }
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
