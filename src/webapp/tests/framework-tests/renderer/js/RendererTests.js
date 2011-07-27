/*
 Copyright 2008-2010 University of Cambridge
 Copyright 2008-2009 University of Toronto
 Copyright 2010-2011 Lucendo Development Ltd.
 
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

    fluid.tests.testRenderer = function () {
        var deepEqTests = new jqUnit.TestCase("Deep Equivalence Tests");
        
        deepEqTests.test("Test", function () {
            jqUnit.assertDeepEq("eq1", {
                p1: "thing1"
            }, {
                p1: "thing1"
            });
            jqUnit.assertDeepNeq("eq2", {
                p1: "thing1"
            }, {
                p2: "thing1"
            });
            jqUnit.assertDeepNeq("eq3", {
                p1: "thing1"
            }, null);
            jqUnit.assertDeepNeq("eq4", null, {
                p1: "thing1"
            });
            jqUnit.assertDeepEq("eq5", null, null);
            jqUnit.assertDeepEq("eq6", undefined, undefined);
            jqUnit.assertDeepNeq("eq7", {
                p1: "thing1",
                p2: "thing"
            }, {
                p1: "thing1"
            });
            jqUnit.assertDeepNeq("eq8", {
                p1: "thing1"
            }, {
                p1: "thing1",
                p2: "thing"
            });
            jqUnit.assertDeepEq("eq9", [1, 2], [1, 2]);
            jqUnit.assertDeepNeq("eq10", [1, 2], [1, 2, 3]);
            jqUnit.assertDeepNeq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
            jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
        });
        
        var parserTests = new jqUnit.TestCase("Selector Parser Test");
        
        parserTests.test("Test", function () {
            var tree = fluid.parseSelector("  div span#id  > .class");
            jqUnit.assertEquals("treeLength", 3, tree.length);
            var expected = [{
                predList: [{
                    tag: "div"
                }]
            }, {
                predList: [{
                    tag: "span"
                }, {
                    id: "id"
                }],
                child: true
            }, {
                predList: [{
                    clazz: "class"
                }]
            }];
            jqUnit.assertDeepEq("Misparse: Tree was " + JSON.stringify(tree), expected, tree);
        });
        
        var renderTests = new jqUnit.TestCase("Selector Render Test");
        
        renderTests.test("Selector-based render test", function () {
            var tree = {
                "header:": []
            };
            var reps = 5;
            for (var i = 0; i < reps; ++i) {
                tree["header:"][i] = i + 1;
            }
            var templates = fluid.selfRender($("#table-header"), tree, {
                cutpoints: [{
                    selector: "th.column-header",
                    id: "header:"
                }]
            });
            
            var rendered = $("#table-header").get(0).innerHTML;
            
            var lumps = templates[0].lumps;
            var found = false;
            
            for (var j = 0; j < lumps.length; ++j) {
                if (lumps[j].rsfID === "header:") {
                    found = true;
                }
            }
            
            jqUnit.assertTrue("Template+selector parse", found);
            
            jqUnit.assertFalse("Template render", rendered.indexOf("5") === -1);
        });
        
        var enc_table = [{
            "species": "Man",
            "score": 7.44
        }, {
            "species": "Dolphin",
            "score": 5.31
        }, {
            "species": "Chimpanzee",
            "score": 2.49
        }, {
            "species": "Rhesus Monkey",
            "score": 2.09
        }, {
            "species": "Elephant",
            "score": 1.87
        }, {
            "species": "Whale",
            "score": 1.76
        }, {
            "species": "Dog",
            "score": 1.17
        }, {
            "species": "CATT",
            "score": 1.00
        }, {
            "species": "Horse",
            "score": 0.86
        }, {
            "species": "Sheep",
            "score": 0.81
        }, {
            "species": "Mouse",
            "score": 0.50
        }, {
            "species": "Rat",
            "score": 0.40
        }, {
            "species": "Rabbit",
            "score": 0.40
        }];
        
        renderTests.test("ID-based render test", function () {
            var contentTree = {
                "data-row:": enc_table
            };
            
            fluid.selfRender($(".paged-content"), contentTree);
            var rows = $(".paged-content tr").length;
            jqUnit.assertEquals("Rendered row count", 14, rows);
            var cells = $(".paged-content td").length;
            jqUnit.assertEquals("Rendered cell count", 26, cells);
            
        });
        
        renderTests.test("Decorator interference test", function () {
            var progressSelectorMap = [{
                selector: ".progress-bars",
                id: "progress-bars:"
            }, {
                selector: ".fl-progress",
                id: "fl-progress"
            }, {
                selector: ".fl-progress-bar",
                id: "fl-progress-bar"
            }, {
                selector: ".fl-progress-indicator",
                id: "fl-progress-indicator"
            }];
            
            var progressComponentTree = {
                children: [{
                    ID: "progress-bars:",
                    decorators: {
                        identify: "stable-bar"
                    },
                    children: [{
                        ID: "fl-progress"
                    }, {
                        ID: "fl-progress-bar"
                    }, {
                        ID: "fl-progress-indicator",
                        decorators: {
                            addClass: "stable"
                        }
                    }]
                }, {
                    ID: "progress-bars:",
                    decorators: {
                        identify: "in-dev-bar"
                    },
                    children: [{
                        ID: "fl-progress"
                    }, {
                        ID: "fl-progress-bar"
                    }, {
                        ID: "fl-progress-indicator",
                        decorators: {
                            addClass: "in-development"
                        }
                    }]
                }, {
                    ID: "progress-bars:",
                    decorators: {
                        identify: "in-design-bar"
                    },
                    children: [{
                        ID: "fl-progress"
                    }, {
                        ID: "fl-progress-bar"
                    }, {
                        ID: "fl-progress-indicator",
                        decorators: {
                            addClass: "in-design"
                        }
                    }]
                }]
            };
            var node = $("#decorator-interference-test");
            fluid.selfRender(node, progressComponentTree, {
                cutpoints: progressSelectorMap
            });
            var decorated = $(".fl-progress-indicator", node);
            jqUnit.assertEquals("3 indicators should be rendered", 3, decorated.length);
            jqUnit.assertEquals("1 is stable", true, decorated.eq(0).hasClass("stable"));
            jqUnit.assertEquals("2 is not stable", false, decorated.eq(1).hasClass("stable"));
            jqUnit.assertEquals("2 is in-development", true, decorated.eq(1).hasClass("in-development"));
        });
        
        renderTests.test("Decorator and degradation test", function () {
            var indexClick = null;
            var columnClick = null;
            var clickBack = function (index, column) {
                indexClick = index;
                columnClick = column;
            };
            var contentTree = fluid.transform(enc_table, function (row, i) {
                return {
                    ID: "data-row:",
                    children: [{
                        ID: "species",
                        value: row.species,
                        decorators: {
                            jQuery: ["click", function () {
                                clickBack(i, "species");
                            }],
                            identify: "species-" + i,
                            addClass: "CATTclick1 CATTclick2",
                            removeClass: "CATTclick3"
                        }
                    }, {
                        ID: "score",
                        value: row.score,
                        decorators: [{
                            type: "$",
                            func: "change",
                            args: function () {
                                clickBack(i, "score");
                            }
                        }, {
                            type: "identify",
                            key: "score-" + i
                        }]
                    }],
                    decorators: {
                        "addClass": (i % 2 === 0) ? "evenRow" : "oddRow"
                    }
                };
            });
            var idMap = {};
            fluid.selfRender($(".paged-content-2"), contentTree, {
                idMap: idMap
            });
            var species6 = idMap["species-7"];
            var el = fluid.jById(species6);
            jqUnit.assertEquals("Identified by idMap", 1, el.length);
            jqUnit.assertTrue("Decorated by addClass", el.hasClass("CATTclick1"));
            jqUnit.assertFalse("Undecorated by removeClass", el.hasClass("CATTclick3"));
            el.click();
            jqUnit.assertEquals("Decorated by click", 7, indexClick);
            clickBack(null, null);
            var input = fluid.jById(idMap["score-7"]);
            jqUnit.assertEquals("Input text", 1.00, input.val());
            input.val(100);
            input.change();
            jqUnit.assertEquals("change-decorate-identify", 7, indexClick);
        });
        
        //   rendertests.test("Invalid trees", function () {
        //     var node = $(".RSF-77-test");
        //     var error;
        //     try {
        //      fluid.selfRender(node, {
        //         "row:": ["Label 1", "Label 2"]
        //         });
        //     }
        //     catch (e) {
        //      error = e;
        //     }
        //     jqUnit.assertNotUndefined("Invalid tree")
        //   });
        
        var messageBase = {
            message1: "A simple message",
            message2: "A second message",
            refMessage: "http://a.b.com/c",
            message3: "Every {0} has {1} {2}(s)"
        };
        
        renderTests.test("ID relation rewriting and template messaging", function () {
            // Tests FLUID-1676
            var node = $(".RSF-77-test");
            fluid.selfRender(node, {
                "row:": [{
                    ID: "target",
                    value: "Target 1"
                }, {
                    ID: "target",
                    value: "Target 2"
                }]
            }, {
                messageSource: {
                    type: "data",
                    messages: messageBase
                }
            });
            var targets = $("span", node);
            jqUnit.assertNotEquals("Unique target ids", targets[0].id, targets[1].id);
            var labels = $("label", node);
            fluid.testUtils.assertNode("Rendered messages", [{
                nodeText: messageBase.message1,
                "for": targets[0].id
            }, {
                nodeText: messageBase.message1,
                "for": targets[1].id
            }], labels);
        });
        
        function testFluid2298(message, useChildren) {
            renderTests.test(message, function () {
                var node = $(".FLUID-2298-test");
                fluid.selfRender(node, {
                    children: [{
                        ID: "target:",
                        children: useChildren ? [] : undefined
                    }]
                }, {
                    messageSource: {
                        type: "data",
                        messages: messageBase
                    }
                });
                var targets = $("span", node);
                var labelNode = $("label", node);
                fluid.testUtils.assertNode("Rendered messages", {
                    nodeText: messageBase.message1,
                    "for": targets[0].id
                }, labelNode);
            });
        }
        
        testFluid2298("ID relation rewriting for branch - FLUID-2298 - branch case", true);
        testFluid2298("ID relation rewriting for branch - FLUID-2298 - leaf case", false);
        
        renderTests.test("ID relation non-interference", function () {
            // Also tests FLUID-1677
            fluid.selfRender($(".RSF-111-test"));
            var label = $(".RSF-111-test label");
            jqUnit.assertEquals("Target undisturbed", "target2", label.attr("for"));
        });
        
        
        renderTests.test("UIMessage tests", function () {
            var node = $(".UIMessage-test");
            function expectMessage(message) {
                var messageNode = $("span", node);
                fluid.testUtils.assertNode("Rendered message", {
                    nodeText: message
                }, messageNode);
            }
            var tree = {
                ID: "message",
                messagekey: "message1"
            };
            var options = {
                messageSource: {
                    type: "data",
                    messages: messageBase,
                    resolveFunc: fluid.formatMessage
                }
            };
            var templates = fluid.selfRender(node, tree, options);
            expectMessage(messageBase.message1);
            
            fluid.reRender(templates, node, {
                ID: "message",
                messagekey: ["junk1", "junk2", "message2"]
            }, options);
            expectMessage(messageBase.message2);
            
            fluid.reRender(templates, node, {
                ID: "message",
                messagekey: "message3",
                args: ["CATT", "four", "leg"]
            }, options);
            expectMessage("Every CATT has four leg(s)");
        });
        
        renderTests.test("UILinkMessage tests", function () {
            var node = $(".UILinkMessage-test");
            
            var tree = {
                children: [{
                    ID: "link",
                    linktext: {
                        messagekey: "message1"
                    },
                    target: {
                        messagekey: "refMessage"
                    }
                }]
            };
            var options = {
                messageSource: {
                    type: "data",
                    messages: messageBase
                }
            };
            var templates = fluid.selfRender(node, tree, options);
            var link = $("a", node);
            fluid.testUtils.assertNode("Rendered messages", {
                nodeText: messageBase.message1,
                href: messageBase.refMessage
            }, link);
        });
        
        renderTests.test("UIVerbatimMessage tests", function () {
            var node = $(".UIVerbatimMessage-test");
            var vmessageBase = {
                vmessage: "Some <em>HTML</em> text"
            };
            
            var tree = {
                children: [{
                    ID: "verbatim",
                    markup: {
                        messagekey: "vmessage"
                    }
                }]
            };
            var options = {
                messageSource: {
                    type: "data",
                    messages: vmessageBase
                }
            };
            var templates = fluid.selfRender(node, tree, options);
            
            var node2 = $(".UIVerbatimMessage-dumpery");
            node2.html(vmessageBase.vmessage);
            
            fluid.testUtils.assertNode("Rendered messages", {
                nodeHTML: node2.html()
            }, $("div", node));
        });
        
        renderTests.test("Simple UIBound tests", function () {
            var node = $(".FLUID-1696-test");
            var templates = fluid.selfRender(node, {
                checkbox1: true,
                checkbox2: false,
                field: "Value"
            });
            fluid.testUtils.assertNode("Render with values", {
                nodeName: "input",
                "class": "checkbox1",
                type: "checkbox",
                value: "true",
                checked: "checked"
            }, $(".checkbox1", node));
            fluid.testUtils.assertNode("Render with values", {
                nodeName: "input",
                "class": "checkbox2",
                type: "checkbox",
                value: "true",
                checked: undefined
            }, $(".checkbox2", node));
            fluid.testUtils.assertNode("Render with values", {
                nodeName: "input",
                "class": "field",
                type: "text",
                value: "Value"
            }, $(".field", node));
            
            fluid.reRender(templates, node, {
                checkbox1: null,
                checkbox2: null,
                field: null
            });
            fluid.testUtils.assertNode("Render without values", {
                nodeName: "input",
                "class": "checkbox1",
                type: "checkbox",
                value: "true",
                checked: undefined
            }, $(".checkbox1", node));
            fluid.testUtils.assertNode("Render without values", {
                nodeName: "input",
                "class": "checkbox2",
                type: "checkbox",
                value: "true",
                checked: "checked"
            }, $(".checkbox2", node));
            fluid.testUtils.assertNode("Render without values", {
                nodeName: "input",
                "class": "field",
                type: "text",
                value: "Thing"
            }, $(".field", node));
        });
        
        // Common data for all the tests which deal with UISelect components
        
        var selection_tree = {
            ID: "select",
            selection: "Apocatastasis",
            optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
            optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
        };
        
        var explode_options = function (type) {
            return {
                selectID: "select",
                rowID: type + "-row:",
                inputID: type,
                labelID: "label"
            };
        };
        
        var model = {
            values: ["Enchiridion", "Apocatastasis", "Exomologesis"],
            names: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
        };
        
        var binding_tree = {
            children: [{
                ID: "select",
                selection: {
                    valuebinding: "choice"
                },
                optionlist: {
                    valuebinding: "values"
                },
                optionnames: {
                    valuebinding: "names"
                }
            }]
        };
        
        var multiple_selection_tree = fluid.copy(selection_tree);
        multiple_selection_tree.selection = ["Enchiridion", "Apocatastasis"];
        
        
        function makeBindingTest(message, testfunc) {
            renderTests.test(message, function () {
                testfunc(null);
            });
            renderTests.test(message + " with autobind", function () {
                testfunc({
                    autoBind: true
                });
            });
        }
        
        function merge(target, source) {
            return $.extend(true, target, source);
        }
        
        function singleSelectionRenderTests(node) {
            var options = $("option", node);
            fluid.testUtils.assertNode("Render UISelect options", [{
                nodeName: "option",
                selected: undefined,
                value: "Enchiridion",
                nodeText: "Enchiridion"
            }, {
                nodeName: "option",
                selected: "selected",
                value: "Apocatastasis",
                nodeText: "ApoCATTastasis"
            }, {
                nodeName: "option",
                selected: undefined,
                value: "Exomologesis",
                nodeText: "Exomologesis"
            }], options);
            var select = $("select", node);
            fluid.testUtils.assertNode("Render UISelect select", {
                nodeName: "select",
                multiple: undefined
            }, select);
        }
        
        renderTests.test("UISelect tests with HTML select", function () {
            var node = $(".UISelect-test-select");
            fluid.selfRender(node, {
                children: [fluid.copy(selection_tree)]
            });
            singleSelectionRenderTests(node);
        });
        
        
        makeBindingTest("UISelect binding tests with HTML select", function (opts) {
            var node = $(".UISelect-test-select");
            var model1 = $.extend(true, {}, model, {
                choice: "Apocatastasis"
            });
            
            var template = fluid.selfRender(node, fluid.copy(binding_tree), merge({
                model: model1
            }, opts));
            singleSelectionRenderTests(node);
            var select = $("select", node);
            select.val("Enchiridion");
            select.change();
            if (!opts) {
                fluid.applyChange(select);
            }
            jqUnit.assertEquals("Applied value to model", "Enchiridion", model1.choice);
            fluid.reRender(template, node, fluid.copy(binding_tree), merge({
                model: model1
            }, opts));
        });
        
        function multipleSelectionRenderTests(node) {
            var options = $("option", node);
            fluid.testUtils.assertNode("Render UISelect", [{
                nodeName: "option",
                selected: "selected",
                value: "Enchiridion",
                nodeText: "Enchiridion"
            }, {
                nodeName: "option",
                selected: "selected",
                value: "Apocatastasis",
                nodeText: "ApoCATTastasis"
            }, {
                nodeName: "option",
                selected: undefined,
                value: "Exomologesis",
                nodeText: "Exomologesis"
            }], options);
            var select = $("select", node);
            fluid.testUtils.assertNode("Render UISelect select", {
                nodeName: "select",
                multiple: "multiple"
            }, select);
        }
        
        renderTests.test("UISelect tests with HTML multiple select", function () {
            var node = $(".UISelect-test-select");
            var templates = fluid.selfRender(node, {
                children: [fluid.copy(multiple_selection_tree)]
            });
            multipleSelectionRenderTests(node);
        });
        
        makeBindingTest("UISelect binding tests with HTML multiple select", function (opts) {
            var node = $(".UISelect-test-select");
            var model2 = $.extend(true, {}, model, {
                choice: ["Enchiridion", "Apocatastasis"]
            });
            var templates = fluid.selfRender(node, fluid.copy(binding_tree), merge({
                model: model2
            }, opts));
            multipleSelectionRenderTests(node);
            var select = $("select", node);
            select.val(["Exomologesis", "Apocatastasis"]);
            select.change();
            if (!opts) {
                fluid.applyChange(select);
            }
            jqUnit.assertDeepEq("Applied value to model", ["Apocatastasis", "Exomologesis"], model2.choice);
        });
        
        function singleSelectionRadioRenderTests(node) {
            var inputs = $("input", node);
            fluid.testUtils.assertNode("Render UISelect as radio buttons", [{
                nodeName: "input",
                checked: undefined,
                value: "Enchiridion",
                type: "radio"
            }, {
                nodeName: "input",
                checked: "checked",
                value: "Apocatastasis",
                type: "radio"
            }, {
                nodeName: "input",
                checked: undefined,
                value: "Exomologesis",
                type: "radio"
            }], inputs);
            var names = fluid.transform(inputs, function (node) {
                return $(node).attr("name");
            });
            jqUnit.assertValue("Name should be assigned", names[0]);
            jqUnit.assertTrue("Name should have been rewritten", names[0] !== "vocable");
            jqUnit.assertEquals("Names should be identical", names[0], names[1]);
            jqUnit.assertEquals("Names should be identical", names[1], names[2]);
            jqUnit.assertNotEquals("IDs should be different", inputs[0].id, inputs[1].id);
            jqUnit.assertNotEquals("IDs should be different", inputs[1].id, inputs[2].id);
            var labels = $("label", node);
            fluid.testUtils.assertNode("Labels and relations", [{
                nodeName: "label",
                "for": inputs[0].id,
                "nodeText": "Enchiridion"
            }, {
                nodeName: "label",
                "for": inputs[1].id,
                "nodeText": "ApoCATTastasis"
            }, {
                nodeName: "label",
                "for": inputs[2].id,
                "nodeText": "Exomologesis"
            }], labels);
        }
        
        
        renderTests.test("UISelect tests with radio buttons", function () {
            var node = $(".UISelect-test-radio-1");
            var tree = {
                children: [fluid.copy(selection_tree)].concat(fluid.explodeSelectionToInputs(selection_tree.optionlist, explode_options("radio")))
            };
            fluid.selfRender(node, tree);
            singleSelectionRadioRenderTests(node);
        });
        
        makeBindingTest("UISelect binding tests with radio buttons", function (opts) {
            var node = $(".UISelect-test-radio-1");
            var model3 = $.extend(true, {}, model, {
                choice: "Apocatastasis"
            });
            var tree = fluid.copy(binding_tree);
            tree.children = tree.children.concat(fluid.explodeSelectionToInputs(selection_tree.optionlist, explode_options("radio")));
            var template = fluid.selfRender(node, tree, merge({
                model: model3
            }, opts));
            singleSelectionRadioRenderTests(node);
            var inputs = $("input", node);
            fluid.value(inputs, "Enchiridion");
            $(inputs[0]).change();
            if (!opts) {
                fluid.applyChange(inputs);
            }
            jqUnit.assertEquals("Applied value to model", "Enchiridion", model3.choice);
        });
        
        function multipleSelectionCheckboxRenderTests(node) {
            var inputs = $("input", node);
            fluid.testUtils.assertNode("Render UISelect as checkboxes", [{
                nodeName: "input",
                checked: "checked",
                value: "Enchiridion",
                type: "checkbox"
            }, {
                nodeName: "input",
                checked: "checked",
                value: "Apocatastasis",
                type: "checkbox"
            }, {
                nodeName: "input",
                checked: undefined,
                value: "Exomologesis",
                type: "checkbox"
            }], inputs);
            var names = fluid.transform(inputs, function (node) {
                return $(node).attr("name");
            });
            jqUnit.assertValue("Name should be assigned", names[0]);
            jqUnit.assertTrue("Name should have been rewritten", names[0] !== "vocable");
            jqUnit.assertEquals("Names should be identical", names[0], names[1]);
            jqUnit.assertEquals("Names should be identical", names[1], names[2]);
        }
        
        renderTests.test("UISelect tests with checkboxes", function () {
            var node = $(".UISelect-test-check-1");
            var tree = {
                children: [fluid.copy(multiple_selection_tree)].concat(fluid.explodeSelectionToInputs(selection_tree.optionlist, explode_options("checkbox")))
            };
            fluid.selfRender(node, tree);
            multipleSelectionCheckboxRenderTests(node);
        });
        
        makeBindingTest("UISelect binding tests with checkboxes", function (opts) {
            var node = $(".UISelect-test-check-1");
            var model4 = $.extend(true, {}, model, {
                choice: ["Enchiridion", "Apocatastasis"]
            });
            var tree = fluid.copy(binding_tree);
            tree.children = tree.children.concat(fluid.explodeSelectionToInputs(selection_tree.optionlist, explode_options("checkbox")));
            fluid.selfRender(node, tree, merge({
                model: model4
            }, opts));
            multipleSelectionCheckboxRenderTests(node);
            var inputs = $("input", node);
            fluid.value(inputs, ["Exomologesis", "Apocatastasis"]);
            $(inputs[0]).change();
            if (!opts) {
                fluid.applyChange(inputs);
            }
            jqUnit.assertDeepEq("Applied value to model", ["Apocatastasis", "Exomologesis"], model4.choice);
        });
        
        renderTests.test("UILink rendering", function () {
            // must use absolute URLs for tests, since IE will rewrite relative ones by itself
            var link_target = "http://www.site/dynamic-target.html";
            var link_target_2 = "http://www.site/dynamic-target-2.jpg";
            var model = {
                "target_2": link_target_2
            };
            var tree = {
                children: [{
                    ID: "link-1",
                    target: link_target
                }, {
                    ID: "link-2",
                    target: {
                        valuebinding: "target_2"
                    }
                }]
            };
            var node = $(".link-test-1");
            var templates = fluid.selfRender(node, fluid.copy(tree), {
                model: model
            });
            var link = $("a", node);
            jqUnit.assertTrue("Link rendered", link.length > 0);
            // can only test endsWith on IE, since it expands relative links to 
            jqUnit.assertEquals("Rewritten target", link_target, link.attr("href"));
            var img = $("img", link);
            jqUnit.assertTrue("Image rendered", img.length > 0);
            jqUnit.assertEquals("Rewritten target", link_target_2, img.attr("src"));
            
            tree.children[0].linktext = "Dynamic text";
            fluid.reRender(templates, node, fluid.copy(tree), {
                model: model
            });
            
            return;
            /*
             // the remainder of this test cannot be supported - browsers will rewrite
             // hrefs etc. that are attached to the document
             
             var link = $("a", node);
             fluid.testUtils.assertNode("UILink text material overwrite",
             {nodeName: "a", href: link_target, nodeText: "Dynamic text"}, link);
             var img = $("img", node);
             jqUnit.assertTrue("Image not rendered", img.length === 0);
             
             var node2 = $(".link-test-2");
             fluid.selfRender(node2, fluid.copy(tree));
             
             var link2 = $("a", node2);
             fluid.testUtils.assertNode("UILink text material overwrite",
             {nodeName: "a", href: "dynamic-target.html", nodeText: "Dynamic text"}, link2);
             
             var form = $("form", node2);
             jqUnit.assertTrue("Form rendered", form.length > 0);
             jqUnit.assertEquals("Rewritten target", "dynamic-target-2.jpg", form.attr("action"));
             */
        });
        
        renderTests.test("Basic input rendering and binding", function () {
            var model = {
                "string": "value",
                "boolean": false
            };
            var tree = {
                children: [{
                    ID: "input",
                    valuebinding: "string"
                }, {
                    ID: "checkbox",
                    valuebinding: "boolean"
                }]
            };
            var node = $(".basic-input-1");
            fluid.selfRender(node, tree, {
                model: model,
                autoBind: true
            });
            
            var text = $(".text", node);
            fluid.testUtils.assertNode("Rendered field", {
                nodeName: "input",
                type: "text",
                value: "value"
            }, text);
            text.val("New value");
            text.change();
            jqUnit.assertEquals("Model updated", "New value", model.string);
            
            var checkbox = $(".checkbox");
            fluid.testUtils.assertNode("Rendered field", {
                nodeName: "input",
                type: "checkbox",
                value: "true",
                checked: undefined
            }, checkbox);
            fluid.value(checkbox, true); // irregularity in jQuery.val() would force us to use jQuery.checked otherwise 
            checkbox.change();
            jqUnit.assertEquals("Model updated", true, model["boolean"]);
            
            fluid.value(checkbox, false);
            checkbox.change();
            jqUnit.assertEquals("Model updated", false, model["boolean"]);
        });
        
        renderTests.test("ul with payload-component (IE innerHTML bug)", function () {
            var node = $(".FLUID-2046-test");
            var renderOptions = {
                cutpoints: [{
                    id: "page-link:",
                    selector: ".flc-pager-pageLink"
                }, {
                    id: "payload-component",
                    selector: "a"
                }]
            };
            
            function pageToComponent(page) {
                return {
                    ID: "page-link:",
                    value: page + 1
                };
            }
            
            var three = fluid.iota(3);
            var tree = fluid.transform(three, pageToComponent);
            
            fluid.selfRender(node, tree, renderOptions);
            fluid.testUtils.assertNode("Rendered nodes", [{
                nodeName: "li",
                "class": "flc-pager-pageLink"
            }, {
                nodeName: "li",
                "class": "flc-pager-pageLink"
            }, {
                nodeName: "li",
                "class": "flc-pager-pageLink"
            }], $("li", node));
            
        });
        
        renderTests.test("Single properly closed li bug (FLUID-2178)", function () {
            var node = $(".FLUID-2178-test");
            var tree = {
                "toc-list:": [{
                    "toc_item:": ["foofer", "barbar"]
                }]
            };
            fluid.selfRender(node, tree);
        });
        
        renderTests.test("Tag elision for branches (FLUID-2596)", function () {
            var nodeSel = ".FLUID-2596-test";
            var tree = {
                children: [{
                    ID: "row:",
                    children: {
                        cell1: "Thing1",
                        cell2: "Thing2",
                        cell3: "Thing3",
                        cell4: "Thing4"
                    }
                }, {
                    ID: "row:",
                    children: {
                        cell1: "Thing5",
                        cell2: "Thing6",
                        cell3: "Thing7",
                        cell4: "Thing8"
                    }
                }]
            };
            fluid.selfRender($(nodeSel), tree, {
                armouring: "cdata"
            });
            jqUnit.assertTrue("Rendering passed", true);
            fluid.testUtils.assertNode("Rendered nodes", {
                nodeName: "div",
                children: [{
                    nodeName: "table",
                    children: [{
                        nodeName: "tbody",
                        children: [{
                            nodeName: "tr"
                        }, {
                            nodeName: "tr"
                        }, {
                            nodeName: "tr"
                        }, {
                            nodeName: "tr"
                        }]
                    }]
                }]
            }, $(nodeSel));
        });
        
        renderTests.test("Attribute removal test (FLUID-2598)", function () {
            function makeCheck(ID, disabled) {
                return {
                    ID: ID,
                    decorators: {
                        attrs: {
                            disabled: disabled ? "disabled" : null
                        }
                    }
                };
            }
            var node = $(".FLUID-2598-test");
            var tree = {
                children: [{
                    ID: "data-row:",
                    children: [makeCheck("checkbox-1", true), makeCheck("checkbox-2", false)]
                }, {
                    ID: "data-row:",
                    children: [makeCheck("checkbox-1", false), makeCheck("checkbox-2", true)]
                }]
            };
            
            fluid.selfRender(node, tree);
            var inputs = $("input", node);
            fluid.testUtils.assertNode("Checkbox state", [{
                disabled: "disabled"
            }, {
                disabled: undefined
            }, {
                disabled: undefined
            }, {
                disabled: "disabled"
            }], inputs);
        });
        
        fluid.tests.decoratorRegistrar = function (container, registrar) {
            registrar[registrar.length] = container;
            var node = $(".FLUID-2980-test2");
            fluid.selfRender(node, {});
        };
        
        renderTests.test("Multiple decorator test (FLUID-2980)", function () {
            var node = $(".FLUID-2980-test");
            var registrar = [];
            var tree = {
                children: [{
                    ID: "item:",
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.decoratorRegistrar",
                        options: registrar
                    }
                }, {
                    ID: "item:",
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.decoratorRegistrar",
                        options: registrar
                    }
                }]
            };
            fluid.selfRender(node, tree);
            jqUnit.assertEquals("2 invocations of decorator expected", 2, registrar.length);
        });
        
        renderTests.test("UISelect decorator fail (FLUID-3357)", function () {
            var node = $(".FLUID-3357-test");
            var registrar = [];
            var tree = {
                children: [{
                    ID: "select",
                    selection: "Choice1",
                    optionlist: ["Choice1", "Choice2"],
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.decoratorRegistrar",
                        options: registrar
                    }
                }]
            };
            fluid.selfRender(node, tree, {
                cutpoints: [{
                    selector: ".select-3357",
                    id: "select"
                }]
            });
            jqUnit.assertEquals("2 invocations of decorator expected", 2, registrar.length);
            // This tests FLUID-4193
            jqUnit.assertNotEquals("Different nodes decorated", registrar[0][0], registrar[1][0]);
        });
        
        renderTests.test("Attribute character support (FLUID-3364)", function () {
            var node = $(".FLUID-3364-test");
            var tree = {};
            fluid.selfRender(node, tree);
            var input = $("input", node);
            fluid.testUtils.assertNode("Rendered messages", {
                "aria-readonly": "true",
                "aria-disabled": "true"
            }, input);
        });
        
        fluid.tests.multiIdentity = function () {
            // since arguments is not a true array, need to convert into one to avoid confusing new QUnit.deepEquiv
            return fluid.makeArray(arguments);
        };
        
        renderTests.test("InitBlock rendering (FLUID-3482)", function () {
            var node = $(".FLUID-3482-test");
            var args = [true, 3, "string", {
                key1: 3,
                "key2": "thing"
            }];
            var tree = {
                ID: "initBlock",
                functionname: "fluid.tests.multiIdentity",
                "arguments": args
            };
            fluid.selfRender(node, tree);
            var block = $("div", node);
            var result = eval(block.html());
            jqUnit.assertDeepEq("Idempotent transit", args, result);
        });
        
        renderTests.test("Removal of rsf:id attributes (FLUID-3498)", function () {
            var node = $(".FLUID-3498-test");
            fluid.selfRender(node, {});
            var markup = node.html();
            jqUnit.assertEquals("ids removed", -1, markup.indexOf("rsf:id"));
        });
        
        function renderManually(node, tree, options) {
            options = options || {};
            var resourceSpec = {
                base: {
                    resourceText: fluid.extractTemplate(node[0], options.armouring),
                    href: ".",
                    resourceKey: "."
                }
            };
            var templates = fluid.parseTemplates(resourceSpec, ["base"]);
            var renderer = fluid.renderer(templates, tree, options);
            var rendered = renderer.renderTemplates();
            return rendered;
        }
        
        renderTests.test("Empty tag corruption test (FLUID-3493)", function () {
            var node = $(".FLUID-3493-test");
            var tree = {
                children: [{
                    ID: "cell:",
                    children: [{
                        ID: "payload-1",
                        value: "Thing 1"
                    }, {
                        ID: "payload-2",
                        value: "Thing 2"
                    }]
                }, {
                    ID: "cell:",
                    children: [{
                        ID: "payload-1",
                        value: "Thing 2"
                    }, {
                        ID: "payload-2",
                        value: "Thing 3"
                    }]
                }]
            };
            fluid.selfRender(node, tree);
            function assertCount(sel, count) {
                var rows = $(sel, node);
                jqUnit.assertEquals("Render count " + count + " for " + sel, count, rows.length);
            }
            
            //            var rendered = renderManually(node, tree, {});
            assertCount("div.cell", 2);
            assertCount("div.preamble", 2);
            assertCount("br.middle", 2);
            assertCount("div.end", 2);
        });
        
        renderTests.test("Blank switching and blind textarea support (FLUID-3224)", function () {
            var node = $(".FLUID-3224-test");
            var model = {};
            var tree = {
                children: [{
                    ID: "input",
                    valuebinding: "nonexistent.empty"
                }, {
                    ID: "switch"
                }]
            };
            var rendered = renderManually(node, tree, {
                model: model
            });
            // These lines commented out since the test for an unclosed textarea is not completely safe
            // due to possible corruption or "correction" through passage through the DOM
            //     fluid.selfRender(node, tree, {model: model, autoBind: true});
            //     var rendered = node[0].innerHTML;
            jqUnit.assertTrue("Closed textarea is expected", rendered.indexOf("</textarea>") >= 0);
        });
        
        renderTests.test("Self-closed tags for HTML support (FLUID-3524)", function () {
            var node = $(".FLUID-3524-test");
            var rendered = renderManually(node, {}, {
                armouring: "comment"
            });
            jqUnit.assertTrue("No empty tags are present", rendered.indexOf("</") === -1);
            jqUnit.assertTrue("meta rendered", rendered.indexOf("meta") !== -1);
            jqUnit.assertTrue("link rendered", rendered.indexOf("link") !== -1);
        });
        
        renderTests.test("Id uniquification and autobind test (FLUID-3656)", function () {
            var node = $(".FLUID-3656-test");
            var model1 = {
                value1: "Cat",
                value2: "Dog"
            };
            var model2 = {
                value1: "Chat",
                value2: "Chien"
            };
            var tree = {
                children: [{
                    ID: "input-1",
                    valuebinding: "value1"
                }, {
                    ID: "input-2",
                    valuebinding: "value2"
                }]
            };
            var cutpoints = [{
                id: "input-1",
                selector: ".my-input-1"
            }, {
                id: "input-2",
                selector: ".my-input-2"
            }];
            var applier1 = fluid.makeChangeApplier(model1);
            var applier2 = fluid.makeChangeApplier(model2);
            fluid.selfRender($(".first-block", node), fluid.copy(tree), {
                autoBind: true,
                model: model1,
                applier: applier1,
                cutpoints: cutpoints
            });
            fluid.selfRender($(".second-block", node), fluid.copy(tree), {
                autoBind: true,
                model: model2,
                applier: applier2,
                cutpoints: cutpoints
            });
            var orig1 = fluid.copy(model1);
            var CATT2 = $(".my-input-1", $(".second-block", node));
            CATT2.val("CHATT");
            CATT2.change();
            jqUnit.assertDeepEq("Unchanged model 1", model1, orig1);
            jqUnit.assertDeepEq("Changed model 2", model2, {
                value1: "CHATT",
                value2: "Chien"
            });
        });
        
        renderTests.test("Id uniquification and autobind test II (fossils for multipass rendering) (FLUID-3755)", function () {
            var model = {
                value1: "value1",
                value2: "value2"
            };
            var applier = fluid.makeChangeApplier(model);
            var fossils = {};
            var renderOptions = {
                autoBind: true,
                model: model,
                applier: applier,
                fossils: fossils
            };
            function makeTree(binding) {
                return {
                    children: [{
                        ID: "input",
                        valuebinding: binding
                    }]
                };
            }
            var node = $(".FLUID-3755-test");
            var templates = fluid.render({
                node: $(".template", node)
            }, $(".target1", node), makeTree("value1"), renderOptions);
            fluid.reRender(templates, $(".target2", node), makeTree("value2"), renderOptions);
            var fossilArray = [];
            fluid.each(fossils, function (fossil) {
                fossilArray.push(fossil);
            });
            jqUnit.assertEquals("Two fossils", 2, fossilArray.length);
        });
        
        renderTests.test("Self-closed tags for HTML support (FLUID-3524-b)", function () {
            var node = $(".FLUID-3524-b-test");
            var rendered = renderManually(node, {}, {
                armouring: "comment"
            });
            jqUnit.assertTrue("script open rendered", rendered.indexOf("<script") !== -1);
            jqUnit.assertTrue("script close rendered", rendered.indexOf("</script>") !== -1);
        });
        
        renderTests.test("Properties unescaping", function () {
        
            jqUnit.assertEquals("Simple unescaping", "This is a thing", fluid.unescapeProperties("This\\ is\\ a\\ thing")[0]);
            jqUnit.assertEquals("Unicode unescaping", "\u30b5\u30a4\u30c8\u304b\u3089\u3053\u306e\u30da\u30fc\u30b8\u3092\u524a\u9664", fluid.unescapeProperties("\\u30b5\\u30a4\\u30c8\\u304b\\u3089\\u3053\\u306e\\u30da\\u30fc\\u30b8\\u3092\\u524a\\u9664")[0]);
            // 10 slashes ACTUALLY means 5 REAL \ characters 
            jqUnit.assertDeepEq("Random junk", ["\\\\\\\\\\ \t\nThing\x53\u0000", true], fluid.unescapeProperties("\\\\\\\\\\\\\\\\\\\\\ \\t\\nThing\\x53\\u0000\\"));
        });
        
        renderTests.test("Nested data binding", function () {
            var selectionModel = {
                values: ["v1", "v2"],
                names: ["value one", "value two"],
                selection: ["v2"]
            };
            
            var selectorMap = [{
                selector: ".nestLevelOne",
                id: "levelOne:"
            }, {
                selector: ".nestLevelTwo",
                id: "levelTwo:"
            }, {
                selector: ".nestLevelThree",
                id: "levelThree:"
            }, {
                selector: "#nestedDataBindingInput",
                id: "input"
            }, {
                selector: ".nestedDataBindingLabel",
                id: "label"
            }];
            
            var generateNestedTree = function () {
                var tree = {
                    children: []
                };
                
                tree.children[0] = {
                    ID: "selections",
                    optionlist: {
                        valuebinding: "values"
                    },
                    optionnames: {
                        valuebinding: "names"
                    },
                    selection: {
                        valuebinding: "selection"
                    }
                };
                
                tree.children[1] = {
                    ID: "levelOne:",
                    children: [{
                        ID: "levelTwo:",
                        children: []
                    }]
                };
                
                for (var i = 0; i < selectionModel.values.length; i++) {
                    var item = tree.children[1].children[0].children;
                    
                    item[item.length] = {
                        ID: "levelThree:",
                        children: [{
                            ID: "input",
                            choiceindex: i,
                            parentRelativeID: "..::..::..::selections"
                        }, {
                            ID: "label",
                            choiceindex: i,
                            parentRelativeID: "..::..::..::selections"
                        }]
                    };
                }
                
                return tree;
            };
            
            fluid.selfRender($(".nestedDataBinding"), generateNestedTree(), {
                cutpoints: selectorMap,
                model: selectionModel
            });
            
            jqUnit.assertEquals("Number of Inputs", selectionModel.values.length, $("input", ".nestedDataBinding").length);
            jqUnit.assertEquals("Number of Labels", selectionModel.values.length, $("label", ".nestedDataBinding").length);
            jqUnit.assertEquals("Selected Value", selectionModel.selection, $("input:checked", ".nestedDataBinding").attr("value"));
        });
        
        
        var resourceSpec = {
            properties: {
                href: "../data/testProperties.properties"
            },
            json: {
                href: "../data/testProperties.json"
            }
        };
        var calls = 0;
        
        fluid.fetchResources(resourceSpec, function () {
            renderTests.test("Properties file parsing", function () {
                ++calls; // Test FLUID-3361
                jqUnit.assertEquals("Just one call to fetchResources callback", 1, calls);
                jqUnit.assertValue("Fetched properties file", resourceSpec.properties.resourceText);
                jqUnit.assertValue("Fetched JSON file", resourceSpec.json.resourceText);
                var json = JSON.parse(resourceSpec.json.resourceText);
                var properties = fluid.parseJavaProperties(resourceSpec.properties.resourceText);
                jqUnit.assertDeepEq("Parsed properties equivalent", json, properties);
                jqUnit.assertTrue("Nonpollution by callbackCalled (FLUID-3486)", resourceSpec.callbackCalled === undefined);
            });
            
        });
        
        var destructiveCalls = 0;
        
        var destructiveCountingFunction = function (response) {
            ++destructiveCalls;
            fluid.fail("A terrible callback which tries to destroy the world");
        };
        
        var resourceSpec2 = {
            properties: {
                href: "../data/testProperties.properties",
                options: {
                    success: destructiveCountingFunction,
                    async: false
                }
            },
            json: {
                href: "../data/testProperties.json",
                options: {
                    success: destructiveCountingFunction,
                    async: false
                }
            }
        };
        
        renderTests.test("fetchResources callback tests", function () {
            var callbackCalled = 0;
            function callback() {
                ++callbackCalled;
            }
            try {
                fluid.pushSoftFailure(true);
                fluid.fetchResources(resourceSpec2, callback);
            } finally {
                fluid.pushSoftFailure(-1);
            }
            jqUnit.assertEquals("Two calls to destructive callback", 2, destructiveCalls);
            jqUnit.assertEquals("Call to overall callback", 1, callbackCalled);
        });
        
        var resourceSpec3 = {
            data: {
                href: "../data/testPerformance.json"
            },
            html: {
                href: "../data/testPerformance.html"
            }
        };
        
        renderTests.test("Renderer performance test - FLUID-3684", function () {
            fluid.setLogging(true);
            var renderit = function (specs) {
                var data = JSON.parse(specs.data.resourceText);
                fluid.log("Resources fetched - begin parse");
                specs.html.cutpoints = data.renderOpts.cutpoints;
                var templates = fluid.parseTemplates(specs, ["html"]);
                fluid.log("Templates parsed - begin render");
                var rendered = fluid.renderer(templates, data.tree, data.renderOpts).renderTemplates();
                fluid.log("Render complete");
            };
            fluid.fetchResources(resourceSpec3, renderit);
        });
        
        renderTests.test("FLUID-3819 test: messagekey with no value no expand", function () {
            var node = $(".FLUID-3819-test");
            var selector = ".flc-noMessagekey";
            var tree = {
                ID: "noMessage",
                messagekey: {
                    valuebinding: "nomessage"
                }
            };
            fluid.selfRender(node, tree, {
                cutpoints: [{
                    id: "noMessage",
                    selector: selector
                }],
                model: {},
                messageLocator: fluid.messageLocator({}, fluid.stringTemplate)
            });
            jqUnit.assertEquals("Messagekey resolves to undefined", "[No messagecodes provided]", $(selector).text());
        });
        
        
        renderTests.test("FLUID-4050 test: XML encoding corruption", function () {
            var node = $(".FLUID-4050-test");
            var value = "Value containing \"Several < undesirable > XML characters &c\"";
            var url = "http://www.google.com/search?rls=ig&hl=en&source=hp&q=thing&aq=f&aqi=g10&aql=&oq=";
            var tree = {
                children: [{
                    ID: "input",
                    value: value
                }, {
                    ID: "select",
                    selection: value,
                    optionlist: [value],
                    optionnames: ["Value"]
                }, {
                    ID: "radio",
                    parentRelativeID: "select",
                    choiceindex: 0
                }, {
                    ID: "span",
                    decorators: {
                        attrs: {
                            attrkey: value
                        }
                    }
                },  {
                    ID: "link",
                    target: url
                }]
            };
            fluid.selfRender(node, tree);
            var recovered1 = $(":text", node).val();
            jqUnit.assertEquals("Recovered value from attribute", value, recovered1);
            var recovered2 = $(":radio", node).val();
            jqUnit.assertEquals("Recovered value from radio button", value, recovered2);
            var recovered3 = $("span", node).attr("attrkey");
            jqUnit.assertEquals("Recovered value from attribute decorator", value, recovered3);
            var recovered4 = $("a", node).attr("href");
            jqUnit.assertEquals("Recovered encoded URL", url, recovered4);
        });
    };
})(jQuery);
