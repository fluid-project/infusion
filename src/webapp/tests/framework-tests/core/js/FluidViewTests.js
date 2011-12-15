/*
Copyright 2011 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, fluid, jqUnit, jQuery, start, stop*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {

    fluid.setLogging(true);

    fluid.tests.testView = function () {
 
        var fluidViewTests = new jqUnit.TestCase("Fluid View Tests");


        fluidViewTests.test("jById id not found", function () {
            var invalidIdElement = fluid.jById("this-id-does-not-exitst");
            jqUnit.assertEquals("element not found", 0, invalidIdElement.length);
        });
        
        fluidViewTests.test("FLUID-3953 tests: confusion for namespaced attributes", function () {
            jqUnit.expect(2);
            var node = fluid.byId("FLUID-3953-test");
            jqUnit.assertEquals("Plain DOM node fetched", "FLUID-3953-test", node.id);
            var jNode = fluid.jById("FLUID-3953-test");
            jqUnit.assertEquals("jQuery node fetched", "FLUID-3953-test", jNode.prop("id"));
        });

        fluidViewTests.test("findAncestor", function () {
            var testFunc = function (elementOfArray, indexInArray) {
                return elementOfArray.id === "top1";
            };
            jqUnit.assertEquals("Ancestor should be 'top1'", "top1", fluid.findAncestor($("#page-link-1"), testFunc).id);
        });
        
        fluidViewTests.test("Container: bind to an id", function () {
            try {
                fluid.pushSoftFailure(true);
                expect(2);
                // Give it a valid id string.
                var result = fluid.container("#main");
                jqUnit.assertTrue("One element should be returned when specifying a selector",
                                  1, result.length);
              
                // Now try with a invalid string... a CSS selector matching two elements
                try {
                    result = fluid.container(".container");
                } catch (e) {
                    jqUnit.assertTrue("We should have received an exception", !!e);
                }
            } finally {
                fluid.pushSoftFailure(-1);  
            }
        });
    
        fluidViewTests.test("container(): bind to a single jQuery", function () {
            try {
                fluid.pushSoftFailure(true);
                expect(2);
                // Try with a single-item jQuery.
                var oneContainer = jQuery("#main");
                var result = fluid.container(oneContainer);
                jqUnit.assertEquals("If a single-element jQuery is used, it should be immediately returned.",
                             oneContainer, result);
                 
                // Now try with a two-element jQuery, which should cause an exception.
                var twoContainers = jQuery(".container");
                try {
                    result = fluid.container(twoContainers);
                } catch (e) {
                    jqUnit.assertTrue("We should have received an exception", !!e);
                }
            } finally {
                fluid.pushSoftFailure(-1);  
            }
        });
        
        fluidViewTests.test("container(): bind to a DOM element", function () {
            var container = document.getElementById("main");
            var result = fluid.container(container);
            jqUnit.assertEquals("If a single DOM element is used, it should be wrapped in a jQuery.",
                                container, result[0]);
        });
        
        fluidViewTests.test("container(): garbage object", function () {
            try {
                fluid.pushSoftFailure(true);
                expect(1);
                // Random objects should fail.
                var container = {foo: "bar"};
    
                try {
                    fluid.container(container);
                } catch (e) {
                    jqUnit.assertTrue("We should have received an exception", !!e);
                }
            } finally {
                fluid.pushSoftFailure(-1);
            }
        });
        
        fluidViewTests.test("DOM binder", function () {
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

       
        fluidViewTests.test("allocateSimpleId", function () {
            var element = {};
            var fluidId = fluid.allocateSimpleId();
            jqUnit.assertEquals("Calling on allocateSimpleId with no parameter returns an ID starts with 'fluid-id-'", 0, fluidId.indexOf("fluid-id-"));
            fluidId = fluid.allocateSimpleId(element);
            jqUnit.assertEquals("Calling on allocateSimpleId with parameter returns an ID starts with 'fluid-id-'", 0, fluidId.indexOf("fluid-id-"));
            jqUnit.assertEquals("The element ID should be set after allocateSimpleId is called with element.", fluidId, element.id);
        });
          
          
              
        fluid.tests.testComponent = function (container, options) {
            var that = fluid.initView("fluid.tests.testComponent", container, options);
            that.subcomponent = fluid.initSubcomponent(that, "subcomponent", [that.container, fluid.COMPONENT_OPTIONS]);
            return that;
        };
        
        fluid.tests.subcomponent = function (container, options) {
            var that = fluid.initView("fluid.tests.subcomponent", container, options);
            that.greeting = that.options.greeting;
            return that;
        };
        
        fluid.defaults("fluid.tests.testComponent", {
            subcomponent: {
                type: "fluid.tests.subcomponent"
            } 
        });
        
        fluid.defaults("fluid.tests.subcomponent", {
            greeting: "hello"
        });
        
        var componentWithOverridenSubcomponentOptions = function (greeting) {
            return fluid.tests.testComponent("#main-container", {
                subcomponent: {
                    options: {
                        greeting: greeting
                    }
                }
            });
        };
        
        fluidViewTests.test("initSubcomponents", function () {
            // First, let's check that the defaults are used if no other options are specified.
            var myComponent = fluid.tests.testComponent("#main-container");
            jqUnit.assertEquals("The subcomponent should have its default options.", 
                                "hello", myComponent.subcomponent.greeting);
           
            // Now try overriding the subcomponent options with specific options.
            myComponent = componentWithOverridenSubcomponentOptions("bonjour");
            jqUnit.assertEquals("The subcomponent's options should have been overridden correctly.", 
                                "bonjour", myComponent.subcomponent.greeting);
                               
        });
        
        fluid.defaults("fluid.tests.testGradedView", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                "page-link": ".page-link"
            }
        });
        
        fluidViewTests.test("Graded View Component", function () {
            var model = {myKey: "myValue"};
            var that = fluid.tests.testGradedView("#pager-top", {model: model});
            jqUnit.assertValue("Constructed component", that);
            jqUnit.assertEquals("Constructed functioning DOM binder", 3, that.locate("page-link").length);
            jqUnit.assertEquals("View component correctly preserved model", that.model, model);   
        });
      
        fluid.tests.blurTester = function (container, options) {
            var that = fluid.initView("fluid.tests.blurTester", container, options);
            return that;  
        };
     
        fluid.defaults("fluid.tests.blurTester", {
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
     
        // This function is necessary since simulation of focus events by jQuery under IE
        // is not sufficiently good to intercept the "focusin" binding.
        function applyOp(node, func) {
            var raw = fluid.unwrap(node);
            raw[func] ? raw[func]() : node[func]();   
        }
     
        function blurTest(message, provokeTarget, provokeOp, shouldBlur, excludeMaker) { 
            fluidViewTests.test("Dead man's blur test - " + message, function () {
               
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
                
                applyOp(input, "focus");
                 
                var blurOutwaiter = function () {
                    jqUnit.assertTrue(message + " - Blur handler has not executed", shouldBlur ^ !blurReceived);
                    noteTime();
                    start();
                };
    
                applyOp(input, "blur");
                window.setTimeout(function () {
                    fluid.log("Apply " + provokeOp + " to " + provokeTarget);
                    applyOp(blurTester.locate(provokeTarget), provokeOp);
                }, blurrer.options.delay - 100);
                 
                window.setTimeout(blurOutwaiter, blurrer.options.delay + 300);
                 
                stop();
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
     
        fluidViewTests.test("ARIA labeller test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1");
            var attr = target.attr("aria-label");
            jqUnit.assertValue("Target must be labelled", attr);
            jqUnit.assertEquals("Target label", "Label 1", attr);
            labeller.update({text: "Label 2"});
            jqUnit.assertEquals("Label updated", "Label 2", target.attr("aria-label"));
        });
        
        fluidViewTests.test("ARIA labeller live region test", function () {
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