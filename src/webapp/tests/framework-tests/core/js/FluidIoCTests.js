/*
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

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
        [
            "{testComponent}.container", 
            {"default1": "{testComponent}.options.default1"}
        ]);


    fluid.defaults("fluid.tests.modelComponent", {
        gradeNames: ["fluid.modelComponent", "autoInit"]
    });


    fluid.defaults("fluid.tests.dependentModel", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
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
        gradeNames: ["fluid.littleComponent", "autoInit"],
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
        gradeNames: ["fluid.littleComponent", "autoInit"],
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
    
    fluid.defaults("fluid.tests.parentView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            defaultedChildView: {
                type: "fluid.tests.subComponent",
                container: "{parentView}.dom.defaultedChildContainer"
            },
            demandedChildView: {
                type: "fluid.tests.childView"
            }
        },
        selectors: {
            defaultedChildContainer: ".flc-tests-parentView-defaultedChildContainer",
            demandedChildContainer: ".flc-tests-parentView-demandedChildContainer"
        }
    });
    
    fluid.demands("fluid.tests.childView", "fluid.tests.parentView", {
        container: "{parentView}.dom.demandedChildContainer",
        options: {
            cat: "meow"
        }
    });

    fluid.makeComponents({
        "fluid.tests.testOrder":          "fluid.viewComponent", 
        "fluid.tests.subComponent":       "fluid.viewComponent",
        "fluid.tests.multiResSub":        "fluid.littleComponent",
        "fluid.tests.multiResSub2":       "fluid.littleComponent",
        "fluid.tests.multiResSub3":       "fluid.littleComponent",
        "fluid.tests.fluid3818child":     "fluid.littleComponent",
        "fluid.tests.thatStackTail":      "fluid.littleComponent",
        "fluid.tests.reinsChild":         "fluid.littleComponent",
        "fluid.tests.childView":          "fluid.viewComponent"
    });

    fluid.defaults("fluid.tests.invokerComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
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
        gradeNames: ["fluid.littleComponent", "autoInit"],
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

    fluid.demands("sub1", "fluid.tests.testComponent2", [
        "{testComponent2}.container",
        {"crossDefault": "{testComponent2}.sub2.options.value"}
    ]);

    fluid.demands("sub2", "fluid.tests.testComponent2",
        ["{testComponent2}.container", fluid.COMPONENT_OPTIONS]);


    fluid.defaults("fluid.tests.multiResolution", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            resSub: {
                type: "fluid.tests.multiResSub"
            }
        }  
    });

    fluid.demands("fluid.tests.staticResolution", [], {
        funcName: "fluid.identity",
        args: "{fluid.tests.localFiles}"
    });

    fluid.demands("fluid.tests.multiResSub", "fluid.tests.multiResolution", {
        funcName: "fluid.tests.multiResSub"
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
            args: [{
                localKey1: "testValue1"
            }, null]
        });
    
    fluid.defaults("fluid.tests.defaultInteraction", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            popup: {
                type: "fluid.tests.popup"
            }
        }  
    });

    fluid.defaults("fluid.tests.popup", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resources: {
            template: {
                forceCache: true,
                url: "../html/AutocompleteAddPopup.html"
            }
        }
    });

    fluid.demands("fluid.tests.popup", "fluid.tests.localTest", {
        args: {
            resources: {
                template: {
                    url: "../../html/AutocompleteAddPopup.html"
                }
            }
        }
    });



    var fluidIoCTests = new jqUnit.TestCase("Fluid IoC Tests");

    fluid.setLogging(true);

    fluidIoCTests.test("construct", function () {
        jqUnit.expect(2);
        var that = fluid.tests.testComponent("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "testComponent value", that.test2.options.default1);
    });

    fluidIoCTests.test("crossConstruct", function () {
        jqUnit.expect(2);
        var that = fluid.tests.testComponent2("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "Subcomponent 2 default", that.sub1.options.crossDefault);
    });

    fluidIoCTests.test("invokers", function () {
        jqUnit.expect(2);
        var that = fluid.tests.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("invokers with demands", function () {
        jqUnit.expect(2);
        var that = fluid.tests.invokerComponent2();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });

    fluidIoCTests.test("Aliasing expander test", function () {
        jqUnit.expect(3);
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
            fluid.testUtils.assertLeftHand("\"Local\" subcomponent options", localDemandOptions, that2.resSub.options);
        
            fluid.staticEnvironment.testEnvironment = fluid.typeTag("fluid.tests.localTest");
            var that3 = fluid.tests.multiResolution();
            jqUnit.assertValue("Constructed", that3);
            var type3 = "fluid.tests.multiResSub3";
            jqUnit.assertEquals("\"Test\" subcomponent", type3, that3.resSub.typeName);
            var expectedOptions = {
                localKey1: "testValue1"
    //             targetTypeName: type3 // This floats about a bit as we change policy on "typeName"
            };
            fluid.testUtils.assertLeftHand("\"Test\" subcomponent merged options", expectedOptions, that3.resSub.options);

        } finally {
            delete fluid.staticEnvironment.testEnvironment;
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluidIoCTests.test("Static resolution test", function () {
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localFiles");
                
            var staticRes = fluid.invoke("fluid.tests.staticResolution");
            jqUnit.assertNotUndefined("Resolved value from static environment", staticRes);
        } finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluidIoCTests.test("Basic interaction between defaults and demands", function () {
        var that = fluid.tests.defaultInteraction();
        jqUnit.assertValue("Constructed", that);
        var standardDefaults = fluid.copy(fluid.defaults("fluid.tests.popup"));
        fluid.clearLifecycleFunctions(standardDefaults);
        jqUnit.assertDeepEq("Default options", standardDefaults, that.popup.options);
    
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localTest");
            var demands = fluid.demands("fluid.tests.popup", "fluid.tests.localTest");
            var that2 = fluid.tests.defaultInteraction();
            standardDefaults.targetTypeName = "fluid.tests.popup"; // TODO: this floats about a bit 
            var mergedDefaults = $.extend(true, standardDefaults, demands.args);
            jqUnit.assertDeepEq("Merged options", mergedDefaults, that2.popup.options);
        } finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });
    
    fluid.defaults("fluid.tests.autoGradedComponent", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            anEvent: null
        }
    });
    
    fluid.defaults("fluid.tests.gradedComponent", {
        gradeNames: "fluid.viewComponent",
        events: {
            anEvent: null
        }
    });
    
    fluid.defaults("fluid.tests.ungradedComponent", {
        events: {
            anEvent: null
        }
    });
    
    fluid.tests.gradedComponent = function (container, options) {
        var that = fluid.initView("fluid.tests.gradedComponent", container, options);
        return that; 
    };
    
    fluid.tests.ungradedComponent = function (container, options) {
        var that = fluid.initView("fluid.tests.ungradedComponent", container, options);
        return that; 
    };
    
    fluid.defaults("fluid.tests.gradeResolutionParent", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            type: "fluid.tests.gradeResolutionChild",
            container: "{gradeResolutionParent}.container"
        }
    });
    
    fluid.tests.gradeTestTypes = ["fluid.tests.gradedComponent", "fluid.tests.autoGradedComponent", "fluid.tests.ungradedComponent"];
    
    function testEvent(message, component) {
        jqUnit.expect(1);
        component.events.anEvent.addListener(function () {
            jqUnit.assert("Event fired");
        });
        component.events.anEvent.fire();
    }
    
    fluidIoCTests.test("Grade resolution test", function () {
        fluid.each(fluid.tests.gradeTestTypes, function (typeName) {
            var that = fluid.invokeGlobalFunction(typeName, ["#pager-top"]);
            testEvent("Construction of " + typeName, that);
        });
    });

    fluid.tests.listenerMergingPreInit = function (that) {
        that.eventFired = function (eventName) {
            that[eventName] = true;
        };
    };
       
    fluid.defaults("fluid.tests.listenerMerging", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "fluid.tests.listenerMergingPreInit",
        listeners: {
            eventOne: "{fluid.tests.listenerMerging}.eventFired",
            eventTwo: "{fluid.tests.listenerMerging}.eventFired"
        },
        events: {
            eventOne: null,
            eventTwo: null,
            eventThree: null
        }
    });

    fluidIoCTests.test("Listener Merging Tests: FLUID-4196", function () {
        var threeFired = false;
        var that = fluid.tests.listenerMerging({
            listeners: {
                eventThree: function () {threeFired = true;}
            }
        });
        
        that.events.eventThree.fire();
        jqUnit.assertTrue("Event three listener notified", threeFired);
        
        that.events.eventTwo.fire("twoFired");
        jqUnit.assertTrue("Event two listener notified", that.twoFired);
    });
    
    fluid.tests.initLifecycle = function (that) {
        that.initted = true;  
    };
    
    fluid.defaults("fluid.tests.lifecycleTest", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: "fluid.tests.initLifecycle"  
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
            environmentalValue: $.extend(fluid.typeTag("environmentalValue"), { 
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
            var resolved = fluid.resolveEnvironment(urlBuilder, {fetcher: fluid.makeEnvironmentFetcher()});
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

    fluid.demands("fluid.tests.stackThroughInvokeDeferred", [], {
        funcName: "fluid.tests.stackThroughInvoke",
        args: ["@0", "@1"]
    });
    
    fluid.demands("fluid.tests.stackThroughInvoke", [], ["@0", "@1"]);


    fluid.defaults("fluid.tests.stackThroughInvoke", {
        components: {
            resultsPager: {
                type: "fluid.tests.resultsPager",
                options: {
//                    dataModel: "{stackThroughInvoke}.model",
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

    fluid.defaults("fluid.tests.deferredInvoke", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.defaults("fluid.tests.deferredInvokeParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        child: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "fluid.tests.deferredInvoke",
                args: {
                    test: "test option"
                }
            }
        }
    });
    
    fluid.demands("fluid.tests.deferredInvoke", "fluid.tests.testContext", {
        mergeOptions: {
            test: "test option from demands"
        }
    });
    
    fluidIoCTests.test("Deferred invoked creator function", function () {
        var parent = fluid.tests.deferredInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option", parent.options.child.options.test);
    });
    
    fluidIoCTests.test("Deferred invoked creator function with demands", function () {
        fluid.staticEnvironment.currentTestEnvironment = fluid.typeTag("fluid.tests.testContext");
        var parent = fluid.tests.deferredInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option from demands", parent.options.child.options.test);
    });


    fluid.demands("fluid.tests.freeTarget1", [], {
        funcName: "fluid.identity",
        args: ["@0", "@1"]
    });
    
    fluidIoCTests.test("Test Invoke Preservation", function () {
        var model = {};
        var returned = fluid.invoke("fluid.tests.freeTarget1", model);
        jqUnit.assertEquals("Identical model reference", model, returned);
    });
    
    fluid.tests.listenerHolder = function () {
        var that = fluid.initLittleComponent("fluid.tests.listenerHolder");
        that.listener = function (value) {
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
    
    fluid.demands("boiledLocal", "fluid.tests.eventChild", [
        "{arguments}.0",
        "{eventChild}"
    ]);
    
    fluidIoCTests.test("FLUID-4135 event injection and boiling", function () {
        var that = fluid.tests.eventParent();
        var child = that.eventChild;
        jqUnit.expect(9);
        jqUnit.assertValue("Child component constructed", child);
        var origArg0 = "Value";

        that.events.parentEvent.addListener(function (arg0) {
            jqUnit.assertEquals("Plain transmission of argument", origArg0, arg0);
        });
        child.events.boiledParent.addListener(function (argParent, argChild, arg0) {
            jqUnit.assertEquals("Injection of resolved parent", that, argParent);
            jqUnit.assertEquals("Injection of self", child, argChild);
            jqUnit.assertEquals("Transmission of original arg0", origArg0, arg0);
        });
        child.events.parentEvent.fire(origArg0);
        jqUnit.assertEquals("Value received in cross-tree injected listener", origArg0, that.listenerHolder.value);
        
        child.events.localEvent.addListener(function (arg0) {
            jqUnit.assertEquals("Plain transmission of argument", origArg0, arg0);
        });
        child.events.boiledLocal.addListener(function (arg0, argChild) {
            jqUnit.assertEquals("Transmission of original arg0", origArg0, arg0);
            jqUnit.assertEquals("Injection of self via demands block", child, argChild);
        });
        child.events.localEvent.fire(origArg0);
    });
    
    // Simpler demonstration matching docs, also using "scoped event binding"
    fluid.defaults("fluid.tests.eventParent2", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent: null
        },
        components: {
            eventChild: {
                type: "fluid.tests.eventChild2"
            }
        }
    });
    
    fluid.defaults("fluid.tests.eventChild2", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent: null
        }
    });

    fluid.demands("fluid.tests.eventChild2", "fluid.tests.eventParent2", {
        mergeOptions: {
            events: {
                parentEvent: "{eventParent2}.events.parentEvent"
            }
        }
    });
    
    fluidIoCTests.test("FLUID-4135 event injection with scope", function () {
        var that = fluid.tests.eventParent2();
        jqUnit.expect(1);
        that.events.parentEvent.addListener(function () {
            jqUnit.assert("Listener fired");  
        });
        that.eventChild.events.parentEvent.fire();
        
    });
    
    fluid.tests.reinsNonComponent = function () {
        return {
            key: "Non-component material"
        };
    };
    
    fluid.defaults("fluid.tests.unexpectedReturn", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            gchild: {
                type: "fluid.tests.reinsChild2"
            }
        },
        returnedPath: "gchild"
    });
    
    fluid.defaults("fluid.tests.reinstantiation", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        headValue: "headValue",
        components: {
            headChild: {
                type: "fluid.tests.reinsChild"  
            },
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
                                    },
                                    child4: {
                                        type: "fluid.tests.reinsNonComponent"
                                    },
                                    // This duplication tests FLUID-4166
                                    child5: "{reinstantiation}.headChild",
                                    child6: "{reinstantiation}.headChild",
                                    child7: {
                                        type: "fluid.tests.unexpectedReturn"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.demands("fluid.tests.reinsChild2", "fluid.tests.reinstantiation", [
        fluid.COMPONENT_OPTIONS,
        "{reinstantiation}.options.headValue" 
    ]);
    
    fluid.tests.reinsChild2 = function (options, otherValue) {
        var that = fluid.initLittleComponent("fluid.tests.reinsChild2", options);
        fluid.initDependents(that);
        that.otherValue = otherValue;
        return that;
    };
    
    function checkValue(message, root, value, paths) {
        fluid.each(paths, function (path) {
            jqUnit.assertEquals(message + " transmitted from root", value, fluid.get(root, path));
        }); 
    }
    
    fluidIoCTests.test("FLUID-4055 reinstantiation test", function () {
        var reins = fluid.tests.reinstantiation();
        var origID = reins.child1.child2.id;
        var instantiator = reins.child1.instantiator;
        var expectedPaths = ["child1.child2.options.value", "child1.child2.otherValue", 
            "child1.child2.child3.options.value", "child1.child2.child3.otherValue"];
        checkValue("Original value", reins, reins.options.headValue, expectedPaths);
        reins.options.headValue = "headValue2"; // in poor style, modify options to verify reexpansion
        reins.child1.options.components.child2 = fluid.copy(fluid.defaults("fluid.tests.reinstantiation").components.child1.options.components.child2);
        instantiator.clearComponent(reins.child1, "child2");
        fluid.initDependent(reins.child1, "child2", instantiator);
        jqUnit.assertNotEquals("Child2 reinstantiated", origID, reins.child1.child2.id);
        checkValue("Changed value", reins, "headValue2", expectedPaths);
    });
    
    fluid.defaults("fluid.tests.misclearTop", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            middle: {
                type: "fluid.tests.misclearMiddle"
            }  
        }
    });
    
    fluid.defaults("fluid.tests.misclearMiddle", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            leaf: {
                type: "fluid.tests.misclearLeaf"
            }  
        },
        returnedPath: "leaf"
    });
    
    fluid.defaults("fluid.tests.misclearLeaf", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "fluid.tests.misclearLeaf.init"
    });
    
    fluid.tests.misclearLeaf.init = function (that) {
        that.uncreated = fluid.typeTag("uncreated");
    };
    
    fluidIoCTests.test("FLUID-4179 unexpected material in clear test", function () {
        jqUnit.expect(1);
        var that = fluid.tests.misclearTop();
        jqUnit.assertValue("Component successfully constructed", that);
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
    
    fluidIoCTests.test("FLUID-4129 merge policy for component options", function () {
        var mergeComp = fluid.tests.mergeComponent();
        var defs = fluid.defaults("fluid.tests.mergeComponent");
        jqUnit.assertEquals("Dangerous parameters unexpanded",
            defs.components.mergeChild.options.dangerousParams, 
            mergeComp.mergeChild.options.dangerousParams);
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
            mergeAllOptions: [
                "{options}", {childOption1: "demandValue1"}, {childOption3: "{mergePaths}.options.headOption"}
            ]
        }
    });
    
    fluid.demands("fluid.tests.mergePathsViewChild", "fluid.tests.mergePaths", [
        "#pager-top", {
            mergeOptions: { 
                model:   "{mergePaths}.model", 
                applier: "{mergePaths}.options.applier" 
            }
        }
    ]);
    
    fluidIoCTests.test("FLUID-4130 mergeOptions for demanded component options", function () {
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
        };
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
        }]);
    
    fluid.tests.makeInitFunction = function (name) {
        return function (that) {
            that.initFunctionRecord.push(name);
        };
    };
    
    fluid.tests.createInitFunctionsMembers = function (that) {
        that.mainEventListener = function () {
            that.initFunctionRecord.push("mainEventListener");
        };
        that.initFunctionRecord = [];
    };
    
    // Test FLUID-4162 by creating namespace before component of the same name
    fluid.registerNamespace("fluid.tests.initFunctions");
    
    fluid.tests.initFunctions.initRecordingComponent = function (that) {
        var parent = that.options.parent;
        parent.initFunctionRecord.push(that.options.name);
    };
    
    fluid.defaults("fluid.tests.initFunctions.recordingComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        mergePolicy: {
            parent: "nomerge"  
        },
        postInitFunction: "fluid.tests.initFunctions.initRecordingComponent"
    });
    
    fluid.defaults("fluid.tests.initFunctions", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: ["fluid.tests.createInitFunctionsMembers", fluid.tests.makeInitFunction("preInitFunction")],
        postInitFunction: fluid.tests.makeInitFunction("postInitFunction"),
        finalInitFunction: fluid.tests.makeInitFunction("finalInitFunction"),
        events: {
            mainEvent: null
        },
        listeners: {
            mainEvent: "{initFunctions}.mainEventListener"
        },
        components: {
            initTimeComponent: {
                type: "fluid.tests.initFunctions.recordingComponent",
                options: {
                    parent: "{initFunctions}",
                    name: "initTimeComponent"
                }
            },
            eventTimeComponent: {
                type: "fluid.tests.initFunctions.recordingComponent",
                createOnEvent: "mainEvent",
                options: {
                    parent: "{initFunctions}",
                    name: "eventTimeComponent"  
                } 
            },
            demandsInitComponent: {
                type: "fluid.tests.initFunctions.demandsInitComponent",
                options: {
                    components: {
                        parent: "{initFunctions}"
                    }
                }
            }
            
        }
    });
    
    fluid.defaults("fluid.tests.initFunctions.demandsInitComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.tests.initFunctions.demandsInitComponent.finalInitFunction = function (that) {
        that.parent.initFunctionRecord.push("finalInitFunctionSubcomponent");
    };
    fluid.demands("demandsInitComponent", "fluid.tests.initFunctions", {
        options: {
            finalInitFunction: fluid.tests.initFunctions.demandsInitComponent.finalInitFunction
        }
    });
    
    fluidIoCTests.test("Component lifecycle test", function () {
        var testComp = fluid.tests.initFunctions();
        testComp.events.mainEvent.fire();
        var expected = [
            "preInitFunction",
            "postInitFunction",
            "initTimeComponent",
            "finalInitFunctionSubcomponent",
            "finalInitFunction",
            "mainEventListener",
            "eventTimeComponent"
        ];
        jqUnit.assertDeepEq("Expected initialisation sequence", testComp.initFunctionRecord, expected); 
    });
    
    fluid.defaults("fluid.tests.createOnEvent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            afterRender: null  
        },
        components: {
            markupRenderer: {
                type: "fluid.tests.createOnEvent.iframe",
                options: {
                    events: {
                        afterRender: "{createOnEvent}.events.afterRender"  
                    }
                }
            },
            uiOptionsBridge: {
                type: "fluid.tests.createOnEvent.uiOptionsBridge",
                createOnEvent: "afterRender"
            }
        }
    });
    
    fluid.defaults("fluid.tests.createOnEvent.iframe", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.tests.createOnEvent.iframe.finalInit"  
    });
    
    fluid.tests.createOnEvent.iframe.finalInit = function (that) {
        that.events.afterRender.fire();
    };
    
    fluid.defaults("fluid.tests.createOnEvent.uiOptionsBridge", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluidIoCTests.test("FLUID-4290 test: createOnEvent sequence corruption", function () {
        jqUnit.expect(1);
        var testComp = fluid.tests.createOnEvent();
        jqUnit.assert("Component successfully constructed");
    });

    fluid.tests.guidedChildInit = function (that) {
       // awful, illegal, side-effect-laden init function :P
        that.options.parent.constructRecord.push(that.options.index);
    };
   
    fluid.defaults("fluid.tests.guidedChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        mergePolicy: {
            parent: "nomerge",
            mergeAllOptions: "nomerge" // TODO: This should not be necessary!!
        },
        finalInitFunction: "fluid.tests.guidedChildInit"
    });
    
    fluid.demands("fluid.tests.guidedChild", "fluid.tests.guidedParent", {
        mergeOptions:  {parent: "{guidedParent}"}
    });

    fluid.tests.guidedParentInit = function (that) {
        that.constructRecord = [];  
    };
   
    fluid.defaults("fluid.tests.guidedParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            compn: {
                type: "fluid.tests.guidedChild",
                options: {
                    index: 4
                },
                priority: "last"
            },
            comp5: {
                type: "fluid.tests.guidedChild",
                options: {
                    index: 2
                },
                priority: 5
            },
            comp0: {
                type: "fluid.tests.guidedChild",
                options: {
                    index: 3 
                }
            },
            compf: {
                type: "fluid.tests.guidedChild",
                options: {
                    index: 1  
                },
                priority: "first"
            }
        },
        preInitFunction: "fluid.tests.guidedParentInit"
    });
   
    fluidIoCTests.test("Guided instantiation test", function () {
        var testComp = fluid.tests.guidedParent();
        jqUnit.assertDeepEq("Children constructed in sort order", [1, 2, 3, 4], testComp.constructRecord);
    });
    
    fluidIoCTests.test("Tree circularity test", function () {
        try {
            fluid.pushSoftFailure(true);
            jqUnit.expect(3);
            var circular = fluid.tests.circularity();
            // if this test fails, the browser will bomb with a stack overflow 
            jqUnit.assertValue("Circular test delivered instantiator", circular.child1.options.instantiator);
            
            var rawDefaults = fluid.rawDefaults("fluid.tests.circChild");
            delete rawDefaults.mergePolicy;
            try {
                var circular2 = fluid.tests.circularity();
            } catch (e) {
                jqUnit.assert("Exception caught in circular instantiation");
            }
            try {
                fluid.expandOptions(circular, circular);
            } catch (e2) {
                jqUnit.assert("Exception caught in circular expansion");
            }
        } finally {
            fluid.pushSoftFailure(-1);  
        }
    });
    
    
    /** This test case reproduces a circular reference condition found in the Flash
     *  implementation of the uploader, which the framework did not properly detect */
     
    fluid.registerNamespace("fluid.tests.circular");
    
    fluid.defaults("fluid.tests.circular.strategy", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            local: {
                type: "fluid.tests.circular.local"
            },
            engine: {
                type: "fluid.tests.circular.engine"
            }
        }
    });
    
    fluid.defaults("fluid.tests.circular.swfUpload", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.tests.circular.initEngine = function (that) {
      // This line, which is a somewhat illegal use of an invoker before construction is complete,
      // will trigger failure
      //  fluid.fail("Thing");
        that.bindEvents();
    };
    
    fluid.defaults("fluid.tests.circular.engine", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.tests.circular.initEngine",
        invokers: {            
            bindEvents: "fluid.tests.circular.eventBinder"
        },
        components: {
            swfUpload: {
                type: "fluid.tests.circular.swfUpload"
            }
        }
    });
    
    fluid.tests.circular.eventBinder = fluid.identity;
    
    fluid.demands("fluid.tests.circular.eventBinder", [
        "fluid.tests.circular.engine"
    ], {
        args: [
            "{strategy}.local"
        ]
    });

    fluid.defaults("fluid.tests.circular.local", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.demands("fluid.tests.circular.local", "fluid.tests.circular.strategy", {
        args: [
            "{engine}.swfUpload",
            fluid.COMPONENT_OPTIONS
        ]
    });
    
    fluidIoCTests.test("Advanced circularity test I", function () {
        // If this test fails, it will bomb the browser with an infinite recursion
        try {
            fluid.pushSoftFailure(true);
            jqUnit.expect(1);
            var comp = fluid.tests.circular.strategy();
        } catch (e) {
            jqUnit.assert("Circular construction guarded");  
        } finally {
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
            expanded = fluid.expander.expandLight(dependencies, {fetcher: fluid.makeEnvironmentFetcher()});
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
    
        fluid.testUtils.assertCanoniseEqual("Accumulated resourceSpecs", requiredSpecs, resourceSpecs, fluid.testUtils.canonicaliseFunctions);
    
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

    fluid.tests.invokerGrandParent = function (options) {
        var that = fluid.initLittleComponent("fluid.tests.invokerGrandParent", options);
        fluid.initDependents(that);
        return that;
    };
    
    fluid.defaults("fluid.tests.invokerGrandParent", {
        gradeNames: "fluid.littleComponent",
        components: {
            invoker1: {
                type: "fluid.tests.invokerParent"
            },
            invokerwrapper: {
                type: "fluid.tests.invokerParentWrapper"
            }
        }
    });
    
    fluid.defaults("fluid.tests.invokerParent", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: {
            testValue: 1
        },
        invokers: {
            checkTestValue: "checkTestValue"
        }
    });
    
    fluid.defaults("fluid.tests.invokerParentWrapper", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        components: {
            invoker2: {
                type: "fluid.tests.invokerParent"
            }
        }
    });
    fluid.demands("checkTestValue", "fluid.tests.invokerParent", {
        funcName: "fluid.tests.checkTestValue",
        args: "{invokerParent}.model"
    });
    fluid.tests.checkTestValue = function (model) {
        return model.testValue;
    };

    fluidIoCTests.test("Invoker resolution tests", function () {
        var that = fluid.tests.invokerGrandParent();
        var newValue = 2;
        that.invokerwrapper.invoker2.applier.requestChange("testValue", newValue);
        jqUnit.assertEquals("The invoker for second subcomponent should return the value from its parent", 
            newValue, that.invokerwrapper.invoker2.checkTestValue());
    });
    
    fluid.defaults("fluid.tests.news.parent", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: { test: "test" },
        components: {
            child: {
                type: "fluid.tests.news.child",
                model: "{parent}.model"
            }
        }
    });

    fluid.defaults("fluid.tests.news.child", {
        gradeNames: ["fluid.modelComponent", "autoInit"]
    });
      
    fluidIoCTests.test("FLUID-4285 test - prevent unencoded options", function () {
        try {
            jqUnit.expect(1);
            fluid.pushSoftFailure(true);
            var parent = fluid.tests.news.parent();
        } catch (e) {
            jqUnit.assert("Caught exception in constructing stray options component");
        } finally {
            fluid.pushSoftFailure(-1);  
        }
    });


    /************************************
     * DOM Binder IoC Resolution Tests. *
     ************************************/
     
    var checkChildContainer = function (parent, child, containerName, configName) {
        jqUnit.assertEquals("The child component should have the correct container sourced from the parent's DOM Binder when configured in " + configName,
            parent.locate(containerName)[0], child.container[0]);
    };
    
    fluidIoCTests.test("Child view's container resolved by IoC from parent's DOM Binder", function () {
        var parent = fluid.tests.parentView(".flc-tests-parentView-container");
        checkChildContainer(parent, parent.defaultedChildView, "defaultedChildContainer", "defaults");
        checkChildContainer(parent, parent.demandedChildView, "demandedChildContainer", "demands");
    });

})(jQuery); 
