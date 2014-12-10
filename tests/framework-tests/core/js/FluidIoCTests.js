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
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid IoC Tests");

    fluid.staticEnvironment.isTest = fluid.typeTag("fluid.test");

    fluid.setLogging(fluid.logLevel.TRACE);
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
    // case, and the current implementation should be adequate for FLUID-4409/FLUID-4636 situations in PrefsEditor.
    /*{
        message: "merge policy has no effect on plain defaults",
        options: undefined,
        expected: {
            defaultSource: "sourceValue",
            defaultTarget: "targetValue"
        }
    }, */
        {
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
                defaultSource: "sourceValue"
            },
            expected: {
                defaultSource: "sourceValue",
                defaultTarget: "sourceValue"
            }
        }
    ];

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

    jqUnit.test("Model reference aliasing test", function () {
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

    /** Preservation of material with "exotic types" (with constructor) for FLUID-5089 **/

    fluid.tests.customType = new Date();

    fluid.defaults("fluid.tests.typedMemberComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            cat: fluid.tests.customType,
            cat3: "@expand:fluid.identity({that}.cat)"
        },
        synthDef: {
            cat: "{that}.cat",
            cat2: "@expand:fluid.identity({that}.cat)"
        }
    });

    jqUnit.test("FLUID-5089: Preservation of exotic types", function () {
        jqUnit.assertTrue("Sanity check: detect custom object by instanceof", fluid.tests.customType instanceof Date);

        var comp = fluid.tests.typedMemberComponent();
        jqUnit.assertTrue("An exotic object stored as a component default should not be corrupted.",
            comp.cat instanceof Date);
        jqUnit.assertTrue("An exotic object stored as an IoC-resolved component default should not be corrupted.",
            comp.options.synthDef.cat instanceof Date);
        jqUnit.assertTrue("An exotic object resolved via an expander should not be corrupted.",
            comp.options.synthDef.cat2 instanceof Date);
        jqUnit.assertTrue("An exotic object resolved via a top-level expander should not be corrupted.",
            comp.cat3 instanceof Date);
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
            // targetTypeName: type3 // This floats about a bit as we change policy on "typeName"
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

    /** FLUID-5239 **/

    // dynamically creating name to show that anything starting with "source" will not be resolved by IoC
    var name = "source" + fluid.allocateGuid();

    fluid.defaults("fluid." + name, {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    jqUnit.test("FLUID-5239: Component name starting with 'source'", function () {
        jqUnit.expect(1);
        fluid[name]({
            listeners: {
                onCreate: {
                    listener: "jqUnit.assertNotUndefined",
                    args: ["The reference to {" + name + "} should resolve to the component", "{" + name + "}"]
                }
            }
        });
    });

    /** end FLUID-5239 **/

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
            childEvent: null
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
            mergeKey1: "bottomValue1"
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

    fluid.tests.IoCSSParsing = [{
        selector: "fluid.tests.contextName",
        expected: [{
            predList: [{
                "context": "fluid.tests.contextName"
            }]
        }]
    }, {
        selector: "fluid.tests.contextName & fluid.tests.contextName2",
        expected: "fail"
    }, {
        selector: "fluid.tests.contextName&fluid.tests.contextName2",
        expected: [{
            predList: [{
                "context": "fluid.tests.contextName"
            }, {
                "context": "fluid.tests.contextName2"
            }]
        }]
    }, {
        selector: "fluid.tests.contextName#35 > fluid.tests.contextName2",
        expected: [{
            child: true,
            predList: [{
                "context": "fluid.tests.contextName"
            }, {
                "id": "35"
            }]
        }, {
            predList: [{
                "context": "fluid.tests.contextName2"
            }]
        }]
    }];

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
                type: "fluid.tests.uploaderImpl"
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

    // Example liberated from PrefsEditor implementation, which revealed requirement for
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

    /** FLUID-5082 auto-namespaces (soft) **/

    fluid.tests.FLUID5082func = function (that, arg) {
        that.fireRecord.push(arg);
    };

    fluid.tests.FLUID5082func2 = fluid.tests.FLUID5082func;

    fluid.defaults("fluid.tests.FLUID5082Parent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            fireRecord: [],
            self: "{that}"
        },
        events: {
            testEvent: null
        },
        listeners: {
            testEvent: [{
                funcName: "fluid.tests.FLUID5082func",
                args: ["{that}", 1]
            }, {
                func: "{that}.FLUID5082invoker",
                args: ["{that}", 2]
            }, {
                "this": "{that}.self",
                method: "FLUID5082invoker2",
                args: ["{that}", 3]
            }, {
                funcName: "fluid.tests.FLUID5082func2",
                args: ["{that}", 4]
            }]
        },
        invokers: {
            FLUID5082invoker: {
                funcName: "fluid.tests.FLUID5082func"
            },
            FLUID5082invoker2: {
                funcName: "fluid.tests.FLUID5082func"
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID5082Child", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            testEvent: [{
                funcName: "fluid.tests.FLUID5082func",
                namespace: "fluid.tests.FLUID5082Parent.FLUID5082func", // will override
                args: ["{FLUID5082Parent}", 5]
            }, {
                func: "{FLUID5082Parent}.FLUID5082invoker",
                namespace: "fluid.tests.FLUID5082Parent.FLUID5082invoker", // will override
                args: ["{FLUID5082Parent}", 6]
            }, {
                "this": "{FLUID5082Parent}.self",
                namespace: "fluid.tests.FLUID5082Parent.self.FLUID5082invoker2", // will override
                method: "FLUID5082invoker2",
                args: ["{FLUID5082Parent}", 7]
            }, {
                funcName: "fluid.tests.FLUID5082func2", // will not override
                args: ["{FLUID5082Parent}", 8]
            }]
        }
    });

    jqUnit.test("Listener Merging Tests: FLUID-5082", function () {
        var that = fluid.tests.FLUID5082Parent();
        that.events.testEvent.fire();
        jqUnit.assertDeepEq("Base grade listeners fired", [1, 2, 3, 4], that.fireRecord);
        // Test configuration with child superposed on parent
        var that2 = fluid.tests.FLUID5082Parent({gradeNames: "fluid.tests.FLUID5082Child"});
        that2.events.testEvent.fire();
        jqUnit.assertDeepEq("Composite grade listeners fired", [4, 5, 6, 7, 8], that2.fireRecord);
        // Test configuration with child as child component - results should be identical
        var that3 = fluid.tests.FLUID5082Parent( {
            components: {
                child: {
                    type: "fluid.tests.FLUID5082Child",
                    options: {
                        events: {
                            testEvent: "{FLUID5082Parent}.events.testEvent"
                        }
                    }
                }
            }
        });
        that3.events.testEvent.fire();
        jqUnit.assertDeepEq("Subcomponent listeners fired", [4, 5, 6, 7, 8], that3.fireRecord);
    });

    /** FLUID-5128 - Soft Namespaces removal test **/

    fluid.tests.fluid5128listener = function (that, index) {
        that.fireRecord.push(index);
    };

    fluid.defaults("fluid.tests.fluid5128child", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{fluid5128head}.events.subscrEvent": {
                funcName: "fluid.tests.fluid5128listener",
                args: ["{fluid5128head}", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5128head", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            fireRecord: []
        },
        events: {
            createEvent: null,
            subscrEvent: null
        },
        components: {
            child1: {
                type: "fluid.tests.fluid5128child",
                createOnEvent: "createEvent"
            },
            child2: {
                type: "fluid.tests.fluid5128child",
                createOnEvent: "createEvent"
            }
        }
    });

    jqUnit.test("FLUID-5128 Soft listener deregistration test", function () {
        var that = fluid.tests.fluid5128head();
        that.events.createEvent.fire();
        that.events.subscrEvent.fire(1);
        jqUnit.assertDeepEq("Two initial firings", [1, 1], that.fireRecord);
        that.events.createEvent.fire();
        that.events.subscrEvent.fire(2);
        jqUnit.assertDeepEq("Two subsequent firings", [1, 1, 2, 2], that.fireRecord);
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
                            args: "{thatStackHead}.options.headValue"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("thatStack tests", function () {
        var component = fluid.tests.thatStackHead();
        var value = component.child1.getHeadValue();
        jqUnit.assertEquals("Correctly resolved head value through invoker", fluid.defaults("fluid.tests.thatStackHead").headValue, value);
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
        }
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
                event: "baseEvent"
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
        var baseListener = function () {
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

    /** FLUID-5112: Composite event firing test **/
    fluid.defaults("fluid.tests.composite.test", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            onReady: {
                events: {
                    "onCreate": "onCreate",
                    "refresh": "afterRefresh"
                },
                args: ["{that}"]
            },
            afterRefresh: null
        },
        listeners: {
            "onCreate.setup": "{that}.events.afterRefresh.fire"
        }
    });

    jqUnit.asyncTest("FLUID-5112: composite event firing test", function () {
        jqUnit.expect(3); // afterRefresh, then onReady, then afterRefresh again
        var started = false;
        var onReadyCount = 0;

        fluid.tests.composite.test({
            listeners: {
                afterRefresh: function () {
                    jqUnit.assert("the afterRefresh event should have fired.");
                    if (!started) {
                        started = true;
                        jqUnit.start();
                    }
                },
                onReady: {
                    listener: function (that) {
                        jqUnit.assertEquals("the onReady event should fire exactly once", 0, onReadyCount);
                        ++onReadyCount;
                        if (onReadyCount < 2) {
                            that.events.afterRefresh.fire();
                        }
                    }
                }
            }
        });

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

    /** FLUID-4878 - "this-ist" binding tests **/

    var NastyThisistThing = function () { };

    NastyThisistThing.prototype.thisistMethod = function (arg) {
        this.storedArg = arg;
    };

    // Not worth making a framework facility for this, since most "this-ist" constructors are written by OTHERS
    // and hence will not be placed in a suitable global namespace.
    fluid.tests.makeThisistThing = function () {
        return new NastyThisistThing();
    };

    fluid.defaults("fluid.tests.invokerThis", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            "thisistThing": {
                expander: { funcName: "fluid.tests.makeThisistThing" }
            }
        },
        invokers: {
            callThisist: {
                "this": "{that}.thisistThing",
                method: "thisistMethod",
                args: "{arguments}.0"
            }
        },
        listeners: {
            onCreate: {
                "this": "{that}.thisistThing",
                method: "thisistMethod",
                args: 5
            }
        }
    });

    jqUnit.test("FLUID-4878 this-ist invoker", function () {
        var that = fluid.tests.invokerThis();
        jqUnit.assertEquals("This-ist method called by onCreate listener", 5, that.thisistThing.storedArg);
        that.callThisist(7);
        jqUnit.assertEquals("This-ist method called by invoker", 7, that.thisistThing.storedArg);
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
        fluid.defaults("fluid.tests.mergeComponent");
        var options = mergeComp.mergeChild.options;
        jqUnit.assertEquals("Dangerous parameters via grade defaults unexpanded",
            "{mergeComponent}.nothingUseful", options.dangerousParams);
        jqUnit.assertEquals("Dangerous parameters via grade defaults unexpanded",
            "{mergeComponent}.nothingUseful", options.dangerousParamsII);
    });

    /** FLUID-4987 - double listeners added by demands block **/

    fluid.defaults("fluid.tests.demandListeners", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            listenerCount: 0
        },
        events: {
            demandEvent: null
        }
    });

    fluid.tests.demandRecording = function (that) {
        that.listenerCount ++;
    };

    fluid.demands("fluid.tests.demandListeners", [], {
        options: {
            listeners: {
                demandEvent: "fluid.tests.demandRecording"
            }
        }
    });

    jqUnit.test("FLUID-4987 double listener from demands block", function () {
        var that = fluid.invoke("fluid.tests.demandListeners"); // TODO: Allow components to be "self-reactive"
        that.events.demandEvent.fire(that);
        jqUnit.assertEquals("Just one listener notified", 1, that.listenerCount);
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

    fluid.tests.createRecordingMembers = function (that) {
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
            afterDestroy: fluid.tests.makeTimedChildListener("afterDestroy", true),
            onClear: fluid.tests.makeTimedChildListener("onClear", true)
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
            {key: "eventTimeComponent.afterDestroy", name: "eventTimeComponent", parent: "lifecycle"},
            "eventTimeComponent.postInitFunction",
            {key: "root.onAttach", name: "injected", parent: "recordingComponent"}, // re-inject 2nd time
            "eventTimeComponent.onCreate",
            {key: "eventTimeComponent.onAttach", name: "eventTimeComponent", parent: "lifecycle"}
        ];
        jqUnit.assertDeepEq("Expected initialisation sequence", expected, testComp.listenerRecord);
    });

    /** FLUID-5268 - direct root "afterDestroy" listener **/

    fluid.defaults("fluid.tests.fluid5268", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    jqUnit.test("Component lifecycle test - FLUID-5268 root afterDestroy", function () {
        var record = [];
        var onDestroy = function () {
            record.push("onDestroy");
        };
        var afterDestroy = function () {
            record.push("afterDestroy");
        };
        var that = fluid.tests.fluid5268({
            listeners: {
                onDestroy: onDestroy,
                afterDestroy: afterDestroy
            }
        });
        that.destroy();
        var expected = ["onDestroy", "afterDestroy"];
        jqUnit.assertDeepEq("Expected exactly one onDestroy followed by one afterDestroy", expected, record);
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
            prefsEditorBridge: {
                type: "fluid.littleComponent",
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

    jqUnit.test("FLUID-4290 test: createOnEvent sequence corruption", function () {
        jqUnit.expect(1);
        fluid.tests.createOnEvent();
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
            parent: "nomerge"
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

    /** Tree circularity tests (early detection of stack overflow) **/

    fluid.defaults("fluid.tests.circularEvent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            circular: {
                event: "circular"
            }
        }
    });

    function circularTest(componentName, message) {
        jqUnit.test("FLUID-4978 " + message, function () {
            jqUnit.expectFrameworkDiagnostic("Circular construction guarded", function () {
                fluid.invokeGlobalFunction(componentName);
            }, "circular");
        });
    }

    circularTest("fluid.tests.circularEvent", "event circularity test");

    fluid.defaults("fluid.tests.circularOptions", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        circular1: "{that}.options.circular2",
        circular2: "{that}.options.circular1"
    });

    circularTest("fluid.tests.circularOptions", "options circularity test");

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
            try {
                delete circular.typeName; // necessary to defeat new framework's detection of components - update as necessary
                fluid.expandOptions(circular, circular);
            } catch (e2) {
                jqUnit.assertTrue("Framework exception caught in circular expansion", e2 instanceof fluid.FluidError);
            }
        } finally {
            fluid.pushSoftFailure(-1);
        }
    });

    fluid.defaults("fluid.tests.FLUID5088Circularity", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        option1: "{that}.options.option2",
        option2: "{that}.options.option1"
    });

    jqUnit.test("Direct circularity test", function () {
        jqUnit.expectFrameworkDiagnostic("Framework exception caught in circular expansion", fluid.tests.FLUID5088Circularity, "circular");
    });

    /** This test case reproduces a circular reference condition found in the Flash
     *  implementation of the uploader, which the framework did not properly detect. In the
     *  FLUID-4330 framework, this is no longer an error */

    fluid.registerNamespace("fluid.tests.circular");

    fluid.defaults("fluid.tests.circular.strategy", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            local: {
                type: "fluid.littleComponent"
            },
            engine: {
                type: "fluid.tests.circular.engine"
            }
        }
    });

    fluid.tests.circular.initEngine = function (that) {
        // This line, use of an invoker before construction is complete would once trigger failure
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
                type: "fluid.littleComponent"
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

    // NB - this is an old-style "non-merging" demands block, use is deprecated
    fluid.demands("fluid.tests.circular.local", "fluid.tests.circular.strategy", {
        args: [
            "{engine}.swfUpload",
            fluid.COMPONENT_OPTIONS
        ]
    });

    jqUnit.test("Advanced circularity test I", function () {
        jqUnit.expect(1);
        var comp = fluid.tests.circular.strategy();
        jqUnit.assertValue("Component constructed", comp);
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
        jqUnit.expectFrameworkDiagnostic("Constructing stray options component", fluid.tests.news.parent, "options");
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
        jqUnit.expectFrameworkDiagnostic("Constructing bad listener component", fluid.tests.badListener, "badListener");
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
            island2.events.inEvent.fire();
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
        var that = fluid.tests.comp({
            gradeNames: ["fluid.tests.grade"]
        });
        jqUnit.assertTrue("The original option should exist", fluid.get(that, "options.opt.opt"));
        jqUnit.assertTrue("The merged grade option should exist", fluid.get(that, "options.gradeOpt.gradeOpt"));
    });

    fluid.registerNamespace("fluid.tests.initFuncs");

    fluid.defaults("fluid.tests.initFuncs", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "fluid.tests.initFuncs.preInit",
        postInitFunction: "fluid.tests.initFuncs.postInit",
        finalInitFunction: "fluid.tests.initFuncs.finalInit"
    });

    fluid.each(["preInit", "postInit", "finalInit"], function (init) {
        fluid.tests.initFuncs[init] = function () {
            jqUnit.assert("The " + init + " function fired");
        };
    });

    jqUnit.test("FLUID-4939: init functions with gradeName modification", function () {
        jqUnit.expect(3);
        fluid.tests.initFuncs({
            gradeNames: ["fluid.tests.grade"]
        });
    });

    fluid.defaults("fluid.tests.circularGrade", {
        gradeNames: ["fluid.tests.initFuncs", "autoInit"],
        extraOpt: "extraOpt"
    });

    jqUnit.test("FLUID-4939: init functions with gradeName modification - circular grades", function () {
        jqUnit.expect(4);
        var that = fluid.tests.initFuncs({
            gradeNames: ["fluid.tests.circularGrade"]
        });
        jqUnit.assertEquals("Extra option added", "extraOpt", that.options.extraOpt);
    });

    /** FLUID-5012: IoCSS doesn't apply the gradeNames option onto the target component **/
    fluid.defaults("fluid.tests.prefsEditor", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            templateLoader: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.templateLoader",
            target: "{that > templateLoader}.options"
        }
    });

    fluid.defaults("fluid.tests.defaultTemplateLoader", {
        userOption: 10
    });

    jqUnit.test("FLUID-5012: Apply gradeNames option onto the target component with IoCSS", function () {
        var prefsEditor = fluid.tests.prefsEditor({
            templateLoader: {
                gradeNames: ["fluid.tests.defaultTemplateLoader"]
            }
        });
        var expectedGrades = ["fluid.tests.defaultTemplateLoader", "fluid.littleComponent", "autoInit"];

        jqUnit.assertDeepEq("The option grades are merged into the target component", expectedGrades, prefsEditor.templateLoader.options.gradeNames);
        jqUnit.assertEquals("The user option from the grade component is transmitted", 10, prefsEditor.templateLoader.options.userOption);
    });

    /** FLUID-5013: IoCSS doesn't pass down non-options blocks **/

    fluid.defaults("fluid.tests.top", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            subComponent: {
                type: "fluid.tests.subComponent1"
            }
        },
        distributeOptions: {
            source: "{that}.options.subComponentMaterial",
            target: "{that > subComponent}"
        }
    });

    fluid.defaults("fluid.tests.subComponent1", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    fluid.defaults("fluid.tests.subComponent2", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        userOption: 1
    });

    jqUnit.test("FLUID-5013: Pass down non-options blocks with IoCSS", function () {
        var top = fluid.tests.top({
            subComponentMaterial: {
                type: "fluid.tests.subComponent2"
            }
        });

        jqUnit.assertEquals("The non-options blocks are passed down to the target component", "fluid.tests.subComponent2", top.subComponent.typeName);
        jqUnit.assertEquals("The user options from the new component type are merged into the target component", 1, top.subComponent.options.userOption);
    });

    /** FLUID-5014 Case 1 - IoCSS: one source value gets passed down to several subcomponents **/

    fluid.defaults("fluid.tests.fluid5014root", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            sub1: {
                type: "fluid.tests.fluid5014sub"
            },
            sub2: {
                type: "fluid.tests.fluid5014sub"
            },
            sub3: {
                type: "fluid.tests.fluid5014sub"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5014sub", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    fluid.defaults("fluid.tests.fluid5014distro1", {
        distributeOptions: [{
            source: "{that}.options.userOption",
            target: "{that > sub1}.options.userOption"
        }, {
            source: "{that}.options.userOption",
            target: "{that > sub2}.options.userOption"
        }, {
            source: "{that}.options.userOption",
            target: "{that > sub3}.options.userOption"
        }]
    });

    fluid.defaults("fluid.tests.fluid5014distro2", {
        distributeOptions: [{ // Check that even when we remove source, we can distribute to multiple targets via one record
            source: "{that}.options.userOption",
            removeSource: true,
            target: "{that > fluid.tests.fluid5014sub}.options.userOption"
        }]
    });

    fluid.tests.testDistro = function (distroGrade) {
        jqUnit.test("FLUID-5014 Case 1: one source value gets passed down to several subcomponents - " + distroGrade, function () {
            var root = fluid.tests.fluid5014root({
                gradeNames: distroGrade,
                userOption: 2
            });

            jqUnit.assertEquals("The user option is passed down to the subcomponent #1", 2, root.sub1.options.userOption);
            jqUnit.assertEquals("The user option is passed down to the subcomponent #2", 2, root.sub2.options.userOption);
            jqUnit.assertEquals("The user option is passed down to the subcomponent #3", 2, root.sub3.options.userOption);
        });
    };

    fluid.tests.testDistro("fluid.tests.fluid5014distro1");
    fluid.tests.testDistro("fluid.tests.fluid5014distro2");

    /** FLUID-5014 Case 2 - IoCSS: one source value gets passed down to its own and its grade component **/

    fluid.defaults("fluid.tests.fluid5014gradeComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            gradeSubComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.userOption",
            target: "{that > gradeSubComponent}.options.userOption"
        }
    });

    fluid.defaults("fluid.tests.fluid5014rootComponent", {
        gradeNames: ["fluid.tests.fluid5014gradeComponent", "autoInit"],
        components: {
            rootSubComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.userOption",
            target: "{that > rootSubComponent}.options.userOption"
        }
    });

    jqUnit.test("FLUID-5014 Case 2: one source value gets passed down to its own and its grade component", function () {
        var root = fluid.tests.fluid5014rootComponent({
            userOption: 2
        });

        jqUnit.assertEquals("The user option is passed down to the subcomponent of the root component", 2, root.rootSubComponent.options.userOption);
        jqUnit.assertEquals("The user option is passed down to the subcomponent of the grade component", 2, root.gradeSubComponent.options.userOption);
    });

    /** FLUID-5017 - IoCSS: Merge "distributeOptions" of the own component and grade components **/

    fluid.defaults("fluid.tests.fluid5017Grade", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            myGradeSubComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.gradeOption",
            target: "{that > myGradeSubComponent}.options.gradeOption"
        }
    });

    fluid.defaults("fluid.tests.fluid5017Root", {
        gradeNames: ["fluid.tests.fluid5017Grade", "autoInit"],
        components: {
            myRootSubComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.rootOption",
            target: "{that > myRootSubComponent}.options.rootOption"
        }
    });

    jqUnit.test("FLUID-5017: Merge distributeOptions of the own component and grade components", function () {
        var root = fluid.tests.fluid5017Root({
            rootOption: 2,
            gradeOption: 20
        });

        jqUnit.assertEquals("The root option is passed down to the subcomponent of the root component", 2, root.myRootSubComponent.options.rootOption);
        jqUnit.assertEquals("The grade option is passed down to the subcomponent of the grade component", 20, root.myGradeSubComponent.options.gradeOption);
    });

    /** FLUID-5018 - IoCSS: Pass to-be-resolved option to a target **/

    fluid.defaults("fluid.tests.own", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            ownSub: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.toBeResolvedOption",
            target: "{that > ownSub}.options.resolvedOption"
        },
        toBeResolvedOption: "{that}.options.userOption",
        userOption: 10
    });

    jqUnit.test("FLUID-5018: Pass to-be-resolved option to a target", function () {
        var root = fluid.tests.own();

        jqUnit.assertEquals("The to-be-resolved option is passed down to the target", 10, root.ownSub.options.resolvedOption);
    });

    /** FLUID-5126 - Corruption of listener material held in demands blocks **/

    fluid.defaults("fluid.tests.fluid5126parent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            createEvent: null
        },
        members: {
            idRecord: []
        },
        components: {
            child: {
                createOnEvent: "createEvent",
                type: "fluid.eventedComponent",
                options: {
                    invokers: {
                        childListener: {
                            funcName: "fluid.tests.fluid5126listener",
                            args: ["{that}", "{fluid5126parent}"]
                        }
                    },
                    events: {
                        "childEvent": null
                    }
                }

            }
        }
    });

    fluid.tests.fluid5126register = function () {
        fluid.demands("fluid.eventedComponent", "fluid.tests.fluid5126parent", {
            options: {
                listeners: {
                    childEvent: {
                        func: "{that}.childListener"
                    }
                }
            }
        });
    };

    fluid.tests.fluid5126listener = function (that, parent) {
        parent.idRecord.push(that.id);
    };

    jqUnit.test("FLUID-5126: Corruption of listener records in demands blocks", function () {
        var parent = fluid.tests.fluid5126parent();
        function cycle() {
            fluid.tests.fluid5126register();
            parent.events.createEvent.fire();
        }
        cycle();
        var localChild = [parent.child.id];
        parent.child.events.childEvent.fire();
        cycle();
        localChild.push(parent.child.id);
        localChild.push(parent.child.id); // two listeners for duplicate from demands block
        parent.child.events.childEvent.fire();
        cycle();
        localChild.push(parent.child.id);
        localChild.push(parent.child.id);
        localChild.push(parent.child.id); // two listeners for duplicate from demands block
        parent.child.events.childEvent.fire();
        jqUnit.assertDeepEq("The three children should be registered in order", localChild, parent.idRecord);
    });

    /** FLUID-5023 - Corruption of model material in shared grades **/

    fluid.defaults("fluid.tests.fluid5023comp2", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: {}
    });

    fluid.tests.fluid5023comp2.finalInit = function (that) {
        // adds a unique ID to the model through the applier, so that we can check it later
        that.applier.requestChange("tempId", fluid.allocateGuid());
    };

    // define a simple grade
    fluid.defaults("fluid.tests.fluid5023testGrade", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    // add the grade to the test component using demands

    fluid.demands("fluid.tests.fluid5023comp2", ["fluid.testSharedGrade"], {
        options: {
            gradeNames: ["fluid.tests.fluid5023testGrade", "autoInit"]
        }
    });

    jqUnit.test("FLUID-5023: Test creation of two instances of the same component with a shared grade added through demands", function () {
        fluid.staticEnvironment.testSharedGrade = fluid.typeTag("fluid.testSharedGrade");
        // Instantiate two copies of the same test component
        // Use fluid.invoke to ensure demands honoured
        var c1 = fluid.invoke("fluid.tests.fluid5023comp2");
        var c2 = fluid.invoke("fluid.tests.fluid5023comp2");
        var defs = fluid.defaults("fluid.tests.fluid5023comp2");

        jqUnit.assertUndefined("The defaults should not have the tempId", defs.model.tempId);
        jqUnit.assertNotEquals("The ids in the models are not equal", c1.model.tempId, c2.model.tempId);

        delete fluid.staticEnvironment.testSharedGrade;
    });

    /** FLUID-5022 - Designation of dynamic components **/

    fluid.tests.fluid5022add = function (that) {
        that.count++;
    };

    fluid.defaults("fluid.tests.fluid5022head", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        values: [2, 3],
        members: {
            count: 0
        },
        dynamicComponents: {
            dynamic: {
                sources: "{that}.options.values",
                type: "fluid.eventedComponent",
                options: {
                    source: "{source}",
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.fluid5022add",
                            args: "{fluid5022head}"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5022: Dynamic component creation", function () {
        var head = fluid.tests.fluid5022head();
        jqUnit.assertEquals("Constructed 2 components", 2, head.count);
        jqUnit.assertEquals("First component source transmitted: ", 2, head.dynamic.options.source);
        jqUnit.assertEquals("First component source transmitted: ", 3, head["dynamic-1"].options.source);
    });

    fluid.defaults("fluid.tests.fluid5022eventHead", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            count: 0
        },
        events: {
            createIt: null
        },
        dynamicComponents: {
            dynamic: {
                createOnEvent: "createIt",
                type: "fluid.eventedComponent",
                options: {
                    source: "{arguments}.0.value",
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.fluid5022add",
                            args: "{fluid5022eventHead}"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5022: Dynamic component creation in response to events", function () {
        var head = fluid.tests.fluid5022eventHead();
        head.events.createIt.fire({value: 2});
        head.events.createIt.fire({value: 3});
        jqUnit.assertEquals("Constructed 2 components", 2, head.count);
        jqUnit.assertEquals("First component source transmitted: ", 2, head.dynamic.options.source);
        jqUnit.assertEquals("First component source transmitted: ", 3, head["dynamic-1"].options.source);
    });

    /** FLUID-5029 - Child selector ">" in IoCSS selector should not select an indirect child **/

    fluid.defaults("fluid.tests.fluid5029root", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            sub: {
                type: "fluid.littleComponent",
                options: {
                    components: {
                        subOfSub: {
                            type: "fluid.littleComponent"
                        }
                    }
                }
            }
        },
        distributeOptions: {
            source: "{that}.options.userOption",
            target: "{that > subOfSub}.options.userOption"
        },
        userOption: 10
    });

    jqUnit.test("FLUID-5029 - > separator in IoCSS target field should not identify a non-direct child", function () {
        var root = fluid.tests.fluid5029root();

        jqUnit.assertUndefined("The user option is not be passed down to the target", root.sub.subOfSub.options.userOption);
    });


    /** FLUID-5032 - Forward reference through grade hierarchy **/

    fluid.defaults("fluid.tests.fluid5032Root", {
        gradeNames: ["fluid.eventedComponent", "fluid.tests.fluid5032Grade", "autoInit"],
        components: {
            subComponent: {
                type: "fluid.eventedComponent"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5032Grade", {
        gradeNames: ["fluid.eventedComponent"],
        events: {
            creationEvent: null
        },
        listeners: {
            creationEvent: {
                listener: "fluid.tests.fluid5032listener",
                args: "{that}"
            }
        },
        components: {
            subComponent: {
                createOnEvent: "creationEvent"
            }
        }
    });

    fluid.tests.fluid5032listener = function (that) {
        that.creationEventFired = true;
    };

    jqUnit.test("FLUID-5032 - forward reference in grade hierarchy", function () {
        var root = fluid.tests.fluid5032Root();

        jqUnit.assertNotUndefined("The event defined in the grade component is merged in", root.events.creationEvent);
        jqUnit.assertFalse("The createOnEvent is not fired", root.creationEventFired);
        jqUnit.assertUndefined("The subcomponent that should be created on createOnEvent is not created", root.subComponent);
    });

    /** FLUID-5033 - Grade reloading **/

    function defineFluid5033Grade(value) {
        // Note that this technique must not be used within ordinary user code - in general the dynamic redefinition of a grade is an error.
        // This technique is only appropriate for development or "live coding" scenarios
        fluid.defaults("fluid.tests.fluid5033Grade", {
            gradeNames: ["fluid.littleComponent"],
            gradeValue: value
        });
    }
    defineFluid5033Grade(1);

    fluid.defaults("fluid.tests.fluid5033Root", {
        gradeNames: ["fluid.tests.fluid5033Grade", "autoInit"]
    });

    jqUnit.test("FLUID-5033 - grade reloading updates cache", function () {
        var root1 = fluid.tests.fluid5033Root();
        jqUnit.assertEquals("Original graded value", 1, root1.options.gradeValue);
        defineFluid5033Grade(2);
        var root2 = fluid.tests.fluid5033Root();
        jqUnit.assertEquals("Original graded value", 2, root2.options.gradeValue);
    });

    /** FLUID-4922 - Fast invokers and their caching characteristics **/

    fluid.tests.add = function (a, b) {
        return a + b;
    };

    fluid.tests.addArray = function (a, array) {
        return a + array[0] + array[1];
    };

    fluid.defaults("fluid.tests.fluid4922", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            value: 1
        },
        invokers: {
            slowInvoker: {
                funcName: "fluid.tests.add",
                args: ["{that}.value", "{arguments}.0"],
                dynamic: true
            },
            argsInvoker: { // This will be fast
                funcName: "fluid.tests.addArray",
                args: ["{that}.value", "{arguments}"]
            },
            fastInvoker: {
                funcName: "fluid.tests.add",
                args: ["{that}.value", "{arguments}.0"]
            },
            throughInvoker: {
                funcName: "fluid.tests.add"
            }
        }
    });

    jqUnit.test("FLUID-4922 - fast and slow invokers", function () {
        var that = fluid.tests.fluid4922();
        jqUnit.assertEquals("Slow init", 2, that.slowInvoker(1));
        jqUnit.assertEquals("Fast init", 2, that.fastInvoker(1));
        jqUnit.assertEquals("Through init", 2, that.throughInvoker(1, 1));
        jqUnit.assertEquals("Args init", 3, that.argsInvoker(1, 1));
        that.value = 2;
        jqUnit.assertEquals("Slow changed", 4, that.slowInvoker(2));
        jqUnit.assertEquals("Fast changed", 3, that.fastInvoker(2));
        jqUnit.assertEquals("Args changed", 5, that.argsInvoker(2, 2));
    });

    /** FLUID-5127 - Test cases for compact invokers, listeners and expandesr **/

    fluid.tests.fluid5127listener = function (value1, value2, that) {
        that.fireValue = value1 + value2;
    };

    fluid.tests.fluid5127modifyOne = function (value1, that) {
        that.one = value1;
    };

    fluid.defaults("fluid.tests.fluid5127root", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            one:         "@expand:fluid.identity(1)",
            two: 2,
            thing:       "@expand:fluid.identity(thing)",
            thing2:      "@expand:fluid.identity({that}.thing)",
            added:       "@expand:fluid.tests.add({that}.one, {that}.two)",
            addedInvoke: "@expand:{that}.addOne({that}.two)",
            number:      "@expand:fluid.identity(3.5)",
            "true":      "@expand:fluid.identity(true)",
            "false":     "@expand:fluid.identity(false)",
            fireValue: 0
        },
        invokers: {
            addOne: "fluid.tests.add({that}.one, {arguments}.0)",
            bindRecord: "fluid.tests.fluid5127listener({arguments}.0, {arguments}.1, {that})",
            addOneDynamic: "fluid.tests.add!({that}.one, {arguments}0)"
        },
        events: {
            addEvent: null,
            addEvent2: null,
            addEvent3: null
        },
        listeners: {
            addEvent: "fluid.tests.fluid5127listener({that}.one, {arguments}.0, {that})",
            addEvent2: "{that}.bindRecord({that}.one, {arguments}.0)",
            addEvent3: [
                "fluid.tests.fluid5127modifyOne({that}.two, {that})",
                "fluid.tests.fluid5127listener({that}.one, {that}.two, {that})"
            ]
        }
    });

    jqUnit.test("FLUID-5127 - compact syntax", function () {
        var that = fluid.tests.fluid5127root();
        jqUnit.assertEquals("String arguments", "thing", that.thing);
        jqUnit.assertEquals("Single arguments", "thing", that.thing2);
        jqUnit.assertEquals("Two arguments", 3, that.added);

        jqUnit.assertEquals("Number", 3.5, that.number);
        jqUnit.assertEquals("true", true, that["true"]);
        jqUnit.assertEquals("false", false, that["false"]);

        var added = that.addOne(2);
        jqUnit.assertEquals("Compact invoker", 3, added);
        jqUnit.assertEquals("Expander to invoker", 3, that.addedInvoke);

        that.events.addEvent.fire(1);
        jqUnit.assertEquals("Compact direct listener", 2, that.fireValue);

        that.events.addEvent2.fire(1);
        jqUnit.assertEquals("Compact invoker listener", 2, that.fireValue);

        that.events.addEvent3.fire(); // listener modifies the value of "one" to 2
        jqUnit.assertEquals("Multiple compact listeners", 4, that.fireValue);

        jqUnit.assertEquals("Static invoker", 2, that.addOne(1));
        jqUnit.assertEquals("Dynamic invoker", 3, that.addOneDynamic(1));
    });

    /** FLUID-5036, Case 1 - An IoCSS source that is fetched from the static environment is not resolved correctly **/

    fluid.defaults("fluid.tests.fluid5036_1Root", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            subComponent: {
                type: "fluid.littleComponent",
                options: {
                    targetOption: null
                }
            }
        },
        source: "{fluid5036_1UserOption}.options.userOption",
        distributeOptions: {
            source: "{that}.options.source",
            removeSource: true,
            target: "{that > subComponent}.options.targetOption"
        }
    });

    jqUnit.test("FLUID-5036, Case 1 - An IoCSS source that is fetched from the static environment is not resolved correctly", function () {
        var userOption = 10;

        fluid.staticEnvironment.fluid5036_1UserOption = fluid.littleComponent({
            gradeNames: "fluid5036_1UserOption",
            userOption: userOption
        });
        var root = fluid.tests.fluid5036_1Root();

        jqUnit.assertEquals("The user option fetched from the static environment is passed down the target", userOption, root.subComponent.options.targetOption);
    });

    /** FLUID-5036, Case 2 - An IoCSS source that is fetched from the static environment is not resolved correctly **/

    fluid.defaults("fluid.tests.fluid5036_2Root", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        // Note: this is not a recommended implementation technique, causing double nesting of options - this test is purely intendend to verify fix to a
        // framework issue which caused a faulty diagnostic "Malformed context reference without }" as well as to verify that at least some sensible effect
        // results from this reference. In general, i) only components are resolvable as context references (including in the static environment) and
        // ii) components should not be passed through options material as a whole - they should either be injected as subcomponents or else options
        // material selected from them resolved into other options
        source: "{fluid5036_2UserOption}",
        components: {
            subComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.source",
            removeSource: true,
            target: "{that > subComponent}.options"
        }
    });

    jqUnit.test("FLUID-5036, Case 2 - An IoCSS source that is fetched from the static environment is not resolved correctly", function () {
        var targetOption = 10;

        fluid.staticEnvironment.fluid5036_2UserOption = fluid.littleComponent({
            gradeNames: "fluid5036_2UserOption",
            targetOption: targetOption
        });
        var root = fluid.tests.fluid5036_2Root();

        jqUnit.assertEquals("The user option fetched from the static environment is passed down the target", targetOption, root.subComponent.options.options.targetOption);
    });

    fluid.defaults("fluid.tests.baseGradeComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        initialModel: {}
    });

    fluid.defaults("fluid.tests.derivedGradeComponent", {
        gradeNames: ["fluid.tests.baseGradeComponent", "autoInit"],
        initialModel: {
            test: true
        }
    });

    fluid.defaults("fluid.tests.implementationSubcomponent", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: {}
    });

    fluid.defaults("fluid.tests.implementationComponent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            subcomponent: {
                type: "fluid.tests.implementationSubcomponent",
                options: {
                    model: {
                        value: "{fluid.tests.baseGradeComponent}.options.initialModel.test"
                    }
                }
            }
        }
    });

    jqUnit.test("Contributed grade resolution", function () {
        var component = fluid.tests.implementationComponent({
            gradeNames: ["fluid.tests.derivedGradeComponent"]
        });
        jqUnit.assertTrue("Model fields should be resolved", component.subcomponent.model.value);
    });

    fluid.defaults("fluid.tests.builderComponent", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            actualComponent: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: ["{fluid.tests.builderComponent}.options.gradeName"],
                    components: {
                        originalSub: {
                            type: "fluid.littleComponent",
                            options: {
                                gradeNames: "autoInit"
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.contributedGrade", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            mustExist: {
                type: "fluid.littleComponent"
            }
        },
        existingOption: true
    });

    jqUnit.test("Contributed dynamic grade components resolution", function () {
        var builder = fluid.tests.builderComponent({
            gradeName: "fluid.tests.contributedGrade"
        });
        jqUnit.assertTrue("Non component related options are merged correctly", builder.actualComponent.options.existingOption);
        jqUnit.assertTrue("Grade was assigned correctly", fluid.hasGrade(builder.actualComponent.options, "fluid.tests.contributedGrade"));
        jqUnit.assertNotUndefined("The existing subcomponent exists", builder.actualComponent.originalSub);
        jqUnit.assertValue("Components must be merged correctly", builder.actualComponent.mustExist);
    });

    /** FLUID-5094: Dynamic grade merging takes an undefined source passed in from IoCSS into account rather than ignoring it **/

    fluid.defaults("fluid.tests.fluid5094", {
        gradeNames: ["fluid.littleComponent", "fluid.tests.nonExistedGrade", "autoInit"],
        components: {
            subComponent: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: ["{fluid.tests.fluid5094}.options.gradeName"]
                }
            }
        },
        passDownObject: "{nonExistedGrade}.options.fakeOption",
        distributeOptions: {
            source: "{that}.options.passDownObject",
            target: "{that > subComponent}.options"
        }
    });

    fluid.defaults("fluid.tests.fluid5094Grade", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            mustExist: {
                type: "fluid.littleComponent"
            }
        }
    });

    jqUnit.test("FLUID-5094: Dynamic grade merging takes an undefined source passed in from IoCSS into account rather than ignoring it", function () {
        var root = fluid.tests.fluid5094({
            gradeName: "fluid.tests.fluid5094Grade"
        });

        jqUnit.assertValue("Components must be merged correctly", root.subComponent.mustExist);
    });

    fluid.defaults("fluid.tests.fluid5117", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        inputObject: {
            "key1": "value1"
        },
        invokers: {
            getObject: {
                funcName: "fluid.identity",
                args: "{that}.options.inputObject"
            }
        },
        listeners: {
            onCreate: {
                listener: "fluid.tests.fluid5117.init",
                args: ["{that}", {expander: {func: "{that}.getObject"}}]
            }
        }
    });

    fluid.tests.fluid5117.init = function (that, retrievedObject) {
        that.options.outputObject = retrievedObject;
    };

    jqUnit.test("FLUID-5117: Function that uses an expander as an argument have the expander itself in the resolved expander return", function () {
        var that = fluid.tests.fluid5117();
        jqUnit.assertDeepEq("The output of an expander argument is same as the return of the expander function", that.options.inputObject, that.options.outputObject);
    });


    /** FLUID-5242: Corruption when distributing listener records to multiple components **/

    fluid.defaults("fluid.tests.tooltip", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            afterOpen: null
        }
    });

    fluid.defaults("fluid.tests.trackTooltips", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            tooltipListeners: "noexpand"
        },
        distributeOptions: {
            source: "{that}.options.tooltipListeners",
            removeSource: true,
            target: "{that fluid.tests.tooltip}.options.listeners"
        },
        tooltipListeners: {
            afterOpen: {
                funcName: "fluid.tests.trackTooltip",
                args: ["{trackTooltips}", "{arguments}.2", "{arguments}.1"]
            }
        },
        components: {
            tooltip1: {
                type: "fluid.tests.tooltip"
            },
            tooltip2: {
                type: "fluid.tests.tooltip"
            }
        },
        members: {
            fireRecord: []
        }
    });

    fluid.tests.trackTooltip = function (that, arg1, arg2) {
        that.fireRecord.push({arg1: arg1, arg2: arg2});
    };

    jqUnit.test("FLUID-5242: Corruption of listener blocks when distributed to multiple components", function () {
        var that = fluid.tests.trackTooltips();
        that.tooltip1.events.afterOpen.fire(0, 1, 2);
        that.tooltip2.events.afterOpen.fire(0, 1, 2);
        var expected = [{arg1: 2, arg2: 1}, {arg1: 2, arg2: 1}];
        jqUnit.assertDeepEq("Listeners fired without argument corruption", expected, that.fireRecord);
    });

    /** FLUID-5108: Source and supplied dynamic grades that both have common option(s) are not merged correctly **/

    fluid.defaults("fluid.tests.fluid5108", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        source: {
            options: {
                userOption: "initial"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5108Grade", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        source: {
            options: {
                userOption: "fromSuppliedGrade"
            }
        }
    });

    jqUnit.test("FLUID-5108: Source and supplied dynamic grades that both have common option(s) are not merged correctly", function () {
        var root = fluid.tests.fluid5108({
            gradeNames: "fluid.tests.fluid5108Grade"
        });

        jqUnit.assertTrue("The grade is merged correctly", fluid.hasGrade(root.options, "fluid.tests.fluid5108Grade"));
        jqUnit.assertEquals("The option from the supplied grade should overwrite the original component option", "fromSuppliedGrade", root.options.source.options.userOption);
    });

    /** FLUID-5155 failure of dynamic grade delivered dynamically **/

    fluid.defaults("fluid.tests.fluid5155dynamicParent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        parentOption: 1
    });

    fluid.defaults("fluid.tests.fluid5155dynamicGrade", {
        gradeNames: ["fluid.littleComponent", "autoInit", "{that}.computeGrade"],
        invokers: {
            computeGrade: "fluid.tests.computeFluid5155DynamicParent"
        }
    });

    fluid.tests.computeFluid5155DynamicParent = function () {
        return "fluid.tests.fluid5155dynamicParent";
    };

    fluid.defaults("fluid.tests.fluid5155root", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            subComponent: {
                type: "fluid.littleComponent"
            }
        },
        distributeOptions: {
            source: "{that}.options.subComponent",
            removeSource: true,
            target: "{that subComponent}.options"
        }
    });

    jqUnit.test("FLUID-5155 Dynamic grade support", function () {
        var that = fluid.tests.fluid5155root({
            subComponent: {
                gradeNames: "fluid.tests.fluid5155dynamicGrade"
            }
        });

        jqUnit.assertTrue("Correctly resolved parent grade", fluid.hasGrade(that.subComponent.options, "fluid.tests.fluid5155dynamicParent"));
        jqUnit.assertEquals("Correctly resolved options from parent grade", 1, that.subComponent.options.parentOption);
    });



    fluid.defaults("fluid.tests.dynamicInvoker", {
        gradeNames: ["autoInit", "fluid.littleComponent", "{that}.getDynamicInvoker"],
        invokers: {
            getDynamicInvoker: {
                funcName: "fluid.tests.dynamicInvoker.getDynamicInvoker"
            }
        }
    });

    fluid.tests.dynamicInvoker.getDynamicInvoker = function () {
        return "fluid.tests.dynamicInvokerGrade";
    };

    fluid.defaults("fluid.tests.dynamicInvokerGrade", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        invokers: {
            method: "fluid.tests.dynamicInvokerGrade.method"
        }
    });

    fluid.tests.dynamicInvokerGrade.method = function () {
        jqUnit.assertTrue("Dynamic invoker is called", true);
    };


    jqUnit.test("Test dynamic grade invoker contribution", function () {
        jqUnit.expect(2);
        var component = fluid.tests.dynamicInvoker();
        jqUnit.assertValue("Invoker is resolved correctly", component.method);
        component.method();
    });

    /*** FLUID-5243 re-entrant expansion aliasing test ***/

    fluid.defaults("fluid.tests.fluid5243Reorderer", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        layoutHandler: "fluid.tests.fluid5243ModuleLayout",
        mergePolicy: {
            "selectors.labelSource": "selectors.grabHandle",
            "selectors.selectables": "selectors.movables"
        },
        containerRole: "{that}.layoutHandler.options.containerRole",
        selectors: {
            movables:    ".flc-reorderer-movable",
            selectables: ".flc-reorderer-movable",
            grabHandle: ""
        },
        components: {
            layoutHandler: {
                type: "{that}.options.layoutHandler"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5243ModuleLayout", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        containerRole: "regions",
        selectors: {
            modules: "{fluid5243Reorderer}.options.selectors.modules",
            columns: "{fluid5243Reorderer}.options.selectors.columns"
        },
        invokers: {
            makeComputeModules: {
                funcName: "fluid.identity"
            }
        },
        distributeOptions: {
            target: "{fluid5243Reorderer}.options",
            record: {
                selectors: {
                    movables: {
                        expander: {
                            func: "{that}.makeComputeModules",
                            args: [false]
                        }
                    },
                    selectables: {
                        expander: {
                            func: "{that}.makeComputeModules",
                            args: [true]
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5243 re-entrant aliasing of path segments options corruption", function () {
        var that = fluid.tests.fluid5243Reorderer({
            selectors: {
                grabHandle: ".title",
                columns: ".flc-reorderer-column",
                modules: ".flc-reorderer-module"
            }
        });

        jqUnit.assertEquals("Noncorruption of reentrant options references", ".title",
            that.options.selectors.grabHandle);
    });


    /** FLUID-5212 dynamic grade linkage aka "new demands blocks" **/

    fluid.defaults("fluid.tests.gradeLinkageComponent", {
        gradeNames: ["autoInit", "fluid.littleComponent", "fluid.applyGradeLinkage"],
        invokers: {
            handle: {
                funcName: "fluid.tests.gradeLinkageComponent.handle"
            }
        }
    });

    fluid.defaults("fluid.tests.gradeLinkageRecord", {
        gradeNames: ["autoInit", "fluid.gradeLinkageRecord"],
        contextGrades: ["fluid.tests.contributedGrade1", "fluid.tests.gradeLinkageComponent"],
        resultGrades: "fluid.tests.contributedGrade2"
    });

    fluid.defaults("fluid.tests.fluid5212root", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        distributeOptions: {
            source: "{that}.options.contributedGradeNames",
            target: "{that subcomponent}.options.gradeNames"
        },
        components: {
            subcomponent: {
                type: "fluid.tests.gradeLinkageComponent"
            }
        },
        contributedGradeNames: ["fluid.tests.contributedGrade1"]
    });

    fluid.defaults("fluid.tests.contributedGrade1", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        invokers: {
            handle: {
                funcName: "fluid.tests.gradeLinkageComponent.handle1"
            }
        }
    });

    fluid.tests.gradeLinkageComponent.handle1 = function () {
        return false;
    };

    fluid.defaults("fluid.tests.contributedGrade2", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        invokers: {
            handle: {
                funcName: "fluid.tests.gradeLinkageComponent.handle2"
            }
        }
    });

    fluid.tests.gradeLinkageComponent.handle2 = function () {
        return true;
    };

    jqUnit.test("Test dynamic grade linkage", function () {
        jqUnit.expect(3);
        var component = fluid.tests.fluid5212root();
        fluid.each(["fluid.tests.contributedGrade1", "fluid.tests.contributedGrade2"], function (gradeName) {
            jqUnit.assertTrue("Grade is correctly applied", fluid.contains(component.subcomponent.options.gradeNames, gradeName));
        });
        jqUnit.assertTrue("Subcomponent invoker is overriden correctly", component.subcomponent.handle());
    });

    /** FLUID-5246 - dynamic grade linkage without initial dynamic grades **/

    fluid.defaults("fluid.tests.staticGradeLinkageRecord", {
        gradeNames: ["autoInit", "fluid.gradeLinkageRecord"],
        contextGrades: ["fluid.tests.fluid5246Root"],
        resultGrades: ["fluid.tests.fluid5246Result"]
    });

    fluid.defaults("fluid.tests.fluid5246Root", {
        gradeNames: ["autoInit", "fluid.littleComponent", "fluid.applyGradeLinkage"]
    });

    fluid.defaults("fluid.tests.fluid5246Result", {
        gradeNames: ["autoInit", "fluid.littleComponent"]
    });

    jqUnit.test("FLUID-5246 - static use of grade linkage", function () {
        var that = fluid.tests.fluid5246Root();
        jqUnit.assertTrue("Resolved statically linked grade is present", fluid.hasGrade(that.options, "fluid.tests.fluid5246Result"));
    });

    /** FLUID-5254 - failure of impersonateListener in dispatchListener **/

    fluid.tests.fluid5254Listener = function (that) {
        that.invocations++;
    };

    fluid.defaults("fluid.tests.fluid5254Root", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            rootEvent: null,
            creationEvent: null
        },
        components: {
            child: {
                createOnEvent: "creationEvent",
                type: "fluid.eventedComponent",
                options: {
                    events: {
                        childEvent: "{fluid5254Root}.events.rootEvent"
                    },
                    members: {
                        invocations: 0
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5254 - failure to impersonate raw listener in injected event", function () {
        var that = fluid.tests.fluid5254Root();
        that.events.creationEvent.fire();
        var listener = function () {
            fluid.tests.fluid5254Listener(that.child);
        };
        that.child.events.childEvent.addListener(listener);
        that.events.rootEvent.fire();
        jqUnit.assertEquals("Exactly one invocation for raw listener to injected event", 1, that.child.invocations);
        that.child.events.childEvent.removeListener(listener);
        that.events.rootEvent.fire();
        jqUnit.assertEquals("Exactly one invocation for raw listener to injected event", 1, that.child.invocations);
    });

    /** FLUID-5245 - distributeOptions based on grades which are themselves dynamic **/

    fluid.makeComponents({
        "fluid.tests.pageList":               "fluid.littleComponent",
        "fluid.tests.renderedPageList":       "fluid.littleComponent"
    });

    fluid.defaults("fluid.tests.fluid5245Root", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        distributeOptions: [{
            source: "{that}.options.pageList",
            removeSource: true,
            target: "{that fluid.tests.pageList}"
        }, {
            target: "{that fluid.tests.renderedPageList}.options.dynamicToDynamic",
            record: 0 // test distribution of falsy values at the same time
        }],
        components: {
            pageList: {
                type: "fluid.tests.pageList"
            }
        },
        pageList: {
            type: "fluid.tests.renderedPageList"
        }
    });

    jqUnit.test("FLUID-5245 - distributeOptions based on grades which were themselves distributed", function () {
        var that = fluid.tests.fluid5245Root();
        jqUnit.assertEquals("Successfully distributed option", 0, that.pageList.options.dynamicToDynamic);
    });

    /*** FLUID-5333 destruction during listener notification ***/
    
    fluid.tests.destructingListener = function (that) {
        that.destroy();
    };
    
    fluid.tests.notingListener = function (that) {
        that.noted = true;
    };
    
    fluid.defaults("fluid.tests.fluid5333component", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            ourEvent: null
        },
        listeners: {
            onCreate: ["fluid.tests.destructingListener", "fluid.tests.notingListener"],
            ourEvent: "fluid.tests.notingListener"
        }
    });
    
    jqUnit.test("FLUID-5333 - destruction during listener notification", function () {
        var that = fluid.tests.fluid5333component();
        jqUnit.assertEquals("Component should be returned in destroyed condition", true, fluid.isDestroyed(that));
        jqUnit.assertUndefined("Listeners after destruction point should not be notified", that.noted);
        that.events.ourEvent.fire(that);
        jqUnit.assertUndefined("Listeners after destruction point should not be notified", that.noted);
    });
    
    /*** FLUID-5266 diagnostic when accessing createOnEvent component before construction ***/
    
    fluid.defaults("fluid.tests.fluid5266root", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            creationEvent: null
        },
        components: {
            child: {
                type: "fluid.eventedComponent",
                createOnEvent: "creationEvent",
                options: {
                    members: {
                        initMember: 3
                    }
                }
            }
        }
    });
    
    // style 1 of ginger reference
    fluid.defaults("fluid.tests.fluid5266context", {
        gradeNames: ["fluid.tests.fluid5266root", "autoInit"],
        reference: "{child}.initMember"
    });
    
    fluid.defaults("fluid.tests.fluid5266direct", {
        gradeNames: ["fluid.tests.fluid5266root", "autoInit"],
        reference: "{that}.child.initMember"
    });
    
    jqUnit.test("FLUID-5226 - ginger reference to createOnEvent component should fail", function () {
        jqUnit.expectFrameworkDiagnostic("Bad ginger reference to createOnEvent via context", fluid.tests.fluid5266context, "createOnEvent");
        jqUnit.expectFrameworkDiagnostic("Bad ginger reference to createOnEvent via direct member", fluid.tests.fluid5266direct, "createOnEvent");
    });

})(jQuery);
