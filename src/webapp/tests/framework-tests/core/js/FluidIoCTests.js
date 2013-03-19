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

    jqUnit.module("Fluid IoC Tests");
    
    fluid.staticEnvironment.isTest = fluid.typeTag("fluid.test");

    fluid.setLogging(true);
    fluid.activityTracing = true;

    fluid.defaults("fluid.tests.defaultMergePolicy", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        defaultSource: "sourceValue",
        defaultTarget: "targetValue",
        mergePolicy: {
            defaultTarget: "defaultSource"
        }
    }); 
    
    fluid.tests.fluid4736Tests = [
    // Before FLUID-4330, we used to support this test case and not the last one - after FLUID-4330 the
    // position is now reversed. Supporting "non-monotonic merges" that the first case would require much more
    // complexity in the implementation in the form of a "provenance" object holding the merge depth of each 
    // value. In fact we don't require this support since the Reorderer defaults changed to be "monotonic" in any 
    // case, and the current implementation should be adequate for FLUID-4409/FLUID-4636 situations in UIOptions.
    /*{
        message: "merge policy has no effect on plain defaults",
        options: undefined,
        expected: {
            defaultSource: "sourceValue",
            defaultTarget: "targetValue"          
        }
    }, */{
        message: "merge policy copies user option to default value",
        options: {
            defaultSource: "userSource"
        },
        expected: {
            defaultSource: "userSource",
            defaultTarget: "userSource"
        }
    }, {
        message: "merge policy has no effect on full user values",
        options: {
            defaultSource: "userSource",
            defaultTarget: "userTarget"
        },
        expected: {
            defaultSource: "userSource",
            defaultTarget: "userTarget"
        }
    }, 
    // With FLUID-4392, this test case can now be supported, but the first can't: see also FLUID-4733
    {
        message: "user modifies value to default",
        options: {
            defaultSource: "sourceValue",
        },
        expected: {
            defaultSource: "sourceValue",
            defaultTarget: "sourceValue"
        }
    }];
    
    jqUnit.test("FLUID-4736: Interaction of default value merge policy with grade chain", function () {
        fluid.each(fluid.tests.fluid4736Tests, function (fixture) {
            var component = fluid.tests.defaultMergePolicy(fixture.options);
            jqUnit.assertLeftHand(fixture.message, fixture.expected, component.options);              
        });      
    });

    fluid.makeComponents({
        "fluid.tests.multiResSub":        "fluid.littleComponent",
        "fluid.tests.multiResSub2":       "fluid.littleComponent",
        "fluid.tests.multiResSub3":       "fluid.littleComponent",
        "fluid.tests.fluid3818child":     "fluid.littleComponent",
        "fluid.tests.thatStackTail":      "fluid.littleComponent",
        "fluid.tests.reinsChild":         "fluid.littleComponent" // standard blank "littleComponent" used throughout tests 
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

    jqUnit.test("invokers", function () {
        jqUnit.expect(2);
        var that = fluid.tests.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
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

    jqUnit.test("invokers with demands", function () {
        jqUnit.expect(2);
        var that = fluid.tests.invokerComponent2();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });
    
        fluid.demands("stringRenderer", "fluid.tests.invokerComponent2", {
        funcName: "fluid.formatMessage",
        args: ["{invokerComponent2}.options.template", "@0"]       
    });


    /** Correct transmission of model references */

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

    jqUnit.test("Aliasing expander test", function () {
        jqUnit.expect(3);
        var model = {unpollute: 1};
        var that = fluid.tests.dependentModel({model: model});
        jqUnit.assertValue("Constructed", that);
        model.pollute = 3;
        jqUnit.assertEquals("Transit 1", 3, that.options.model.pollute);
        jqUnit.assertEquals("Transit 1", 3, that.modelComponent.options.model.pollute);
    });

    
    fluid.defaults("fluid.tests.multiResolution", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            resSub: {
                type: "fluid.tests.multiResSub"
            }
        }  
    });

    /** Resolution based on increasingly specific context combinations **/

    fluid.demands("fluid.tests.multiResSub", ["fluid.tests.multiResolution", "fluid.tests.localFiles"], {
        funcName: "fluid.tests.multiResSub2",
        args: {
            localKey1: "localValue1",
            localKey2: "localValue2"
        }  
    });
    
    fluid.demands("fluid.tests.multiResSub", ["fluid.tests.multiResolution", "fluid.tests.localFiles", "fluid.tests.localTest"], {
        funcName: "fluid.tests.multiResSub3",
        args: [{
            localKey1: "testValue1"
        }, null]
    });
    
    
    jqUnit.test("Multi-resolution test", function () {
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
            jqUnit.assertLeftHand("\"Local\" subcomponent options", localDemandOptions, that2.resSub.options);
        
            fluid.staticEnvironment.testEnvironment = fluid.typeTag("fluid.tests.localTest");
            var that3 = fluid.tests.multiResolution();
            jqUnit.assertValue("Constructed", that3);
            var type3 = "fluid.tests.multiResSub3";
            jqUnit.assertEquals("\"Test\" subcomponent", type3, that3.resSub.typeName);
            var expectedOptions = {
                localKey1: "testValue1"
    //             targetTypeName: type3 // This floats about a bit as we change policy on "typeName"
            };
            jqUnit.assertLeftHand("\"Test\" subcomponent merged options", expectedOptions, that3.resSub.options);

        } finally {
            delete fluid.staticEnvironment.testEnvironment;
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    fluid.demands("fluid.tests.staticResolution", [], {
        funcName: "fluid.identity",
        args: "{fluid.tests.localFiles}"
    });

    jqUnit.test("Static resolution test", function () {
        try {
            fluid.staticEnvironment.localEnvironment = fluid.typeTag("fluid.tests.localFiles");
                
            var staticRes = fluid.invoke("fluid.tests.staticResolution");
            jqUnit.assertNotUndefined("Resolved value from static environment", staticRes);
        } finally {
            delete fluid.staticEnvironment.localEnvironment;
        }
    });

    // This is identical to a test in Fluid.js, but exposed a bug in the alternative workflow that was triggered by FLUID-4930 work - "evaluateFully"
    fluid.defaults("fluid.tests.eventMerge", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
           event: "preventable"
        }
    });
    
    jqUnit.test("Merge over named listener", function () {
        var that = fluid.tests.eventMerge({
            events: {
               event: null
            },
            listeners: {
               event: "fluid.identity"
            }
        });
        var result = that.events.event.fire(false);
        jqUnit.assertUndefined("Event returned to nonpreventable through merge", result);
    });

    /** FLUID-4634 demands exclusion test **/

    fluid.defaults("fluid.tests.demandedEvent1", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            event1: null
        }
    });
    
    fluid.defaults("fluid.tests.demandedEvent2", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            event2: null
        }
    });
    
    fluid.demands("testDemandedEvent", ["fluid.tests.testContext", "fluid.tests.demandedEvent2"], ["demanded"]);
    
    jqUnit.test("FLUID-4634: multiple components with the same boiled event name", function () {
        fluid.staticEnvironment.currentTestEnvironment = fluid.typeTag("fluid.tests.testContext");
        var orig = "original";
        var e1 = fluid.tests.demandedEvent1({
            events: {
                testDemandedEvent: {
                    event: "event1"
                }
            }
        });
        var e2 = fluid.tests.demandedEvent2({
            events: {
                testDemandedEvent: {
                    event: "event2"
                }
            }
        });
        
        e1.events.testDemandedEvent.addListener(function (arg) {
            jqUnit.assertEquals("The original argument should be passeed in.", orig, arg);
        });
        e2.events.testDemandedEvent.addListener(function (arg) {
            jqUnit.assertEquals("The demanded argument should be passed in.", "demanded", arg);
        });
        
        e1.events.event1.fire(orig);
        e2.events.event2.fire(orig);
        delete fluid.staticEnvironment.currentTestEnvironment;
    });
    
    /** FLUID-4631 argument transmission test **/

    fluid.defaults("fluid.tests.demandsEvents", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            someEvent: null
        }
    });

    fluid.demands("testEvent", ["fluid.tests.demandsEvents"], [
        "newArg", 
        "{arguments}.0"
    ]);
    
    jqUnit.test("FLUID-4631: double event dispatch issue", function () {
        jqUnit.expect(3);
        var origArg0 = "origArg";
        var assertEvent = function (arg0, arg1) {
            jqUnit.assertNotEquals("The two arguments should be different", arg0, arg1);
            jqUnit.assertEquals("Injection of new first argument", "newArg", arg0);
            jqUnit.assertEquals("Transmission of the original first arguement", origArg0, arg1);
        };
        var that = fluid.tests.demandsEvents({
            events: {
                testEvent: {
                    event: "someEvent"
                }
            },
            listeners: {
                testEvent: assertEvent
            }
        });
        that.events.someEvent.fire(origArg0);
    });

    fluid.demands("testEvent2", ["fluid.tests.demandsEvents"], [
        "{arguments}.1"
    ]);
    
    jqUnit.test("FLUID-4631: multiple to single argument", function () {
        jqUnit.expect(1);
        var origArg0 = "origArg0";
        var origArg1 = "origArg1";
        var assertEvent = function (arg0) {
            jqUnit.assertEquals("Transmission of the original second argument", origArg1, arg0);
        };
        var that = fluid.tests.demandsEvents({
            events: {
                testEvent2: {
                    event: "someEvent"
                }
            },
            listeners: {
                testEvent2: assertEvent
            }
        });
        that.events.someEvent.fire(origArg0, origArg1);
    });
    
    /** FLUID-4637 component proximity resolution test **/

    fluid.defaults("fluid.tests.twinSubComponent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "fluid.tests.twinSubComponent.preInit",
        events: {
            childEvent: null,
        },
        listeners: {
            childEvent: "{twinSubComponent}.testRealName"
        },
        realName: ""
    });
    
    fluid.tests.twinSubComponent.preInit = function (that) {
        that.testRealName = function (expectedName) {
            jqUnit.assertEquals("The correct component should be triggered", expectedName, that.options.realName);
        };
    };
    
    fluid.defaults("fluid.tests.twinParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            twin1: {
                type: "fluid.tests.twinSubComponent",
                options: {
                    realName: "twin1"
                }
            },
            twin2: {
                type: "fluid.tests.twinSubComponent",
                options: {
                    realName: "twin2"
                }
            }
        }
    });
    
    jqUnit.test("FLUID-4637: Listener mix up with injected events in twin subcomponents", function () {
        var that = fluid.tests.twinParent();
        
        that.twin1.events.childEvent.fire(that.twin1.options.realName);
    });
    
    /** FLUID-4914 derived grade resolution tests **/
    
    fluid.defaults("fluid.tests.dataSource", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            get: "fluid.tests.dataSource.get"
        }  
    });
    
    fluid.defaults("fluid.tests.URLDataSource", {
        gradeNames: ["fluid.tests.dataSource", "autoInit"],
        url: "http://jsforcats.com",
        invokers: {
            resolve: "fluid.tests.dataSource.urlResolver.resolve"
        }
    });
    
    fluid.demands("fluid.tests.dataSource.urlResolver.resolve", "fluid.tests.URLDataSource", {
        funcName: "fluid.identity",
        args: "{dataSource}.options.url"
    });
    
    fluid.demands("fluid.tests.dataSource.get", "fluid.tests.dataSource", {
        funcName: "fluid.identity",
        args: {value: 4}
    });
    
    jqUnit.test("FLUID-4914: resolve grade as context name", function () {
        var dataSource = fluid.tests.URLDataSource();
        var url = dataSource.resolve();
        jqUnit.assertEquals("Resolved grade context name via invoker", dataSource.options.url, url);
        var data = dataSource.get();
        jqUnit.assertDeepEq("Resolved grade context name as demands context", {value: 4}, data); 
    });
    

    /** FLUID-4392 demands block merging tests **/

    fluid.demands("fluid.tests.demandMerge", ["fluid.tests.context1"], {
        funcName: "fluid.tests.demandMerge1",
        options: {
            mergeKey1: "topValue1",
            mergeKey2: "topValue2",
            mergeKey3: "topValue3"
        }  
    });
    
    fluid.demands("fluid.tests.demandMerge", ["fluid.tests.context1", "fluid.tests.context2"], {
        funcName: "fluid.tests.demandMerge2",
        options: {
            mergeKey1: "middleValue1",
            mergeKey2: "middleValue2"
        }  
    });

    fluid.demands("fluid.tests.demandMerge", ["fluid.tests.context1", "fluid.tests.context2", "fluid.tests.context3"], {
        funcName: "fluid.tests.demandMerge3",
        options: {
            mergeKey1: "bottomValue1",
        }  
    });
    
    // We only create the most specific component since the most specific demands block will win on funcName
    fluid.defaults("fluid.tests.demandMerge3", {
        gradeNames: ["fluid.littleComponent", "autoInit"]  
    });
    
    fluid.defaults("fluid.tests.demandHolder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            context1: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "fluid.tests.context1"
                }
            },
            context2: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "fluid.tests.context2"
                }
            },
            context3: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "fluid.tests.context3"
                }
            },
            demandMerge: {
                type: "fluid.tests.demandMerge"
            }
        } 
    });    

    /** FLUID-4916 dynamic grade support tests **/
    
    fluid.defaults("fluid.tests.dynamicParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        parentOption: 1  
    });
    
    fluid.defaults("fluid.tests.dynamicGrade", {
        gradeNames: ["fluid.littleComponent", "autoInit", "{that}.computeGrade"],
        invokers: {
            computeGrade: "fluid.tests.computeDynamicParent",
            respondParent: "fluid.tests.respondParent"
        }
    });
    
    fluid.tests.computeDynamicParent = function () {
        return "fluid.tests.dynamicParent";
    };
    
    fluid.demands("fluid.tests.respondParent", "fluid.tests.dynamicParent", {
        funcName: "fluid.tests.respondParentImpl",
        args: "{dynamicParent}.options.parentOption"
    });
    
    fluid.tests.respondParentImpl = fluid.identity;
    
    jqUnit.test("FLUID-4916 Dynamic grade support", function () {
        var that = fluid.tests.dynamicGrade();
        jqUnit.assertTrue("Correctly resolved parent grade", fluid.hasGrade(that.options, "fluid.tests.dynamicParent"));
        jqUnit.assertEquals("Correctly resolved options from parent grade", 1, that.options.parentOption);
        jqUnit.assertEquals("Correctly resolved parent-contextualised invoker", 1, that.respondParent());
    });
    
    /** FLUID-4917 demands block horizon support **/
    
    fluid.defaults("fluid.tests.horizonParent", {
        gradeNames: ["fluid.littleComponent", "fluid.tests.horizonExtraParent", "autoInit"],
        components: {
            horizonMiddle: {
                type: "fluid.tests.horizonMiddle"
            }
        }
    });
    
    fluid.defaults("fluid.tests.horizonMiddle", {
        gradeNames: ["fluid.littleComponent", "fluid.tests.horizonExtra", "autoInit"],
        invokers: {
            horizonOp: "fluid.tests.horizonOp"
        }
    });
    
    // This demands block would have force 3 and win if it were not horizoned
    fluid.demands("fluid.tests.horizonOp", ["fluid.tests.horizonMiddle", "fluid.tests.horizonParent", "fluid.tests.horizonExtraParent"], {
        horizon: "fluid.tests.horizonMiddle",
        funcName: "fluid.tests.horizonByParent"
    });
    
    // As a result of the prior block eliminating itself down to force one through horizon, this one will win
    fluid.demands("fluid.tests.horizonOp", ["fluid.tests.horizonMiddle", "fluid.tests.horizonExtra"], {
        funcName: "fluid.tests.horizonByExtra"
    });
    
    fluid.tests.horizonByExtra = fluid.identity;

    jqUnit.test("FLUID-4917 Demands block horizon support", function () {
        var that = fluid.tests.horizonParent();
        jqUnit.assertTrue("Correctly resolved horizoned demands block", that.horizonMiddle.horizonOp(true));
    });

    // NOTE! This test must be left COMPLETELY undisturbed - as well as testing support for "members" itself, it exposed
    // a bug in the ginger pathway itself, whereby the driving effect of the "members" expander failed to cause "expanded" 
    // to be expanded as a result of its trunk path already being seen during the previous driving during options expansion
    // which evaluated the expander, causing "emptyArray" to be driven and hence the trunk path for "members". This was 
    // patched in the merge strategy to ensure that any evaluations which occur after "initter" cause full evalution, 
    // but we expect similar such bugs in the future until we understand the ginger process properly.
    
    // The idea was also to be able to verify reference equality of "expanded" and "emptyArray" but this seems not to be 
    // possible right now as a result of the recursion by the expander copying its arguments at args = options.recurse([], args);
    fluid.defaults("fluid.tests.memberTest", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
           expanded: {
               expander: {
                   func: "{that}.identity",
                   args: "{that}.emptyArray"
               }  
           },
           emptyArray: [],
           doubleTest: "{that}.options.invokers.dummy" // double expansion tester - will explode on double expansion
        },
        invokers: {
            identity: "fluid.identity",
            dummy: {
               funcName: "fluid.identity",
               args: "{arguments}.0"
            }
        }  
    });
    
    jqUnit.test("FLUID-4918 Support for \"members\" directive", function () {
        var member1 = fluid.tests.memberTest();
        function testEmptyArray(that) {
            jqUnit.assertDeepEq("Correctly instantiated member from literal", [], that.emptyArray);
            jqUnit.assertDeepEq("Correctly instantiated member through expander", that.emptyArray, that.expanded);
        }
        testEmptyArray(member1);
        member1.emptyArray.push("corruption");
        var member2 = fluid.tests.memberTest(); // Ensure that expanded material in "members" has not become aliased
        testEmptyArray(member2); 
    });

    /** Basic IoC Tests **/

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

    jqUnit.test("Basic interaction between defaults and demands", function () {
        var that = fluid.tests.defaultInteraction();
        jqUnit.assertValue("Constructed", that);
        var standardDefaults = fluid.copy(fluid.defaults("fluid.tests.popup"));
        delete standardDefaults.mergePolicy;
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
    
    /** FLUID-4873 distributeOptions tests **/
    
    fluid.tests.IoCSSParsing = [
        {selector: "fluid.tests.contextName",
         expected: [ {predList: [{
             "context": "fluid.tests.contextName"
         }]}
         ]
        }, 
        {selector: "fluid.tests.contextName & fluid.tests.contextName2",
         expected: "fail"
        },
        {selector: "fluid.tests.contextName&fluid.tests.contextName2",
         expected: [ {predList: [{
                 "context": "fluid.tests.contextName"
             }, {
                 "context": "fluid.tests.contextName2"
             }
         ]}
         ]
        },
        {selector: "fluid.tests.contextName#35 > fluid.tests.contextName2",
         expected: [ {
             child: true,
             predList: [{
                 "context": "fluid.tests.contextName"
             }, {
                 "id": "35"
             }
         ]}, {
             predList: [{
                 "context": "fluid.tests.contextName2"
             }
         ]}
         ]
        }
    ];
    
    jqUnit.test("FLUID-4873 IoCSS selector parsing tests", function () {
        fluid.pushSoftFailure(true);
        fluid.each(fluid.tests.IoCSSParsing, function (fixture) {
            var parser = function () { return fluid.parseSelector(fixture.selector, fluid.IoCSSMatcher);};
            if (fixture.expected === "fail") {
                jqUnit["throws"](parser, "Selector " + fixture.selector + " is invalid");
            }
            else {
                var parsed = parser();
                jqUnit.assertDeepEq("Parsed selector " + fixture.selector, fixture.expected, parsed);
            }  
        });
        fluid.pushSoftFailure(-1);
    });
    
    fluid.defaults("fluid.tests.uploader", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            uploaderContext: {
                type: "fluid.progressiveCheckerForComponent",
                options: {componentName: "fluid.tests.uploader"}
            },
            uploaderImpl: {
                type: "fluid.tests.uploaderImpl",
            }
        },
        distributeOptions: {
            source: "{that}.options",
            exclusions: ["components.uploaderContext", "components.uploaderImpl"],
            target: "{that > uploaderImpl}.options"
        },
        progressiveCheckerOptions: {
            checks: [
                {
                    feature: "{fluid.test}",
                    contextName: "fluid.uploader.html5"
                }
            ]
        }
    });
    
    fluid.demands("fluid.tests.uploaderImpl", "fluid.uploader.html5", {
        funcName: "fluid.tests.uploader.multiFileUploader"
    });
    
    fluid.defaults("fluid.tests.uploader.multiFileUploader", { 
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    jqUnit.test("FLUID-4873 Total Skywalker Options Distribution", function () {
        var uploader = fluid.tests.uploader({userOption: 5}).uploaderImpl;
        jqUnit.assertEquals("Skywalker options transmission", 5, uploader.options.userOption);
        jqUnit.assertNoValue("Options exclusion", uploader.uploaderContext);
    });
    
    /** FLUID-4926 Invoker tests **/
    
    fluid.defaults("fluid.tests.invokerFunc", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            targetInvoker: "fluid.identity",
            sourceInvoker: {
                func: "{that}.targetInvoker",
                args: false
            }
        }
    });
    
    jqUnit.test("FLUID-4926 Invoker resolution test", function () {
        var that = fluid.tests.invokerFunc();
        var result = that.sourceInvoker();
        jqUnit.assertEquals("Invoker relay of false argument", false, result);
    });
    
    /** Expansion order test **/
    
    // Example liberated from UIOptions implementation, which revealed requirement for
    // "expansion before merging" when constructing the new framework. This is a perverse
    // but probably valid usage of the framework. These kinds of "wholesale options transmissions"
    // cases are intended to be handled by FLUID-4873 "Luke Skywalker Options" ("distributeOptions")
    
    fluid.defaults("fluid.tests.uiEnhancer", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        value: 3,
        outerValue: 4 
    });
    
    fluid.defaults("fluid.tests.pageEnhancer", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        uiEnhancerOptions: {
            outerValue: 3
        },
        components: {
            uiEnhancer: {
                type: "fluid.tests.uiEnhancer",
                options: "{pageEnhancer}.options.uiEnhancerOptions"
            }
        }
    });
    
    jqUnit.test("Expansion order test", function () {
        var that = fluid.tests.pageEnhancer();
        var expected = {
            value: 3,
            outerValue: 3
        };
        jqUnit.assertLeftHand("Correctly merged options", expected, that.uiEnhancer.options);
    });
    
    /** Listener merging tests **/

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

    jqUnit.test("Listener Merging Tests: FLUID-4196", function () {
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

    /** withEnvironment tests - eventually to be deprecated **/

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

    jqUnit.test("Environmental Tests II - FLUID-3818", function () {
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

    fluid.registerNamespace("fluid.tests.envTests");

    fluid.tests.envTests.config = {
        viewURLTemplate: "http://titan.atrc.utoronto.ca:5984/%dbName/%view",        
        views: {
            exhibitions: "_design/exhibitions/_view/browse"
        }
    };

    jqUnit.test("Environmental Tests", function () {
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
            var resolved = fluid.expand(urlBuilder, {fetcher: fluid.makeEnvironmentFetcher()});
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

    /** Contextualisation of invokers **/

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

    jqUnit.test("thatStack tests", function () {
        var component = fluid.tests.thatStackHead();
        var value = component.child1.getHeadValue();
        jqUnit.assertValue("Correctly resolved head value through invoker", fluid.defaults("fluid.tests.thatStackHead").headValue, value);
    });

    fluid.defaults("fluid.tests.deferredInvoke", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    // This is an incredibly perverse test that attempts to invoke a component's creator function
    // as part of an expander during options, which results in an unreasonable structure holding 
    // a component within the options structure. However, there's no good reason this should be
    // forbidden outright, and we expect some kind of sensible results from the process
    
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
    
    jqUnit.test("Deferred invoked creator function", function () {
        var parent = fluid.tests.deferredInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option", parent.options.child.options.test);
    });
    
    jqUnit.test("Deferred invoked creator function with demands", function () {
        fluid.staticEnvironment.currentTestEnvironment = fluid.typeTag("fluid.tests.testContext");
        var parent = fluid.tests.deferredInvokeParent();
        jqUnit.assertEquals("Child options are correctly applied", "test option from demands", parent.options.child.options.test);
    });


    fluid.demands("fluid.tests.freeTarget1", [], {
        funcName: "fluid.identity",
        args: ["@0", "@1"]
    });
    
    jqUnit.test("Test Invoke Preservation", function () {
        var model = {};
        var returned = fluid.invoke("fluid.tests.freeTarget1", model);
        jqUnit.assertEquals("Identical model reference", model, returned);
    });
    
    /** FLUID-4330 - ginger expansion tests **/
    
    var outerConfig = {
        value: 4,
        otherValue: 3
    };
    
    var expandingConfig = {
        outerValue: "{outerConfig}.value",
        selfValue: "{self}.outerValue", // backward reference
        selfForward: "{self}.innerBlock.innerRef", // forward reference
        innerBlock: {
            innerValue: 5,
            innerRef: "{outerConfig}.otherValue"
        },
        innerBlock2: { // this block tests cursor regeneration
            innerRef: "{self}.innerBlock2.moreInner.innerValue",
            moreInner: {
                innerValue: 6
            }
        },
        expanderValue: {
            expander: {
                type: "fluid.deferredCall",
                func: "fluid.identity",
                args: "{self}.forwardValue"
            }
        },
        forwardValue: "{outerConfig}.value",
        unexpanded: {
            expander: {
                type: "fluid.noexpand",
                value: "{outerConfig}.value"
            }
        },
        expander: {
            type: "fluid.noexpand",
            tree: {
                unexpandedTop: "{outerConfig}.value"
            }
        }
    };
    
    var expectedExpand = {
        outerValue: 4,
        selfValue: 4, // backward reference
        selfForward: 3, // forward reference
        innerBlock: {
            innerValue: 5,
            innerRef: 3
        },
        innerBlock2: {
            innerRef: 6,
            moreInner: {
                innerValue: 6
            }
        },
        expanderValue: 4,
        forwardValue: 4,
        unexpanded: "{outerConfig}.value",
        unexpandedTop: "{outerConfig}.value"
    };
    
    fluid.tests.simpleFetcher = function (contexts) {
        return function (parsed) {
            var context = contexts[parsed.context];
            return fluid.get(context.root, parsed.path, context.config);
        };
    };
    
    jqUnit.test("FLUID-4330 Basic Ginger Expansion Test", function () {
        var contexts = {};
        var expandOptions = fluid.makeExpandOptions(expandingConfig, {
            sourceStrategy: fluid.concreteTrundler, 
            fetcher: fluid.tests.simpleFetcher(contexts),
            mergePolicy: {}
            });
        var target = expandOptions.target;
        contexts.outerConfig = {root: outerConfig, config: {strategies: [fluid.model.defaultFetchStrategy]}};
        contexts.self = {root: target, config: {strategies: [expandOptions.strategy]}};
        expandOptions.initter();
        jqUnit.assertDeepEq("Properly expanded self-referential structure", expectedExpand, target);
    });
    
    var gingerTests = {
        basicTest: {
            name: "Basic merging and expansion test",
            blocks: [{
                forwardRef: "{self}.mergedProperty",
                mergedProperty: 1,
                mergedProperty2: 1
            }, {
                mergedProperty2: 2
            }, {
                mergedProperty: 3,
                backwardRef: "{self}.mergedProperty2"  
            }
            ],
            expected: {
                forwardRef: 3,
                mergedProperty: 3,
                backwardRef: 2,
                mergedProperty2: 2
            }
        },
        moderateTest: {
            name: "Moderate driving test",
            blocks: [{
                forwardRef: "{self}.topProperty",
                topProperty: {
                    otherProperty: 3,
                    selfProperty: "{self}.topProperty.otherProperty"
                }
            }, {
                topProperty: {
                    otherProperty: 5
                },
                tallLateBlock: {
                    thingInside: "{self}.topProperty"
                },
                unexpandable: {
                    thingInside: "{self}.topProperty"
                },
                unexpandableString: "{self}.topProperty"
            }
            ],
            expected: {
                forwardRef: {
                    otherProperty: 5,
                    selfProperty: 5
                },
                topProperty: {
                    otherProperty: 5,
                    selfProperty: 5
                },
                tallLateBlock: {
                    thingInside: {
                        otherProperty: 5,
                        selfProperty: 5
                    }
                },
                unexpandable: {
                    thingInside: "{self}.topProperty"
                },
                unexpandableString: "{self}.topProperty"
            }
        }
    };
    
    fluid.tests.testOneGinger = function (entry) {
        jqUnit.test("FLUID-4330 " + entry.name, function () {
            var blocks = entry.blocks;
            var target = {};
            var ultimateStrategy;
            var expandFetcher = function (parsed) {
                if (parsed.context === "self") {
                    return fluid.get(target, parsed.path, {strategies: [ultimateStrategy]});
                }
            };
            var baseExpandOptions = {
                sourceStrategy: fluid.concreteTrundler, 
                fetcher: expandFetcher,
                mergePolicy: fluid.compileMergePolicy({ "unexpandable" : "noexpand", "unexpandableString" : "noexpand"}).builtins
                };
            var allExpandOptions = fluid.transform(blocks, function(block) {
                var thisOptions = $.extend(true, {}, baseExpandOptions);
                return fluid.makeExpandOptions(block, thisOptions);
            });
            var baseMergeOptions = {
                target: target,
                sourceStrategies: fluid.getMembers(allExpandOptions, "strategy")
            };
            var mergeOptions = fluid.makeMergeOptions({}, fluid.getMembers(allExpandOptions, "target"), baseMergeOptions);
            ultimateStrategy = mergeOptions.strategy;
            fluid.each(allExpandOptions, function(expandOption) { expandOption.initter();});
            mergeOptions.initter();
            jqUnit.assertDeepEq("Properly merged and expanded self-referential structure", entry.expected, target);
        });
    };
    
    fluid.each(gingerTests, function (entry) {
        fluid.tests.testOneGinger(entry);
    });
    
    fluid.defaults("fluid.tests.gingerMiddle", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        lowOption: "lowOption"
    });
    
    fluid.defaults("fluid.tests.gingerTop", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        lowOption: "{that}.gingerMiddle.options.lowOption",
        highOption: "highOption",
        circuitOption: "{that}.gingerMiddle.options.highOption",
        components: {
            gingerMiddle: {
                type: "fluid.tests.gingerMiddle",
                options: {
                    highOption: "{gingerTop}.options.highOption"
                }
            }
        }
    });
    
    jqUnit.test("FLUID-4330 ginger references cyclic in components", function () {
        var gingerTop = fluid.tests.gingerTop();
        var expected = {
            lowOption: "lowOption",
            highOption: "highOption",
            circuitOption: "highOption"  
        };
        
        jqUnit.assertLeftHand("Correctly circuited ginger options", expected, gingerTop.options);
    });
    
    /** FLUID-4135 - event injection and boiling test **/
    
    // This manual init function tests framework support for (to be deprecated) components
    // with unhelpful manual workflows (this one discards its options entirely)
    fluid.tests.listenerHolder = function () {
        var that = fluid.initLittleComponent("fluid.tests.listenerHolder");
        that.listener = function (value) {
            that.value = value;
        };
        return that;
    };
    
    fluid.defaults("fluid.tests.eventParent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        childType: "fluid.tests.eventChild", // test resolved type reference
        events: {
            parentEvent: null
        },
        components: {
            eventChild: {
                type: "{that}.options.childType"
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
    
    jqUnit.test("FLUID-4135 event injection and boiling", function () {
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
    
    /** FLUID-4398 - event injection and event/listener boiling test **/
    
    fluid.tests.invokerListener = function (injectThat, transmitThat) {
        injectThat.invokerListenerCheck = injectThat === transmitThat;
    };
    
    fluid.defaults("fluid.tests.eventParent3", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent1: null,
            parentEvent2: null  
        },
        listeners: { // This tests FLUID-4709
            parentEvent1: "{that}.invokerListener"
        },
        invokers: {
            invokerListener: {
                funcName: "fluid.tests.invokerListener",
                args: ["{that}", "{arguments}.0"]
            }
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
    
    fluid.tests.globalListener = function (parent, arg2) {
        if (!parent.listenerRecord) {
            parent.listenerRecord = [];
        };
        parent.listenerRecord.push(arg2);
    };
    
    jqUnit.test("FLUID-4398 event and listener boiling", function () {
        var that = fluid.tests.eventParent3();
        var received = {};
        that.eventChild.events.relayEvent.addListener(function(arg) {
            received.arg = arg;
        });
        that.events.parentEvent1.fire(that); // first event only fires to invoker
        jqUnit.assertNoValue("No event on first fire", that.listenerRecord);
        jqUnit.assertNoValue("No relay on first fire", received.arg);
        jqUnit.assertTrue("Listener fired to invoker", that.invokerListenerCheck); // FLUID-4709
        that.events.parentEvent2.fire(3, 4);
        jqUnit.assertDeepEq("Received boiled argument after dual fire", [4], that.listenerRecord);
        jqUnit.assertEquals("Received relayed fire after dual fire", 4, received.arg);
        that.eventChild.destroy(); // for FLUID-4257
        jqUnit.assertUndefined("Component has been destroyed", that.eventChild);
        that.events.parentEvent1.fire(that);
        that.events.parentEvent2.fire(3, 5);
        jqUnit.assertDeepEq("No event fired by destroyed child component", [4], that.listenerRecord);
        jqUnit.assertEquals("No event fired by destroyed child component", 4, received.arg);
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
    
    jqUnit.test("FLUID-4398 further event boiling tests", function () {
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
    
    /** FLUID-4135 - simple event injection test **/
    
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
    
    jqUnit.test("FLUID-4135 event injection with scope", function () {
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
        // TODO: This cannot be supported and will cause bugs in clearing shadow record when the improper return is processed
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
    
    jqUnit.test("FLUID-4055 reinstantiation test", function () {
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
    
    jqUnit.test("FLUID-4711 reinstantiation test", function () {
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
    
    jqUnit.test("FLUID-4179 unexpected material in clear test", function () {
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
                    mergePolicy: {
                        dangerousParamsII: "noexpand"  
                    },
                    dangerousParams: "{mergeComponent}.nothingUseful",
                    dangerousParamsII: "{mergeComponent}.nothingUseful"
                }
            }
        }  
    });
    
    jqUnit.test("FLUID-4129 merge policy for component options", function () {
        var mergeComp = fluid.tests.mergeComponent();
        var defs = fluid.defaults("fluid.tests.mergeComponent");
        var options = mergeComp.mergeChild.options;
        jqUnit.assertEquals("Dangerous parameters via grade defaults unexpanded",
            "{mergeComponent}.nothingUseful", options.dangerousParams);
        jqUnit.assertEquals("Dangerous parameters via grade defaults unexpanded",
            "{mergeComponent}.nothingUseful", options.dangerousParamsII);
    });

    /** Component lifecycle functions and merging test - includes FLUID-4257 **/
    
    function pushRecord(target, name, extra, that, childName, parent) {
        var key = that.options.name + "." + name;
        target.listenerRecord.push(extra ? {
            key: key,
            name: childName,
            parent: parent.nickName
        } : key);      
    }
    
    fluid.tests.makeTimedListener = function (name, extra) {
        return function (that, childName, parent) {
            pushRecord(that, name, extra, that, childName, parent);
        };
    };
    
    fluid.tests.makeTimedChildListener = function (name, extra) {
        return function (that, childName, parent) {
            pushRecord(that.options.parent, name, extra, that, childName, parent);
        };
    };
    
    fluid.tests.createRecordingMembers = function (that, extra) {
        that.mainEventListener = function () {
            that.listenerRecord.push("root.mainEventListener");
        };
        that.listenerRecord = [];
    };
    
    // Test FLUID-4162 by creating namespace before component of the same name
    fluid.registerNamespace("fluid.tests.lifecycle");
    
    fluid.tests.lifecycle.initRecordingComponent = function (that) {
        var parent = that.options.parent;
        parent.listenerRecord.push(that.options.name);
    };
    
    fluid.defaults("fluid.tests.lifecycle.recordingComponent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            parent: "nomerge"  
        },
        postInitFunction: fluid.tests.makeTimedChildListener("postInitFunction"),
        listeners: {
            onCreate: fluid.tests.makeTimedChildListener("onCreate"),
            onAttach: fluid.tests.makeTimedChildListener("onAttach", true),
            onDestroy: fluid.tests.makeTimedChildListener("onDestroy", true),
            onClear: fluid.tests.makeTimedChildListener("onClear", true),
        }
    });
    
    fluid.defaults("fluid.tests.lifecycle", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: ["fluid.tests.createRecordingMembers", fluid.tests.makeTimedListener("preInitFunction")],
        postInitFunction: fluid.tests.makeTimedListener("postInitFunction"),
        finalInitFunction: fluid.tests.makeTimedListener("finalInitFunction"),
        events: {
            mainEvent: null
        },
        name: "root",
        listeners: {
            mainEvent: "{lifecycle}.mainEventListener",
            onCreate: fluid.tests.makeTimedListener("onCreate"),
            onAttach: fluid.tests.makeTimedListener("onAttach", true), // these two listeners track attachment and detachment round the tree
            onClear: fluid.tests.makeTimedListener("onClear", true),
            onDestroy: fluid.tests.makeTimedListener("onDestroy", true) // must never fire - root component must have manual destruction
        },
        components: {
            initTimeComponent: {
                type: "fluid.tests.lifecycle.recordingComponent",
                options: {
                    parent: "{lifecycle}", // NB: This is strictly abuse - injection of component which has not finished construction
                    name: "initTimeComponent"
                }
            },
            eventTimeComponent: {
                type: "fluid.tests.lifecycle.recordingComponent",
                createOnEvent: "mainEvent",
                options: {
                    parent: "{lifecycle}",
                    name: "eventTimeComponent",
                    components: {
                        injected: "{lifecycle}"
                    }
                }
            },
            demandsInitComponent: {
                type: "fluid.tests.lifecycle.demandsInitComponent",
                options: {
                    components: {
                        parent: "{lifecycle}"
                    }
                }
            }
            
        }
    });
    
    fluid.defaults("fluid.tests.lifecycle.demandsInitComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.tests.lifecycle.demandsInitComponent.finalInitFunction = function (that) {
        that.parent.listenerRecord.push("finalInitFunctionSubcomponent");
    };
    fluid.demands("demandsInitComponent", "fluid.tests.lifecycle", {
        options: {
            finalInitFunction: fluid.tests.lifecycle.demandsInitComponent.finalInitFunction
        }
    });
    
    jqUnit.test("Component lifecycle test - with FLUID-4257", function () {
        var testComp = fluid.tests.lifecycle();
        testComp.events.mainEvent.fire();
        testComp.events.mainEvent.fire();
        var expected = [
            "root.preInitFunction",
            "root.postInitFunction",
            "initTimeComponent.postInitFunction",
            "initTimeComponent.onCreate",
            {key: "initTimeComponent.onAttach", name: "initTimeComponent", parent: "lifecycle"},
            {key: "root.onAttach", name: "parent", parent: "demandsInitComponent"},
            "finalInitFunctionSubcomponent",
            "root.finalInitFunction",
            "root.onCreate",
            "root.mainEventListener",
            "eventTimeComponent.postInitFunction",
            {key: "root.onAttach", name: "injected", parent: "recordingComponent"}, // eventTimeComponent's injected root
            "eventTimeComponent.onCreate",
            {key: "eventTimeComponent.onAttach", name: "eventTimeComponent", parent: "lifecycle"},
            "root.mainEventListener",
            {key: "eventTimeComponent.onClear", name: "eventTimeComponent", parent: "lifecycle"},
            {key: "eventTimeComponent.onDestroy", name: "eventTimeComponent", parent: "lifecycle"},
            {key: "root.onClear", name: "injected", parent: "recordingComponent"}, // NO destroy here!
            "eventTimeComponent.postInitFunction",
            {key: "root.onAttach", name: "injected", parent: "recordingComponent"}, // re-inject 2nd time
            "eventTimeComponent.onCreate",
            {key: "eventTimeComponent.onAttach", name: "eventTimeComponent", parent: "lifecycle"}
        ];
        jqUnit.assertDeepEq("Expected initialisation sequence", expected, testComp.listenerRecord); 
    });
    
    /** FLUID-4257 - automatic listener teardown test **/
    
    fluid.defaults("fluid.tests.head4257", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            parentEvent: null
        },
        components: {
            child1: {
                type: "fluid.tests.child4257",
                options: {
                    listeners: {
                        "{head4257}.events.parentEvent": {
                            listener: "{child4257}.listener",
                            namespace: "parentSpace", // Attempt to fool identification of event
                            args: ["{head4257}", "{arguments}.0"]
                        }
                    }
                }
            }
        }
    });
    
    fluid.defaults("fluid.tests.child4257", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
        // implicitly registered init function tests FLUID-4776
    });
    
    fluid.tests.child4257.preInit = function (that) {
        that.listener = function (parentThat, arg) {
            parentThat.records = parentThat.records || [];
            parentThat.records.push(arg);
        };
    };
    
    jqUnit.test("FLUID-4257 test: removal of injected listeners", function() {
        var that = fluid.tests.head4257();
        that.events.parentEvent.fire(3);
        jqUnit.assertDeepEq("First event fire", [3], that.records);
        that.child1.destroy();
        that.events.parentEvent.fire(4);
        jqUnit.assertDeepEq("Listener no longer registered", [3], that.records);
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
    
    jqUnit.test("FLUID-4290 test: createOnEvent sequence corruption", function () {
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
   
    jqUnit.test("Guided instantiation test", function () {
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
    
    jqUnit.test("Tree circularity test", function () {
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
    
    jqUnit.test("Advanced circularity test I", function () {
        // If this test fails, it will bomb the browser with an infinite recursion
        // TODO: In the new framework, this no longer fails! But it probably shouldn't in the
        // long run anyway
        try {
            fluid.pushSoftFailure(true);
            jqUnit.expect(1);
            var comp = fluid.tests.circular.strategy();
            jqUnit.assertValue("Component constructed", comp);
        } catch (e) {
            jqUnit.assert("Circular construction guarded");  
        } finally {
            fluid.pushSoftFailure(-1);
        }
    });

    /** Correct resolution of invoker arguments through the tree **/

    fluid.defaults("fluid.tests.invokerGrandParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            parent1: {
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
            parent2: {
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

    jqUnit.test("Invoker resolution tests", function () {
        var that = fluid.tests.invokerGrandParent();
        var newValue = 2;
        that.invokerwrapper.parent2.applier.requestChange("testValue", newValue);
        jqUnit.assertEquals("The invoker for second subcomponent should return the value from its parent", 
            newValue, that.invokerwrapper.parent2.checkTestValue());
    });
    
    /** FLUID-4712 - contextualisation of calls issued from an invoker **/
    
    fluid.defaults("fluid.tests.test4712parent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            refChild3: { // put at top level so that "blank instantiator guess" is definitively wrong
                type: "fluid.tests.reinsChild",
                options: {
                    refOption: 3
                }
            },
            instantiator: "{instantiator}",
            refChild: {
                type: "fluid.tests.reinsChild",
                options: {
                    components: {
                        refChild2: { // this component gets cleared and gingerly reinstantiated
                            type: "fluid.tests.reinsChild",
                            options: {
                                components: {
                                    // resolution of this parent will fail if invoker loses context (broken "that stack")
                                    ref3: "{refChild3}"
                                }
                            }
                        }
                    },
                    invokers: {
                        invoker: {
                            funcName: "fluid.identity",
                            args: "{refChild2}.ref3.options.refOption"
                        }
                    }
                }
            }
        }
    });
    
    jqUnit.test("Invoker contextualisation tests", function() {
        jqUnit.expect(3);
        var that = fluid.tests.test4712parent();
        jqUnit.assertEquals("Child component should be properly instantiated", 3, that.refChild.refChild2.ref3.options.refOption);
        jqUnit.assertEquals("Invoker should resolve on startup", 3, that.refChild.invoker());
        that.instantiator.clearComponent(that.refChild, "refChild2");
        var resolved = that.refChild.invoker();
        jqUnit.assertEquals("Component reconstruction and resolution", 3, resolved);
    });
    
    /** FLUID-4285 - prevent attempts to refer to options outside options block **/
    
    fluid.defaults("fluid.tests.news.parent", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: { test: "test" },
        components: {
            child: {
                type: "fluid.tests.news.child",
                model: "{parent}.model" // error HERE
            }
        }
    });

    fluid.defaults("fluid.tests.news.child", {
        gradeNames: ["fluid.modelComponent", "autoInit"]
    });
      
    jqUnit.test("FLUID-4285 test - prevent unencoded options", function () {
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
    
    jqUnit.test("FLUID-4151 test - diagnostic for bad listener resolution", function () {
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

    jqUnit.test("FLUID-4626 test - cross-island use of instantiators", function() {
        jqUnit.expect(1);
        var island1 = fluid.tests.island1();
        var island2 = fluid.tests.island2();
        island1.events.outEvent2.addListener(function() {
            island2.events.inEvent.fire()
        });
        island1.events.outEvent2.fire();
        jqUnit.assert("No error fired on cross-island dispatch");
    });
    
    fluid.defaults("fluid.tests.grade", {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            gradeOpt: {
                gradeOpt: "gradeOpt"
            }
        });

        fluid.defaults("fluid.tests.comp", {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            opt: {
                opt: "opt"
            }
        });

        jqUnit.test("FLUID-4937: gradeName merging at instantiation", function () {
            jqUnit.expect(2);
            that = fluid.tests.comp({
                gradeNames: ["fluid.tests.grade"]
            });
            jqUnit.assertTrue("The original option should exist", fluid.get(that, "options.opt.opt"));
            jqUnit.assertTrue("The merged grade option should exist", fluid.get(that, "options.gradeOpt.gradeOpt"));
        });

})(jQuery); 
