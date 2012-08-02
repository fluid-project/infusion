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

    fluid.makeComponents({
        "fluid.tests.multiResSub":        "fluid.littleComponent",
        "fluid.tests.multiResSub2":       "fluid.littleComponent",
        "fluid.tests.multiResSub3":       "fluid.littleComponent",
        "fluid.tests.fluid3818child":     "fluid.littleComponent",
        "fluid.tests.thatStackTail":      "fluid.littleComponent",
        "fluid.tests.reinsChild":         "fluid.littleComponent"
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
        // TODO: boiledParent.fire should not fire to eventParent! boiledParent listeners all expect 3 arguments,
        // eventParent listeners just expect 1. We actually probably never wanted to boil events at all, only to boil
        // listeners. In all "composite" event cases, (including boiling, multi-events, etc.) the events will not share
        // firing and behave as if the composite part was just a listener spec. 
        // Recommend everyone to use boiled listeners for all composite cases? I guess use an event in the case
        // that multiple listeners will want to share the config.
        // So - the only shared case is eName: thing or eName: {event: thing} with NOTHING else
        
        child.events.localEvent.addListener(function (arg0) {
            jqUnit.assertEquals("Plain transmission of argument", origArg0, arg0);
        });
        child.events.boiledLocal.addListener(function (arg0, argChild) {
            jqUnit.assertEquals("Transmission of original arg0", origArg0, arg0);
            jqUnit.assertEquals("Injection of self via demands block", child, argChild);
        });
        child.events.localEvent.fire(origArg0);
    });
    
    fluid.defaults("fluid.tests.eventParent3", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent1: null,
            parentEvent2: null  
        },
        components: {
            eventChild: {
                type: "fluid.tests.eventChild3"
            }
        }
    });
    
    fluid.defaults("fluid.tests.eventChild3", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            boiledDouble: {
                events: {
                   event1: "{eventParent3}.events.parentEvent1",
                   event2: "{eventParent3}.events.parentEvent2"
                },
                args: ["{arguments}.event1.0", "{arguments}.event2.1"]
            },
            relayEvent: null
        },
        listeners: {
            boiledDouble: [
                 "fluid.tests.globalListener", // This tests FLUID-4337
                 {                             // This tests FLUID-4398
                     listener: "{eventChild3}.events.relayEvent",
                     args: "{arguments}.1" 
                 }
                 ]
        }
    });
    
    fluid.tests.globalListener = function(parent, arg2) {
        if (!parent.listenerRecord) {
            parent.listenerRecord = [];
        };
        parent.listenerRecord.push(arg2);
    };
    
    fluidIoCTests.test("FLUID-4398 event and listener boiling", function () {
        var that = fluid.tests.eventParent3();
        var received = {};
        that.eventChild.events.relayEvent.addListener(function(arg) {
            received.arg = arg;
        });
        that.events.parentEvent1.fire(that); // first event does nothing
        jqUnit.assertNoValue("No event on first fire", that.listenerRecord);
        jqUnit.assertNoValue("No relay on first fire", received.arg);
        that.events.parentEvent2.fire(3, 4);
        jqUnit.assertDeepEq("Received boiled argument after dual fire", [4], that.listenerRecord);
        jqUnit.assertEquals("Received relayed fire after dual fire", 4, received.arg);
    });
    
    fluid.defaults("fluid.tests.eventBoiling2", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            baseEvent: null,
            baseEvent2: null,
            boiledEvent: {
                event: "baseEvent",
            }
        },
        listeners: {
            baseEvent2: "{eventBoiling2}.events.boiledEvent"
        }      
    });
    
    fluidIoCTests.test("FLUID-4398 further event boiling tests", function () {
        var count = 0;
        // Tests i) inter-event reference using unqualified local names
        // ii) listener reference to a non-composite boiled event without using "fire" suffix
        var baseListener = function() {
           ++ count;
        };
        var that = fluid.tests.eventBoiling2({
            listeners: {
                baseEvent: baseListener
            }
        });
        that.events.baseEvent2.fire();
        jqUnit.assertEquals("Double relay to base event", 1, count);
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

    /** FLUID-4055 - reinstantiation test **/
    
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
    
    fluid.defaults("fluid.tests.refChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
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
                                    },
                                    child8: {
                                        type: "fluid.tests.reinsChild2",
                                        options: {
                                           // This reference tests FLUID-4338
 // nb test is currently through a slightly slimy means - without fix for 4338, the 
 // component is triggered through "ginger exploration" of its parent rather than being
 // found directly, and then triggers a circularity error.
                                            value: "{child2}.options.value"
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
            jqUnit.assertEquals(message + " transmitted from root to path " + path, value, fluid.get(root, path));
        }); 
    }
    
    fluidIoCTests.test("FLUID-4055 reinstantiation test", function () {
        var reins = fluid.tests.reinstantiation();
        var origID = reins.child1.child2.id;
        var instantiator = reins.child1.instantiator;
        var expectedPaths = [
            "child1.child2.options.value", 
            "child1.child2.otherValue", 
            "child1.child2.child3.options.value", 
            "child1.child2.child3.otherValue",
            "child1.child2.child8.options.value"
            ];
        checkValue("Original value", reins, reins.options.headValue, expectedPaths);
        reins.options.headValue = "headValue2"; // in poor style, modify options to verify reexpansion
        reins.child1.options.components.child2 = fluid.copy(fluid.defaults("fluid.tests.reinstantiation").components.child1.options.components.child2);
        instantiator.clearComponent(reins.child1, "child2");
        fluid.initDependent(reins.child1, "child2", instantiator);
        jqUnit.assertNotEquals("Child2 reinstantiated", origID, reins.child1.child2.id);
        checkValue("Changed value", reins, "headValue2", expectedPaths);
    });
    
    /** FLUID-4711 - corruption in clear with injected material of longer scope **/
    
    fluid.defaults("fluid.tests.clearParent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            requestStart: null
        },
        components: {
            longChild: {
                type: "fluid.tests.refChild"
            },
            shortParent: {
                type: "fluid.tests.refChild",
                createOnEvent: "requestStart",
                options: {
                    components: {
                         clearParent: "{clearParent}"
                    }
                }
            }
        }  
    });
    
    fluidIoCTests.test("FLUID-4711 reinstantiation test", function () {
        var reins = fluid.tests.clearParent();
        reins.events.requestStart.fire();
        jqUnit.assertValue("Child components instantiated and injected", reins.shortParent.clearParent.longChild);
        reins.events.requestStart.fire();
        jqUnit.assertValue("Long lifetime component has survived", reins.longChild);
    });
    
    /** FLUID-4179 unexpected material in clear test **/
    
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
    
    /** FLUID-4129 - merge policy for component options test **/
    
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

    /** Component lifecycle functions and merging test **/
    
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
    
    /** FLUID-4290 - createOnEvent sequence corruption test **/
    
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

    /** Guided component sequence (priority field without createOnEvent **/

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
    
    /** Tree circularity test (early detection of stack overflow **/
        
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
            instantiator: "nomerge"
        }
    });
    
    fluid.demands("fluid.tests.circChild", "fluid.tests.circularity",
        [{
            instantiator: "{circularity}.instantiator"  
        }]);
    
    fluidIoCTests.test("Tree circularity test", function () {
        try {
            fluid.pushSoftFailure(true);
            jqUnit.expect(2);
            var circular = fluid.tests.circularity();
            // if this test fails, the browser will bomb with a stack overflow 
            jqUnit.assertValue("Circular test delivered instantiator", circular.child1.options.instantiator);
            
            // This part of the test can no longer run since FLUID-4563 no longer allows us to dynamically modify options
            // var rawDefaults = fluid.rawDefaults("fluid.tests.circChild");
            // delete rawDefaults.mergePolicy;
            // try {
            //     var circular2 = fluid.tests.circularity();
            // } catch (e) {
            //     jqUnit.assert("Exception caught in circular instantiation");
            //}
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

    /** Correct resolution of invoker arguments through the tree **/

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
    
    /** FLUID-4285 - prevent attempts to refer to options outside options block **/
    
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
    
    fluid.defaults("fluid.tests.badListener", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            haveEvent: null
        },
        listeners: {
            haveEvent: "{badListener}.noListener"  
        }
    });
    
    fluidIoCTests.test("FLUID-4151 test - diagnostic for bad listener resolution", function () {
        try {
            jqUnit.expect(1);
            fluid.pushSoftFailure(true);
            var bad = fluid.tests.badListener();
        } catch (e) {
            var message = e.message;
            var index = message.indexOf("badListener");
            jqUnit.assertTrue("Caught diagnostic exception in constructing bad listener component", index >= 0);
        } finally {
            fluid.pushSoftFailure(-1);  
        }
    });
    
    /** FLUID-4626 - references between separated component "islands" (without common instantiator) **/
    
    fluid.defaults("fluid.tests.island1", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            outEvent1: null,
            // note inconsistency - only IoC-resolved events get instantiator wrapping!
            // "that" reference tests FLUID-4680
            outEvent2: "{that}.events.outEvent1" 
        }
    });
    
    fluid.defaults("fluid.tests.island2", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            inEvent: null
        },
        components: {
            instantRequires: {
                type: "fluid.tests.news.child",
                createOnEvent: "inEvent"
            }   
        }  
    });

    fluidIoCTests.test("FLUID-4626 test - cross-island use of instantiators", function() {
        jqUnit.expect(1);
        var island1 = fluid.tests.island1();
        var island2 = fluid.tests.island2();
        island1.events.outEvent2.addListener(function() {
            island2.events.inEvent.fire()
        });
        island1.events.outEvent2.fire();
        jqUnit.assert("No error fired on cross-island dispatch");
    });
})(jQuery); 
