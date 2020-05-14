/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit, Float32Array, Map */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid IoC Tests");

    fluid.setLogging(fluid.logLevel.TRACE);
    // This option might one day support external visualisations of the framework activity, but for now is disabled
    // to aid tracking of memory leaks
    // fluid.activityTracing = true;


    fluid.defaults("fluid.tests.eventMerge", {
        gradeNames: ["fluid.component"],
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

    fluid.tests.makeNotingListener = function (key) {
        return function (that) {
            var existing = that.values[key];
            that.values[key] = existing === undefined ? 1 : existing + 1;
        };
    };

    fluid.defaults("fluid.tests.listenerTest", {
        gradeNames: ["fluid.component"],
        events: {
            event: null
        },
        listeners: {
            event: fluid.tests.makeNotingListener("noNamespace"),
            "event.namespace": fluid.tests.makeNotingListener("namespace"),
            onCreate: fluid.tests.makeNotingListener("onCreate"),
            "onCreate.namespace": fluid.tests.makeNotingListener("onCreate.namespace"),
            "onCreate.makeValues": {
                listener: "fluid.tests.listenerTest.makeValues",
                priority: "first"
            }
        }
    });

    fluid.tests.listenerTest.makeValues = function (that) {
        that.values = {};
    };

    jqUnit.test("Correctly merge optioned listeners", function () {
        var options = {listeners: {
            event: fluid.tests.makeNotingListener("noNamespace2"),
            "event.namespace": fluid.tests.makeNotingListener("namespace2"),
            onCreate: fluid.tests.makeNotingListener("onCreate2"),
            "onCreate.namespace": fluid.tests.makeNotingListener("onCreate.namespace2")
        }};
        var that = fluid.tests.listenerTest(options);
        var expected1 = {
            onCreate: 1,
            onCreate2: 1,
            "onCreate.namespace2": 1
        };
        jqUnit.assertDeepEq("Creation listeners merged and fired", expected1, that.values);
        that.events.event.fire(that);
        var expected2 = {
            noNamespace: 1,
            noNamespace2: 1,
            namespace2: 1
        };
        jqUnit.assertDeepEq("Listeners correctly merged", $.extend(expected2, expected1), that.values);
    });

    /** FLUID-5288: Improved diagnostic for incomplete grade hierarchy **/

    jqUnit.test("FLUID-5288: Improved diagnostic for component with incomplete grade hierarchy", function () {
        jqUnit.expectFrameworkDiagnostic("Framework diagnostic on incomplete grade hierarchy", function () {
            // TODO: in future, there will be no error thrown on definition, but only on use - since it should be possible
            // to declare grade hierarchies through forward reference
            fluid.defaults("fluid.tests.missingGradeComponent", {
                gradeNames: ["fluid.tests.nonexistentGrade"]
            });
            fluid.tests.missingGradeComponent();
        }, ["incomplete", "nonexistentGrade"]);
    });

    fluid.defaults("fluid.tests.nonexistentRootBase", {
        gradeNames: "fluid.component",
        components: {
            nonexistentRoot: {
                type: "fluid.tests.nonexistentGrade"
            }
        }
    });

    jqUnit.test("Framework diagnostic for all grades nonexistent", function () {
        jqUnit.expectFrameworkDiagnostic("Framework diagnostic on all grades nonexistent ", function () {
            fluid.tests.nonexistentRootBase();
        }, ["defined", "nonexistentGrade"]);
    });

    /** Forward reference through grade hierarchy **/

    fluid.defaults("fluid.tests.forwardRefComponent", {
        gradeNames: "fluid.tests.forwardBaseComponent"
    });

    fluid.defaults("fluid.tests.forwardBaseComponent", {
        gradeNames: "fluid.component"
    });

    jqUnit.test("Forward reference through grade hierarchy", function () {
        jqUnit.expect(1);
        var that = fluid.tests.forwardRefComponent();
        jqUnit.assertValue("Should have received component with forward grade reference", that);
    });

    /** fluid.parseContextReference tests **/

    fluid.tests.parseContext = [{
        ref: "{context}.path",
        expected: {
            context: "context",
            path: "path"
        }
    }, {
        ref: "{{nestedContext}.innerPath}.outerPath",
        expected: {
            context: {
                context: "nestedContext",
                path: "innerPath"
            },
            path: "outerPath"
        }
    }, {
        ref: "{{nestedContext}}.outerPath",
        expected: {
            context: {
                context: "nestedContext",
                path: ""
            },
            path: "outerPath"
        }
    }, {
        ref: "{{nestedContext}.innerPath}",
        expected: {
            context: {
                context: "nestedContext",
                path: "innerPath"
            },
            path: ""
        }
    }
    ];

    fluid.tests.filterContext = function (parsed) {
        var togo = fluid.filterKeys(parsed, ["context", "path"]);
        if (typeof(togo.context) === "object") {
            togo.context = fluid.tests.filterContext(togo.context);
        }
        return togo;
    };

    jqUnit.test("fluid.parseContextReference tests", function () {
        fluid.each(fluid.tests.parseContext, function (fixture, i) {
            var parsed = fluid.parseContextReference(fixture.ref);
            parsed = fluid.tests.filterContext(parsed);
            jqUnit.assertDeepEq("Expected parsed context index " + i, fixture.expected, parsed);
        });
    });

    /** FLUID-6456 Obsolete ${} EL style tests */

    fluid.defaults("fluid.tests.FLUID6456", {
        gradeNames: "fluid.component",
        nonexistent: "${nonexistent.thing}",
        nonexistentNested: "\"${{nonexistent}.nested}.thing\""
    });

    jqUnit.test("FLUID 6456: Obsolete ELstyle test", function () {
        var that = fluid.tests.FLUID6456();
        jqUnit.assertEquals("Should have received component with unexpanded obsolete EL", "${nonexistent.thing}",
            that.options.nonexistent);
        jqUnit.assertEquals("Should have received component with unexpanded obsolete EL", "\"${{nonexistent}.nested}.thing\"",
            that.options.nonexistentNested);
    });

    fluid.defaults("fluid.tests.defaultMergePolicy", {
        gradeNames: ["fluid.modelComponent"],
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
        "fluid.tests.multiResSub":        "fluid.component",
        "fluid.tests.multiResSub2":       "fluid.component",
        "fluid.tests.multiResSub3":       "fluid.component",
        "fluid.tests.fluid3818child":     "fluid.component",
        "fluid.tests.thatStackTail":      "fluid.component"
    });

    fluid.defaults("fluid.tests.invokerComponent", {
        gradeNames: ["fluid.component"],
        template: "Every {0} has {1} {2}(s)",
        invokers: {
            render: {
                funcName: "fluid.formatMessage",
                args: ["{invokerComponent}.options.template", "{arguments}.0"]
            }
        },
        events: {
            testEvent: null
        }
    });

    jqUnit.test("Invokers", function () {
        jqUnit.expect(2);
        var that = fluid.tests.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)",
            that.render(["CATT", "4", "Leg"]));
    });

    // Example taken from Enactors.js to verify action of expanders within invoker args - a non-recommended but permitted idiom

    fluid.tests.getLineHeightMultiplier = function (lineHeight, fontSize) {
        return lineHeight / fontSize;
    };

    fluid.defaults("fluid.tests.invokerExpander", {
        gradeNames: ["fluid.component"],
        textSizeInPx: 8,
        invokers: {
            getLineHeightMultiplier: {
                funcName: "fluid.tests.getLineHeightMultiplier",
                args: [{expander: {func: "{that}.getLineHeight"}}, "@expand:{that}.getTextSizeInPx({that}.options.textSizeInPx)"]
            },
            getLineHeight: "fluid.identity(16)",
            getTextSizeInPx: "fluid.identity"
        }
    });

    jqUnit.test("Expanders within invoker args", function () {
        var that = fluid.tests.invokerExpander();
        jqUnit.assertEquals("Resolved expanders via invoker argument list", 2, that.getLineHeightMultiplier());
    });

    fluid.defaults("fluid.tests.multiResolution", {
        gradeNames: ["fluid.component"],
        components: {
            resSub: {
                type: "fluid.tests.multiResSub"
            }
        }
    });

    fluid.defaults("fluid.tests.expanderMemberTiming", {
        gradeNames: ["fluid.component"],
        members: {
            expandMember: "@expand:fluid.tests.expanderTime({that})"
        },
        generalOption: 42
    });

    fluid.tests.expanderTime = function (that) {
        jqUnit.assertEquals("Member expanders should at least be able to see standard options", 42, that.options.generalOption);
    };

    jqUnit.test("Expander member timing", function () {
        // This is a very vexed issue until we have FLUID-4925. We experimented with moving "members" to the standard framework options
        // expansion workflow, but this disturbed many users, most of all, InlineEdit which expects to use expanders to resolve general options
        // material. Our ultimate goal is for expanders to only block on their immediate arguments, BUT for those to be expanded fully. This is not
        // possible with the current framework. So we have put back the old-fashioned "members" workflow with a fix for FLUID-5668, so that at least
        // we don't supply expanders within members (the most common case) with partially evaluated options.
        jqUnit.expect(1);
        fluid.tests.expanderMemberTiming();
    });

    /** FLUID-5758: expanders in listener args which refer to {arguments} **/

    fluid.defaults("fluid.tests.FLUID5758test", {
        gradeNames: "fluid.component",
        events: {
            onDoIt: null
        },
        listeners: {
            onDoIt: {
                funcName: "fluid.tests.FLUID5758record",
                args: ["{that}", {
                    expander: {
                        funcName: "fluid.identity",
                        args: ["{arguments}.0"]
                    }
                }]
            }
        }
    });

    fluid.tests.FLUID5758record = function (that, value) {
        that.recorded = value;
    };

    jqUnit.test("FLUID-5758: Resolution from {arguments} within listener expanders", function () {
        var comp = fluid.tests.FLUID5758test();
        comp.events.onDoIt.fire("Hugo");
        jqUnit.assertEquals("Resolved value from {arguments}", "Hugo", comp.recorded);
    });

    /** FLUID-5898: Diagnostic when expanding pathed "fast path" references with mismatched context **/

    fluid.defaults("fluid.tests.FLUID5898test", {
        gradeNames: "fluid.component",
        events: {
            onDoIt: null
        },
        listeners: {
            onDoIt: "fluid.identity({fluid.mismatched}.member)"
        }
    });

    jqUnit.test("FLUID-5898: diagnostic for pathed reference with mismatched context", function () {
        var that = fluid.tests.FLUID5898test();
        jqUnit.expectFrameworkDiagnostic("Received framework diagnostic", function () {
            that.events.onDoIt.fire();
        }, ["could not match context", "fluid.mismatched"]);
    });

    /** Preservation of material with "exotic types" (with constructor) for FLUID-5089 **/

    fluid.tests.customType = new Date();

    fluid.defaults("fluid.tests.typedMemberComponent", {
        gradeNames: ["fluid.component"],
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

    // This is identical to a test in Fluid.js, but exposed a bug in the alternative workflow that was triggered by FLUID-4930 work - "evaluateFully"
    fluid.defaults("fluid.tests.eventMerge", {
        gradeNames: ["fluid.component"],
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

    /** FLUID-4930 retrunking test taken from fluid-authoring arrow rendering **/

    fluid.tests.vectorToPolar = function (start, end) {
        var dx = end[0] - start[0], dy = end[1] - start[1];
        return {
            length: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx)
        };
    };

    fluid.defaults("fluid.tests.retrunking", {
        gradeNames: "fluid.component",
        arrowGeometry: {
            length: "{that}.options.polar.length",
            width: 10,
            headWidth: 20,
            headHeight: 20,
            angle: "{that}.options.polar.angle",
            start: [100, 100],
            end: [100, 200]
        },
        polar: "@expand:fluid.tests.vectorToPolar({that}.options.arrowGeometry.start, {that}.options.arrowGeometry.end)"
    });

    jqUnit.test("FLUID-4930: Options retrunking test", function () {
        var that = fluid.tests.retrunking();
        var expected = {
            length: 100,
            width: 10,
            headWidth: 20,
            headHeight: 20,
            angle: Math.PI / 2,
            start: [100, 100],
            end: [100, 200]
        };
        jqUnit.assertDeepEq("Successfully evaluated all options", expected, that.options.arrowGeometry);
    });

    // Structure taken from gpii.express.user.validationMiddleware"

    fluid.defaults("fluid.tests.FLUID4930.schemaHolder", {
        gradeNames: "fluid.component",
        schema: {
            type: "object",
            title: "gpii-express-user core user schema",
            description: "This schema defines the common format for user data transmitted and received by the gpii-express-user library.",
            definitions: {
                email: {
                    type: "string",
                    format: "email",
                    required: true,
                    errors: {
                        "": "gpii.express.user.email"
                    }
                },
                username: {
                    required: true,
                    type: "string",
                    minLength: 1,
                    errors: {
                        "": "gpii.express.user.username"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID4930.signup", {
        gradeNames: ["fluid.tests.FLUID4930.schemaHolder", "fluid.resourceLoader", "fluid.modelComponent"],
        resources: {
            schema: {
                promiseFunc: "{that}.generateSchema"
            }
        },
        model: {
            inputSchema: "{that}.resources.schema.parsed"
        },
        invokers: {
            generateSchema: "fluid.tests.FLUID4930.generateSchema({that}.options.schema)"
        },
        schema: {
            title: "gpii-express-user user signup schema",
            description: "This schema defines the format accepted when creating a new user.",
            properties: {
                email: "{that}.options.schema.definitions.email",
                username: "{that}.options.schema.definitions.username",
                password: "{that}.options.schema.definitions.password",
                confirm: "{that}.options.schema.definitions.confirm",
                profile: "{that}.options.schema.definitions.profile"
            }
        }
    });

    fluid.tests.FLUID4930.generateSchema = function (schema) {
        var togo = fluid.promise();
        togo.resolve(schema);
        return togo;
    };

    jqUnit.test("FLUID-4930: Retrunking III", function () {
        var that = fluid.tests.FLUID4930.signup();
        jqUnit.assertEquals("Successfully evaluated email option", "string", that.options.schema.properties.email.type);
        jqUnit.assertEquals("Successfully evaluated username option", "string", that.options.schema.properties.username.type);
    });

    /** FLUID-5755 - another "exotic types" test - this time a native array **/

    fluid.defaults("fluid.tests.componentWithTypedArrayOption", {
        gradeNames: "fluid.component",
        buffer: new Float32Array([1, 1, 1, 1])
    });

    jqUnit.test("FLUID-5755: Typed Array Component Merging", function () {
        var c = fluid.tests.componentWithTypedArrayOption();
        jqUnit.assertDeepEq("The component's typed array should be set to the default value.", new Float32Array([1, 1, 1, 1]),
            c.options.buffer);

        c = fluid.tests.componentWithTypedArrayOption({
            buffer: new Float32Array([2, 2, 2, 2])
        });
        jqUnit.assertDeepEq("The component's typed array should have been overriden.", new Float32Array([2, 2, 2, 2]), c.options.buffer);
    });

    /** FLUID-5239 **/

    // dynamically creating name to show that anything starting with "source" will not be resolved by IoC
    var name = "source" + fluid.allocateGuid();

    fluid.defaults("fluid." + name, {
        gradeNames: ["fluid.component"]
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

    /** FLUID-4637 component proximity resolution test **/

    fluid.defaults("fluid.tests.twinSubComponent", {
        gradeNames: ["fluid.component"],
        preInitFunction: "fluid.tests.twinSubComponent.preInit",
        events: {
            childEvent: null
        },
        invokers: {
            testRealName: "fluid.tests.twinSubComponent.testRealName({that}, {arguments}.0)" // expectedName
        },
        listeners: {
            childEvent: "{twinSubComponent}.testRealName"
        },
        realName: ""
    });

    fluid.tests.twinSubComponent.testRealName = function (that, expectedName) {
        jqUnit.assertEquals("The correct component should be triggered", expectedName, that.options.realName);
    };

    fluid.defaults("fluid.tests.twinParent", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        invokers: {
            get: {
                funcName: "fluid.identity",
                args: {value: 4}
            }
        }
    });

    fluid.defaults("fluid.tests.URLDataSource", {
        gradeNames: ["fluid.tests.dataSource"],
        url: "http://jsforcats.com",
        invokers: {
            resolve: {
                funcName: "fluid.identity",
                args: "{dataSource}.options.url"
            }
        }
    });

    jqUnit.test("FLUID-4914: resolve grade as context name", function () {
        var dataSource = fluid.tests.URLDataSource();
        var url = dataSource.resolve();
        jqUnit.assertEquals("Resolved grade context name via invoker", dataSource.options.url, url);
        var data = dataSource.get();
        jqUnit.assertDeepEq("Resolved grade context name as demands context", {value: 4}, data);
    });

    /** FLUID-4916 dynamic grade support tests **/

    fluid.defaults("fluid.tests.dynamicParent", {
        gradeNames: ["fluid.component"],
        parentOption: 1
    });

    fluid.defaults("fluid.tests.dynamicGrade", {
        gradeNames: ["fluid.component", "{that}.computeGrade"],
        invokers: {
            computeGrade: "fluid.tests.computeDynamicParent",
            respondParent: {
                funcName: "fluid.tests.respondParentImpl",
                args: "{dynamicParent}.options.parentOption"
            }
        }
    });

    fluid.tests.computeDynamicParent = function () {
        return "fluid.tests.dynamicParent";
    };

    fluid.tests.respondParentImpl = fluid.identity;

    jqUnit.test("FLUID-4916 Dynamic grade support", function () {
        var that = fluid.tests.dynamicGrade();
        jqUnit.assertTrue("Correctly resolved parent grade", fluid.hasGrade(that.options, "fluid.tests.dynamicParent"));
        jqUnit.assertEquals("Correctly resolved options from parent grade", 1, that.options.parentOption);
        jqUnit.assertEquals("Correctly resolved parent-contextualised invoker", 1, that.respondParent());
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
        gradeNames: ["fluid.component"],
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
        fluid.each(fluid.tests.IoCSSParsing, function (fixture) {
            var parser = function () { return fluid.parseSelector(fixture.selector, fluid.IoCSSMatcher);};
            if (fixture.expected === "fail") {
                jqUnit.expectFrameworkDiagnostic("Invalid selector", parser, "selector");
            }
            else {
                var parsed = parser();
                jqUnit.expect(1);
                jqUnit.assertDeepEq("Parsed selector " + fixture.selector, fixture.expected, parsed);
            }
        });
    });

    fluid.contextAware.makeChecks({"fluid.test": true});

    fluid.makeComponents ({
        "fluid.tests.uploader.html5": "fluid.component",
        "fluid.tests.uploaderImpl": "fluid.component"
    });

    // Simplified example derived from parts of the old uploader initialisation strategy
    // which we still support.
    fluid.defaults("fluid.tests.uploader", {
        gradeNames: ["fluid.component"],
        components: {
            uploaderContext: {
                type: "fluid.tests.uploader.html5"
            },
            uploaderImpl: {
                type: "fluid.tests.uploaderImpl"
            }
        },
        distributeOptions: {
            source: "{that}.options",
            exclusions: ["components.uploaderContext", "components.uploaderImpl"],
            target: "{that > uploaderImpl}.options"
        }
    });


    fluid.defaults("fluid.tests.uploader.multiFileUploader", {
        gradeNames: ["fluid.component"]
    });

    jqUnit.test("FLUID-4873 Total Skywalker Options Distribution", function () {
        var uploader = fluid.tests.uploader({userOption: 5}).uploaderImpl;
        jqUnit.assertEquals("Skywalker options transmission", 5, uploader.options.userOption);
        jqUnit.assertNoValue("Options exclusion", uploader.uploaderContext);
    });

    /** FLUID-6137 distributeOptions with 0 as value **/

    fluid.defaults("fluid.tests.distributeOptionsZero", {
        gradeNames: ["fluid.component"],
        components: {
            child: {
                type: "fluid.component"
            }
        },
        toDistributeCheck: 1,
        toDistribute: 0,
        distributeOptions: [{
            source: "{that}.options.toDistributeCheck",
            target: "{that child}.options.sourceSanityCheck"
        }, {
            record: 1,
            target: "{that child}.options.recordSanityCheck"
        }, {
            source: "{that}.options.toDistribute",
            target: "{that child}.options.fromSource"
        }, {
            record: 0,
            target: "{that child}.options.fromRecord"
        }]
    });

    jqUnit.test("FLUID-6137 distributeOptions with 0 as value", function () {
        var distributeZero = fluid.tests.distributeOptionsZero();
        jqUnit.assertEquals("Option should be distributed to sourceSanityCheck", 1, distributeZero.child.options.sourceSanityCheck);
        jqUnit.assertEquals("Option should be distributed to recordSanityCheck", 1, distributeZero.child.options.recordSanityCheck);
        jqUnit.assertEquals("Option should be distributed to fromSource", 0, distributeZero.child.options.fromSource);
        jqUnit.assertEquals("Option should be distributed to fromRecord", 0, distributeZero.child.options.fromRecord);
    });

    /** FLUID-4926 Invoker tests **/

    fluid.defaults("fluid.tests.invokerFunc", {
        gradeNames: ["fluid.component"],
        members: {
            value: 3
        },
        invokers: {
            targetInvoker: "fluid.identity",
            sourceInvoker: {
                func: "{that}.targetInvoker",
                args: false
            },
            structuralInvoker: {
            // This test also exercises a crucial part of the reference idiom - obviously fluid.identity can't clone its
            // argument, and obviously the return value needs to be referenceable after the return. This implies we
            // can't get away without invokers doing a deep clone of structural arguments - at least to any site of expansion.
                funcName: "fluid.identity",
                args: {
                    arg1: "{arguments}.1",
                    key: {
                        value: "{that}.value",
                        arg0: "{arguments}.0"
                    }
                }
            },
            nullInvoker: null // FLUID-4861
        }
    });

    jqUnit.test("FLUID-4926 Invoker resolution test", function () {
        var that = fluid.tests.invokerFunc();
        var result = that.sourceInvoker();
        jqUnit.assertEquals("Invoker relay of false argument", false, result);
        jqUnit.assertUndefined("No invoker constructed from empty record", that.nullInvoker);
        var result2 = that.structuralInvoker(1, 2);
        jqUnit.assertDeepEq("Structural boiling of invoker argument", {arg1: 2, key: {value: 3, arg0: 1} }, result2);
    });

    /** FLUID-5733 abstract grade test **/

    fluid.defaults("fluid.tests.FLUID5733invoker", {
        gradeNames: "fluid.component",
        invokers: {
            abstractInvoker: "fluid.notImplemented",
            abstractWithArgs: {
                funcName: "fluid.notImplemented",
                args: ["one", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID5733override", {
        gradeNames: "fluid.tests.FLUID5733invoker",
        invokers: {
            abstractInvoker: { // tests FLUID-5714 also
                func: fluid.identity
            },
            abstractWithArgs: "fluid.identity"
        }
    });

    fluid.defaults("fluid.tests.FLUID5733nonoverride", {
        gradeNames: "fluid.tests.FLUID5733invoker"
    });

    jqUnit.test("FLUID-5733: prevent instantiation of \"abstract grade\" with fluid.notImplemented invoker", function () {
        jqUnit.expectFrameworkDiagnostic("Diagnostic on instantiation", function () {
            fluid.tests.FLUID5733invoker();
        }, ["overridden", "fluid.tests.FLUID5733invoker"]);
        jqUnit.expectFrameworkDiagnostic("Diagnostic on instantiation mentioning source grade", function () {
            fluid.tests.FLUID5733nonoverride();
        }, ["overridden", "fluid.tests.FLUID5733invoker"]);
        jqUnit.expect(2);
        var that = fluid.tests.FLUID5733override();
        jqUnit.assertEquals("Correct override of invoker with concrete", 3, that.abstractInvoker(3));
        jqUnit.assertEquals("Correct override of invoker with original args by string style", 3, that.abstractWithArgs(3));
    });

    fluid.defaults("fluid.tests.FLUID5733event", {
        gradeNames: "fluid.component",
        events: {
            lifeEvent: null
        },
        listeners: {
            "lifeEvent.namespace": "fluid.notImplemented"
        }
    });

    fluid.defaults("fluid.tests.FLUID5733eventOverride", {
        gradeNames: "fluid.component",
        events: {
            lifeEvent: null
        },
        listeners: {
            "lifeEvent.namespace": "fluid.identity"
        }
    });

    jqUnit.test("FLUID-5733: prevent instantiation of \"abstract grade\" with fluid.notImplemented namespaced listener", function () {
        jqUnit.expectFrameworkDiagnostic("Diagnostic on instantiation", function () {
            fluid.tests.FLUID5733event();
        }, ["overridden", "fluid.tests.FLUID5733event"]);
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5733eventOverride();
        that.events.lifeEvent.fire();
        jqUnit.assert("Correct override of namespaced listener with concrete");
    });

    /** Expansion order test **/

    // Example liberated from PrefsEditor implementation, which revealed requirement for
    // "expansion before merging" when constructing the new framework. This is a perverse
    // but probably valid usage of the framework. These kinds of "wholesale options transmissions"
    // cases are intended to be handled by FLUID-4873 "Luke Skywalker Options" ("distributeOptions")

    fluid.defaults("fluid.tests.uiEnhancer", {
        gradeNames: ["fluid.component"],
        value: 3,
        outerValue: 4
    });

    fluid.defaults("fluid.tests.pageEnhancer", {
        gradeNames: ["fluid.component"],
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

    /** FLUID-5743 - Arabic Grades **/

    fluid.defaults("fluid.tests.componentOne", {
        gradeNames: "fluid.component",
        option1: "TEST1",
        option3: "TEST1"
    });

    fluid.defaults("fluid.tests.componentTwo", {
        gradeNames: "fluid.component",
        option1: "TEST2",
        option2: "TEST2"
    });

    fluid.defaults("fluid.tests.combinedComponent", {
        gradeNames: ["fluid.tests.componentOne", "fluid.tests.componentTwo"]
    });

    jqUnit.test("FLUID-5743 Arabic grade merging", function () {
        var merged = fluid.tests.combinedComponent();
        var expected = {
            option1: "TEST2",
            option2: "TEST2",
            option3: "TEST1"
        };
        jqUnit.assertLeftHand("Merged grades in correct left-to-right order", expected, merged.options);
        var merged2 = fluid.tests.componentOne({
            gradeNames: "fluid.tests.componentTwo"
        });
        jqUnit.assertLeftHand("Merged grades in correct left-to-right order with direct grade arguments", expected, merged2.options);
    });

    /** FLUID-5800 - grade hierarchy resolution algorithm **/

    fluid.defaults("fluid.tests.FLUID5800base", {
        events: {
            onUserToken: null
        },
        members: {
            eventCount: 0
        },
        listeners: {
            onUserToken: [{
                listener: "fluid.tests.fluid5800count",
                args: ["{that}", "{arguments}.0"]
            }, "{that}.getPreferences"]
        },
        invokers: {
            getPreferences: "fluid.tests.fluid5800count",
            getDeviceContext: "fluid.tests.fluid5800count"
        }
    });

    fluid.tests.fluid5800count = function (that) {
        ++that.eventCount;
    };

    fluid.defaults("fluid.tests.FLUID5800mid", { // this used to throw on registration
        gradeNames: "fluid.tests.FLUID5800base",
        listeners: {
            onUserToken: "{that}.getDeviceContext"
        }
    });

    fluid.defaults("fluid.tests.FLUID5800", {
        gradeNames: ["fluid.component", "fluid.tests.FLUID5800mid"]
    });

    jqUnit.test("FLUID-5800 merge corruption", function () {
        jqUnit.expect(2);

        var that = fluid.tests.FLUID5800();
        jqUnit.assertValue("Successfully constructed instance (basic test)", that);
        that.events.onUserToken.fire(that);
        jqUnit.assertEquals("Listeners have merged correctly", 3, that.eventCount);
        // Failure IS observable through this route, but it is not economic to fix this without rewriting the entire default merge workflow -
        // See FLUID-5800 JIRA comment
        // var midDefaults = fluid.defaults("fluid.tests.FLUID5800mid");
        // jqUnit.assertEquals("Listeners were designated correctly in abstract grade", 3, midDefaults.listeners.onUserToken.length);
    });

    fluid.defaults("fluid.tests.FLUID5800base2", {
        gradeNames: "fluid.component",
        members: {
            expanderCount: 0
        },
        mergePolicy: {
            expanderOption: fluid.arrayConcatPolicy
        },
        expanderOption: "@expand:fluid.tests.FLUID5800expand({that}, {that}.expanderCount)"
    });

    fluid.defaults("fluid.tests.FLUID5800mid2", {
        gradeNames: "fluid.tests.FLUID5800base2"
    });

    fluid.defaults("fluid.tests.FLUID5800mid3", {
        gradeNames: "fluid.tests.FLUID5800base2"
    });
    // NB this grade just here for reference purposes, not used in test
    fluid.defaults("fluid.tests.FLUID5800leaf", {
        gradeNames: ["fluid.tests.FLUID5800mid2", "fluid.tests.FLUID5800mid3"]
    });

    fluid.tests.FLUID5800expand = function (that) {
        return that.expanderCount++;
    };

    jqUnit.test("FLUID-5800 repeated expander evaluation", function () {
        // Note that, obnoxiously, this failure cannot be observed via fluid.tests.FLUID5800leaf since defaults really DO just accumulate
        // non-accumulatively
        var that = fluid.tests.FLUID5800mid2({gradeNames: "fluid.tests.FLUID5800mid3"});
        jqUnit.assertEquals("Expander evaluated only once", 1, that.expanderCount);
    });

    /** FLUID-5615: Base grades of subcomponents should be weaker than dynamic **/

    fluid.defaults("fluid.tests.FLUID5615sub", {
        gradeNames: ["fluid.component", "fluid.tests.FLUID5615subBase"],
        value: "fromSub"
    });

    fluid.defaults("fluid.tests.FLUID5615subBase", {
        gradeNames: "fluid.component",
        value: "fromSubBase"
    });

    fluid.defaults("fluid.tests.FLUID5615dyn", {
        gradeNames: "fluid.component",
        value: "fromDyn"
    });

    fluid.defaults("fluid.tests.FLUID5615base", {
        gradeNames: "fluid.component",
        distributeOptions: {
            record: "fluid.tests.FLUID5615dyn",
            target: "{that sub}.options.gradeNames"
        },
        components: {
            sub: {
                type: "fluid.component",
                options: {
                    gradeNames: "fluid.tests.FLUID5615sub"
                }
            }
        }
    });

    jqUnit.test("FLUID-5615 sub vs dynamic", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5615base();
        jqUnit.assertEquals("Distribution should beat subcomponent base", "fromDyn", that.sub.options.value);
    });

    /** Listener merging tests **/

    fluid.defaults("fluid.tests.listenerMerging", {
        gradeNames: ["fluid.component"],
        invokers: {
            eventFired: "fluid.tests.listenerMerging.eventFired({that}, {arguments}.0)" // eventName
        },
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

    fluid.tests.listenerMerging.eventFired = function (that, eventName) {
        that[eventName] = true;
    };

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
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        listeners: {
            "{fluid5128head}.events.subscrEvent": {
                funcName: "fluid.tests.fluid5128listener",
                args: ["{fluid5128head}", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5128head", {
        gradeNames: ["fluid.component"],
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

    /** Contextualisation of invokers **/

    fluid.defaults("fluid.tests.thatStackHead", {
        gradeNames: ["fluid.component"],
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
                            type: "fluid.expander.invokeFunc",
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
        gradeNames: ["fluid.component"]
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
            var allExpandOptions = fluid.transform(blocks, function (block) {
                var thisOptions = $.extend(true, {}, baseExpandOptions);
                return fluid.makeExpandOptions(block, thisOptions);
            });
            var baseMergeOptions = {
                target: target,
                sourceStrategies: fluid.getMembers(allExpandOptions, "strategy")
            };
            var mergeOptions = fluid.makeMergeOptions({}, fluid.getMembers(allExpandOptions, "target"), baseMergeOptions);
            ultimateStrategy = mergeOptions.strategy;
            fluid.each(allExpandOptions, function (expandOption) { expandOption.initter();});
            mergeOptions.initter();
            jqUnit.assertDeepEq("Properly merged and expanded self-referential structure", entry.expected, target);
        });
    };

    fluid.each(gingerTests, function (entry) {
        fluid.tests.testOneGinger(entry);
    });

    fluid.defaults("fluid.tests.gingerMiddle", {
        gradeNames: ["fluid.component"],
        lowOption: "lowOption"
    });

    fluid.defaults("fluid.tests.gingerTop", {
        gradeNames: ["fluid.component"],
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

    /** FLUID-4330 - ginger reference during "short expansion" **/
    // FLUID-5249 and similar work caused degradation in ginger support - the new "expandImmediate" and "fetch expander" don't
    // trigger ginger instantiation for component references themselves. This should be fixed automatically by FLUID-4925

    fluid.defaults("fluid.tests.gingerEventRoot", {
        gradeNames: "fluid.component",
        components: {
            gingerSource: {
                type: "fluid.component",
                options: {
                    listeners: {
                        "{gingerTarget}.events.gingerTarget": "fluid.identity({that}.options)"
                    }
                }
            },
            gingerTarget: {
                type: "fluid.component",
                options: {
                    events: {
                        gingerTarget: null
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-4330/FLUID-5249 ginger reference from listener key", function () {
        jqUnit.expect(1);
        var that = fluid.tests.gingerEventRoot();
        jqUnit.assertValue("Expected component construction", that);
    });

    fluid.defaults("fluid.tests.FLUID5696root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            dataRange: "{chaundles}.model.dataRange"
        },
        components: {
            chaundleTileManager: {
                type: "fluid.modelComponent"
            },
            chaundles: {
                type: "fluid.modelComponent",
                options: {
                    modelListeners: {
                        "{tileManager}.model.dataTicks.mainWindow": "{that}.resolveInject()" // TODO: declarative syntax with FLUID-5695
                    },
                    components: {
                        tileManager: "{FLUID5696root}.chaundleTileManager"
                    },
                    invokers: {
                        resolveInject: "fluid.identity({tileManager})"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5696 ginger reference from model system to injected component", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5696root();
        var resolved = that.chaundles.resolveInject();
        jqUnit.assertEquals("Resolved injected component by member name", that.chaundleTileManager, resolved);
    });

    /** FLUID-5818 - ginger reference from distant construct descendent of incomplete parent **/

    fluid.defaults("fluid.tests.FLUID5818root", {
        gradeNames: "fluid.component",
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    components: {
                        child3: {
                            type: "fluid.component",
                            options: {
                                listeners: {
                                    onCreate: {
                                        funcName: "fluid.tests.fluid5818fetch",
                                        args: "{child2}"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            child2: {
                type: "fluid.component"
            }
        }
    });

    fluid.tests.fluid5818fetch = function (child2) {
        jqUnit.assertValue("Should have caused fetch of child of unconstructed parent", child2);
    };

    jqUnit.test("FLUID-5818 ginger reference to child of unconstructed parent", function () {
        jqUnit.expect(5);
        var that = fluid.tests.FLUID5818root();
        // White-box testing of lifecycle status
        fluid.each([that, that.child1, that.child2, that.child1.child3], function (component) {
            jqUnit.assertEquals("All components should have \"treeConstructed\" state", "treeConstructed", component.lifecycleStatus);
        });
    });

    /** FLUID-6468 - ginger reference to site of nested reference **/

    fluid.defaults("fluid.tests.FLUID6468root", {
        gradeNames: ["fluid.component"],
        components: {
            coOcRoot: {
                type: "fluid.component",
                options: {
                    components: {
                        recipesContainer: "{coOcRoot}.componentRoot.recipes",
                        componentRoot: "{FLUID6468root}.componentRoot"
                    }
                }
            },
            componentRoot: {
                type: "fluid.component",
                options: {
                    components: {
                        recipes: {
                            type: "fluid.component",
                            options: {
                                recipe: 42
                            }
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6468 ginger reference to site of nested parent", function () {
        var that = fluid.tests.FLUID6468root();
        jqUnit.assertEquals("Cross-injected reference walked", 42, that.coOcRoot.recipesContainer.options.recipe);
    });

    /** FLUID-5925 - ginger reference from IoC-qualified listener key **/

    fluid.defaults("fluid.tests.FLUID5925root1", {
        gradeNames: "fluid.component",
        components: {
            referrer: {
                type: "fluid.modelComponent",
                options: {
                    listeners: {
                        "{eventHolder}.events.targetEvent": {
                            changePath: "value",
                            value: "{arguments}.0"
                        }
                    }
                }
            },
            eventHolder: {
                type: "fluid.component",
                options: {
                    events: {
                        targetEvent: null
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5925 ginger reference from IoC-qualified listener key", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5925root1();
        that.eventHolder.events.targetEvent.fire(1);
        jqUnit.assertEquals("Ginger reference successfully registered model listener", 1, that.referrer.model.value);
    });

    fluid.defaults("fluid.tests.FLUID5925root2", {
        gradeNames: "fluid.component",
        events: {
            localEvent: null
        },
        listeners: {
            localEvent: {
                listener: "{invokerHolder}.record"
            }
        },
        components: {
            invokerHolder: {
                type: "fluid.modelComponent",
                options: {
                    invokers: {
                        record: {
                            changePath: "value",
                            value: 1
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5925 ginger reference from IoC-qualified listener function", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5925root2();
        that.events.localEvent.fire(1);
        jqUnit.assertEquals("Ginger reference successfully registered model listener", 1, that.invokerHolder.model.value);
    });

    /** FLUID-5820 - scope chain reference to injected component **/

    fluid.defaults("fluid.tests.FLUID5820root", {
        gradeNames: "fluid.component",
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    components: {
                        child2: {
                            type: "fluid.component"
                        }
                    }
                }
            },
            child3: {
                type: "fluid.component",
                options: {
                    components: {
                        child2: "{child1}.child2"
                    },
                    invokers: {
                        get: "fluid.identity({child2})"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5820 scope chain reference to injected component", function () {
        var root = fluid.tests.FLUID5820root();
        var child = root.child3.get();
        jqUnit.assertEquals("Got resolved injected value via scope chain", root.child1.child2, child);
    });

    /** FLUID-4135 - event injection and boiling test **/

    fluid.defaults("fluid.tests.listenerHolder", {
        gradeNames: ["fluid.component"],
        invokers: {
            listener: "fluid.tests.listenerHolder.listener({that}, {arguments}.0)"
        }
    });

    fluid.tests.listenerHolder.listener = function (that, value) {
        that.value = value;
    };

    fluid.defaults("fluid.tests.eventParent", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        events: {
            parentEvent: "{eventParent}.events.parentEvent",
            boiledParent: {
                event: "{eventParent}.events.parentEvent",
                args: ["{eventParent}", "{eventChild}", "{arguments}.0"]
            },
            boiledLocal: {
                event: "localEvent",
                args: ["{arguments}.0", "{eventChild}"]
            },
            localEvent: null
        },
        listeners: {
            "{eventParent}.events.parentEvent": "{eventParent}.listenerHolder.listener"
        }
    });

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
            jqUnit.assertEquals("Injection of self via boiling", child, argChild);
        });
        child.events.localEvent.fire(origArg0);
    });

    /** FLUID-4398 - event injection and event/listener boiling test **/

    fluid.tests.invokerListener = function (injectThat, transmitThat) {
        injectThat.invokerListenerCheck = injectThat === transmitThat;
    };

    fluid.defaults("fluid.tests.eventParent3", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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
        that.eventChild.events.relayEvent.addListener(function (arg) {
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
        gradeNames: ["fluid.component"],
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
            ++count;
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
        gradeNames: ["fluid.component"],
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

    /** FLUID-6202: merging over composite event **/

    fluid.defaults("fluid.tests.FLUID6202parent", {
        gradeNames: "fluid.component",
        members: {
            fireCount: 0
        },
        events: {
            baseEvent: null,
            compositeEvent: {
                events: {
                    baseEvent: "baseEvent"
                }
            }
        },
        listeners: {
            compositeEvent: "fluid.tests.FLUID6202recordFire({that})"
        }
    });

    fluid.tests.FLUID6202recordFire = function (that) {
        ++that.fireCount;
    };

    fluid.defaults("fluid.tests.FLUID6202child", {
        gradeNames: "fluid.tests.FLUID6202parent",
        events: {
            childEvent: null,
            compositeEvent: {
                events: {
                    childEvent: "childEvent"
                }
            }
        }
    });

    jqUnit.test("FLUID-6202: Merging over composite event", function () {
        var that = fluid.tests.FLUID6202child();
        jqUnit.assertEquals("No firing at start", 0, that.fireCount);
        that.events.childEvent.fire();
        jqUnit.assertEquals("No firing with child event", 0, that.fireCount);
        that.events.baseEvent.fire();
        jqUnit.assertEquals("1 firing with base event", 1, that.fireCount);
        that.events.baseEvent.fire();
        jqUnit.assertEquals("No firing with base event", 1, that.fireCount);
        that.events.childEvent.fire();
        jqUnit.assertEquals("One firing with child event", 2, that.fireCount);
    });

    /** FLUID-4135 - simple event injection test **/

    // Simpler demonstration matching docs, also using "scoped event binding"
    fluid.defaults("fluid.tests.eventParent2", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        events: {
            parentEvent: "{eventParent2}.events.parentEvent"
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
        gradeNames: ["fluid.component"],
        members: {
            thisistThing: {
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

    /** FLUID-5184 - "overriding this-ist invoker" **/

    fluid.defaults("fluid.tests.overrideInvokerThis", {
        gradeNames: "fluid.component",
        members: {
            thisistThing: {
                expander: { funcName: "fluid.tests.makeThisistThing" }
            }
        },
        invokers: {
            overridden: {
                "this": "{that}.thisistThing",
                method: "thisistMethod"
            }
        }
    });

    fluid.tests.overrideInvokerThis.override = function (storedArg, that) {
        that.thisistThing.thisistMethod("Stored arg set to: " + storedArg);
    };

    jqUnit.test("FLUID-5184 overriding this-ist invoker", function () {
        var that = fluid.tests.overrideInvokerThis({
            invokers: {
                overridden: {
                    funcName: "fluid.tests.overrideInvokerThis.override",
                    args: ["{arguments}.0", "{that}"]
                }
            }
        });
        that.overridden(7);
        jqUnit.assertEquals("The overriding method should be called by the invoker", "Stored arg set to: 7", that.thisistThing.storedArg);
    });

    /** FLUID-6136 - "overriding changePath invoker" **/

    fluid.defaults("fluid.tests.overrideInvokerChangePath", {
        gradeNames: "fluid.modelComponent",
        model: {
            value: "foo"
        },
        invokers: {
            toOverride: {
                changePath: "value",
                value: "{arguments}.0"
            }
        }
    });

    fluid.tests.overrideInvokerChangePath.overridden = function (that) {
        that.applier.change("value", "overridden");
    };

    jqUnit.test("FLUID-6136 overriding changePath invoker", function () {
        var replace = fluid.tests.overrideInvokerChangePath({
            invokers: {
                toOverride: {
                    funcName: "fluid.tests.overrideInvokerChangePath.overridden",
                    args: ["{that}"]
                }
            }
        });
        replace.toOverride("bar");
        jqUnit.assertEquals("The overriding method should be called by the invoker", "overridden", replace.model.value);

        var replaceAndNull = fluid.tests.overrideInvokerChangePath({
            invokers: {
                toOverride: {
                    funcName: "fluid.tests.overrideInvokerChangePath.overridden",
                    args: ["{that}"]
                }
            }
        });
        replaceAndNull.toOverride("bar");
        jqUnit.assertEquals("The overriding method, with changePath and value nulled out, should be called by the invoker", "overridden", replaceAndNull.model.value);
    });

    /** FLUID-4055 - reinstantiation test **/

    fluid.defaults("fluid.tests.refChild", {
        gradeNames: ["fluid.component"]
    });

    fluid.defaults("fluid.tests.reinstantiation", {
        gradeNames: ["fluid.component"],
        members: {
            headValue: "headValue"
        },
        events: {
            createIt: null
        },
        components: {
            headChild: {
                type: "fluid.component"
            },
            child1: {
                type: "fluid.component",
                createOnEvent: "createIt",
                options: {
                    components: {
                        child2: {
                            type: "fluid.tests.reinsChild2",
                            options: {
                                value: "{reinstantiation}.headValue",
                                components: {
                                    child3: {
                                        type: "fluid.tests.reinsChild2",
                                        options: {
                                            value: "{reinstantiation}.headValue"
                                        }
                                    },
                                    // This duplication tests FLUID-4166
                                    child5: "{reinstantiation}.headChild",
                                    child6: "{reinstantiation}.headChild",
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

    fluid.defaults("fluid.tests.reinsChild2", {
        gradeNames: ["fluid.component"],
        members: {
            otherValue: "{reinstantiation}.headValue"
        }
    });

    function checkValue(message, root, value, paths) {
        fluid.each(paths, function (path) {
            jqUnit.assertEquals(message + " transmitted from root to path " + path, value, fluid.get(root, path));
        });
    }

    jqUnit.test("FLUID-4055 reinstantiation test", function () {
        var reins = fluid.tests.reinstantiation();
        reins.events.createIt.fire();
        var origID = reins.child1.child2.id;
        var expectedPaths = [
            "child1.child2.options.value",
            "child1.child2.otherValue",
            "child1.child2.child3.options.value",
            "child1.child2.child3.otherValue",
            "child1.child2.child8.options.value"
        ];
        checkValue("Original value", reins, reins.headValue, expectedPaths);
        reins.headValue = "headValue2";
        reins.events.createIt.fire();
        jqUnit.assertNotEquals("Child2 reinstantiated", origID, reins.child1.child2.id);
        checkValue("Changed value", reins, "headValue2", expectedPaths);
    });

    /** FLUID-5812 - corruption in clear in cases of partial clear **/

    fluid.defaults("fluid.tests.FLUID5812root", {
        gradeNames: "fluid.component",
        components: {
            child1: {
                type: "fluid.component"
            },
            child2: {
                type: "fluid.component",
                options: {
                    components: {
                        child3: {
                            type: "fluid.component",
                            options: {
                                components: {
                                    inject1: "{FLUID5812root}.child1"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5812 mis-clear test I", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5812root();
        that.child2.destroy();
        that.child1.destroy();
        jqUnit.assertNoValue("Successfully cleared child1 from injected site before root site", that.child1);
    });

    jqUnit.test("FLUID-5812 mis-clear test II", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5812root();
        that.manualInject = that.child2.child3;
        that.child2.destroy();
        that.destroy();
        jqUnit.assert("No error on clearing with manually injected, destroyed component");
    });

    /** FLUID-5904 - corruption when throwing during expander resolution **/

    fluid.defaults("fluid.tests.FLUID5904root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        components: {
            child: {
                type: "fluid.component",
                createOnEvent: "createIt",
                options: {
                    explodingMember: "@expand:fluid.tests.FLUID5904explode()"
                }
            }
        }
    });

    fluid.tests.FLUID5904explode = function () {
        throw new Error("explode");
    };

    jqUnit.test("FLUID-5904: corruption when throwing from expander", function () {
        jqUnit.expect(2);
        var that = fluid.tests.FLUID5904root();
        try {
            that.events.createIt.fire();
        } catch (e) {
            jqUnit.assert("Exception received during construction");
        }
        that.destroy();
        jqUnit.assert("Successfully destroyed root");
    });

    /** FLUID-4711 - corruption in clear with injected material of longer scope **/

    fluid.defaults("fluid.tests.clearParent", {
        gradeNames: ["fluid.component"],
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

    /** FLUID-6193: corruption when options distribution head is shorter-lived sibling **/

    fluid.defaults("fluid.tests.FLUID6193root", {
        gradeNames: "fluid.component",
        components: {
            distroSource: {
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        record: 5,
                        target: "{siblingHead distroTarget}.options.five"
                    }
                }
            },
            siblingHead: {
                type: "fluid.component",
                options: {
                    events: {
                        createTarget: null
                    },
                    components: {
                        distroTarget: {
                            // note that without createOnEvent, there is no way the distribution can win the race -
                            // this will change with FLUID-6148 world and should be re-tested
                            createOnEvent: "createTarget",
                            type: "fluid.component"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6193 options distribution with shorter-lived sibling as head", function () {
        jqUnit.expect(2);
        var root = fluid.tests.FLUID6193root();
        root.siblingHead.events.createTarget.fire();
        jqUnit.assertEquals("Distribution reached target", 5, root.siblingHead.distroTarget.options.five);
        root.siblingHead.destroy();
        root.destroy();
        jqUnit.assert("Components destroyed without failure");
    });

    /** FLUID-4179 unexpected material in clear test **/

    fluid.defaults("fluid.tests.misclearTop", {
        gradeNames: ["fluid.component"],
        components: {
            middle: {
                type: "fluid.tests.misclearMiddle"
            }
        }
    });

    fluid.defaults("fluid.tests.misclearMiddle", {
        gradeNames: ["fluid.component"],
        components: {
            leaf: {
                type: "fluid.tests.misclearLeaf"
            }
        },
        returnedPath: "leaf"
    });

    fluid.defaults("fluid.tests.misclearLeaf", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        mergePolicy: {
            dangerousParams: "noexpand"
        }
    });

    fluid.defaults("fluid.tests.mergeComponent", {
        gradeNames: ["fluid.component"],
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

    /** Component lifecycle functions and merging test - includes FLUID-4257 **/

    function pushRecord(target, name, extra, that, childName, parent) {
        var key = that.options.name + "." + name;
        var listenerRecord = fluid.getForComponent(target, "listenerRecord");
        listenerRecord.push(extra ? {
            key: key,
            name: childName,
            parent: fluid.computeNickName(parent.typeName)
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

    fluid.tests.timedGlobalListener = function (that, name, args) {
        var fromRootPath = fluid.model.parseEL(args[1]).slice(1).join(".");
        that.listenerRecord.push({
            key: fromRootPath + "." + name,
            created: args[3]
        });
    };

    fluid.tests.pushMainEventListener = function (that) {
        that.listenerRecord.push("root.mainEventListener");
    };

    // Test FLUID-4162 by creating namespace before component of the same name
    fluid.registerNamespace("fluid.tests.lifecycle");

    fluid.defaults("fluid.tests.lifecycle.recordingComponent", {
        gradeNames: ["fluid.component"],
        mergePolicy: {
            parent: "nomerge"
        },
        listeners: {
            onCreate: fluid.tests.makeTimedChildListener("onCreate"),
            onDestroy: fluid.tests.makeTimedChildListener("onDestroy", true),
            afterDestroy: fluid.tests.makeTimedChildListener("afterDestroy", true)
        }
    });

    fluid.defaults("fluid.tests.lifecycle", {
        gradeNames: ["fluid.component"],
        events: {
            mainEvent: null
        },
        invokers: {
            mainEventListener: "fluid.tests.pushMainEventListener({that})"
        },
        members: {
            listenerRecord: []
        },
        name: "root",
        listeners: {
            mainEvent: "{lifecycle}.mainEventListener",
            onCreate: fluid.tests.makeTimedListener("onCreate"),
            onDestroy: fluid.tests.makeTimedListener("onDestroy", true), // must never fire - root component must have manual destruction
            "{instantiator}.events.onComponentAttach": {
                funcName: "fluid.tests.timedGlobalListener",
                args: ["{that}", "onComponentAttach", "{arguments}"]
            },
            "{instantiator}.events.onComponentClear": {
                funcName: "fluid.tests.timedGlobalListener",
                args: ["{that}", "onComponentClear", "{arguments}"]
            }
        },
        components: {
            initTimeComponent: {
                type: "fluid.tests.lifecycle.recordingComponent",
                options: {
                    parent: "{lifecycle}",
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
            }
        }
    });

    jqUnit.test("Component lifecycle test - with FLUID-4257", function () {
        var testComp = fluid.tests.lifecycle();
        testComp.events.mainEvent.fire(testComp);
        testComp.events.mainEvent.fire(testComp);
        var expected = [
            // Note: we don't get onComponentAttach for root because it occurs before we can register root listeners
            // {key: "initTimeComponent.onComponentAttach", created: true},
            "initTimeComponent.onCreate",
            "root.onCreate",
            "root.mainEventListener",
            {key: "eventTimeComponent.onComponentAttach", created: true},
            {key: "eventTimeComponent.injected.onComponentAttach", created: false},
            "eventTimeComponent.onCreate",
            "root.mainEventListener",
            {key: "eventTimeComponent.onComponentClear", created: true},
            {key: "eventTimeComponent.injected.onComponentClear", created: false},
            {key: "eventTimeComponent.onDestroy", name: "eventTimeComponent", parent: "lifecycle"},
            {key: "eventTimeComponent.afterDestroy", name: "eventTimeComponent", parent: "lifecycle"},
            {key: "eventTimeComponent.onComponentAttach", created: true},
            {key: "eventTimeComponent.injected.onComponentAttach", created: false},
            "eventTimeComponent.onCreate"
        ];
        jqUnit.assertDeepEq("Expected initialisation sequence", expected, testComp.listenerRecord);
        // Unbind its global listeners
        testComp.destroy();
    });

    /** FLUID-5930 - presence of injected components during onDestroy **/

    fluid.defaults("fluid.tests.fluid5930.root", {
        gradeNames: "fluid.component",
        components: {
            toInject: {
                type: "fluid.component"
            },
            middle: {
                type: "fluid.component",
                options: {
                    components: {
                        injectSite: "{toInject}"
                    },
                    listeners: {
                        onDestroy: "fluid.tests.fluid5930.checkInjection"
                    }
                }
            }
        }
    });

    fluid.tests.fluid5930.checkInjection = function (middle) {
        jqUnit.assertValue("Injected component reference should still be present during onDestroy", middle.injectSite);
    };

    jqUnit.test("Component lifecycle test - FLUID-5930 injection clearing", function () {
        jqUnit.expect(2);
        var that = fluid.tests.fluid5930.root();
        jqUnit.assertValue("Check correct injection on startup", that.middle.injectSite);
        that.destroy();
    });

    /** FLUID-5931 - full clearance of records during afterDestroy **/

    fluid.defaults("fluid.tests.fluid5931.root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        components: {
            recreate: {
                type: "fluid.component",
                createOnEvent: "createIt",
                options: {
                    creationValue: "{arguments}.0",
                    listeners: {
                        afterDestroy: "fluid.tests.fluid5931.recreate({root})"
                    }
                }
            }
        }
    });

    fluid.tests.fluid5931.recreate = function (root) {
        // In the future framework, this must still start creation immediately - although it will not conclude until the fluid-componentConstruction listener
        root.events.createIt.fire(2);
    };

    jqUnit.test("Component lifecycle test - FLUID-5931 afterDestroy clearance", function () {
        jqUnit.expect(2);
        var that = fluid.tests.fluid5931.root();
        that.events.createIt.fire(1);
        jqUnit.assertEquals("Correct instance on first firing", 1, that.recreate.options.creationValue);
        that.recreate.destroy();
        jqUnit.assertEquals("Correct instance on second firing", 2, that.recreate.options.creationValue);
    });

    /** FLUID-5790 - neutering invoker support **/

    fluid.defaults("fluid.tests.fluid5790.root", {
        gradeNames: "fluid.component",
        invokers: {
            explode: "fluid.fail"
        }
    });

    jqUnit.test("Neutering invoker test", function () {
        jqUnit.expect(1);
        var that = fluid.tests.fluid5790.root();
        that.destroy();
        that.explode();
        jqUnit.assert("Harmless explosion after component is destroyed");
    });

    /** FLUID-5268 - direct root "afterDestroy" listener **/

    fluid.defaults("fluid.tests.fluid5268", {
        gradeNames: ["fluid.component"]
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
        gradeNames: ["fluid.component"],
        events: {
            parentEvent: null,
            parentEvent2: null
        },
        components: {
            child1: {
                type: "fluid.tests.child4257",
                options: {
                    events: {
                        parentEvent2: "{head4257}.events.parentEvent2"
                    },
                    listeners: {
                        "{head4257}.events.parentEvent": [{
                            listener: "{child4257}.listener",
                            namespace: "parentSpace", // Attempt to fool identification of event
                            args: ["{head4257}", {code: "{arguments}.0", source: "parentSpace"}]
                        }, {
                            listener: "{child4257}.listener",
                            args: ["{head4257}", {code: "{arguments}.0", source: "direct"}]
                        }],
                        parentEvent2: [{
                            listener: "{child4257}.listener",
                            namespace: "parentSpace", // Attempt to fool identification of event
                            args: ["{head4257}", {code: "{arguments}.0", source: "parentSpace"}]
                        }, {
                            listener: "{child4257}.listener",
                            args: ["{head4257}", {code: "{arguments}.0", source: "direct"}]
                        }]
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.child4257", {
        gradeNames: ["fluid.component"],
        invokers: {
            listener: "fluid.tests.child4257.listener({that}, {arguments}.0, {arguments}.1)" // parentThat, arg
        }
    });

    fluid.tests.child4257.listener = function (that, parentThat, arg) {
        parentThat.records = parentThat.records || [];
        parentThat.records.push(fluid.copy(arg));
    };

    jqUnit.test("FLUID-4257 test: removal of injected listeners", function () {
        var that = fluid.tests.head4257();
        that.events.parentEvent.fire(3);
        that.events.parentEvent2.fire(4);
        var expected = [{code: 3, source: "parentSpace"}, {code: 3, source: "direct"}, {code: 4, source: "parentSpace"}, {code: 4, source: "direct"}];
        jqUnit.assertDeepEq("First event fire", expected, that.records);
        that.child1.destroy();
        that.events.parentEvent.fire(5);
        that.events.parentEvent2.fire(6);
        jqUnit.assertDeepEq("Listener no longer registered", expected, that.records);
    });

    /** FLUID-4290 - createOnEvent sequence corruption test **/

    fluid.defaults("fluid.tests.createOnEvent", {
        gradeNames: "fluid.component",
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
                type: "fluid.component",
                createOnEvent: "afterRender"
            }
        }
    });

    fluid.defaults("fluid.tests.createOnEvent.iframe", {
        gradeNames: ["fluid.component"],
        listeners: {
            onCreate: "{that}.events.afterRender.fire"
        }
    });

    jqUnit.test("FLUID-4290 test: createOnEvent sequence corruption", function () {
        jqUnit.expect(1);
        fluid.tests.createOnEvent();
        jqUnit.assert("Component successfully constructed");
    });

    /** FLUID-6367 - createOnEvent during onCreate **/

    fluid.defaults("fluid.tests.FLUID6367head", {
        gradeNames: "fluid.component",
        listeners: {
            onCreate: "fluid.tests.FLUID6367create"
        },
        events: {
            createIt: null
        },
        components: {
            child: {
                type: "fluid.component",
                createOnEvent: "createIt"
            }
        }
    });

    fluid.tests.FLUID6367create = function (that) {
        that.events.createIt.fire();
        // Note that these flags are not intended to be inspected by ordinary users - at least, they should not
        // be expected to resolve the difference between "constructed" and "treeConstructed"
        jqUnit.assertEquals("Subcomponent should be fully constructed", "treeConstructed", that.child.lifecycleStatus);
    };

    jqUnit.test("FLUID-6367 test: createOnEvent during onCreate", function () {
        jqUnit.expect(1);
        fluid.tests.FLUID6367head();
    });

    /** Tree circularity tests (early detection of stack overflow) **/

    fluid.defaults("fluid.tests.circularEvent", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        circular1: "{that}.options.circular2",
        circular2: "{that}.options.circular1"
    });

    circularTest("fluid.tests.circularOptions", "options circularity test");

    fluid.defaults("fluid.tests.circularity", {
        gradeNames: ["fluid.component"],
        components: {
            instantiator: "{instantiator}",
            child1: {
                type: "fluid.tests.circChild"
            }
        }
    });

    fluid.defaults("fluid.tests.circChild", {
        gradeNames: ["fluid.component"],
        mergePolicy: {
            instantiator: "nomerge"
        },
        instantiator: "{circularity}.instantiator"
    });

    jqUnit.test("Tree circularity test", function () {
        jqUnit.expect(1);
        var that = fluid.tests.circularity();
        var circular = {};
        circular.circular = circular;
        // if this test fails, the browser will bomb with a stack overflow
        jqUnit.assertValue("Circular test delivered instantiator", that.child1.options.instantiator);
        jqUnit.expectFrameworkDiagnostic("Framework exception in circular expansion", function () {
            fluid.expandOptions(circular, that);
        }, "circular");
    });

    jqUnit.test("FLUID-5667: Circularity in options precursors", function () {
        var circular = {};
        circular.property = circular;
        jqUnit.expectFrameworkDiagnostic("Framework exception caught in circular expansion", function () {
            fluid.component({
                circular: circular
            });
        }, "circular");
    });

    fluid.defaults("fluid.tests.FLUID5088Circularity", {
        gradeNames: ["fluid.component"],
        option1: "{that}.options.option2",
        option2: "{that}.options.option1"
    });

    jqUnit.test("FLUID-5088: Direct circularity test", function () {
        jqUnit.expectFrameworkDiagnostic("Framework exception caught in circular expansion", fluid.tests.FLUID5088Circularity, "circular");
    });

    /** This test case reproduces a circular reference condition found in the Flash
     *  implementation of the uploader, which the framework did not properly detect. In the
     *  FLUID-4330 framework, this is no longer an error */

    fluid.defaults("fluid.tests.circular.strategy", {
        gradeNames: ["fluid.component"],
        components: {
            local: {
                type: "fluid.component"
            },
            engine: {
                type: "fluid.tests.circular.engine"
            }
        }
    });

    fluid.tests.circular.initEngine = function (that) {
        that.bindEvents();
    };

    fluid.defaults("fluid.tests.circular.engine", {
        gradeNames: ["fluid.component"],
        invokers: {
            bindEvents: {
                funcName: "fluid.tests.circular.engine",
                args: "{strategy}.local"
            }
        },
        components: {
            swfUpload: {
                type: "fluid.component"
            }
        },
        listeners: {
            onCreate: "fluid.tests.circular.initEngine"
        }
    });

    jqUnit.test("Advanced circularity test I", function () {
        jqUnit.expectFrameworkDiagnostic("Attempt to invoke creator via invoker", fluid.tests.circular.strategy, "invoker");
    });

    /** FLUID-5668: Mouse droppings when merging member holding expander reference **/

    fluid.defaults("fluid.tests.droppingsRoot", {
        gradeNames: "fluid.component",
        topRecord: {
            a: 1,
            b: 2
        },
        distributeOptions: {
            record: {
                c: 3
            },
            target: "{that child}.options.members.mergingMember"
        },
        components: {
            child: {
                type: "fluid.component",
                options: {
                    members: {
                        mergingMember: "{droppingsRoot}.options.topRecord"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5668: Mouse droppings in compound expansion", function () {
        var that = fluid.tests.droppingsRoot();
        var member = that.child.mergingMember;
        jqUnit.assertNoValue("Absence of string mouse droppings in reference holder", member[0]);
    });

    /** FLUID-5668: Ability to suppress merging for member using mergePolicy **/

    fluid.defaults("fluid.tests.FLUID5668nomerge", {
        gradeNames: "fluid.component",
        mergePolicy: {
            "members.noMergeMember": "replace"
        },
        members: {
            noMergeMember: "@expand:fluid.fail(Exploding member should not be evaluated)"
        }
    });

    fluid.defaults("fluid.tests.FLUID5668nomergeDerived", {
        gradeNames: "fluid.tests.FLUID5668nomerge",
        members: {
            noMergeMember: 3
        }
    });

    jqUnit.test("FLUID-5668: Ability to defeat merging for members", function () {
        var that = fluid.tests.FLUID5668nomergeDerived();
        jqUnit.assertEquals("Successfully overridden merging member declaration", 3, that.noMergeMember);
    });

    /** FLUID-5694: Circularity in component injection **/

    fluid.defaults("fluid.tests.fluid5694circle", {
        gradeNames: "fluid.component",
        components: {
            child: "{fluid5694circle}.child"
        }
    });

    fluid.defaults("fluid.tests.fluid5694circle2", {
        gradeNames: "fluid.component",
        components: {
            child1: "{fluid5694circle2}.child2",
            child2: "{fluid5694circle2}.child1"
        }
    });

    jqUnit.test("FLUID-5694 circularity test", function () {
        jqUnit.expectFrameworkDiagnostic("Expect framework diagnostic on self-injection", function () {
            fluid.tests.fluid5694circle();
        }, "Circular");
        jqUnit.expectFrameworkDiagnostic("Expect framework diagnostic on circular injection", function () {
            fluid.tests.fluid5694circle2();
        }, "Circular");
    });

    /** FLUID-6148: Injection of unconstructed component **/

    fluid.defaults("fluid.tests.fluid6148ahead", {
        gradeNames: "fluid.component",
        components: {
            injected: "{fluid6148ahead}.ahead",
            ahead: {
                type: "fluid.component"
            }
        }
    });

    jqUnit.test("FLUID-6148: Injection of unconstructed component", function () {
        var that = fluid.tests.fluid6148ahead();
        jqUnit.assertValue("Expected injected value", that.injected);
        jqUnit.assertEquals("Expected injected value equal to constructed", that.injected, that.ahead);
    });

    /** Correct resolution of invoker arguments through the tree **/

    fluid.defaults("fluid.tests.invokerGrandParent", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.modelComponent"],
        model: {
            testValue: 1
        },
        invokers: {
            checkTestValue: {
                funcName: "fluid.tests.checkTestValue",
                args: "{invokerParent}.model"
            }
        }
    });

    fluid.defaults("fluid.tests.invokerParentWrapper", {
        gradeNames: ["fluid.modelComponent"],
        components: {
            parent2: {
                type: "fluid.tests.invokerParent"
            }
        }
    });

    fluid.tests.checkTestValue = function (model) {
        return model.testValue;
    };

    jqUnit.test("Invoker resolution tests", function () {
        var that = fluid.tests.invokerGrandParent();
        var newValue = 2;
        that.invokerwrapper.parent2.applier.change("testValue", newValue);
        jqUnit.assertEquals("The invoker for second subcomponent should return the value from its parent",
            newValue, that.invokerwrapper.parent2.checkTestValue());
    });

    /** FLUID-4712 - contextualisation of calls issued from an invoker **/

    fluid.defaults("fluid.tests.test4712parent", {
        gradeNames: ["fluid.component"],
        components: {
            refChild3: { // put at top level so that "blank instantiator guess" is definitively wrong
                type: "fluid.component",
                options: {
                    refOption: 3
                }
            },
            refChild: {
                type: "fluid.component",
                options: {
                    components: {
                        refChild2: {
                            type: "fluid.component",
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

    jqUnit.test("Invoker contextualisation tests", function () {
        jqUnit.expect(2);
        var that = fluid.tests.test4712parent();
        jqUnit.assertEquals("Child component should be properly instantiated", 3, that.refChild.refChild2.ref3.options.refOption);
        jqUnit.assertEquals("Invoker should resolve on startup", 3, that.refChild.invoker());
        that.refChild.refChild2.destroy();
        jqUnit.expectFrameworkDiagnostic("No ginger construction outside fit", function () {
            // Change in behaviour for 2.0 framework - old framework would reconstruct this
            that.refChild.invoker();
        }, ["could not match context", "refChild2"]);
    });

    /** FLUID-4285 - prevent attempts to refer to options outside options block **/

    fluid.defaults("fluid.tests.news.parent", {
        gradeNames: ["fluid.modelComponent"],
        model: { test: "test" },
        components: {
            child: {
                type: "fluid.tests.news.child",
                model: "{parent}.model" // error HERE
            }
        }
    });

    fluid.defaults("fluid.tests.news.child", {
        gradeNames: ["fluid.modelComponent"]
    });

    jqUnit.test("FLUID-4285 test - prevent unencoded options", function () {
        jqUnit.expectFrameworkDiagnostic("Constructing stray options component", fluid.tests.news.parent, "options");
    });

    fluid.defaults("fluid.tests.badListener", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        events: {
            outEvent1: null,
            // note inconsistency - only IoC-resolved events get instantiator wrapping!
            // "that" reference tests FLUID-4680
            outEvent2: "{that}.events.outEvent1"
        }
    });

    fluid.defaults("fluid.tests.island2", {
        gradeNames: ["fluid.component"],
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

    jqUnit.test("FLUID-4626 test - cross-island use of instantiators", function () {
        jqUnit.expect(1);
        var island1 = fluid.tests.island1();
        var island2 = fluid.tests.island2();
        island1.events.outEvent2.addListener(function () {
            island2.events.inEvent.fire();
        });
        island1.events.outEvent2.fire();
        jqUnit.assert("No error fired on cross-island dispatch");
    });

    fluid.defaults("fluid.tests.grade", {
        gradeNames: ["fluid.component"],
        gradeOpt: {
            gradeOpt: "gradeOpt"
        }
    });

    fluid.defaults("fluid.tests.comp", {
        gradeNames: ["fluid.component"],
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

    fluid.defaults("fluid.tests.circularGrade", {
        gradeNames: ["fluid.component"],
        extraOpt: "extraOpt"
    });

    jqUnit.test("FLUID-4939: Component with gradeName modification - circular grades", function () {
        jqUnit.expect(1);
        var that = fluid.component({
            gradeNames: ["fluid.tests.circularGrade"]
        });
        jqUnit.assertEquals("Extra option added", "extraOpt", that.options.extraOpt);
    });

    /** FLUID-5012: IoCSS doesn't apply the gradeNames option onto the target component **/

    fluid.defaults("fluid.tests.prefsEditor", {
        gradeNames: ["fluid.component"],
        components: {
            templateLoader: {
                type: "fluid.component"
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
        var expectedGrades = ["fluid.component", "fluid.tests.defaultTemplateLoader"];

        jqUnit.assertDeepEq("The option grades are merged into the target component", expectedGrades, prefsEditor.templateLoader.options.gradeNames);
        jqUnit.assertEquals("The user option from the grade component is transmitted", 10, prefsEditor.templateLoader.options.userOption);
    });

    /** FLUID-5013: IoCSS doesn't pass down non-options blocks **/

    fluid.defaults("fluid.tests.top", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"]
    });

    fluid.defaults("fluid.tests.subComponent2", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"]
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
        gradeNames: ["fluid.component"],
        components: {
            gradeSubComponent: {
                type: "fluid.component"
            }
        },
        distributeOptions: {
            source: "{that}.options.userOption",
            target: "{that > gradeSubComponent}.options.userOption"
        }
    });

    fluid.defaults("fluid.tests.fluid5014rootComponent", {
        gradeNames: ["fluid.tests.fluid5014gradeComponent"],
        components: {
            rootSubComponent: {
                type: "fluid.component"
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
        gradeNames: ["fluid.component"],
        components: {
            myGradeSubComponent: {
                type: "fluid.component"
            }
        },
        distributeOptions: {
            source: "{that}.options.gradeOption",
            target: "{that > myGradeSubComponent}.options.gradeOption"
        }
    });

    fluid.defaults("fluid.tests.fluid5017Root", {
        gradeNames: ["fluid.tests.fluid5017Grade"],
        components: {
            myRootSubComponent: {
                type: "fluid.component"
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
        gradeNames: ["fluid.component"],
        components: {
            ownSub: {
                type: "fluid.component"
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

    /** FLUID-5771 - Framework diagnostic when injecting to unrecognised non-options path **/

    fluid.defaults("fluid.tests.FLUID5771missRoot", {
        gradeNames: "fluid.component",
        distributeOptions: {
            record: "{that}",
            target: "{that}.components.child"
        }
    });

    jqUnit.test("FLUID-5771: Framework diagnostic distributing to unrecognised non-options path", function () {
        jqUnit.expectFrameworkDiagnostic("Diagnostic mentioning valid paths",
            fluid.tests.FLUID5771missRoot, "createOnEvent");
    });

    /** FLUID-5771 - Framework diagnostic when trying to distribute non-options material **/

    fluid.defaults("fluid.tests.FLUID5771nonOptions", {
        gradeNames: "fluid.component",
        distributeOptions: {
            source: "{that}",
            target: "{that}.options.components.child"
        }
    });

    jqUnit.test("FLUID-5771: Framework diagnostic distributing to unrecognised non-options path", function () {
        jqUnit.expectFrameworkDiagnostic("Diagnostic mentioning that source must be within options",
            fluid.tests.FLUID5771nonOptions, ["source", "options"]);
    });

    /** FLUID-5771 - Distribution of injected component **/

    fluid.defaults("fluid.tests.FLUID5771root", {
        gradeNames: "fluid.component",
        distributeOptions: {
            record: "{that}",
            target: "{that}.options.components.child"
        }
    });

    jqUnit.test("FLUID-5771: Distribute injected component reference", function () {
        var that = fluid.tests.FLUID5771root();
        jqUnit.assertEquals("FLUID-5771: Distributed injected component reference to child component",
            that, that.child);
    });

    /** FLUID-5982 - Injected component designated by expander **/

    fluid.defaults("fluid.tests.FLUID5982root", {
        gradeNames: "fluid.component",
        components: {
            sourceComponent: {
                type: "fluid.component",
                options: {
                    sourceComponent: true
                }
            },
            targetComponent: {
                expander: {
                    func: "fluid.identity",
                    args: "{FLUID5982root}.sourceComponent"
                }
            }
        }
    });

    jqUnit.test("FLUID-5982: Designate injected component via expander", function () {
        var that = fluid.tests.FLUID5982root();
        jqUnit.assertEquals("Injected component resolved via expander", true, that.targetComponent.options.sourceComponent);
    });

    /** FLUID-5022 - Designation of dynamic components **/

    fluid.tests.fluid5022add = function (that, count) {
        that.count = count + 1;
    };

    fluid.defaults("fluid.tests.fluid5022head", {
        gradeNames: ["fluid.component"],
        values: [2, 3],
        members: {
            count: 0
        },
        dynamicComponents: {
            dynamic: {
                sources: "{that}.options.values",
                type: "fluid.component",
                options: {
                    source: "{source}",
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.fluid5022add",
                            args: ["{fluid5022head}", "{fluid5022head}.count"]
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5022literal", {
        dynamicComponents: {
            dynamic: {
                sources: [2, 3]
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5022expander", {
        dynamicComponents: {
            dynamic: {
                sources: {
                    expander: {
                        func: "fluid.identity",
                        args: "{that}.options.values"
                    }
                }
            }
        }
    });

    fluid.tests.fluid5022test = function (headGrades) {
        var head = fluid.tests.fluid5022head({
            gradeNames: fluid.makeArray(headGrades)
        });
        jqUnit.assertEquals("Constructed 2 components", 2, head.count);
        jqUnit.assertEquals("First component source transmitted: ", 2, head.dynamic.options.source);
        jqUnit.assertEquals("Second component source transmitted: ", 3, head["dynamic-1"].options.source);
    };

    fluid.tests.fluid5022fixtures = [{
        name: "FLUID-5022: Dynamic component creation from referenced array source"
    }, {
        name: "FLUID-5022: Dynamic component creation from literal array",
        headGrades: "fluid.tests.fluid5022literal"
    },  {
        name: "FLUID-5022: Dynamic component creation from expander",
        headGrades: "fluid.tests.fluid5022expander"
    }];

    fluid.tests.fluid5022fixtures.forEach(function (oneFixture) {
        jqUnit.test(oneFixture.name, function () {
            fluid.tests.fluid5022test(oneFixture.headGrades);
        });
    });

    fluid.defaults("fluid.tests.fluid5022eventHead", {
        gradeNames: ["fluid.component"],
        members: {
            count: 0
        },
        events: {
            createIt: null
        },
        dynamicComponents: {
            dynamic: {
                createOnEvent: "createIt",
                type: "{arguments}.1",
                options: {
                    gradeNames: "{arguments}.2",
                    source: "{arguments}.0.value",
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.fluid5022add",
                            args: ["{fluid5022eventHead}", "{fluid5022eventHead}.count"]
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5022: Dynamic component creation in response to events", function () {
        var head = fluid.tests.fluid5022eventHead();
        head.events.createIt.fire({value: 2}, "fluid.component", "fluid.tests.fluid5022Grade");
        head.events.createIt.fire({value: 3}, "fluid.component");
        jqUnit.assertEquals("Constructed 2 components", 2, head.count);
        var first = head.dynamic;
        jqUnit.assertEquals("First component source transmitted: ", 2, first.options.source);
        jqUnit.assertTrue("Grade name transmitted via arguments", fluid.componentHasGrade(first, "fluid.tests.fluid5022Grade"));
        jqUnit.assertEquals("Second component source transmitted: ", 3, head["dynamic-1"].options.source);
    });

    /** FLUID-5893 - Dynamic components with grades sourced from single reference **/

    fluid.defaults("fluid.tests.fluid5893root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        dynamicComponents: {
            // Note: This kind of definition makes the FLUID-5750 options flattening revolution somewhat problematic
            dynamic: {
                createOnEvent: "createIt",
                type: "fluid.component",
                options: "{arguments}.0"
            }
        }
    });

    jqUnit.test("FLUID-5893: Dynamic component creation with grades sourced from single reference", function () {
        var that = fluid.tests.fluid5893root();
        that.events.createIt.fire({gradeNames: "fluid.resolveRoot"});
        jqUnit.assertTrue("Dynamic grade applied to dynamic component", fluid.componentHasGrade(that.dynamic, "fluid.resolveRoot"));
        that.destroy();
    });

    /** FLUID-6213 - Dynamic components with directly specified subcomponents **/

    jqUnit.test("FLUID-6213: Dynamic components with directly specified subcomponents", function () {
        var that = fluid.tests.fluid5893root();
        var eventArgument = {
            components: {
                sub1: {
                    type: "fluid.component",
                    options: {
                        answer: 42
                    }
                },
                sub2: {
                    type: "fluid.modelComponent"
                }
            }
        };
        var eventArgCopy = fluid.copy(eventArgument);
        that.events.createIt.fire(eventArgument);
        jqUnit.assertDeepEq("Event argument is unmodified through being fired", eventArgCopy, eventArgument);
        jqUnit.assertDeepEq("Designated subcomponents have been created", ["sub1", "sub2"], fluid.keys(fluid.filterKeys(that.dynamic, ["sub1", "sub2"])));
        jqUnit.assertEquals("Subcomponent has designated option", 42, that.dynamic.sub1.options.answer);
    });

    /** FLUID-5912 - {arguments} within members and models **/

    fluid.defaults("fluid.tests.fluid5912root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        dynamicComponents: {
            dynamic: {
                createOnEvent: "createIt",
                type: "fluid.modelComponent",
                options: {
                    members: {
                        argument0: "{arguments}.0"
                    },
                    model: {
                        argument1: "{arguments}.1"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5912: {arguments} within members and models", function () {
        var that = fluid.tests.fluid5912root();
        that.events.createIt.fire(42, 43);
        jqUnit.assertEquals("Argument value transmitted to member", 42, that.dynamic.argument0);
        jqUnit.assertEquals("Argument value transmitted to model", 43, that.dynamic.model.argument1);
    });

    /** FLUID-6404 - destroy() of self during onDestroy via createOnEvent **/

    fluid.defaults("fluid.tests.fluid6404root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        components: {
            dynamic: {
                type: "fluid.component",
                createOnEvent: "createIt",
                options: {
                    components: {
                        dynamicChild: {
                            type: "fluid.component"
                        }
                    },
                    listeners: {
                        "onDestroy.destroy": "fluid.tests.fluid6404destroy"
                    }
                }
            }
        }
    });

    fluid.tests.fluid6404destroy = function (that) {
        if (!fluid.isDestroyed(that)) {
            that.destroy();
        }
    };

    fluid.tests.fluid6404verify = function (that) {
        jqUnit.assertTrue("Dynamic component exists", fluid.isComponent(that.dynamic));
        jqUnit.assertTrue("Dynamic child exists", fluid.isComponent(that.dynamic.dynamicChild));
        var dynamic = that.dynamic, dynamicChild = that.dynamic.dynamicChild;
        var rootPath = fluid.pathForComponent(that);
        var dynamicPath = rootPath.concat(["dynamic"]);
        var dynamicChildPath = rootPath.concat(["dynamic", "dynamicChild"]);
        jqUnit.assertDeepEq("Path for dynamic is correct", dynamicPath, fluid.pathForComponent(dynamic));
        jqUnit.assertDeepEq("Path for dynamic child is correct", dynamicChildPath, fluid.pathForComponent(dynamicChild));
        jqUnit.assertEquals("Shadow for dynamic is correct", dynamic, fluid.shadowForComponent(dynamic).that);
        jqUnit.assertEquals("Shadow for dynamic is correct", dynamicChild, fluid.shadowForComponent(dynamicChild).that);
        jqUnit.assertEquals("Path lookup for dynamic is correct", dynamic, fluid.componentForPath(dynamicPath));
        jqUnit.assertEquals("Path lookup for dynamic child is correct", dynamicChild, fluid.componentForPath(dynamicChildPath));
    };

    jqUnit.test("FLUID-6404: destroy of self during onDestroy", function () {
        jqUnit.expect(40);
        var that = fluid.tests.fluid6404root();
        for (var i = 0; i < 5; ++i) {
            that.events.createIt.fire();
            fluid.tests.fluid6404verify(that);
        }
    });

    /** FLUID-6408 - "Hybrid time" **/

    fluid.defaults("fluid.tests.fluid6408root", {
        gradeNames: "fluid.modelComponent",
        workflows: {
            local: {
                fluid6408workflow: {
                    funcName: "fluid.tests.fluid6408workflow",
                    priority: "after:concludeComponentObservation"
                }
            }
        },
        freeComponent: {
            expander: { // This will eventually be forbidden
                func: "fluid.component"
            }
        },
        someLateOption: 42
    });

    fluid.tests.fluid6408workflow = function (shadow) {
        jqUnit.assertEquals("Component options should have been fully evaluated", 42, shadow.that.options.someLateOption);
        fluid.invokeLater(function () {
            // Clear out the defaults and workflow function to avoid disrupting later tests
            fluid.defaults("fluid.tests.fluid6408root", {});
        });
    };

    jqUnit.test("FLUID-6408: Obnoxious free component disrupts workflow", function () {
        jqUnit.expect(1);
        fluid.tests.fluid6408root();
    });

    /** FLUID-6406 - Workflow runs ahead */

    fluid.defaults("fluid.tests.fluid6406root", {
        gradeNames: "fluid.modelComponent",
        model: {
            value: true
        },
        dynamicComponents: {
            dynamic: {
                // Deliberately don't make this a modelComponent to make the fresh work cycle empty
                type: "fluid.component",
                source: "{that}.model",
                options: {
                    staticish: 42
                }
            }
        },
        members: {
            // This should be what we see, even though it is not a great practice
            staticish: "{that}.dynamic.options.staticish"
        }
    });

    jqUnit.test("FLUID-6406: Progress of workflow", function () {
        var that = fluid.tests.fluid6406root();
        jqUnit.assertEquals("Late reference to lensed component value ", 42, that.staticish);
    });

    /** FLUID-6410 - Failure in hybrid time through 0-element sequence reuse **/

// This currently tests the final branch of the test in fluid.commitPotentiae:
//         if (!topSequencer || topSequencer.hasStartedConcludeInit || topSequencer.promise.disposition) {
    fluid.defaults("fluid.tests.fluid6410root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        dynamicComponents: {
            dynamic: {
                type: "fluid.modelComponent",
                createOnEvent: "createIt",
                options: {
                    model: 42
                }
            }
        },
        listeners: {
            "onCreate.createThem": "fluid.tests.fluid6410createThem"
        }
    });

    fluid.tests.fluid6410createThem = function (that) {
        that.events.createIt.fire();
        that.events.createIt.fire();
    };

    jqUnit.test("FLUID-6410: Partial construction through sequence reuse", function () {
        var that = fluid.tests.fluid6410root();
        jqUnit.assertValue("First component model constructed", that.dynamic.model);
        jqUnit.assertValue("Second component model constructed", that["dynamic-1"].model);
    });

    /** FLUID-6411 - Failure when cleaning up model resource listener **/

    fluid.tests.fluid6411promiseGenerator = function () {
        return function () {
            var simplePromise = fluid.promise();
            simplePromise.resolve("Everything is fine.");
            return simplePromise;
        };
    };

    fluid.defaults("fluid.tests.fluid6411resourceLoader", {
        gradeNames: ["fluid.resourceLoader", "fluid.modelComponent"],
        resources: {
            promiseResource: {
                promiseFunc: "@expand:fluid.tests.fluid6411promiseGenerator()"
            }
        },
        model: {
            promiseResource: "{that}.resources.promiseResource.parsed"
        }
    });

    fluid.defaults("fluid.tests.fluid6411root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null
        },
        components: {
            resourceLoader: {
                createOnEvent: "createIt",
                type: "fluid.tests.fluid6411resourceLoader"
            }
        }
    });

    jqUnit.test("FLUID-6411: Cleanup after resource-based model", function () {
        jqUnit.expect(1);
        var that = fluid.tests.fluid6411root();
        that.events.createIt.fire();
        that.events.createIt.fire();
        jqUnit.assertEquals("Model resolved from promise for the 2nd time", "Everything is fine.", that.resourceLoader.model.promiseResource);
    });

    /** FLUID-6428 - Options which resolve to undefined in the immutable world: two cases **/

    fluid.defaults("fluid.tests.fluid6428root", {
        gradeNames: "fluid.component",
        arena1: {
        },
        arena2: {
        },
        reference: "{that}.options.arena1.nonexistent",
        components: {
            child: {
                type: "fluid.component",
                options: {
                    // This forwarding duplicates the setup in fluid.textfieldSlider -> fluid.slider where the because of lack of cloning
                    // mergeBlock target ends up sharing the frozen target object from the parent
                    arena2: "{fluid6428root}.options.arena2",
                    listeners: {
                        "onCreate.reference": "fluid.identity({that}.options.arena2.nonexistent)"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6428: Options which resolve to undefined in the immutable world", function () {
        var that = fluid.tests.fluid6428root();
        jqUnit.assertDeepEq("No mouse droppings in arena1", {}, that.options.arena1);
        jqUnit.assertDeepEq("No mouse droppings in arena2", {}, that.child.options.arena2);
    });

    /** FLUID-6428 - Aliasing of noexpand material **/

    jqUnit.test("FLUID-6428: Options which resolve to undefined in the immutable world", function () {
        var immutableEvents = fluid.freezeRecursive({
            type: "fluid.component",
            events: {
                immutableEvent: null
            }
        });
        // This checks thisPolicy.noexpand -> expanded = fluid.copy(source); in fluid.expandSource
        // Note that this only gets exercised because fluid.construct currently doesn't go through expandCompact
        // which does a copy anyway
        var that = fluid.construct("fluid-6428alias2", immutableEvents);
        jqUnit.assertValue("Successfully constructed component", that);
        that.events.immutableEvent.fire();
        that.destroy();
    });

    /** FLUID-6428 - Ensure that aliasing is proper in the immutable world for exotic records **/

    fluid.defaults("fluid.tests.fluid6428alias", {
        gradeNames: "fluid.modelComponent",
        members: {
            queue: []
        },
        invokers: {
            pushQueue: {
                "this": "{that}.queue",
                method: "push",
                args: "thisistInvoker"
            }
        },
        modelListeners: {
            flag1: {
                funcName: "fluid.tests.fluid6428push",
                args: ["{that}.queue", "directModelListener"]
            },
            flag2: {
                "this": "{that}.queue",
                method: "push",
                args: "thisistModelListener"
            }
        },
        eventReader: "{that}.options.events.nonexistent"
    });

    fluid.tests.fluid6428push = function (queue, element) {
        queue.push(element);
    };

    jqUnit.test("FLUID-6428: Aliasing in immutable world", function () {
        var that = fluid.tests.fluid6428alias();
        that.pushQueue();
        that.applier.change("flag1", true);
        that.applier.change("flag2", true);
        var expected = ["thisistInvoker", "directModelListener", "thisistModelListener"];
        jqUnit.assertDeepEq("Expected aliasing in immediate expansion", expected, that.queue);
    });

    /** FLUID-6428 - Expander inside changePath record **/

    fluid.defaults("fluid.tests.fluid6428expander", {
        gradeNames: "fluid.modelComponent",
        invokers: {
            changeIt: {
                changePath: "flag",
                value: {
                    expander: {
                        funcName: "fluid.identity",
                        args: true
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6428: Expanders inside listeners", function () {
        var that = fluid.tests.fluid6428expander();
        that.changeIt();
        jqUnit.assertEquals("Flag updated via expander", true, that.model.flag);
    });

    /** FLUID-6433 - Priority in scope for memberName **/

    fluid.defaults("fluid.tests.fluid6433trial", {
        gradeNames: "fluid.component"
    });

    fluid.defaults("fluid.tests.fluid6433head", {
        gradeNames: "fluid.component",
        components: {
            fluid6433first: {
                type: "fluid.tests.fluid6433trial"
            },
            fluid6433trial: {
                type: "fluid.tests.fluid6433trial",
                options: {
                    value: "The right one"
                }
            },
            fluid6433other: {
                type: "fluid.tests.fluid6433trial"
            }
        },
        invokers: {
            getIt: "fluid.identity({fluid6433trial})"
        }
    });

    jqUnit.test("FLUID-6433: Priority of members via fast path scope resolution", function () {
        var that = fluid.tests.fluid6433head();
        var resolved = that.getIt();
        jqUnit.assertEquals("Retrieved component via member by priority", "The right one", resolved.options.value);
    });

    /** FLUID-6427 - References cyclic via model state yield corrupted model rather than failure **/

    fluid.defaults("fluid.tests.fluid6427root", {
        gradeNames: "fluid.modelComponent",
        components: {
            inner: {
                type: "fluid.modelComponent",
                options: {
                    trunkValue: {
                        outerConsumer: "{fluid6427root}.model.toConsume",
                        toConsumeInner: 26
                    },
                    model: {
                        innerConsumer: "{that}.options.trunkValue.toConsumerInner"
                    }
                }
            }
        },
        model: {
            toConsume: 25
        }
    });

    jqUnit.test("FLUID-6427: References cyclic via model state yield corruption", function () {
        jqUnit.expectFrameworkDiagnostic("Should receive diagnostic rather than corrupt model", function () {
            fluid.tests.fluid6427root();
        }, ["circular", "model"]);
    });

    /** FLUID-6390 - Lensed components as a hash **/

    fluid.defaults("fluid.tests.fluid6390child", {
        gradeNames: "fluid.modelComponent"
    });

    fluid.defaults("fluid.tests.fluid6390hashRoot", {
        gradeNames: "fluid.modelComponent",
        model: {
            arena: {
                element1: {
                    value: 42
                },
                element2: {
                    value: 43
                }
            }
        },
        dynamicComponents: {
            arenaComponents: {
                sources: "{that}.model.arena",
                type: "fluid.tests.fluid6390child",
                options: {
                    model: {
                        arenaValue: "{source}.value"
                    }
                }
            }
        }
    });

    fluid.tests.fluid6390assertModelValues = function (message, that, expected) {
        var children = fluid.queryIoCSelector(that, "fluid.tests.fluid6390child");
        var values = fluid.getMembers(children, ["model", "arenaValue"]);
        jqUnit.assertDeepEq(message, expected, values);
    };

    jqUnit.test("FLUID-6390: Lensed components as a hash", function () {
        var that = fluid.tests.fluid6390hashRoot();
        var children = fluid.queryIoCSelector(that, "fluid.tests.fluid6390child");
        jqUnit.assertEquals("Two model-driven subcomponents created", 2, children.length);
        fluid.tests.fluid6390assertModelValues("Initial model values are correct", that, [42, 43]);
        that.applier.change("arena.element3.value", 44);
        fluid.tests.fluid6390assertModelValues("Model values are correct with new component", that, [42, 43, 44]);
        that.applier.change("arena.element1.value", 1);
        fluid.tests.fluid6390assertModelValues("Model values are correct with forward relay", that, [1, 43, 44]);
        that.applier.change("arena.element1", null, "DELETE");
        fluid.tests.fluid6390assertModelValues("Model deletion relayed to component deletion", that, [43, 44]);
        var component3 = that["arenaComponents-element3"];
        jqUnit.assertTrue("Fetched component via fluid.componentForModelPath", fluid.isComponent(component3));
        component3.applier.change("arenaValue", 3);
        jqUnit.assertEquals("Model value propagated through backward relay", 3, that.model.arena.element3.value);
        var component2 = that["arenaComponents-element2"];
        component2.destroy();
        var expectedFinalArena = {
            element3: {
                value: 3
            }
        };
        jqUnit.assertDeepEq("Relay of component destruction back to deletion of source model", expectedFinalArena, that.model.arena);
    });

    fluid.defaults("fluid.tests.fluid6390booleanRoot", {
        gradeNames: "fluid.modelComponent",
        model: {
            shouldComponentExist: 1
        },
        dynamicComponents: {
            conditionalComponent: {
                source: "{that}.model.shouldComponentExist",
                type: "fluid.component"
            }
        }
    });

    jqUnit.test("FLUID-6390: Lensed components from a boolean", function () {
        var that = fluid.tests.fluid6390booleanRoot();
        jqUnit.assertTrue("Conditional component should have been constructed", fluid.isComponent(that.conditionalComponent));
        that.conditionalComponent.destroy();
        jqUnit.assertEquals("Destruction of component should have unset model value", false, that.model.shouldComponentExist);
        jqUnit.assertUndefined("Conditional component should not have been reconstructed", that.conditionalComponent);
        that.applier.change("shouldComponentExist", true);
        jqUnit.assertTrue("Conditional component should have been reconstructed", fluid.isComponent(that.conditionalComponent));
        jqUnit.assertEquals("Model flag should not have been unset", true, that.model.shouldComponentExist);
        that.applier.change("shouldComponentExist", false);
        jqUnit.assertUndefined("Conditional component should have been destroyed", that.conditionalComponent);
        jqUnit.assertEquals("Model flag should not have been reset", false, that.model.shouldComponentExist);
    });

    /** FLUID-6390 - Hall of mirrors lensed components **/

    fluid.registerNamespace("fluid.tests.fluid6390mirror");

    fluid.tests.fluid6390mirror.model2 = {
        headings: [{
            level: 1,
            text: "h1",
            url: "#h1",
            headings: [{
                level: 2,
                text: "h2",
                url: "#h2"
            }]
        }]
    };

    fluid.tests.fluid6390mirror.model6 = {
        headings: [{
            level: 1,
            text: "h1",
            url: "#h1",
            headings: [{
                level: 2,
                text: "h2",
                url: "#h2",
                headings: [{
                    level: 3,
                    text: "h3",
                    url: "#h3",
                    headings: [{
                        level: 4,
                        text: "h4",
                        url: "#h4",
                        headings: [{
                            level: 5,
                            text: "h5",
                            url: "#h5",
                            headings: [{
                                level: 6,
                                text: "h6",
                                url: "#h6"
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };

    fluid.defaults("fluid.tests.fluid6390levels", {
        gradeNames: "fluid.tests.fluid6390heading"
    });

    fluid.defaults("fluid.tests.fluid6390heading", {
        gradeNames: "fluid.modelComponent",
        model: {
            // [text: heading, url: linkURL, headings: [ an array of subheadings in the same format ]
        },
        dynamicComponents: {
            headings: {
                sources: "{that}.model.headings",
                type: "fluid.tests.fluid6390heading",
                options: {
                    model: "{source}"
                }
            }
        }
    });

    fluid.tests.fluid6390defaultModels = function (rootModel, depth) {
        var togo = [], model = rootModel;
        for (var i = 0; i < depth; ++i) {
            togo.push(model);
            model = fluid.getImmediate(model, ["headings", "0"]);
        }
        return togo;
    };

    fluid.tests.fluid6390mirrorTest = function (model, levels) {
        var that = fluid.tests.fluid6390levels({
            model: model
        });
        var headings = [that].concat(fluid.queryIoCSelector(that, "fluid6390heading"));
        jqUnit.assertEquals("Correct number of headings constructed", levels, headings.length);
        var expectedModels = fluid.tests.fluid6390defaultModels(model, levels);
        var models = fluid.getMembers(headings, "model");
        jqUnit.assertDeepEq("Nested models should be correct", expectedModels, models);
    };

    jqUnit.test("FLUID-6390: Hall of mirrors lensed components", function () {
        fluid.tests.fluid6390mirrorTest(fluid.tests.fluid6390mirror.model2, 3);
        fluid.tests.fluid6390mirrorTest(fluid.tests.fluid6390mirror.model6, 7);
    });

    /** FLUID-6414 - Dynamic grades via expanders **/
// Also tests FLUID-6415 corruption in graph structure
    fluid.defaults("fluid.tests.fluid6414root", {
        gradeNames: "fluid.modelComponent",
        model: {
            arena: {
                element1: {
                    type: "green",
                    value: 42
                },
                element2: {
                    type: "red",
                    value: 43
                },
                element3: {
                    type: "green",
                    value: 44
                }
            }
        },
        components: {
            middle: {
                type: "fluid.tests.fluid6414middle",
                options: {
                    model: "{fluid6414root}.model"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid6414middle", {
        gradeNames: "fluid.modelComponent",
        invokers: {
            resolveElementGrade: "fluid.tests.fluid6414resolve({arguments}.0)"
        },
        model: {
            arena: {}
        },
        dynamicComponents: {
            element: {
                sources: "{that}.model.arena",
                type: "@expand:{fluid6414middle}.resolveElementGrade({source}.type)",
                options: {
                    model: {
                        value: "{source}.value"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid6414element", {
        gradeNames: "fluid.modelComponent",
        model: {
            value: null
        }
    });

    fluid.defaults("fluid.tests.fluid6414green", {
        gradeNames: "fluid.tests.fluid6414element",
        model: {
            colour: "green"
        }
    });

    fluid.defaults("fluid.tests.fluid6414red", {
        gradeNames: "fluid.tests.fluid6414element",
        model: {
            colour: "red"
        }
    });

    fluid.tests.fluid6414resolve = function (flatType) {
        return "fluid.tests.fluid6414" + flatType;
    };

    jqUnit.test("FLUID-6414: Dynamic grades via expanders", function () {
        var that = fluid.tests.fluid6414root();
        fluid.test.assertTransactionsConcluded();
        var subs = fluid.queryIoCSelector(that, "fluid.tests.fluid6414element");
        jqUnit.assertEquals("Three components lensed into existence", 3, subs.length);
        var expectedModels = [{
            colour: "green",
            value: 42
        },{
            colour: "red",
            value: 43
        },{
            colour: "green",
            value: 44
        }];
        var models = fluid.getMembers(subs, "model");
        jqUnit.assertDeepEq("Models resolved correctly", expectedModels, models);
    });

    /** FLUID-5029 - Child selector ">" in IoCSS selector should not select an indirect child **/

    fluid.defaults("fluid.tests.fluid5029root", {
        gradeNames: ["fluid.component"],
        components: {
            sub: {
                type: "fluid.component",
                options: {
                    components: {
                        subOfSub: {
                            type: "fluid.component"
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
        gradeNames: ["fluid.component", "fluid.tests.fluid5032Grade"],
        components: {
            subComponent: {
                type: "fluid.component"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5032Grade", {
        gradeNames: ["fluid.component"],
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
            gradeNames: ["fluid.component"],
            gradeValue: value
        });
    }
    defineFluid5033Grade(1);

    fluid.defaults("fluid.tests.fluid5033Root", {
        gradeNames: ["fluid.tests.fluid5033Grade"]
    });

    jqUnit.test("FLUID-5033 - grade reloading updates cache", function () {
        var root1 = fluid.tests.fluid5033Root();
        jqUnit.assertEquals("Original graded value", 1, root1.options.gradeValue);
        defineFluid5033Grade(2);
        var root2 = fluid.tests.fluid5033Root();
        jqUnit.assertEquals("Original graded value", 2, root2.options.gradeValue);
    });

    /** Was FLUID-4922 - Fast invokers and their caching characteristics - now just tests standard invokers **/

    fluid.tests.add = function (a, b) {
        return a + b;
    };

    fluid.tests.addArray = function (a, array) {
        return a + array[0] + array[1];
    };

    fluid.defaults("fluid.tests.fluid4922", {
        gradeNames: ["fluid.component"],
        members: {
            value: 1
        },
        invokers: {
            invoker: {
                funcName: "fluid.tests.add",
                args: ["{that}.value", "{arguments}.0"]
            },
            argsInvoker: {
                funcName: "fluid.tests.addArray",
                args: ["{that}.value", "{arguments}"]
            },
            throughInvoker: {
                funcName: "fluid.tests.add"
            }
        }
    });

    jqUnit.test("FLUID-4922 - fast and slow invokers", function () {
        var that = fluid.tests.fluid4922();
        jqUnit.assertEquals("Slow init", 2, that.invoker(1));
        jqUnit.assertEquals("Through init", 2, that.throughInvoker(1, 1));
        jqUnit.assertEquals("Args init", 3, that.argsInvoker(1, 1));
        that.value = 2;
        jqUnit.assertEquals("Slow changed", 4, that.invoker(2));
        jqUnit.assertEquals("Args changed", 6, that.argsInvoker(2, 2));
    });

    /** FLUID-5127 - Test cases for compact invokers, listeners and expanders **/

    fluid.tests.fluid5127listener = function (value1, value2, that) {
        that.fireValue = value1 + value2;
    };

    fluid.tests.fluid5127modifyOne = function (value1, that) {
        that.one = value1;
    };

    fluid.tests.fluid6091check = function () {
        jqUnit.assertDeepEq("FLUID-6091: Should have been supplied empty argument list", [], fluid.makeArray(arguments));
        return arguments[0];
    };

    fluid.defaults("fluid.tests.fluid5127root", {
        gradeNames: ["fluid.component"],
        members: {
            one:          "@expand:fluid.identity(1)",
            two:          2,
            thing:        "@expand:fluid.identity(thing)",
            thing2:       "@expand:fluid.identity({that}.thing)",
            added:        "@expand:fluid.tests.add({that}.one, {that}.two)",
            addedInvoke:  "@expand:{that}.addOne({that}.two)",
            number:       "@expand:fluid.identity(3.5)",
            noArgsExpand: "@expand:fluid.identity()",
            "true":       "@expand:fluid.identity(true)",
            "false":      "@expand:fluid.identity(false)",
            fireValue:    0
        },
        invokers: {
            addOne: "fluid.tests.add({that}.one, {arguments}.0)",
            noArgs: "fluid.tests.fluid6091check()",
            bindRecord: "fluid.tests.fluid5127listener({arguments}.0, {arguments}.1, {that})"
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
        jqUnit.assertEquals("noArgsExpander", undefined, that.noArgsExpand);

        var added = that.addOne(2);
        jqUnit.assertEquals("Compact invoker", 3, added);
        jqUnit.assertEquals("Expander to invoker", 3, that.addedInvoke);

        var noArgs = that.noArgs();
        jqUnit.assertEquals("No args supply no arguments", undefined, noArgs);

        that.events.addEvent.fire(1);
        jqUnit.assertEquals("Compact direct listener", 2, that.fireValue);

        that.events.addEvent2.fire(1);
        jqUnit.assertEquals("Compact invoker listener", 2, that.fireValue);

        that.events.addEvent3.fire(); // listener modifies the value of "one" to 2
        jqUnit.assertEquals("Multiple compact listeners", 4, that.fireValue);

        jqUnit.assertEquals("Invoker", 3, that.addOne(1));
    });

    /** Unresolvable expander function **/

    fluid.defaults("fluid.tests.unresolvableExpander", {
        gradeNames: "fluid.component",
        badExpander: "@expand:fluid.tests.nonexistent()"
    });

    jqUnit.test("Unresolvable expander function", function () {
        jqUnit.expectFrameworkDiagnostic("Unresolvable expander function", function () {
            fluid.tests.unresolvableExpander();
        }, ["expander record", "fluid.tests.nonexistent"]);
    });

    /** FLUID-5663 - Malformed syntax in compact invokers **/

    fluid.tests.fluid5663bads = [
        "fluid.tests.invokeFunc({that",
        "fluid.tests.invokeFunc({that}), other thing",
        "fluid.tests.invokeFunc){that}"
    ];

    jqUnit.test("FLUID-5663 - malformed compact syntax", function () {
        fluid.each(fluid.tests.fluid5663bads, function (bad, index) {
            jqUnit.expectFrameworkDiagnostic("Malformed compact invoker - " + bad, function () {
                fluid.defaults("fluid.tests.fluid5663-" + index, {
                    gradeNames: "fluid.component",
                    invokers: {
                        testInvoker: bad
                    }
                });
            }, "formed");
        });
    });

    /** FLUID-6450 - Malformed syntax in regular f-ing invokers **/

    fluid.defaults("fluid.tests.fluid6450test", {
        gradeNames: "fluid.component",
        intendedTarget: "Here we are!",
        invokers: {
            log: {
                funcName: "fluid.log",
                args: ["Mangled invoker arg resolves to -> ", "{that].options.intendedTarget"]
            }
        }
    });

    jqUnit.test("FLUID-6450 - malformed regular syntax", function () {
        jqUnit.expectFrameworkDiagnostic("Malformed regular invoker", function () {
            var that = fluid.tests.fluid6450test();
            that.log();
        }, "formed");
    });

    /** FLUID-6467 - Corrupt subcomponent definition produces framework diagnostic **/

    fluid.defaults("fluid.tests.fluid6467root", {
        gradeNames: "fluid.component",
        components: {
            corrupt: null
        }
    });

    jqUnit.test("FLUID-6467 - malformed subcomponent definition", function () {
        jqUnit.expectFrameworkDiagnostic("Malformed subcomponent", function () {
            fluid.tests.fluid6467root();
        }, ["null", "subcomponent"]);
    });

    /** FLUID-5036, Case 1 - An IoCSS source that is fetched from the static environment is not resolved correctly **/

    fluid.defaults("fluid.tests.fluid5036_1Root", {
        gradeNames: ["fluid.component"],
        components: {
            subComponent: {
                type: "fluid.component",
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

    jqUnit.test("FLUID-5036, Case 1 - An IoCSS source that is fetched from a resolveRoot is not resolved correctly", function () {
        var userOption = 10;

        var optionHolder = fluid.component({
            gradeNames: ["fluid5036_1UserOption", "fluid.resolveRoot"],
            userOption: userOption
        });
        var root = fluid.tests.fluid5036_1Root();

        jqUnit.assertEquals("A user option fetched from a resolveRoot component is passed down the target", userOption, root.subComponent.options.targetOption);
        optionHolder.destroy();
    });

    /** FLUID-5036, Case 2 - An IoCSS source that is fetched from a resolveRoot is not resolved correctly **/

    fluid.defaults("fluid.tests.fluid5036_2Root", {
        gradeNames: ["fluid.component"],
        // Note: this is not a recommended implementation technique, causing double nesting of options - this test is purely intendend to verify fix to a
        // framework issue which caused a faulty diagnostic "Malformed context reference without }" as well as to verify that at least some sensible effect
        // results from this reference. In general, i) only components are resolvable as context references (including in the static environment) and
        // ii) components should not be passed through options material as a whole - they should either be injected as subcomponents or else options
        // material selected from them resolved into other options
        source: "{fluid5036_2UserOption}",
        components: {
            subComponent: {
                type: "fluid.component"
            }
        },
        distributeOptions: {
            source: "{that}.options.source",
            removeSource: true,
            target: "{that > subComponent}.options"
        }
    });

    jqUnit.test("FLUID-5036, Case 2 - An IoCSS source that is fetched from the static environment is not resolved correctly - and displacement using fluid.resolveRootSingle", function () {
        function issueRootAndReference(targetOption) {
            var optionHolder = fluid.component({
                gradeNames: ["fluid5036_2UserOption", "fluid.resolveRootSingle"],
                singleRootType: "fluid5036_2UserOption",
                targetOption: targetOption
            });
            var root = fluid.tests.fluid5036_2Root();

            jqUnit.assertEquals("The user option fetched from the static environment is passed down the target", targetOption, root.subComponent.options.options.targetOption);
            return [optionHolder, root];
        }
        issueRootAndReference(10);
        issueRootAndReference(20);
    });

    fluid.defaults("fluid.tests.baseGradeComponent", {
        gradeNames: ["fluid.component"],
        initialModel: {}
    });

    fluid.defaults("fluid.tests.derivedGradeComponent", {
        gradeNames: ["fluid.tests.baseGradeComponent"],
        initialModel: {
            test: true
        }
    });

    fluid.defaults("fluid.tests.implementationSubcomponent", {
        gradeNames: ["fluid.modelComponent"],
        model: {}
    });

    fluid.defaults("fluid.tests.implementationComponent", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        components: {
            actualComponent: {
                type: "fluid.component",
                options: {
                    gradeNames: ["{fluid.tests.builderComponent}.options.gradeName"],
                    components: {
                        originalSub: {
                            type: "fluid.component"
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.contributedGrade", {
        gradeNames: ["fluid.component"],
        components: {
            mustExist: {
                type: "fluid.component"
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

    /** FLUID-5717: Merge policies contributed via dynamic grade **/

    fluid.defaults("fluid.tests.fluid5717bare", { // TODO: This will allow testing of FLUID-5615 when we can fix it
        gradeNames: "fluid.component",
        mergePolicy: {
            protect: "noexpand"
        },
        invokers: {
            evaluate: "fluid.tests.fluid5717eval({that}.options.protect)"
        }
    });

    fluid.defaults("fluid.tests.fluid5717", {
        gradeNames: ["fluid.tests.fluid5717bare", "{that}.evaluate"]
    });

    fluid.tests.fluid5717eval = function (protect) {
        jqUnit.assertEquals("Protected from expansion", "{instantiator}", protect);
        return "fluid.component";
    };

    jqUnit.test("FLUID-5717: Dynamically contributed mergePolicy does not function", function () {
        jqUnit.expect(2);
        var that = fluid.component({
            gradeNames: ["fluid.tests.fluid5717"],
            protect: "{instantiator}"
        });
        jqUnit.assertValue("Constructed dynamic component", that);
    });

    /** FLUID-5615: Raw dynamic grades should be last-ditch **/

    fluid.makeGradeLinkage("fluid.tests.FLUID5615linkage", ["fluid.tests.FLUID5615", "fluid.tests.FLUID5615.writable"], "fluid.tests.FLUID5615.linkage.writable");

    fluid.constructSingle([], "fluid.tests.FLUID5615linkage");

    fluid.defaults("fluid.tests.FLUID5615", {
        gradeNames: ["fluid.component", "{that}.getWritableGrade"],
        invokers: {
            getWritableGrade: {
                funcName: "fluid.tests.FLUID5615.getWritableGrade",
                args: ["{that}.options.writable"]
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID5615derived", {
        writable: true
    });

    fluid.tests.FLUID5615.getWritableGrade = function (writable) {
        return writable ? "fluid.tests.FLUID5615.writable" : [];
    };

    jqUnit.test("FLUID-5615: Resolve dynamic grade material from raw dynamic grade", function () {
        var that = fluid.tests.FLUID5615({
            gradeNames: "fluid.tests.FLUID5615derived"
        });
        jqUnit.assertTrue("Dynamic config hoisted to raw dynamic grade", fluid.componentHasGrade(that, "fluid.tests.FLUID5615.writable"));
        jqUnit.assertTrue("Dynamic config led to linkage resolution", fluid.componentHasGrade(that, "fluid.tests.FLUID5615.linkage.writable"));
    });

    /** FLUID-5094: Dynamic grade merging takes an undefined source passed in from IoCSS into account rather than ignoring it **/

    fluid.defaults("fluid.tests.fluid5094", {
        gradeNames: ["fluid.component", "fluid.tests.nonExistedGrade"],
        components: {
            subComponent: {
                type: "fluid.component",
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
        gradeNames: ["fluid.component"],
        components: {
            mustExist: {
                type: "fluid.component"
            }
        }
    });

    jqUnit.test("FLUID-5094: Dynamic grade merging takes an undefined source passed in from IoCSS into account rather than ignoring it", function () {
        var root = fluid.tests.fluid5094({
            gradeName: "fluid.tests.fluid5094Grade"
        });

        jqUnit.assertValue("Components must be merged correctly", root.subComponent.mustExist);
    });

    /** FLUID-5117: Return value from expander in listener is corrupted **/

    fluid.defaults("fluid.tests.fluid5117", {
        gradeNames: ["fluid.component"],
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
        that.outputObject = retrievedObject;
    };

    jqUnit.test("FLUID-5117: Function that uses an expander as an argument includes the expander itself in the resolved expander return", function () {
        var that = fluid.tests.fluid5117();
        jqUnit.assertDeepEq("The output of an expander argument is same as the return of the expander function", that.options.inputObject, that.outputObject);
    });


    /** FLUID-5242: Corruption when distributing listener records to multiple components **/

    fluid.defaults("fluid.tests.tooltip", {
        gradeNames: ["fluid.component"],
        events: {
            afterOpen: null
        }
    });

    fluid.defaults("fluid.tests.trackTooltips", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        source: {
            options: {
                userOption: "initial"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5108Grade", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
        parentOption: 1
    });

    fluid.defaults("fluid.tests.fluid5155dynamicGrade", {
        gradeNames: ["fluid.component", "{that}.computeGrade"],
        invokers: {
            computeGrade: "fluid.tests.computeFluid5155DynamicParent"
        }
    });

    fluid.tests.computeFluid5155DynamicParent = function () {
        return "fluid.tests.fluid5155dynamicParent";
    };

    fluid.defaults("fluid.tests.fluid5155root", {
        gradeNames: ["fluid.component"],
        components: {
            subComponent: {
                type: "fluid.component"
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
        gradeNames: ["fluid.component", "{that}.getDynamicInvoker"],
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
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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

    /** FLUID-5254 - failure of impersonateListener in dispatchListener **/

    fluid.tests.fluid5254Listener = function (that) {
        that.invocations++;
    };

    fluid.defaults("fluid.tests.fluid5254Root", {
        gradeNames: ["fluid.component"],
        events: {
            rootEvent: null,
            creationEvent: null
        },
        components: {
            child: {
                createOnEvent: "creationEvent",
                type: "fluid.component",
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
        "fluid.tests.pageList":               "fluid.component",
        "fluid.tests.renderedPageList":       "fluid.component"
    });

    fluid.defaults("fluid.tests.fluid5245Root", {
        gradeNames: ["fluid.component"],
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
        gradeNames: ["fluid.component"],
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
        delete that.noted;
        that.events.ourEvent.fire(that);
        jqUnit.assertUndefined("Listeners after destruction should not be notified", that.noted);
    });

    /*** FLUID-5266 diagnostic when accessing createOnEvent component before construction ***/

    fluid.defaults("fluid.tests.fluid5266root", {
        gradeNames: ["fluid.component"],
        events: {
            creationEvent: null
        },
        components: {
            child: {
                type: "fluid.component",
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
        gradeNames: ["fluid.tests.fluid5266root"],
        reference: "{child}.initMember"
    });

    fluid.defaults("fluid.tests.fluid5266direct", {
        gradeNames: ["fluid.tests.fluid5266root"],
        reference: "{that}.child.initMember"
    });

    jqUnit.test("FLUID-5226 - ginger reference to createOnEvent component should fail", function () {
        // Note: This behaviour has changed after FLUID-6148.
        // The first is a generic "not found" failure since the component is not constructed
        jqUnit.expectFrameworkDiagnostic("Bad ginger reference to createOnEvent via context", fluid.tests.fluid5266context, "could not match context");
        // The second simply resolves to nothing as would any "reference into nothing"
        var that = fluid.tests.fluid5266direct();
        jqUnit.expect(1);
        jqUnit.assertUndefined("Bad ginger reference to createOnEvent via direct member", that.reference);
    });

    /*** FLUID-6418 no failure when referring to site of dynamic component during afterDestroy ***/

    fluid.defaults("fluid.tests.fluid6418root", {
        gradeNames: ["fluid.component"],
        events: {
            creationEvent: null
        },
        dynamicComponents: {
            child: {
                type: "fluid.component",
                createOnEvent: "creationEvent",
                options: {
                    initMember: "{arguments}.0",
                    listeners: {
                        "afterDestroy": "fluid.tests.fluid6418verify({fluid6418root}.child)"
                    }
                }
            }
        }
    });

    fluid.tests.fluid6418verify = function (site) {
        jqUnit.assertUndefined("Dynamic component should have been cleanly removed", site);
    };

    jqUnit.test("FLUID-6418 - no failure when referring to site of destroyed dynamic component during after destroy", function () {
        jqUnit.expect(1);
        var that = fluid.tests.fluid6418root();
        that.events.creationEvent.fire(42);
        that.child.destroy();
    });

    /** FLUID-5249 tests - globalInstantiator, fluid.resolveRoot and its effects **/

    fluid.defaults("fluid.tests.fluid5249root", {
        gradeNames: ["fluid.component"],
        components: {
            nonRootRoot: {
                type: "fluid.component",
                options: {
                    gradeNames: ["fluid.resolveRoot", "fluid.tests.fluid5249nonroot"]
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5249finder", {
        gradeNames: ["fluid.component"],
        components: {
            nonRoot: "{fluid.tests.fluid5249nonroot}",
            root: "{fluid.tests.fluid5249root}"
        },
        invokers: {
            findRoot: "fluid.identity({fluid.tests.fluid5249root})",
            findNonRoot: "fluid.identity({fluid.tests.fluid5249nonroot})",
            findNonRoot2: "fluid.identity({nonRoot})"
        }
    });

    jqUnit.test("FLUID-5249 - root resolution of non-root component", function () {
        var rootAdvertiser = fluid.tests.fluid5249root();
        var rootFinder = fluid.tests.fluid5249finder();

        jqUnit.assertEquals("Expected to resolve non-root value of resolveRoot as root", rootAdvertiser.nonRootRoot.id, rootFinder.nonRoot.id);
        // FLUID-6444 tests
        jqUnit.assertNoValue("Expected no leakage of ordinary root component", rootFinder.root);
        jqUnit.assertNoValue("Expected no leakage of ordinary root component via fast-path invoker", rootFinder.findRoot());

        rootAdvertiser.destroy();
        var rootFinder2 = fluid.tests.fluid5249finder();

        jqUnit.assertNoValue("Expected to find non-root value cleared after parent is cleared", rootFinder2.nonRoot);
        jqUnit.assertNoValue("Expected to find injected component cleared from injection point after parent is destroyed", rootFinder.nonRoot);
        jqUnit.assertNoValue("Expected to find non-root value gone from global scope", rootFinder.findNonRoot());
        jqUnit.assertNoValue("Expected to find non-root value gone by member name from all scopes", rootFinder.findNonRoot2());
    });

    /** FLUID-6444 tests - scope priority of injected components **/

    fluid.defaults("fluid.tests.fluid6444outer", {
        gradeNames: "fluid.component"
    });

    fluid.defaults("fluid.tests.fluid6444root", {
        gradeNames: ["fluid.component"],
        components: {
            outer: {
                type: "fluid.tests.fluid6444outer",
                options: {
                    value: 42
                }
            },
            holder: {
                type: "fluid.component",
                options: {
                    components: {
                        innerOuter: {
                            type: "fluid.tests.fluid6444outer",
                            options: {
                                value: 43
                            }
                        }
                    }
                }
            },
            middle: {
                type: "fluid.component",
                options: {
                    components: {
                        outer: "{fluid6444root}.holder.innerOuter"
                    },
                    invokers: {
                        resolveOuter: "fluid.identity({fluid.tests.fluid6444outer}.options.value)"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6444 - scope priority of injected components", function () {
        var that = fluid.tests.fluid6444root();
        jqUnit.assertEquals("Injected component at proper scope", 43, that.middle.resolveOuter());
    });

    /** FLUID-5495 tests - distribute upwards, use of "/" context, global instantiator, and proper deregistration - "new demands blocks" **/

    fluid.defaults("fluid.tests.fluid5495rootDistributor", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            record: "distributedValue",
            target: "{/ fluid.tests.fluid5495target}.options.targetValue"
        }
    });

    fluid.defaults("fluid.tests.fluid5495target", {
        gradeNames: ["fluid.component"]
    });

    jqUnit.test("FLUID-5495 - use of global, time-scoped distributions to root - \"new demands blocks\"", function () {
        var distributor = fluid.tests.fluid5495rootDistributor();
        var target1 = fluid.tests.fluid5495target();
        jqUnit.assertEquals("Standalone component received distribution", "distributedValue", target1.options.targetValue);
        distributor.destroy(); // fun! destruction of standalone component
        var target2 = fluid.tests.fluid5495target();
        jqUnit.assertUndefined("Standalone component received no distribution after destruction of distributor", target2.options.targetValue);
    });

    fluid.defaults("fluid.tests.fluid5495midDistributor", {
        gradeNames: ["fluid.component"],
        events: {
            creationEvent: null
        },
        components: {
            distributor: {
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        record: "fluid.tests.fluid5495outputGrade",
                        target: "{fluid5495midDistributor fluid5495requiredGrade1&fluid5495requiredGrade2}.options.gradeNames"
                    }
                }
            },
            target1: {
                type: "fluid.component",
                createOnEvent: "creationEvent",
                options: {
                    gradeNames: "fluid.tests.fluid5495requiredGrade1"
                }
            },
            target2: {
                type: "fluid.component",
                createOnEvent: "creationEvent",
                options: {
                    gradeNames: "fluid.tests.fluid5495requiredGrade2"
                }
            },
            target3: {
                type: "fluid.component",
                createOnEvent: "creationEvent",
                options: {
                    gradeNames: ["fluid.tests.fluid5495requiredGrade1", "fluid.tests.fluid5495requiredGrade2"]
                }
            }
        }
    });

    fluid.tests.fluid5495checkOutputGrades = function (subnames, parent, requiredGrade) {
        return fluid.transform(subnames, function (subname) {
            return fluid.componentHasGrade(parent[subname], requiredGrade);
        });
    };

    jqUnit.test("FLUID-5495 - distribution upwards to mid-level of tree, matching on multiple gradeNames to output another - \"new demands blocks II\"", function () {
        var distributorRoot = fluid.tests.fluid5495midDistributor();
        distributorRoot.events.creationEvent.fire();
        var subnames = ["target1", "target2", "target3"];
        var hasGrade1 = fluid.tests.fluid5495checkOutputGrades(subnames, distributorRoot, "fluid.tests.fluid5495outputGrade");
        jqUnit.assertDeepEq("Subcomponent with joint grades should have been decorated", [false, false, true], hasGrade1);
        distributorRoot.distributor.destroy();
        distributorRoot.events.creationEvent.fire();
        var hasGrade2 = fluid.tests.fluid5495checkOutputGrades(subnames, distributorRoot, "fluid.tests.fluid5495outputGrade");
        jqUnit.assertDeepEq("Subcomponent with joint grades should not have been decorated after destruction of distributor", [false, false, false], hasGrade2);
    });

    /** FLUID-5587 tests - namespaces for distributions **/

    fluid.defaults("fluid.tests.fluid5587root", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            distributionName: {
                record: "rootDistribution",
                target: "{that subComponent}.options.distributed"
            }
        },
        components: {
            subComponent: {
                type: "fluid.component"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5587grade", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            namespace: "distributionName", // alternative style for registering namespace
            record: "gradeDistribution",
            target: "{that subComponent}.options.distributed"
        }
    });

    jqUnit.test("FLUID-5587 - namespaces for options distributions", function () {
        var that = fluid.tests.fluid5587root({
            gradeNames: "fluid.tests.fluid5587grade"
        });
        jqUnit.assertEquals("Options distribution should have been overwritten by namespaced grade definition", "gradeDistribution", that.subComponent.options.distributed);
    });

    /** FLUID-5621 tests - priorities and distances for distributions **/

    fluid.defaults("fluid.tests.fluid5621common", {
        gradeNames: ["fluid.component"],
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        target: "{/ fluid.tests.fluid5621advised}.options.target", // variant form to show insensitive to this detail
                        record: "middle",
                        namespace: "fluid5621middle"
                    },
                    components: {
                        child2: {
                            type: "fluid.component",
                            options: {
                                distributeOptions: {
                                    target: "{that fluid5621advised}.options.target",
                                    record: "closest"
                                },
                                components: {
                                    child3: {
                                        type: "fluid.component",
                                        options: {
                                            mergePolicy: {
                                                target: fluid.arrayConcatPolicy
                                            },
                                            gradeNames: "fluid.tests.fluid5621advised"
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

    fluid.defaults("fluid.tests.fluid5621root", {
        gradeNames: ["fluid.tests.fluid5621common"],
        distributeOptions: {
            target: "{that fluid5621advised}.options.target",
            record: "root"
        }
    });

    fluid.defaults("fluid.tests.fluid5621global", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            target: "{/ fluid.tests.fluid5621advised}.options.target",
            record: "global",
            priority: "before:fluid5621middle"
        }
    });

    jqUnit.test("Test FLUID-5621 distributeOptions priority arbitration and fluid.queryIoCSelector", function () {
        var advisor = fluid.tests.fluid5621global();
        var that = fluid.tests.fluid5621root();
        // all things being equal, the furthest away distribution source merges on top
        var expected = ["closest", "global", "middle", "root"];
        var options = that.child1.child2.child3.options.target;
        jqUnit.assertDeepEq("Distributed options resolved in required priority order", expected, options);
        fluid.tests.queryIoCSelector.fixtures.forEach(function (fixture) {
            fluid.tests.queryIoCSelector(that, fixture);
        });
        that.destroy(); // it contains a global distribution!
        advisor.destroy();
    });

    fluid.tests.queryIoCSelector = function (that, fixture) {
        var results = fluid.queryIoCSelector(that, fixture.selector, fixture.flat);
        var leaves = fluid.transform(results, function (result) {
            var path = fluid.pathForComponent(result);
            return fluid.peek(path);
        });
        jqUnit.assertDeepEq("Expected results for queryIoCSelector", fixture.expected, leaves);
    };

    fluid.tests.queryIoCSelector.fixtures = [{
        selector: "child1",
        flat:true,
        expected: ["child1"]
    }, {
        selector: "child1",
        expected: ["child1"]
    }, {
        selector: "child2",
        flat:true,
        expected: []
    }, {
        selector: "child2",
        expected: ["child2"]
    },  {
        selector: "child3",
        flat:true,
        expected: []
    }, {
        selector: "child3",
        expected: ["child3"]
    }, {
        selector: "child1 child2",
        expected: ["child2"]
    }, {
        selector: "child1 child3",
        expected: ["child3"]
    },  {
        selector: "child1 child2 child3",
        expected: ["child3"]
    },  {
        selector: "child1 child2 child3&fluid5621advised",
        expected: ["child3"]
    },  {
        selector: "child1 child2&fluid5621advised",
        expected: []
    }, {
        selector: "child1 > child2",
        expected: ["child2"]
    }, {
        selector: "child1 > child3",
        expected: []
    }, {
        selector: "child1 > *",
        expected: ["child2"]
    }, {
        selector: "child1 *",
        expected: ["child2", "child3"]
    }];

    /** FLUID-5824 tests - distances and namespace overriding for distributions **/

    fluid.defaults("fluid.tests.fluid5824root", {
        gradeNames: "fluid.tests.fluid5621common",
        distributeOptions: {
            target: "{that fluid5621advised}.options.target",
            record: "root",
            namespace: "fluid5621middle"
        }
    });

    jqUnit.test("Test FLUID-5824 distributeOptions priority + namespace arbitration", function () {
        var advisor = fluid.tests.fluid5621global();
        var that = fluid.tests.fluid5824root();
        // "root" should now displace "middle"
        var expected = ["closest", "global", "root"];
        var options = that.child1.child2.child3.options.target;
        jqUnit.assertDeepEq("Distributed options resolved in required priority order", expected, options);
        advisor.destroy();
    });

    /** FLUID-5835 test - uniquifying of multiple distribution blocks **/

    fluid.defaults("fluid.tests.fluid5835increase", {
        gradeNames: "fluid.component",
        messageBase: {
            increaseHeader: "increase"
        }
    });

    fluid.defaults("fluid.tests.fluid5835panel", {
        gradeNames: "fluid.component",
        components: {
            msgResolver: {
                type: "fluid.component"
            }
        },
        distributeOptions: {
            source: "{that}.options.messageBase",
            target: "{that > msgResolver}.options.messageBase"
        }
    });

    fluid.defaults("fluid.tests.fluid5835root", {
        gradeNames: "fluid.component",
        components: {
            increasing: {
                type: "fluid.tests.fluid5835panel",
                options: {
                    messageBase: "{fluid5835root}.nothing"
                }
            }
        }
    });

    jqUnit.test("FLUID-5835: Uniquifying multiple distribution blocks", function () {
        var options = {};
        fluid.set(options, "components.increasing.options.gradeNames", "fluid.tests.fluid5835increase");
        var that = fluid.tests.fluid5835root(options);
        jqUnit.assertEquals("Correctly distributed", "increase", that.increasing.msgResolver.options.messageBase.increaseHeader);
    });

    /** FLUID-5813: namespaces and priority for distributeOptions early route **/

    fluid.makeComponents({
        "fluid.tests.FLUID5813far":        "fluid.component",
        "fluid.tests.FLUID5813near":       "fluid.component"
    });

    fluid.defaults("fluid.tests.FLUID5813root", {
        gradeNames: "fluid.component",
        distributeOptions: {
            farDistribute: {
                target: "{that target}.type",
                record: "fluid.tests.FLUID5813far",
                priority: "after:nearDistribute"
            }
        },
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        nearDistribute: {
                            target: "{that target}.type",
                            record: "fluid.tests.FLUID5813near"
                        }
                    },
                    components: {
                        target: {
                            type: "fluid.component"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5813 - namespaces and priority for distributeOptions early route", function () {
        var that = fluid.tests.FLUID5813root();
        jqUnit.assertEquals("Successfully overridden near distribution to type ", "fluid.tests.FLUID5813far", that.child1.target.typeName);
    });

    /** FLUID-5824 variant of FLUID-5813: namespaces and priority for distributeOptions early route **/

    fluid.defaults("fluid.tests.FLUID5824earlyroot", {
        gradeNames: "fluid.component",
        distributeOptions: {
            nameDistribute: {
                target: "{that target}.type",
                record: "fluid.tests.FLUID5813far"
            }
        },
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        nameDistribute: {
                            target: "{that target}.type",
                            record: "fluid.tests.FLUID5813near"
                        }
                    },
                    components: {
                        target: {
                            type: "fluid.component"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5824 variant of FLUID-5813 - namespaces and priority for distributeOptions early route", function () {
        var that = fluid.tests.FLUID5824earlyroot();
        jqUnit.assertEquals("Successfully overridden near distribution to type ", "fluid.tests.FLUID5813far", that.child1.target.typeName);
    });

    /** Test nexus methods and global instantiator machinery **/

    fluid.defaults("fluid.tests.nexusComponent", {
        gradeNames: ["fluid.component"]
    });

    jqUnit.test("Test nexus methods fluid.construct, fluid.componentForPath, and fluid.destroy", function () {
        fluid.construct("fluid_tests_nexusRoot", {
            type: "fluid.tests.nexusComponent",
            value: 53
        });

        jqUnit.assertEquals("Constructed nexus component with options", 53, fluid.rootComponent.fluid_tests_nexusRoot.options.value);
        jqUnit.assertEquals("fluid.componentForPath returns the newly constructed component", 53, fluid.componentForPath("fluid_tests_nexusRoot").options.value);

        fluid.construct("fluid_tests_nexusRoot.child", {
            type: "fluid.tests.nexusComponent",
            value: 64
        });
        fluid.construct("fluid_tests_nexusRoot.child", {
            type: "fluid.tests.nexusComponent",
            value: 75
        });
        var globalChild = fluid.rootComponent.fluid_tests_nexusRoot.child;
        jqUnit.assertEquals("Constructed nexus component child with options", 75, globalChild.options.value);
        var globalPath = "fluid_tests_nexusRoot.child";
        var child = fluid.globalInstantiator.pathToComponent[globalPath];
        jqUnit.assertEquals("Constructed a valid global instantiator component at child path", child, globalChild);
        jqUnit.assertEquals("fluid.componentForPath returns the child component (string)", globalChild, fluid.componentForPath(globalPath));
        jqUnit.assertEquals("fluid.componentForPath returns the child component (array path)", globalChild, fluid.componentForPath(globalPath.split(".")));

        var arrayPath = fluid.pathForComponent(child);
        jqUnit.assertDeepEq("Got array path for component", globalPath.split("."), arrayPath);
        fluid.destroy(arrayPath);
        jqUnit.assertNoValue("Destroyed nexus component via array path", fluid.rootComponent.fluid_tests_nexusRoot.child);
        fluid.destroy("fluid_tests_nexusRoot");

        jqUnit.assertUndefined("fluid.componentForPath returns undefined for destroyed component", fluid.componentForPath(globalPath));
    });

    /** Test potentia idioms **/

    fluid.tests.fetchPaths = function (that, paths) {
        return fluid.transform(paths, function (path) {
            return fluid.get(that, path);
        });
    };

    fluid.defaults("fluid.tests.FLUID6148root", {
        gradeNames: "fluid.component",
        events: {
            constructEvent: null
        },
        components: {
            child1: {
                createOnEvent: "constructEvent",
                type: "fluid.component",
                options: {
                    value1: "value1",
                    nextValue: "{child3}.options.value3"
                }
            },
            child2: {
                createOnEvent: "constructEvent",
                type: "fluid.component",
                options: {
                    value2: "value2",
                    nextValue: "{child1}.options.value1"
                }
            },
            child3: {
                createOnEvent: "constructEvent",
                type: "fluid.component",
                options: {
                    value3: "value3",
                    nextValue: "{child2}.options.value2"
                }
            }
        }
    });

    jqUnit.test("FLUID-6148: Construct circularly referring component on event", function () {
        var that = fluid.tests.FLUID6148root();
        that.events.constructEvent.fire();
        var paths = ["child1.options.nextValue", "child2.options.nextValue", "child3.options.nextValue"];
        var expected = ["value3", "value1", "value2"];
        var values = fluid.tests.fetchPaths(that, paths);
        jqUnit.assertDeepEq("Constructed circularly referring components on event", expected, values);
    });

    /** Test partial evaluation **/

    fluid.defaults("fluid.tests.FLUID6148partial", {
        gradeNames: "fluid.component",
        unnecessaryValue: 42,
        listeners: {
            onCreate: {
                funcName: "fluid.tests.notingListener"
            }
        }
    });

    fluid.tests.oneFluid6148Partial = function (name, options, expected) {
        var paths = ["options.unnecessaryValue", "noted"];
        var transactionId = fluid.beginTreeTransaction(options).transactionId;
        fluid.construct("FLUID6148partial-instance", {
            type: "fluid.tests.FLUID6148partial"
        }, {transactionId: transactionId});
        var that = fluid.commitPotentiae(transactionId).that;
        var values = fluid.tests.fetchPaths(that, paths);
        jqUnit.assertTrue("Partial evaluation test - " + name + ": component constructed", fluid.isComponent(that));
        jqUnit.assertDeepEq("Partial evaluation test - " + name + ": expected construction state", expected, values);
        fluid.destroy("FLUID6148partial-instance");
    };

    jqUnit.test("FLUID-6148: Partial evaluation tests", function () {
        jqUnit.expect(6);
        fluid.tests.oneFluid6148Partial("shell construction",       {breakAt: "shells"},       [undefined, undefined]);
        fluid.tests.oneFluid6148Partial("observation construction", {breakAt: "concludeComponentObservation"},  [42, undefined]);
        fluid.tests.oneFluid6148Partial("full construction",        null,                      [42, true]);
    });

    jqUnit.test("FLUID-6148: Failed lookup of breakAt doesn't corrupt framework", function () {
        jqUnit.expectFrameworkDiagnostic("Failed lookup gives diagnostic", function () {
            var transaction = fluid.beginTreeTransaction({breakAt: "unknown workflow"});
            transaction.promise.then(null, function (err) {
                throw err;
            });
        }, "concludeComponentObservation");
    });

    /** Test cleanup even of perversely constructed components **/

    fluid.defaults("fluid.tests.FLUID6148cleanup", {
        gradeNames: "fluid.component",
        components: {
            lateChild: {
                createOnEvent: "onCreate",
                type: "fluid.component",
                options: {
                    listeners: {
                        "onCreate.explode": {
                            func: "fluid.builtinFail",
                            args: [["Explosion during creation"]]
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6184: Cleanup test", function () {
        var prePaths = fluid.test.getConstructedPaths();
        jqUnit.expect(2);
        try {
            fluid.tests.FLUID6148cleanup();
        } catch (e) {
            jqUnit.assert("Exception caught during construction");
        } finally {
            var postPaths = fluid.test.getConstructedPaths();
            jqUnit.assertDeepEq("No disturbance of constructed paths from failed construction", prePaths, postPaths);
        }
    });

    /** Test cleanup after cancellation of transaction featuring creation and destruction **/
    // Discovered through running GPII's new LifecycleManagerSession/UserRequest setup through FLUID-6148 branch
    fluid.defaults("fluid.tests.FLUID6148cleanup2", {
        gradeNames: "fluid.component",
        events: {
            createOne: null,
            createTwo: null
        },
        components: {
            createOne: {
                type: "fluid.component",
                createOnEvent: "createOne",
                options: {
                    destroyOther: "{arguments}.0",
                    listeners: {
                        "onCreate.destroyOther": "fluid.tests.FLUID6148destroyOther({FLUID6148cleanup2})",
                        "onCreate.explode": {
                            funcName: "fluid.builtinFail",
                            args: [["Fail after destruction"]],
                            priority: "after:destroyOther"
                        }
                    }
                }
            },
            createTwo: {
                type: "fluid.component",
                createOnEvent: "createTwo"

            }
        }
    });

    fluid.tests.FLUID6148destroyOther = function (head) {
        head.createTwo.destroy();
    };

    jqUnit.test("FLUID-6184: Cleanup test 2", function () {
        jqUnit.expect(2);
        var that = fluid.tests.FLUID6148cleanup2();
        that.events.createTwo.fire();
        try {
            that.events.createOne.fire();
        } catch (e) {
            jqUnit.assertUndefined("Component one not created", that.createOne);
            jqUnit.assertUndefined("Component two destroyed", that.createTwo);
        }
    });

    /** Justin's theme: Test destruction of free component during onDestroy listener **/
    // Discovered in "Localization Enactor Tests" where fluid.tests.localizationExistingTests both instantiates and
    // destroys a free component. In fact the stack overflow failure was masked since the destructor had actually
    // executed and the stack overflow exception was just converted into a transaction promise rejection that was unobserved

    fluid.defaults("fluid.tests.FLUID6148destructors", {
        gradeNames: "fluid.component",
        listeners: {
            "onCreate.constructIt": "fluid.tests.FLUID6148destructors.construct",
            "onDestroy.destroyIt": "fluid.tests.FLUID6148destructors.destroy"
        }
        /** Still worse, we could write the following, which will presumably always be forbidden since it might execute
        as late as "observation" which is at the end of local workflows
        members: {
            freeComponent: "@expand:fluid.component()"
        }
        */
    });

    fluid.tests.FLUID6148destructors.construct = function (that) {
        // Truly awful practice but there is little we can do to effectively forbid it
        that.freeComponent = fluid.component();
    };

    fluid.tests.FLUID6148destructors.destroy = function (that) {
        var transRec = fluid.currentTreeTransaction();
        transRec.promise.then(function () {
            jqUnit.assert("Transaction should conclude normally");
        }, function (err) {
            jqUnit.fail("Destruction transaction should have concluded normally, instead got " + err);
        });
        that.freeComponent.destroy();
        jqUnit.assertNotEquals("Opened transaction should not have rejected already", "reject", transRec.promise.disposition);
    };

    jqUnit.test("FLUID-6148: Chained destructors", function () {
        jqUnit.expect(2);
        var that = fluid.tests.FLUID6148destructors();
        that.destroy();
    });

    /** Test to check for double inversion of notification order with onCreate createOnEvent **/

    fluid.defaults("fluid.tests.FLUID6148notate", {
        gradeNames: "fluid.component",
        listeners: {
            "onCreate.note": {
                funcName: "fluid.tests.FLUID6148note",
                args: ["{fluid.tests.FLUID6148create}", "{that}"],
                // Note that if this priority is not supplied, the order will not be as expected since component
                // creation via "onCreate" itself will not be fully enqueued
                priority: "after:fluid-componentConstruction"
            }
        }
    });

    fluid.tests.FLUID6148note = function (noteHolder, created) {
        var createdPath = fluid.pathForComponent(created);
        createdPath.shift();
        noteHolder.createOrder.push(createdPath.join("."));
    };

    fluid.defaults("fluid.tests.FLUID6148create", {
        gradeNames: "fluid.tests.FLUID6148notate",
        members: {
            createOrder: []
        },
        components: {
            child1: {
                type: "fluid.tests.FLUID6148notate",
                createOnEvent: "onCreate",
                options: {
                    components: {
                        child2: {
                            type: "fluid.tests.FLUID6148notate",
                            options: {
                                components: {
                                    child3: {
                                        type: "fluid.tests.FLUID6148notate",
                                        createOnEvent: "onCreate"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-6148: Chained onCreate", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID6148create();
        var expected = ["child1.child2.child3", "child1.child2", "child1", ""];
        jqUnit.assertDeepEq("Components created in expected order", expected, that.createOrder);
    });

    /** FLUID-5614: Merging of "double deep trees" **/

    fluid.tests.push = function (array, value) {
        array.push(value);
    };

    fluid.defaults("fluid.tests.FLUID5614root1", {
        gradeNames: "fluid.component",
        components: {
            sub: {
                type: "fluid.component",
                options: {
                    members: {
                        firings: []
                    },
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.push",
                            args: ["{that}.firings", true]
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID5614root2", fluid.defaults("fluid.tests.FLUID5614root1"));

    jqUnit.test("FLUID-5614: Failure to merge \"double deep trees\" correctly", function () {
        var that = fluid.tests.FLUID5614root1({
            gradeNames: "fluid.tests.FLUID5614root2"
        });
        jqUnit.assertDeepEq("Should have fired two onCreate listeners through merged definitions",
            [true, true], that.sub.firings);
    });

    /** FLUID-6371 Memory leaks with dynamic components **/

    fluid.defaults("fluid.tests.FLUID6371root", {
        gradeNames: "fluid.component",
        events: {
            createIt: null,
            reportIt: null
        },
        listeners: {
            reportIt: "fluid.tests.destroyIt"
        },
        // Test leak resistance with targetted distributions
        distributeOptions: {
            target: "{that > *}.options.listeners.onCreate",
            record: "{FLUID6371root}.events.reportIt.fire"
        },
        dynamicComponents: {
            leakChild: {
                createOnEvent: "createIt",
                type: "fluid.component",
                options: {
                    distributeOptions: {
                        // Note that with current framework this distribution can't hit self but does reach child
                        target: "{FLUID6371root *}.options.selfValue",
                        record: 42
                    },
                    components: {
                        furtherChild: {
                            type: "fluid.component"
                        }
                    }
                }
            }
        }
    });

    // This is necessary because of FLUID-6373
    fluid.tests.destroyIt = function (that) {
        that.destroy();
    };

    fluid.tests.countHeapRecurse = function (map, root, path) {
        if (!map.has(root) && path !== "fluid.global" && path !== "fluid.jQueryStandalone.globalScope") {
            map.set(root, path);
            fluid.each(root, function (child, seg) {
                fluid.tests.countHeapRecurse(map, child, path + "." + seg);
            });
        }
    };

    fluid.tests.countHeap = function () {
        var map = new Map();
        fluid.tests.countHeapRecurse(map, fluid, "fluid");
        return map;
    };

    jqUnit.test("FLUID-6371: Memory leak tests", function () {
        var that = fluid.tests.FLUID6371root();
        var initialHeap = fluid.tests.countHeap();
        fluid.log("Initial heap size ", initialHeap);
        that.events.createIt.fire();
        var oneHeap = fluid.tests.countHeap();
        fluid.log("Heap size after one cycle", oneHeap.size);

        for (var i = 0; i < 3; ++i) {
            that.events.createIt.fire();
        }
        var finalHeap = fluid.tests.countHeap();
        fluid.log("Heap size after three cycles", finalHeap.size);
        jqUnit.assertEquals("Heap size should not have increased after repeated construction", oneHeap.size, finalHeap.size);
        finalHeap.forEach(function (value, key) {
            if (!oneHeap.has(key)) {
                fluid.log("Excess path: ", value);
            }
        });
    });

    /** FLUID-6126 failure to construct child of root which has been advised **/

    fluid.defaults("fluid.tests.FLUID6126root", {
        gradeNames: "fluid.component"
    });

    fluid.defaults("fluid.tests.FLUID6126advisor", {
        gradeNames: "fluid.component",
        distributeOptions: {
            record: "fluid.tests.FLUID6126addon",
            target: "{/ fluid.tests.FLUID6126root}.options.gradeNames"
        }
    });

    jqUnit.test("FLUID-6126: Failure to construct direct child of root which has been advised by distribution", function () {
        var advisor = fluid.tests.FLUID6126advisor();
        var root = fluid.construct("fluid6126root", {type: "fluid.tests.FLUID6126root"});
        jqUnit.assertValue("Successfully constructed root", root);
        jqUnit.assertTrue("Root has been advised", fluid.componentHasGrade(root, "fluid.tests.FLUID6126addon"));
        advisor.destroy();
        root.destroy();
    });

    /** FLUID-6128 failure when issuing IoCSS advice with more than 2 components from root **/

    fluid.defaults("fluid.tests.FLUID6128root", {
        gradeNames: "fluid.modelComponent"
    });

    fluid.defaults("fluid.tests.FLUID6128advisor", {
        gradeNames: "fluid.component",
        distributeOptions: {
            record: "fluid.tests.FLUID6128addon",
            target: "{/ intervening-name fluid.modelComponent}.options.gradeNames"
        }
    });

    jqUnit.test("FLUID-6128: Failure to match IoCSS selector with more than 2 components from root", function () {
        var advisor = fluid.tests.FLUID6128advisor();
        var freeModel = fluid.modelComponent();
        jqUnit.assertValue("Successfully constructed free modelComponent", freeModel);
        jqUnit.assertTrue("Free model has not been advised", !fluid.componentHasGrade(freeModel, "fluid.tests.FLUID6128addon"));
        var midRoot = fluid.construct("intervening-name", {type: "fluid.component"});
        var root = fluid.construct(["intervening-name", "fluid6128root"], {type: "fluid.tests.FLUID6128root"});
        jqUnit.assertTrue("Root has been advised", fluid.componentHasGrade(root, "fluid.tests.FLUID6128addon"));
        midRoot.destroy();
        freeModel.destroy();
        advisor.destroy();
    });

    /** FLUID-5193: The matching form '*' in IoCSS doesn't match any subcomponents **/

    fluid.defaults("fluid.tests.fluid5193root", {
        gradeNames: ["fluid.component"],
        components: {
            sub1: {
                type: "fluid.component"
            },
            sub2: {
                type: "fluid.component"
            }
        },
        userOption: 1,
        distributeOptions: {
            source: "{that}.options.userOption",
            removeSource: true,
            target: "{that > *}.options.userOption"
        }
    });

    jqUnit.test("FLUID-5193 The matching form '*' in IoCSS doesn't match any subcomponents", function () {
        var that = fluid.tests.fluid5193root();

        jqUnit.assertEquals("The distributed options has been passed down to subComponent #1", 1, that.sub1.options.userOption);
        jqUnit.assertEquals("The distributed options has been passed down to subComponent #2", 1, that.sub2.options.userOption);
    });

})(jQuery);
