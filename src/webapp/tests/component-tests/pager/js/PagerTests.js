/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        var pageChangeStats = {};
        
        var setUp = function () {
            pageChangeStats = {};
        };
        
        var tests = new jqUnit.TestCase("Pager Tests", setUp);
        
        var options = {
            listeners: {
                onModelChange: function (newModel, oldModel) {
                    pageChangeStats.pageNum = newModel.pageIndex;
                    pageChangeStats.oldPageNum = oldModel.pageIndex;
                }
            }
        };    
        
        /** Convenience markup driven pager creator **/
        var markupPager = function (container, options) {
            var defaultSetupOptions = {
                pagerBar: {
                    type: "fluid.pager.pagerBar", 
                    options: {
                        pageList: {
                            type: "fluid.pager.directPageList"
                        }
                    }
                },
                bodyRenderer: {
                    type: "fluid.emptySubcomponent"
                },
                columnDefs: "explode",
                annotateColumnRange: undefined
            };
           
            return fluid.pager(container, fluid.merge("replace", defaultSetupOptions, options));
        };    
        
        /** Convenience rendered pager creator **/
        var renderedPager = function (container, options) {
            var defaultSetupOptions = {
                columnDefs: [ 
                    {
                        key: "animal",
                        valuebinding: "*.animal",  
                        sortable: true
                    }
                ],
                tooltip: {
                    type: "fluid.tooltip",
                    options: {
                        delay: 0
                    }
                },
                annotateColumnRange: "animal",
                dataOffset: "pets",
                model: {
                    pageSize: 2
                },
                dataModel: {
                    pets: [
                        {
                            animal: "dog"
                        },
                        {
                            animal: "cat"
                        },
                        {
                            animal: "bird"
                        },
                        {
                            animal: "fish"
                        }
                    ]
                }
            };
           
            return fluid.pager(container, fluid.merge("replace", defaultSetupOptions, options));
        };
        
        /** Convenience strategy pager creator **/
        var strategyRenderer = function (n, pageSize, pageList) {
                var dataModel = {};
                dataModel.pets = [];
                for (var i = 0; i < n; i++) {
                    dataModel.pets.push({animal: "cat_" + i});
                }
                
                var opt = {
                    dataModel : dataModel,
                    model: {
                        pageSize: pageSize
                    },
                    pagerBar: {
                        type: "fluid.pager.pagerBar", 
                        options: {
                            pageList: pageList
                        }
                    }
                };
                var pager = renderedPager("#rendered", opt);
                return pager;
            };
        
        /** Convenience test functions **/
        var enabled = function (str, link) {
            jqUnit.assertFalse(str + " link is enabled", 
                link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.disabled));    
        };
    
        var disabled = function (str, link) {
            jqUnit.assertTrue(str + " link is disabled", 
                link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.disabled));    
        };
    
        var current = function (str, link) {
            jqUnit.assertTrue(str + " link is selected", 
                link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));        
        };
    
        var notCurrent = function (str, link) {
            jqUnit.assertFalse(str + " link is not selected", 
                link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));        
        };
        
        // Just tests that the pager will initialize with only a container, and dataModel passed in.
        // The rest of the options are the defaults.
        tests.test("Default Pager: FLUID-4213", function () {
            jqUnit.assertTrue("The default pager initialized", fluid.pager("#rendered", {
                dataModel: [{language: "javascript"}]
            }));
        });
    
        // This is a placeholder test. It knows too much about the implementation details. 
        // This will be replaced with a better test as the public API of the Pager is developed
        tests.test("Pager setup", function () {
            var pager = markupPager("#gradebook");
            
            // For now, the pager exposes the objects it contains.
            var pagerTop = pager.pagerBar; 
            jqUnit.assertEquals("Pager top is set", "pager-top", pagerTop.container[0].id);
    
            jqUnit.assertEquals("Page Links are set", 3, pagerTop.pageList.pageLinks.length);        
            jqUnit.assertEquals("Previous is set", "previous-top", pagerTop.previousNext.previous[0].id);        
            jqUnit.assertEquals("Next is set", "next-top", pagerTop.previousNext.next[0].id);        
            
            var pagerBottom = pager.pagerBarSecondary; 
            jqUnit.assertEquals("Pager bottom is set", "pager-bottom", pagerBottom.container[0].id);
    
            jqUnit.assertEquals("Page Links are set", 3, pagerBottom.pageList.pageLinks.length);        
            jqUnit.assertEquals("Previous is set", "previous-bottom", pagerBottom.previousNext.previous[0].id);        
            jqUnit.assertEquals("Next is set", "next-bottom", pagerBottom.previousNext.next[0].id);
    
        });
        
        tests.test("Initially First Selected", function () {
            var pager = markupPager("#gradebook", options);
            
            var firstLink = $("#top1");
            var firstLinkBottom = $("#bottom1");
            var previous = $("#previous-top");
            var next = $("#next-top");
            var previousBottom = $("#previous-bottom");
            var nextBottom = $("#next-bottom");
            
            current("First top", firstLink);        
            current("First bottom", firstLinkBottom);        
            disabled("Previous top", previous);
            disabled("Previous bottom", previousBottom);
            enabled("Next top", next);
            enabled("Next bottom", nextBottom);
            
            jqUnit.assertEquals("The onPageChange event should be fired upon initialization.", 0, pageChangeStats.pageNum);
            jqUnit.assertUndefined("The oldPageNum for the onPageChange event should be undefined.", pageChangeStats.oldPageNum);
        });
        
        tests.test("Click link", function () {
            var pager = markupPager("#gradebook", options);
            var link1 = $("#top1");        
            var link1Bottom = $("#bottom1");        
            var link2 = $("#top2");
            var anchor2 = $("a", link2);
            var link2Bottom = $("#bottom2");
            var previous = $("#previous-top");
            var next = $("#next-top");
            var previousBottom = $("#previous-bottom");
            var nextBottom = $("#next-bottom");
    
            anchor2.simulate("click");
            jqUnit.assertEquals("Page number is 1.", 1, pageChangeStats.pageNum);      
            jqUnit.assertEquals("Old page number is 0.", 0, pageChangeStats.oldPageNum);
            
            current("Link 2 top", link2);
            current("Link 2 bottom", link2Bottom);
            notCurrent("Link 1", link1);
            notCurrent("Link 1 bottom", link1Bottom);
            enabled("Next top", next);        
            enabled("Next bottom", nextBottom);
            enabled("Previous top", previous);
            enabled("Previous bottom", previousBottom);
            
            pageChangeStats = {};   
            anchor2.simulate("click");
            jqUnit.assertUndefined("Link 2 clicked again - callback not called.", pageChangeStats.pageNum);
            jqUnit.assertUndefined("Link 2 clicked again - callback not called.", pageChangeStats.oldPageNum);
        });
        
        tests.test("Links between top and bottom", function () {
            var pager = markupPager("#plants", options);
            var nonPageLink = $("#chives");
            var topLink = $("#plants-top2");
            var pageLink = $("#plants-bottom2");
            
            jqUnit.assertEquals("Initially, the first page should be selected.", 0, pageChangeStats.pageNum);
            nonPageLink.simulate("click");
            pageChangeStats = {};   
            jqUnit.assertUndefined("When a non-page link is clicked, no events should be fired.", pageChangeStats.pageNum);
            pageLink.simulate("click");

            jqUnit.assertEquals("Page number is 1.", 1, pageChangeStats.pageNum);
            jqUnit.assertEquals("Old page number is 0.", 0, pageChangeStats.oldPageNum);
            jqUnit.assertTrue("Link 2 top is styled as current", 
                topLink.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));        
            jqUnit.assertTrue("Link 2 bottom is styled as current", 
                pageLink.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));
        });
        
        tests.test("Pager Next/Previous", function () {
            var pager = markupPager("#gradebook");
    
            var nextLink = $("#next-top");
            var previousLink = $("#previous-top");
            var firstLink = $("#top1");
            var secondLink = $("#top2");
            var lastLink = $("#top3");
            
            current("Initially, first", firstLink);
            disabled("Initially, previous", previousLink);
            enabled("Initially, next", nextLink);
    
            nextLink.simulate("click");
            current("After clicking next, second", secondLink);
            notCurrent("After clicking next, first", firstLink);
            enabled("After clicking next, previous", previousLink);
            enabled("After clicking next, next", nextLink);
    
            previousLink.simulate("click");
            current("After clicking previous, first", firstLink);
            notCurrent("After clicking previous, second", secondLink);
            disabled("After clicking previous, previous", previousLink);
            enabled("After clicking previous, next", nextLink);
                
            previousLink.simulate("click");
            current("After clicking previous on first page, first is still", firstLink);
            disabled("After clicking previous on first page, previous", previousLink);
    
            lastLink.simulate("click");
            current("After clicking last, last", lastLink);
            notCurrent("After clicking last, first", firstLink);
            enabled("After clicking last, previous", previousLink);
            disabled("After clicking last, next", nextLink);
            
            nextLink.simulate("click");
            current("After clicking next on last page, last is still", lastLink);
            enabled("After clicking next on last page, previous", previousLink);
            disabled("After clicking next on last page, next", nextLink);
        });
        
        tests.test("Pager bodyRenderer: fluid.pager.selfRender with default columnDefs (FLUID-3793)", function () {
            // without a fix to FLUID-3793, pager creation will fail with the default selfRender configuration
            jqUnit.expect(2);
            var afterRenderThat;
            function afterRenderListener(overallThat) {
                afterRenderThat = overallThat;
            }
            var pager = markupPager("#plants", {
                bodyRenderer: "fluid.pager.selfRender",
                dataModel: {},
                listeners: {
                    afterRender: afterRenderListener
                }
            });
            jqUnit.assertTrue("Pager has been successfully created", pager);
            jqUnit.assertTrue("AfterRender event fired with pager", pager, afterRenderThat);
        });

        tests.test("Pager tooltip", function () {
            var pager = renderedPager("#rendered");
            var pageLinksTop = $("a", pager.pagerBar.locate("pageLinks"));
            var pageLinksBottom = $("a", pager.pagerBarSecondary.locate("pageLinks"));
            var tooltips = $(".ui-tooltip-content");
            var midPoint = tooltips.length / 2;
            
            var splitTooltips = {
                top: tooltips.slice(0, midPoint),
                bottom: tooltips.slice(midPoint)
            };
            
            var tooltipContents = [
                [
                    {nodeName: "b", nodeText: "bird"},
                    {nodeName: "b", nodeText: "fish"}
                ]
            ];

            var tooltipTest = function (location) {
                var toolTipIdx = 0;
                return function (idx, link) {
                    link = $(link);
                    var tooltip = splitTooltips[location].eq(toolTipIdx);
    
                    link.focus();
                    if (link.hasClass(pager.pagerBar.options.styles.currentPage)) {
                        jqUnit.assertEquals("There shouldn't be any tooltips visible when the currentPage is focused", 0, tooltips.filter(":visible").length);
                    } else {
                        jqUnit.assertTrue("The tooltip for page link " + (idx + 1) + ", in the " + location + " page bar is visible", tooltip.is(":visible"));
                        jqUnit.assertEquals("Only 1 tooltip is visible", 1, tooltips.filter(":visible").length);
                        fluid.testUtils.assertNode("The contents of the tooltip should be set", tooltipContents[toolTipIdx], $("b", tooltip));
                        toolTipIdx++;
                    }
                    link.blur();
                    jqUnit.assertEquals("There shouldn't be any tooltips visible when none of the pageLinks are focused", 0, tooltips.filter(":visible").length);
                };
            };
            
            pageLinksTop.each(tooltipTest("top"));
            pageLinksBottom.each(tooltipTest("bottom"));
        });
        
        tests.test("Pager Current Page label", function () {
            var pager = renderedPager("#rendered");
            var currentPages = $(".fl-pager-currentPage", pager.container);
            
            currentPages.each(function (idx, currentPage) {
                var descElmID = $(currentPage).attr("aria-label");
                jqUnit.assertTrue("aria-label was added to the current page list element", descElmID);
                jqUnit.assertEquals("The label is correct", pager.pagerBar.options.strings.currentPageIndexMsg, descElmID);
            });
        });
        
        tests.test("Page Table Header aria-sort, also checks if anchor titles changes accordingly ", function () {
            //the following sortableColumnText strings are the same as fluid.pager.selfRender.strings.
            //redeclaring them here because we cannot get them from the pager object.
            var sortableColumnText = "Select to sort";
            var sortableColumnTextDesc = "Select to sort in ascending, currently in descending order.";
            var sortableColumnTextAsc = "Select to sort in descending, currently in ascending order.";
    
            // TODO: this data can be usefully reused for other tests as well - we might want to make it more accessible.  
            var dataModel = {
                    pets: [
                        {
                            category: "B",
                            breed: "Siberian Husky",
                            origin: "Russia"
                        },
                        {
                            category: "C",
                            breed: "Old German Shepherd Dog",
                            origin: "Germany"
                        },
                        {
                            category: "A",
                            breed: "Old England Old English Terrier",
                            origin: "Germany"
                        },
                        {
                            category: "D",
                            breed: "Kuvasz",
                            origin: "Hungary"
                        },
                        {
                            category: "D",
                            breed: "King Shepherd",
                            origin: "United States"
                        },
                        {
                            category: "B",
                            breed: "Kishu",
                            origin: "Japan"
                        }
                    ]
                };
            var columnDefs = [ 
                {
                    key: "category",
                    valuebinding: "*.category",  
                    sortable: true
                },
                {
                    key: "breed",
                    valuebinding: "*.breed",
                    sortable: true 
                },
                {
                    key: "origin",
                    valuebinding: "*.origin",
                    sortable: true
                }
            ];
            var opt = {
                dataModel : dataModel,
                columnDefs: columnDefs,
                annotateColumnRange: "category",
                model: {
                    pageSize: 6
                }
            };
            var pager = renderedPager("#rendered", opt);
            var currentHeaders = pager.locate("headerSortStylisticOffset");

            /**
             * Get a string representation of the parameter based on the strings we have in Pager.js 
             */
            var sortableColumnTextStr = function (dir_order) {
                if (dir_order === "ascending") {
                    return sortableColumnTextAsc;
                } else if (dir_order === "descending") {
                    return sortableColumnTextDesc;
                } else {
                    return sortableColumnText;
                }
            };

            /**
             * Upon a click on a single column, this function will check the aira-sort attribute, and the anchor titles on ALL columns,
             * making sure they all have the correct values.
             *
             * @param   int     index of the header column on which aria-sort should display in
             * @param   string  the n-th times this column is clicked, use strings like 1st, 2nd, 3rd, etc. Used for displaying report.
             * @param   string  descending/ascending
             */
            var testAriaOnAllHeaders = function (aria_index, times, dir_order) {
                var currentHeadersMod = pager.locate("headerSortStylisticOffset");
                var currentHeadersAnchor = $("a", currentHeadersMod);
                for (var j = 0; j < currentHeadersMod.length; j++) {
                    var aria_sort_attr = $(currentHeadersMod[j]).attr("aria-sort");
                    var title_attr = $(currentHeadersAnchor[j]).attr("title");
                    var test_prefix = times + " clicked  on Column [" + currentHeadersAnchor.eq(aria_index).text() +
                                 "], checking column [" + currentHeadersAnchor.eq(j).text() + "] - ";
                    if (aria_index === j) {
                        jqUnit.assertTrue(test_prefix + "aria-sort was added to the sorted column", aria_sort_attr);
                        jqUnit.assertEquals(test_prefix + "The aria-sort value is set", dir_order, aria_sort_attr);
                        jqUnit.assertEquals(test_prefix + "The anchor of the header is set", sortableColumnTextStr(dir_order), title_attr);
                    } else {
                        jqUnit.assertFalse(test_prefix + "aria-sort was not added to the unsorted column", aria_sort_attr);
                        jqUnit.assertEquals(test_prefix + "The anchor of the header is set", sortableColumnTextStr(""), title_attr);
                    }
                }
            };

            /**
             * This function performs a mouse click on the column header
             *
             * @param   int     index of the header column on which aria-sort should display in
             */
            var clickHeader = function (aria_index) {
                currentHeaders = pager.locate("headerSortStylisticOffset");
                var currentHeader = currentHeaders.eq(aria_index);
                //first click is ascending order
                $("a", currentHeader).click();
            };

            //sort each column individually, and check aria-sort on all columns after every sort.
            for (var i = 0; i < currentHeaders.length; i++) {
                //first click is ascending order
                clickHeader(i);
                testAriaOnAllHeaders(i, "1st", "ascending");

                //second click is descending order
                clickHeader(i);
                testAriaOnAllHeaders(i, "2nd", "descending");

                //third click is ascending order
                //if rand(0,1)===0, then do a third click; this adds randomness
                if (Math.floor(Math.random() * 2) === 0) {
                    clickHeader(i);
                    testAriaOnAllHeaders(i, "3rd", "ascending");
                }
            }
        });
        
        /** 
         * Test everyPageStrategy Strategy
         */
        tests.test("Pager everyPageStrategy", function () {
            /*
             * Create n pages, check if number of pages = n
             */    
            var pageSize = 3;
            var pageList = 20;
            var everyPageStrategyPageList = {
                type: "fluid.pager.renderedPageList",
                options: {
                    pageStrategy: fluid.pager.everyPageStrategy
                }
            };            
            var expectedPages = Math.ceil(pageList / pageSize);
            var pager = strategyRenderer(pageList, pageSize, everyPageStrategyPageList);
            var pagerTopPageLinks = $(".flc-pager-top .flc-pager-pageLink", pager.container).length;
            var pagerBottomPageLinks = $(".flc-pager-bottom .flc-pager-pageLink", pager.container).length;
            jqUnit.assertEquals("Top pageLinks", expectedPages, pagerTopPageLinks);
            jqUnit.assertEquals("Bottom pageLinks", expectedPages, pagerBottomPageLinks);
        });
        
        /** 
         * Test gappedPageStrategy Strategy
         */
        tests.test("Pager gappedPageStrategy", function () {
            var pageSize = 3;
            var pageList = 100;
            var expectedPages = Math.ceil(pageList / pageSize);
            var j = 3;
            var m = 1;
            var gappedPageStrategyPageList = function (j, m) {
                return {
                    type: "fluid.pager.renderedPageList",
                    options: {
                        pageStrategy: fluid.pager.gappedPageStrategy(j, m)
                    }
                };
            };
            var pager = strategyRenderer(pageList, pageSize, gappedPageStrategyPageList(j, m)); 
            
            /*
             * Check if element is in the list when we clicked on "i"
             */
            var shouldExistInList = function (i, element) {
                //manually retrieve ID
                //todo: make this better?
                var link = $(element).find('a');
                var linkId = parseInt(link.attr('id').replace('page-link:link', ''), 10);
                //if this link is within the leading linkCount
                if (linkId <= j) {
                    return true;
                }
                //if this link is within the trailing linkCount
                if (linkId > expectedPages - j && linkId <= expectedPages) {
                    return true;
                }
                //if this link is within the middle linkCount
                if (i >= linkId - m && i <= linkId + m) {
                    return true;
                }
                
                //if all the above fails.
                return false;
            };
            
            var allPagesAfterClickedEachFn = function (index, element) {
                    if (!$(element).hasClass("flc-pager-pageLink-skip")) {
                        jqUnit.assertTrue("Clicked on [page " + i + "] and checking [" + $(element).find('a').attr('id') + "]", shouldExistInList(i, element));
                    }
                };
                
            //Go through all pages 1 by 1 , and click click all page dynamically each time
            for (var i = 1; i <= expectedPages; i++) {
                var page = fluid.jById('page-link:link' + i);
                page.click();     
                var allPagesAfterClicked = pager.pagerBar.pageList.locate("root").find("li");
                allPagesAfterClicked.each(allPagesAfterClickedEachFn);
            } 
        });
        
        /** 
         * Test consistentGappedPageStrategy Strategy
         */
        tests.test("Pager consistentGappedPageStrategy", function () {            
            /*
             * Create n pages, check if number of pages = n
             * consistentGappedPageStrategy(j, m) should look like this:
             * ---j--- -m-[x]-m- ---j---
             */             
            var pageSize = 3;
            var pageList = 100;
            var expectedPages = Math.ceil(pageList / pageSize);
            var j = 3;
            var m = 1;
            var consistentGappedPageStrategyPageList = function (j, m) {
                return {
                    type: "fluid.pager.renderedPageList",
                    options: {
                        pageStrategy: fluid.pager.consistentGappedPageStrategy(j, m)
                    }
                };
            };
            
            /*
             * Check if element is in the list when we clicked on "i"
             */
            var shouldExistInList = function (i, element) {
                //manually retrieve ID
                //todo: make this better?
                var link = $(element).find('a');
                var linkId = parseInt(link.attr('id').replace('page-link:link', ''), 10);
                //if this link is within the leading linkCount
                if (linkId <= j) {
                    return true;
                }
                //if this link is within the trailing linkCount
                if (linkId > expectedPages - j && linkId <= expectedPages) {
                    return true;
                }
                //if this link is within the middle linkCount
                if (i >= linkId - m && i <= linkId + m) {
                    return true;
                }
                
                //if this element is outside of leading linkCount but index
                //is within leading linkCount
                //i-m-2 because 1 2 3 ... 5 6 is pointless. it should be 1 2 3 4 5 6.
                if ((i - m - 2) <= j && linkId <= (expectedPages - j - 1)) {
                    return true;
                }
                
                //if this element is outside of trailing linkCount but index
                //is within leading linkCount
                if (i + m + 2 >= expectedPages - j && linkId > expectedPages - (expectedPages - j - 1)) {
                    return true;
                }
                
                //if all the above fails.
                return false;
            };
            
            var pager = strategyRenderer(pageList, pageSize, consistentGappedPageStrategyPageList(j, m)); 
            //total queue size allowed is current_page + 2 * (j + m) + self + 2 skipped_pages                        
            var totalPages = 2 * (j + m) + 3;
            var allPagesAfterClickedEachFn = function (index, element) {
                    if (!$(element).hasClass("flc-pager-pageLink-skip")) {
                        jqUnit.assertTrue("On [page " + i + "] and checking [" + $(element).find('a').attr('id') + "]", shouldExistInList(i, element));
                    }
                };
            
            //Go through all pages 1 by 1 , and click all page dynamically each time
            for (var i = 1; i <= expectedPages; i++) {
                var page = fluid.jById('page-link:link' + i);
                page.click();                
                jqUnit.assertEquals("Verify number of top page links", totalPages, 
                                    pager.pagerBar.locate("pageLinks").length + pager.pagerBar.locate("pageLinkSkip").length);                
                var allPagesAfterClicked = pager.pagerBar.pageList.locate("root").find("li");
                allPagesAfterClicked.each(allPagesAfterClickedEachFn);
            }
        });
    });
})(jQuery);
