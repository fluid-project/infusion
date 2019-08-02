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

    fluid.defaults("fluid.tests.tableOfContents.templateDistributor", {
        distributeOptions: {
            target: "{/ fluid.tableOfContents.levels}.options.resources.template",
            record: {
                url: "../../../../src/components/tableOfContents/html/TableOfContents.html"
            }
        }
    });

    fluid.constructSingle([], "fluid.tests.tableOfContents.templateDistributor");

    /* For testing a page with no headings */
    var emptyHeadings = {
        headingTags: [],
        anchorInfo: [],
        headingInfo: [],
        model: []
    };

    /* TODO: Might want to rename this and "skippedHeadingsForGradualIndentationModel" */
    var skippedHeadingsForSkippedIndentationModel = {
        headingTags: ["h1", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: [{
            level: 1,
            text: "h1",
            url: "#h1",
            headings: [{
                headings: [{
                    headings: [{
                        headings: [{
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

    /* TODO: Might want to rename this and "skippedHeadingsForSkippedIndentationModel" */
    var skippedHeadingsForGradualIndentationModel = {
        headingTags: ["h1", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: [{
            level: 1,
            text: "h1",
            url: "#h1",
            headings: [{
                level: 2,
                text: "h6",
                url: "#h6"
            }]
        }]
    };

    var linearHeadings = {
        headingTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h2"}, {url: "#h3"}, {url: "#h4"}, {url: "#h5"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 2, text: "h2", url: "#h2"},
            {level: 3, text: "h3", url: "#h3"},
            {level: 4, text: "h4", url: "#h4"},
            {level: 5, text: "h5", url: "#h5"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: [{
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

    var skippedHeadingsForSkippedIndentationTree = {
        children: [{
            ID: "level1:",
            children: [{
                ID: "items1:",
                children: [{
                    ID: "link1",
                    target: "#h1",
                    linktext: "h1"
                }, {
                    ID: "level2:",
                    children: [{
                        ID: "items2:",
                        decorators: [{
                            type: "addClass",
                            classes: "fl-tableOfContents-hide-bullet"
                        }],
                        children: [{
                            ID: "level3:",
                            children: [{
                                ID: "items3:",
                                decorators: [{
                                    type: "addClass",
                                    classes: "fl-tableOfContents-hide-bullet"
                                }],
                                children: [{
                                    ID: "level4:",
                                    children: [{
                                        ID: "items4:",
                                        decorators: [{
                                            type: "addClass",
                                            classes: "fl-tableOfContents-hide-bullet"
                                        }],
                                        children: [{
                                            ID: "level5:",
                                            children: [{
                                                ID: "items5:",
                                                decorators: [{
                                                    type: "addClass",
                                                    classes: "fl-tableOfContents-hide-bullet"
                                                }],
                                                children: [{
                                                    ID: "level6:",
                                                    children: [{
                                                        ID: "items6:",
                                                        children: [{
                                                            ID: "link6",
                                                            target: "#h6",
                                                            linktext: "h6"
                                                        }]
                                                    }]
                                                }]
                                            }]
                                        }]
                                    }]
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };

    var skippedHeadingsForGradualIndentationTree = {
        children: [{
            ID: "level1:",
            children: [{
                ID: "items1:",
                children: [{
                    ID: "link1",
                    target: "#h1",
                    linktext: "h1"
                }, {
                    ID: "level2:",
                    children: [{
                        ID: "items2:",
                        children: [{
                            ID: "link2",
                            target: "#h6",
                            linktext: "h6"
                        }]
                    }]
                }]
            }]
        }]
    };

    var emptyTree = {
        children: []
    };

    var createElm = function (tagName) {
        return fluid.unwrap($("<" + tagName + "/>", {text: tagName}));
    };

    var createElms = function (tagArray) {
        return fluid.transform(tagArray, createElm);
    };

    var toModelTests = function (headingInfo, expectedModel, modelLevelFn) {
        var model = fluid.tableOfContents.modelBuilder.toModel(headingInfo, modelLevelFn);
        jqUnit.assertDeepEq("headingInfo converted to toModel correctly", model, expectedModel);
    };

    var convertToHeadingObjectsTests = function (headings, anchorInfo, expectedHeadingInfo) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var headingInfo = modelBuilder.convertToHeadingObjects(headings, anchorInfo);
        jqUnit.assertDeepEq("Heading objects created correctly", headingInfo, expectedHeadingInfo);
    };

    var assembleModelTests = function (headings, anchorInfo, expectedModel) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var model = modelBuilder.assembleModel(headings, anchorInfo);
        jqUnit.assertDeepEq("Model assembled correctly", model, expectedModel);
    };

    var generateTreeTests = function (model, expectedTree) {
        model = {headings: model};
        var tree = fluid.tableOfContents.levels.generateTree(model);
        jqUnit.assertDeepEq("tree generated correctly", tree, expectedTree);
    };

    /**
     * Retrieve a jquery that's associated with all the selectorNames
     * @param {Object} that - The component itself.
     * @param  {Array} selectorNames - Array of selector names.
     * @return {Object} - A jQuery object containing objects matching selectorNames.
     */
    var locateSet = function (that, selectorNames) {
        var set = $();  // Creates an empty jQuery object.
        fluid.each(selectorNames, function (selectorName) {
            set = set.add(that.locate(selectorName));
        });
        return set;
    };

    /**
     * @param {fluid.tableOfContents.levels} levels - An instance of fluid.tableOfContents.levels component
     * @param {Object} testHeadings - expected heading info data
     * @param {Object} anchorInfo - optional. An array of anchor info objects
     *                              these should include at least the url like {url: "#url"}.
     *                              Typically this will come from the "anchorInfo" member of a
     *                              fluid.tableOfContents component.
     *
     */
    var renderTOCTest = function (levels, testHeadings, anchorInfo) {
        var tocLinks = locateSet(levels, ["link1", "link2", "link3", "link4", "link5", "link6"]);
        jqUnit.assertEquals("The toc header is rendered correctly", levels.options.strings.tocHeader, levels.locate("tocHeader").text());
        jqUnit.assertEquals("The correct number of links are rendered", testHeadings.headingInfo.length, tocLinks.length);
        // #FLUID-4352: check if <ul> exists when there is no tocLinks
        if (tocLinks.length === 0) {
            jqUnit.assertEquals("<ul> should not be defined when no headers are found", 0, $("ul", levels.locate("flc-toc-tocContainer")).length);
        }
        fluid.each(tocLinks, function (elm, idx) {
            var hInfo = testHeadings.headingInfo[idx];
            var headingURL = fluid.get(anchorInfo, [idx, "url"]) || hInfo.url;
            elm = $(elm);

            jqUnit.assertEquals("ToC text set correctly", fluid.get(hInfo, "text"), elm.text());
            // To address IE7 problem, http://bugs.jquery.com/ticket/7117
            // To fix, strip it URI if the windows.location is in href. Otherwise, do nothing.
            var eleHref = elm.attr("href").replace($(location).attr("href"), "");
            jqUnit.assertEquals("ToC anchor set correctly", headingURL, eleHref);
        });
    };

    var renderTOCTests = function (testHeadings) {
        var container = $(".flc-toc-tocContainer", "#flc-toc");
        fluid.tableOfContents.levels(container, {
            model: {
                headings: testHeadings.model
            },
            listeners: {
                afterRender: function (that) {
                    renderTOCTest(that, testHeadings);
                    jqUnit.start();
                }
            },
            resources: {
                template: {
                    url: "../../../../src/components/tableOfContents/html/TableOfContents.html"
                }
            }
        });
    };

    $(document).ready(function () {

        jqUnit.module("Table of Contents: Heading Calculator Tests");

        jqUnit.test("getHeadingLevel", function () {
            var headingCalc = fluid.tableOfContents.modelBuilder.headingCalculator();

            for (var i = 1; i <= 6; i++) {
                var tagName = "h" + i;
                var heading = createElm(tagName);
                jqUnit.assertEquals(tagName + " level", i, headingCalc.getHeadingLevel(heading));
            }
        });


        jqUnit.module("Table of Contents: Model Builder Tests");

        jqUnit.test("toModel: linear headings with gradual indentation models", function () {
            toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
        });
        jqUnit.test("toModel: linear headings with skipped indentation models", function () {
            toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
        });
        jqUnit.test("toModel: skipped headings with gradual indentation models", function () {
            toModelTests(skippedHeadingsForGradualIndentationModel.headingInfo, skippedHeadingsForGradualIndentationModel.model,
                fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
        });
        jqUnit.test("toModel: skipped headings with skipped indentation models", function () {
            toModelTests(skippedHeadingsForSkippedIndentationModel.headingInfo, skippedHeadingsForSkippedIndentationModel.model,
                fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
        });

        jqUnit.test("convertToHeadingObjects: linear headings", function () {
            convertToHeadingObjectsTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.headingInfo);
        });
        jqUnit.test("convertToHeadingObjects: skipped headings", function () {
            convertToHeadingObjectsTests(createElms(skippedHeadingsForSkippedIndentationModel.headingTags),
                skippedHeadingsForSkippedIndentationModel.anchorInfo, skippedHeadingsForSkippedIndentationModel.headingInfo);
            convertToHeadingObjectsTests(createElms(skippedHeadingsForGradualIndentationModel.headingTags),
                skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.headingInfo);
        });

        jqUnit.test("assembleModel: linear headings", function () {
            assembleModelTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.model);
        });
        jqUnit.test("assembleModel: skipped headings", function () {
            // test assembleModel with default toModel invoker - skippedHeadingsForGradualIndentationModel
            assembleModelTests(createElms(skippedHeadingsForGradualIndentationModel.headingTags),
                skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.model);
        });

        jqUnit.test("Test gradualModelLevelFn", function () {
            var modelLevel = ["level1", "level2"];
            var subHeadings = [{level: 6, text: "h6", url: "#h6"}];
            var expectedModelLevel = [{level: 5, text: "h6", url: "#h6"}];

            var gradualIndentationModel = fluid.tableOfContents.modelBuilder.gradualModelLevelFn(modelLevel, subHeadings);
            jqUnit.assertDeepEq("gradual indentation model returns the subHeadings with level decremented by exactly 1.", gradualIndentationModel, expectedModelLevel);

            //reference check. The function should not modify the object with the same reference.
            jqUnit.assertFalse("This function should not modify the level value directly on the object. Returned value should not have the same reference as parameter.", subHeadings === gradualIndentationModel);
        });

        jqUnit.test("Test skippedModelLevelFn", function () {
            var modelLevel = ["level1", "level2", {headings: ["subHeading1", "subHeading2"]}];
            var modelLevelClone = fluid.copy(modelLevel);
            var subHeadings = modelLevelClone.pop();
            var skippedIndentationModel = fluid.tableOfContents.modelBuilder.skippedModelLevelFn(modelLevelClone, subHeadings.headings);
            jqUnit.assertDeepEq("skipped indentation model should always return the modelLevel with subHeadings as a child.", modelLevel, skippedIndentationModel);
        });


        jqUnit.module("Table of Contents: Levels Tests");

        jqUnit.test("generateTree: skipped indentation tree, [h1, '', '', '', '', h6]", function () {
            generateTreeTests(skippedHeadingsForSkippedIndentationModel.model, skippedHeadingsForSkippedIndentationTree);
        });
        jqUnit.test("generateTree: gradual indentation tree, [h1, h6]", function () {
            generateTreeTests(skippedHeadingsForGradualIndentationModel.model, skippedHeadingsForGradualIndentationTree);
        });
        jqUnit.test("generateTree: empty tree, []", function () {
            generateTreeTests([], emptyTree);
        });


        jqUnit.test("objModel: test construction of the levels, items object used by generateTree", function () {
            var levelObj = fluid.tableOfContents.levels.objModel("level", 1);
            jqUnit.assertEquals("The last character of the ID should be a ':'", ":", levelObj.ID.substr(levelObj.ID.length - 1));
            jqUnit.assertEquals("Should create an empty children array", 0, levelObj.children.length);
        });

        jqUnit.test("handleEmptyItemObj: Add decorator to item object", function () {
            var itemObj = {};
            fluid.tableOfContents.levels.handleEmptyItemObj(itemObj);
            var decorator = itemObj.decorators[0];
            jqUnit.assertEquals("Decorator.type is 'addClass'", "addClass", decorator.type);
            jqUnit.assertEquals("Decorator.classes is 'fl-tableOfContents-hide-bullet'", "fl-tableOfContents-hide-bullet", decorator.classes);

        });

        jqUnit.asyncTest("Render toc: empty headings", function () {
            //FLUID-4352
            renderTOCTests(emptyHeadings);
        });
        jqUnit.asyncTest("Render toc: linear headings", function () {
            renderTOCTests(linearHeadings);
        });
        jqUnit.asyncTest("Render toc: skipped headings for skipped indentation model", function () {
            renderTOCTests(skippedHeadingsForSkippedIndentationModel);
        });
        jqUnit.asyncTest("Render toc: skipped headings for gradual indentation model", function () {
            renderTOCTests(skippedHeadingsForGradualIndentationModel);
        });


        jqUnit.module("Table of Contents Tests");
        // fluid tableOfContents" tests

        jqUnit.test("public function: headingTextToAnchorInfo", function () {
            // set up and init the ToC component
            var toc = fluid.tableOfContents("#flc-toc");
            var tocBodyHeading = $("#amphibians");
            var anchorInfo = toc.headingTextToAnchorInfo(tocBodyHeading);

            // test goes here
            jqUnit.assertEquals("anchor url is the same as id except url has a '#' in front", anchorInfo.url.substr(1), anchorInfo.id);
        });

        jqUnit.test("public function: show/hide component", function () {
            // set up and init the ToC component
            var tocContainer = fluid.tableOfContents("#flc-toc").locate("tocContainer");
            jqUnit.isVisible("Initially the component is visible.", tocContainer);
            tocContainer.hide();
            // verify toc is hidden.
            jqUnit.notVisible("After calling hide, the component is invisible.", tocContainer);
            tocContainer.show();
            // verify toc is visible again
            jqUnit.isVisible("After calling show, the component is visible.", tocContainer);
        });

        /**
          * Test anchor links created by TOC.  Check if the heading table a href link maps to the correct header
          * @precondition   Must be rendered
          */
        var renderTOCAnchorTest = function () {
            var anchorLinks = $(".flc-toc-levels-link");
            anchorLinks.each(function (anchorIndex) {
                var anchorHref = anchorLinks.eq(anchorIndex).attr("href");
                jqUnit.assertTrue("Component test headings: TOC anchors should map to the headers correctly - " + anchorHref, $(anchorHref)[0]);
            });
        };

        /**
         * Test component and make sure the number of links, text and anchors are set correctly.
         */
        jqUnit.asyncTest("Component test headings", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadings = {
                headingInfo : []
            };
            var headings = $("#flc-toc").children(":header");

            fluid.each(headings, function (heading) {
                heading = $(heading);
                var headingID = heading.attr("id");
                testHeadings.headingInfo.push({
                    level: heading.prop("tagName").substr(heading.prop("tagName").length - 1),
                    text: heading.text(),
                    url: headingID ? "#" + headingID : undefined
                });
            });
            fluid.tableOfContents("#flc-toc", {
                listeners: {
                    onReady: {
                        func: function (that) {
                            renderTOCTest(that.levels, testHeadings, that.anchorInfo);
                            renderTOCAnchorTest();
                            jqUnit.start();
                        },
                        args: ["{that}"]
                    }
                }
            });
        });

        /**
         * #FLUID-4352: Test component with no headings. Make sure no <ul> is set
         */
        jqUnit.asyncTest("Component test empty headings", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadings = {
                headingInfo : []
            };
            fluid.tableOfContents("#flc-toc-noHeaders", {
                listeners: {
                    onReady: {
                        func: function (that) {
                            renderTOCTest(that.levels, testHeadings, that.anchorInfo);
                            renderTOCAnchorTest();
                            jqUnit.start();
                        },
                        args: ["{that}"]
                    }
                }
            });
        });


        /**
         * #FLUID-4723: Test that the output includes an actual header
         */
        jqUnit.asyncTest("Output includes a heading", function () {
            fluid.tableOfContents("#flc-toc", {
                listeners: {
                    onReady: {
                        func: function (that) {
                            var header = $("h2", that.container);
                            jqUnit.assertEquals("The output should contain exactly one H2", 1, header.length);
                            jqUnit.assertEquals("The H2 should contain the expected text", "Table of Contents", header.text());
                            jqUnit.start();
                        },
                        args: ["{that}.levels"]
                    }
                }
            });
        });

        /**
         * #FLUID-5110: refreshView updates headings
         */
        jqUnit.asyncTest("Component test refreshView", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadingRefreshed = {
                headingInfo: [{
                    level: "2",
                    text: "H2"
                }, {
                    level: "2",
                    text: "test"
                }]
            };
            fluid.tableOfContents("#flc-toc-refreshHeadings", {
                listeners: {
                    "onReady.initialState": {
                        listener: function (levels, that) {
                            that.events.onRefresh.addListener(function () {
                                jqUnit.assert("The onRefresh event should have fired");
                                renderTOCTest(levels, testHeadingRefreshed, that.anchorInfo);
                                renderTOCAnchorTest();
                                jqUnit.start();
                            }, "inTestCase", "last");

                            that.container.append("<h2>test</h2>");
                            that.refreshView();
                        },
                        args: ["{that}.levels", "{that}"]
                    }
                }
            });
        });

       /**
        * #FLUID-5567: Test that table of contents header is localizable
        */
        jqUnit.asyncTest("FLUID-5567: Table of Contents header localization", function () {
            fluid.tableOfContents("#flc-toc-l10n", {
                strings: {
                    tocHeader: "Localized ToC Header"
                },
                listeners: {
                    onReady: {
                        listener: function (that) {
                            jqUnit.assertEquals("The ToC Header should be localized.", that.options.strings.tocHeader, that.locate("tocHeader").text());
                            jqUnit.start();
                        },
                        args: ["{that}.levels"]
                    }
                }
            });
        });

        /**
        * #FLUID-5697: Test the exclusion of headers
        */
        jqUnit.asyncTest("FLUID-5697: Header exclusion", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadings = {
                headingInfo: [{
                    level: "2",
                    text: "Included"
                }]
            };

            fluid.tableOfContents("#fluid-5697", {
                ignoreForToC: {
                    "fluid-5697": ".fluid-5697-exclude"
                },
                listeners: {
                    onReady: {
                        listener: function (that, levels) {
                            renderTOCTest(levels, testHeadings, that.anchorInfo);
                            renderTOCAnchorTest();
                            jqUnit.start();
                        },
                        args: ["{that}", "{that}.levels"]
                    }
                }
            });
        });
    });
})(jQuery);
