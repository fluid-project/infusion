/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, deepEqual, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    fluid.staticEnvironment.demo = fluid.typeTag("fluid.tableOfContentsTest");
    fluid.demands("fluid.tableOfContents.levels", ["fluid.tableOfContents", "fluid.tableOfContentsTest"], {
        options: {
            resources: {
                template: {
                    forceCache: true,
                    url: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            }
        }
    });
    
    fluid.tableOfContents.generateGUIDMock = function () {
        return 'test';
    };
    
    // Use our custom GUID for testing purposes.
    fluid.demands("fluid.tableOfContents.generateGUID", "fluid.tableOfContents", {
        funcName: 'fluid.tableOfContents.generateGUIDMock'
    });
    
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
    
    var createElm = function (tagName) {
        return fluid.unwrap($("<" + tagName + "/>", {text: tagName}));
    };
    
    var createElms = function (tagArray) {
        return fluid.transform(tagArray, createElm);
    };
    
    var toModelTests = function (headingInfo, expectedModel, modelLevelFn) {
        var model = fluid.tableOfContents.modelBuilder.toModel(headingInfo, modelLevelFn);
        deepEqual(model, expectedModel, "headingInfo converted to toModel correctly");
    };
    
    var convertToHeadingObjectsTests = function (headings, anchorInfo, expectedHeadingInfo) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var headingInfo = modelBuilder.convertToHeadingObjects(headings, anchorInfo);
        deepEqual(headingInfo, expectedHeadingInfo, "Heading objects created correctly");
    };
    
    var assembleModelTests = function (headings, anchorInfo, expectedModel) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var model = modelBuilder.assembleModel(headings, anchorInfo);
        deepEqual(model, expectedModel, model);
    };
    
    var generateTreeTests = function (model, expectedTree) {
        model = {headings: model};
        var tree = fluid.tableOfContents.levels.generateTree(model);
        deepEqual(tree, expectedTree, "tree generated correctly");
    };
    
    /**
      * Retrieve a jquery that's associated with all the selectorNames
      * @param  Array   Array of selector names
      */
    var locateSet = function (that, selectorNames) {
        var set = $();  //Creates an empty jQuery object.
        fluid.each(selectorNames, function (selectorName) {
            set = set.add(that.locate(selectorName));
        });
        return set;
    };
    
    var renderTOCTest = function (that, testHeadings) {
        var tocLinks = locateSet(that, ["link1", "link2", "link3", "link4", "link5", "link6"]);
        jqUnit.assertEquals("The correct number of links are rendered", testHeadings.headingInfo.length, tocLinks.length);
        // #FLUID-4352: check if <ul> exists when there is no tocLinks
        if (tocLinks.length === 0) {
            jqUnit.assertEquals("<ul> should not be defined when no headers are found", 0, $('ul', that.locate('flc-toc-tocContainer')).length);
        }
        fluid.each(tocLinks, function (elm, idx) {
            var hInfo = testHeadings.headingInfo[idx];
            elm = $(elm);
            
            jqUnit.assertEquals("ToC text set correctly", fluid.get(hInfo, "text"), elm.text());
            // To address IE7 problem, http://bugs.jquery.com/ticket/7117
            // To fix, strip it URI if the windows.location is in href. Otherwise, do nothing.
            var eleHref = elm.attr("href").replace($(location).attr('href'), '');
            jqUnit.assertEquals("ToC anchor set correctly", fluid.get(hInfo, "url"), eleHref);
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
                    start();
                }
            },
            resources: {
                template: {
                    forceCache: true,
                    url: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            }
        });
    };
    
    /**
     * Returns a ToC Component with the predefined demand block
     * defaults container is #flc-toc
     */
    var renderTOCComponent = function (container, options) {
        container = container || "#flc-toc";
        return fluid.tableOfContents(container, options);
    };

    $(document).ready(function () {

        var tocHeadingCalc = jqUnit.testCase("Table of Contents: Heading Calculator Tests");
        var tocMBTests = jqUnit.testCase("Table of Contents: Model Builder Tests");
        var tocLevelsTests = jqUnit.testCase("Table of Contents: Levels Tests");
        var tocTests = jqUnit.testCase("Table of Contents Tests");
    
        // "fluid.tableOfContents.modelBuilder.headingCalculator" tests
        
        tocHeadingCalc.test("getHeadingLevel", function () {
            var headingCalc = fluid.tableOfContents.modelBuilder.headingCalculator();
            
            for (var i = 1; i <= 6; i++) {
                var tagName = "h" + i;
                var heading = createElm(tagName);
                jqUnit.assertEquals(tagName + " level", i, headingCalc.getHeadingLevel(heading));
            }
        });
        
        // "fluid.tableOfContents.modelBuilder" tests
        
        tocMBTests.test("toModel: linear headings with gradual indentation models", function () {
            toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
        });
        tocMBTests.test("toModel: linear headings with skipped indentation models", function () {
            toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
        });
        tocMBTests.test("toModel: skipped headings with gradual indentation models", function () {
            toModelTests(skippedHeadingsForGradualIndentationModel.headingInfo, skippedHeadingsForGradualIndentationModel.model,
                fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
        });
        tocMBTests.test("toModel: skipped headings with skipped indentation models", function () {
            toModelTests(skippedHeadingsForSkippedIndentationModel.headingInfo, skippedHeadingsForSkippedIndentationModel.model,  
                fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
        });
        
        tocMBTests.test("convertToHeadingObjects: linear headings", function () {
            convertToHeadingObjectsTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.headingInfo);
        });
        tocMBTests.test("convertToHeadingObjects: skipped headings", function () {
            convertToHeadingObjectsTests(createElms(skippedHeadingsForSkippedIndentationModel.headingTags), 
                skippedHeadingsForSkippedIndentationModel.anchorInfo, skippedHeadingsForSkippedIndentationModel.headingInfo);
            convertToHeadingObjectsTests(createElms(skippedHeadingsForGradualIndentationModel.headingTags), 
                skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.headingInfo);
        });
        
        tocMBTests.test("assembleModel: linear headings", function () {
            assembleModelTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.model);
        });
        tocMBTests.test("assembleModel: skipped headings", function () {
            // test assembleModel with default toModel invoker - skippedHeadingsForGradualIndentationModel
            assembleModelTests(createElms(skippedHeadingsForGradualIndentationModel.headingTags), 
                skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.model);
        });
        
        tocMBTests.test("Test gradualModelLevelFn", function () {
            var modelLevel = ['level1', 'level2'];
            var subHeadings = [{level: 6, text: 'h6', url: '#h6'}];
            var expectedModelLevel = [{level: 5, text: 'h6', url: '#h6'}];
            
            var gradualIndentationModel = fluid.tableOfContents.modelBuilder.gradualModelLevelFn(modelLevel, subHeadings);
            deepEqual(gradualIndentationModel, expectedModelLevel, "gradual indentation model returns the subHeadings with level decremented by exactly 1.");
            
            //reference check. The function should not modify the object with the same reference.
            jqUnit.assertFalse("This function should not modify the level value directly on the object. Returned value should not have the same reference as parameter.", subHeadings === gradualIndentationModel);
        }); 
        
        tocMBTests.test("Test skippedModelLevelFn", function () {
            var modelLevel = ['level1', 'level2', {headings: ['subHeading1', 'subHeading2']}];
            var modelLevelClone = fluid.copy(modelLevel);
            var subHeadings = modelLevelClone.pop();
            var skippedIndentationModel = fluid.tableOfContents.modelBuilder.skippedModelLevelFn(modelLevelClone, subHeadings.headings);
            jqUnit.assertDeepEq("skipped indentation model should always return the modelLevel with subHeadings as a child.", modelLevel, skippedIndentationModel);
        }); 
        
        // "fluid.tableOfContents.levels" tests
        
        tocLevelsTests.test("generateTree: skipped indentation tree, [h1, '', '', '', '', h6]", function () {
            generateTreeTests(skippedHeadingsForSkippedIndentationModel.model, skippedHeadingsForSkippedIndentationTree);
        });
        tocLevelsTests.test("generateTree: gradual indentation tree, [h1, h6]", function () {
            generateTreeTests(skippedHeadingsForGradualIndentationModel.model, skippedHeadingsForGradualIndentationTree);
        });
        tocLevelsTests.test("generateTree: empty tree, []", function () {
            generateTreeTests([], []);
        });
        
        
        tocLevelsTests.test("objModel: test construction of the levels, items object used by generateTree", function () {
            var levelObj = fluid.tableOfContents.levels.objModel('level', 1);
            jqUnit.assertEquals("The last character of the ID should be a ':'", ":", levelObj.ID.substr(levelObj.ID.length - 1));
            jqUnit.assertEquals("Should create an empty children array", 0, levelObj.children.length);
        });
        
        tocLevelsTests.test("handleEmptyItemObj: Add decorator to item object", function () {
            var itemObj = {};
            fluid.tableOfContents.levels.handleEmptyItemObj(itemObj);
            var decorator = itemObj.decorators[0];
            jqUnit.assertEquals("Decorator.type is 'addClass'", "addClass", decorator.type);
            jqUnit.assertEquals("Decorator.classes is 'fl-tableOfContents-hide-bullet'", "fl-tableOfContents-hide-bullet", decorator.classes);
            
        });
        
        tocLevelsTests.asyncTest("Render toc: empty headings", function () {
            //FLUID-4352
            renderTOCTests(emptyHeadings);
        });
        tocLevelsTests.asyncTest("Render toc: linear headings", function () {
            renderTOCTests(linearHeadings);
        });
        tocLevelsTests.asyncTest("Render toc: skipped headings for skipped indentation model", function () {
            renderTOCTests(skippedHeadingsForSkippedIndentationModel);
        });
        tocLevelsTests.asyncTest("Render toc: skipped headings for gradual indentation model", function () {
            renderTOCTests(skippedHeadingsForGradualIndentationModel);
        });

        // fluid tableOfContents" tests

        tocTests.test("insertAnchor", function () {
            var tocTestAnchorName = 'tocTestAnchor';
            var tocInsertAnchorElement = $('#tocInsertAnchor');
            fluid.tableOfContents.insertAnchor(tocTestAnchorName, tocInsertAnchorElement);
            // check if the anchor is inserted before the element, in that case, index 0 should be the anchor
            // the first-child test below assumes that there is only 2 element in the wrapper, including the inserted anchor element.
            var tocInsertAnchorWrapperFirstChild = $('#tocInsertAnchorWrapper :first-child');
            jqUnit.assertEquals("ToC insert anchor correctly: id", tocTestAnchorName, tocInsertAnchorWrapperFirstChild.prop('id')); 
            jqUnit.assertEquals("ToC insert anchor correctly: name", tocTestAnchorName, tocInsertAnchorWrapperFirstChild.attr('name'));
        });
        
        tocTests.test("generateGUID", function () {
            var GUID = fluid.tableOfContents.generateGUID();
            var GUID2 = fluid.tableOfContents.generateGUID();
            
            jqUnit.assertNotEquals("GUID should not be the same with the same randomBaseName", GUID, GUID2);
        });
                
        tocTests.test("filterHeadings", function () {
            var allHeadings = $('#tocFilterHeadings :header');
            var expectedHeadings = allHeadings.not(":hidden"); 
            var filteredHeadings = fluid.tableOfContents.filterHeadings(allHeadings);
            jqUnit.assertEquals("The size of headings should be exactly 1 less from the original", allHeadings.size() - 1, filteredHeadings.size());
            jqUnit.assertEquals("The size of headings should be exactly the same as a sliced clone of the original", expectedHeadings.size(), filteredHeadings.size());
            jqUnit.assertDeepEq("The headings object array should be identical between the filtered headings and the sliced clone", 
                expectedHeadings.toArray(), filteredHeadings.toArray());
        });
        
        tocTests.test("finalInit public function: headingTextToAnchor", function () {
            // setup and init the ToC component
            var toc = renderTOCComponent();
            var tocBodyHeading = $('#amphibians');
            var anchorInfo = toc.headingTextToAnchor(tocBodyHeading);
            
            // test goes here
            jqUnit.assertEquals("anchor url is the same as id except url has a '#' in front", anchorInfo.url.substr(1), anchorInfo.id);
        });
        
        tocTests.test("finalInit public function: show/hide component", function () {
            //setup and init the ToC component
            var tocContainer = renderTOCComponent().locate("tocContainer");
            jqUnit.isVisible("Initially the component is visible.", tocContainer);
            tocContainer.hide();
            //verify toc is hidden.
            jqUnit.notVisible("After calling hide, the component is invisible.", tocContainer);
            tocContainer.show();
            //verify toc is visible again
            jqUnit.isVisible("After calling show, the component is visible.", tocContainer);
        });
            
        /**
          * Test anchor links created by TOC.  Check if the heading table a href link maps to the correct header
          * @precondition   Must be rendered
          */
        var renderTOCAnchorTest = function () {
            var anchorLinks = $('.flc-toc-levels-link');
            anchorLinks.each(function (anchorIndex, anchorValue) {
                var anchorHref = anchorLinks.eq(anchorIndex).attr('href');
                jqUnit.assertTrue("Component test headings: TOC anchors should map to the headers correctly - " + anchorHref, $(anchorHref)[0]);
            });
        };
        
        /**
         * Test component and make sure the number of links, text and anchors are set correctly.
         */
        tocTests.asyncTest("Component test headings", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadings = {
                    headingInfo : []
                };
            var headings = $('#flc-toc').children(':header');
            var serializeHeading = function (level, text, url) {
                // macro to serialize heading elements, level, text, url into Object form.
                return {'level': level, 'text': text, 'url' : url};
            };
            headings.each(function (headingsIndex, headingsInfo) {
                var currLink = headings.eq(headingsIndex);
                testHeadings.headingInfo.push(serializeHeading(
                    currLink.prop('tagName').substr(currLink.prop('tagName').length - 1), 
                    currLink.text(), 
                    '#test'
                ));
            });
            renderTOCComponent("#flc-toc", {
                listeners: {
                    afterRender: function (that) {
                        renderTOCTest(that, testHeadings);
                        renderTOCAnchorTest();                        
                        start();
                    }
                }
            });
            
            /*
            * the following is to demonstrated what the headingInfo should be like
            * should remove this once code reviewed.
            *
            componentHeadings.headingInfo = [
                {level: 1, text: "Amphibians", url: "#toc_Amphibians_14"},
                {level: 2, text: "Toads", url: "#toc_Toads_15"},
                {level: 3, text: "Natterjack Toads", url: "#toc_Natterjack-Toads_16"},
                {level: 2, text: "Salamander", url: "#toc_Salamander_17"},
                {level: 2, text: "Newt", url: "#toc_Newt_18"},
                {level: 1, text: "Birds", url: "#toc_Birds_19"},
                {level: 2, text: "Anseriformes", url: "#toc_Anseriformes_20"},
                {level: 3, text: "Ducks", url: "#toc_Ducks_21"},
                {level: 1, text: "Mammals", url: "#toc_Mammals_22"},
                {level: 3, text: "CATT", url: "#toc_CATT_23"}
            ];
            */
        });
        
        /**
         * #FLUID-4352: Test component with no headings. Make sure no <ul> is set
         */
        tocTests.asyncTest("Component test empty headings", function () {
            // craft headingInfo so renderTOCTest() can use it
            var testHeadings = {
                    headingInfo : []
                };
            renderTOCComponent("#flc-toc-noHeaders", {
                listeners: {
                    afterRender: function (that) {
                        renderTOCTest(that, testHeadings);
                        renderTOCAnchorTest();
                        start();
                    }
                }
            });
        });
    });
})(jQuery);
