/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, indent: 4 */

(function ($) {
      
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
       
        return fluid.pagedTable(container, fluid.merge("replace", defaultSetupOptions, options));
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

    // Just tests that the pager will initialize with only a container, and dataModel passed in.
    // The rest of the options are the defaults.
    jqUnit.test("Default Pager: FLUID-4213", function () {
        jqUnit.assertTrue("The default pager initialized", fluid.pagedTable("#rendered", {
            dataModel: [{language: "javascript"}]
        }));
    });
    
    
    jqUnit.test("Pager Current Page label", function () {
        var pager = renderedPager("#rendered");
        var currentPages = $(".fl-pager-currentPage", pager.container);
        
        currentPages.each(function (idx, currentPage) {
            var descElmID = $(currentPage).attr("aria-label");
            jqUnit.assertTrue("aria-label was added to the current page list element", descElmID);
            jqUnit.assertEquals("The label is correct", pager.pagerBar.options.strings.currentPageIndexMsg, descElmID);
            });
        });
 
        
    /** 
     * Test everyPageStrategy Strategy
     */
    jqUnit.test("Pager everyPageStrategy", function () {
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
    jqUnit.test("Pager gappedPageStrategy", function () {
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
                    jqUnit.assertTrue("Clicked on [page " + i + "] and checking [" + $(element).find("a").attr("id") + "]", shouldExistInList(i, element));
                }
            };
            
        //Go through all pages 1 by 1 , and click click all page dynamically each time
        for (var i = 1; i <= expectedPages; i++) {
            var page = fluid.jById("page-link:link" + i);
            page.click();     
            var allPagesAfterClicked = pager.pagerBar.pageList.locate("root").find("li");
                allPagesAfterClicked.each(allPagesAfterClickedEachFn);
            } 
        });
 
         
        jqUnit.test("Page Table Header aria-sort, also checks if anchor titles changes accordingly ", function () {
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
    
    
    jqUnit.test("Pager tooltip", function () {
        var pager = renderedPager("#rendered");
        var pageLinksTop = $("a", pager.pagerBar.locate("pageLinks"));
        var pageLinksBottom = $("a", pager["pagerBar-1"].locate("pageLinks"));
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
                    jqUnit.assertNode("The contents of the tooltip should be set", tooltipContents[toolTipIdx], $("b", tooltip));
                    toolTipIdx++;
                }
                link.blur();
                jqUnit.assertEquals("There shouldn't be any tooltips visible when none of the pageLinks are focused", 0, tooltips.filter(":visible").length);
            };
        };
        
        pageLinksTop.each(tooltipTest("top"));
        pageLinksBottom.each(tooltipTest("bottom"));
    });
    
})(jQuery);