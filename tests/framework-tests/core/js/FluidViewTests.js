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

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.setLogging(true);

    fluid.tests.testView = function () {

        jqUnit.module("Fluid View Tests");

        jqUnit.test("jById id not found", function () {
            var invalidIdElement = fluid.jById("this-id-does-not-exitst");
            jqUnit.assertEquals("element not found", 0, invalidIdElement.length);
        });

        jqUnit.test("FLUID-3953 tests: confusion for namespaced attributes", function () {
            jqUnit.expect(2);
            var node = fluid.byId("FLUID-3953-test");
            jqUnit.assertEquals("Plain DOM node fetched", "FLUID-3953-test", node.id);
            var jNode = fluid.jById("FLUID-3953-test");
            jqUnit.assertEquals("jQuery node fetched", "FLUID-3953-test", jNode.prop("id"));
        });

        jqUnit.test("findAncestor", function () {
            var testFunc = function (elementOfArray) {
                return elementOfArray.id === "top1";
            };
            jqUnit.assertEquals("Ancestor should be 'top1'", "top1", fluid.findAncestor($("#page-link-1"), testFunc).id);
        });


        fluid.registerNamespace("fluid.tests.fluid5821");

        fluid.tests.fluid5821.isEmptyJquery = function (message, element, checkSelector) {
            jqUnit.assertEquals(message + ": The element should have a length of zero...", 0, element.length);
            var fieldsToCheck = ["context", "selectorName"];
            if (checkSelector) {
                fieldsToCheck.push("selector");
            }
            fluid.each(fieldsToCheck, function (field) {
                jqUnit.assertNotUndefined(message + ": The field '" + field + "' should not be undefined...", element[field]);
                jqUnit.assertNotNull(message + ": The field '" + field + "' should not be null...", element[field]);
            });
        };

        fluid.defaults("fluid.tests.fluid5821", {
            gradeNames: ["fluid.viewComponent"],
            selectors: {
                bad:  ".notGonnaFindIt",
                emptyString: ""
            }
        });

        fluid.tests.assertJQuery = function (message, node) {
            jqUnit.assertValue(message, node.jquery);
        };

        jqUnit.test("FLUID-5821: DOM binder missing/empty selector tests", function () {
            var that = fluid.tests.fluid5821("body");
            function expectContainer(message, container) {
                jqUnit.assertEquals(message + " - located container with empty string ", fluid.unwrap(that.container), fluid.unwrap(container));
                fluid.tests.assertJQuery(message + " - located container should be a jQuery", container);
            }
            var missingElement = that.locate("missing");
            jqUnit.assertUndefined("Locate a non-existent selector key", missingElement);
            var badElement = that.locate("bad");
            fluid.tests.fluid5821.isEmptyJquery("Locate a selector which matches nothing", badElement, true);
            var container = that.locate("emptyString");
            expectContainer("Original locate", container);
            var rawContainer = fluid.unwrap(that.container);
            var container2 = that.locate("emptyString", rawContainer);
            expectContainer("locate with raw container", container2);
            var container3 = that.dom.fastLocate("emptyString", that.container);
            expectContainer("fastLocate after cached raw container", container3);
        });

        jqUnit.test("fluid.container: bind to an selector", function () {
            jqUnit.expect(3);
            // Give it a valid id selector.
            var selector = "#main-container";
            var result = fluid.container("#main-container");
            jqUnit.assertTrue("One element should be returned when specifying a selector", 1, result.length);
            jqUnit.assertEquals("The selector property should be set", selector, result.selector);
            jqUnit.assertEquals("The context property should be set", document.URL, result.context.URL);

            jqUnit.expectFrameworkDiagnostic("Selector matching two elements for container", function () {
                result = fluid.container(".container");
            }, "container");
        });

        jqUnit.test("fluid.container: bind to a jQuery", function () {
            jqUnit.expect(1);
            // Try with a single-item jQuery.
            var oneContainer = jQuery("#main-container");
            var result = fluid.container(oneContainer);
            jqUnit.assertEquals("If a single-element jQuery is used, it should be immediately returned.",
                oneContainer, result);
            jqUnit.expectFrameworkDiagnostic("jQuery containing two elements for container", function () {
                result = fluid.container($(".container"));
            }, "container");
        });

        jqUnit.test("fluid.container: bind to a DOM element", function () {
            var container = document.getElementById("main-container");
            var result = fluid.container(container);
            jqUnit.assertEquals("If a single DOM element is used, it should be wrapped in a jQuery.",
                                container, result[0]);
        });

        jqUnit.test("fluid.container: garbage object", function () {
            jqUnit.expectFrameworkDiagnostic("Garbage object", function () {
                var container = {foo: "bar"};
                fluid.container(container);
            }, "container");
        });

        jqUnit.test("DOM binder", function () {
            var container = $(".pager-top");
            var selectors = {
                "page-link": ".page-link",
                "inexistent": ".inexistent",
                "inner-link": "a"
            };
            var binder = fluid.createDomBinder(container, selectors);
            var pageLinks = binder.locate("page-link");
            jqUnit.assertEquals("Find 3 links", 3, pageLinks.length);
            function testSublocate(method) {
                for (var i = 0; i < 3; ++i) {
                    var scoped = binder[method]("inner-link", pageLinks[i]);
                    jqUnit.assertNotNull("Find inner link: " + method + "(" + i + ")", scoped);
                    jqUnit.assertEquals("Found second link: " + method + "(" + i + ")", scoped[0].id, "page-link-" + (i + 1));
                }
            }

            testSublocate("locate");
            testSublocate("fastLocate");

            var inexistent = binder.locate("inexistent");
            jqUnit.assertNotNull("Inexistent return", inexistent);
            jqUnit.assertEquals("Inexistent length", 0, inexistent.length);
            binder.locate("inexistent", pageLinks[0]);
            jqUnit.assertNotNull("Scoped inexistent return", inexistent);
            jqUnit.assertEquals("Scoped inexistent length", 0, inexistent.length);
        });


        jqUnit.test("allocateSimpleId", function () {
            var elementWithId = $("#element-with-id");
            var returnWithId = fluid.allocateSimpleId(elementWithId);
            jqUnit.assertDeepEq("Calling allocateSimpleId on element with id leaves id unchanged", ["element-with-id", "element-with-id"], [returnWithId, elementWithId.prop("id")]);

            var elementWithoutId = $(".element-without-id");
            var fluidId = fluid.allocateSimpleId(elementWithoutId);

            jqUnit.assertEquals("Calling on allocateSimpleId with parameter returns an ID starts with 'fluid-id-'", 0, fluidId.indexOf("fluid-id-"));
            jqUnit.assertEquals("The element ID should be set after allocateSimpleId is called with element.", fluidId, elementWithoutId.prop("id"));
        });

        // FLUID-5277: Improve the error message when an nonexistent container is provided for fluid.viewComponent and fluid.rendererComponent
        fluid.defaults("fluid.tests.fluid5277", {
            gradeNames: ["fluid.viewComponent"]
        });

        jqUnit.test("FLUID-5277: Improve the error message when an nonexistent container is provided for fluid.viewComponent and fluid.rendererComponent", function () {
            jqUnit.expectFrameworkDiagnostic("Nonexistent container", function () {
                fluid.tests.fluid5277("#nonexistent-container");
            }, ["No container element was found", "#nonexistent-container"]);
        });

        fluid.defaults("fluid.tests.testGradedView", {
            gradeNames: ["fluid.viewComponent"],
            selectors: {
                "page-link": ".page-link"
            }
        });

        jqUnit.test("Graded View Component", function () {
            var model = {myKey: "myValue"};
            var that = fluid.tests.testGradedView("#pager-top", {model: model});
            jqUnit.assertValue("Constructed component", that);
            jqUnit.assertEquals("Constructed functioning DOM binder", 3, that.locate("page-link").length);
            jqUnit.assertDeepEq("View component acquired model", model, that.model);
        });

        // Test for regression in ability to use the DOM binder in expanders in the FLUID-6148 framework. This
        // previously used to happen "by accident" via the custom init function for view components.
        fluid.defaults("fluid.tests.testLocatorExpander", {
            gradeNames: "fluid.tests.testGradedView",
            // Use of options rather than members is more likely to jump the queue ahead of the binder itself
            aLink: "@expand:{that}.locate(page-link)"
        });

        jqUnit.test("Use of DOM binder within expander", function () {
            var that = fluid.tests.testLocatorExpander("#pager-top");
            jqUnit.assertValue("Resolved some kind of value via locator expander", that.options.aLink);
            jqUnit.assertEquals("Found the 3 page links during startup", 3, that.options.aLink.length);
        });

        fluid.defaults("fluid.tests.blurTester", {
            gradeNames: "fluid.viewComponent",
            selectors: {
                select: "select",
                input: "input",
                div: "#component-3",
                excluded: ".excluded",
                excludedParent: ".excludedParent"
            }
        });

        function noteTime() {
            jqUnit.assertTrue("Time : " + fluid.renderTimestamp(new Date()), true);
        }

        function blurTest(message, provokeTarget, provokeOp, shouldBlur, excludeMaker) {
            jqUnit.asyncTest("Dead man's blur test - " + message, function () {

                noteTime();

                var blurReceived = false;
                var blurTester = fluid.tests.blurTester("#blurrable-widget");
                var input = blurTester.locate("input");
                var excluded = $("<div></div>").addClass("excludedParent");
                blurTester.container.append(excluded);

                var blurHandler = function () {
                    if (!blurReceived) {
                        jqUnit.assertTrue(message + " - Blur handler should " + (shouldBlur ? "" : "not ") + "execute", shouldBlur);
                        noteTime();
                        blurReceived = true;
                    }
                };
                var blurrer = fluid.deadMansBlur(input, {
                    delay: 300,
                    exclusions: excludeMaker(blurTester),
                    handler: blurHandler
                });

                excluded.append($("<input></input>").addClass("excluded"));

                fluid.focus(input);

                var blurOutwaiter = function () {
                    jqUnit.assertTrue(message + " - Blur handler has not executed", shouldBlur ^ !blurReceived);
                    noteTime();
                    jqUnit.start();
                };

                fluid.blur(input);
                window.setTimeout(function () {
                    fluid.log("Apply " + provokeOp + " to " + provokeTarget);
                    var element = blurTester.locate(provokeTarget);
                    if (provokeOp === "click") {
                        element.click();
                    } else {
                        fluid[provokeOp](element);
                    }
                }, blurrer.options.delay - 100);

                window.setTimeout(blurOutwaiter, blurrer.options.delay + 300);
            });
        }

        var selectExclusions = function (dom) {
            return {selection: dom.locate("select")};
        };

        var bothExclusions = function (dom) {
            return {
                selection: dom.locate("select"),
                div:  dom.locate("div")
            };
        };

        var excludedExclusions = function (dom) {
            return {excludedParent: dom.locate("excludedParent")};
        };

        blurTest("nonExcluded component one", "div", "click", true, selectExclusions);
        blurTest("excluded component one", "select", "focus", false, selectExclusions);

        blurTest("excluded component two - a", "div", "click", false, bothExclusions);
        blurTest("excluded component two - b", "select", "focus", false, bothExclusions);

        blurTest("excluded component excluded", "excluded", "focus", false, excludedExclusions);

        jqUnit.test("ARIA labeller test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1");
            var attr = target.attr("aria-label");
            jqUnit.assertValue("Target must be labelled", attr);
            jqUnit.assertEquals("Target label", "Label 1", attr);
            labeller.update({text: "Label 2"});
            jqUnit.assertEquals("Label updated", "Label 2", target.attr("aria-label"));
        });

        jqUnit.test("ARIA labeller live region test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1", {
                dynamicLabel: true
            });

            var region = fluid.jById(fluid.defaults("fluid.ariaLabeller").liveRegionId);
            jqUnit.assertEquals("Live region should have the correct label", "Label 1", region.text());
            labeller.update({
                text: "Label 2",
                dynamicLabel: true
            });
            jqUnit.assertEquals("The live region should be updated", target.attr("aria-label"), region.text());
        });
    };
})(jQuery);
