/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global fluid, jQuery, jqUnit, expect*/

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
    
        var createPagerBar = function (container, options) {
            var mockEvents = {
                onModelChange: fluid.event.getEventFirer()
            };
            
            return fluid.pager.pagerBar(container, mockEvents, options);    
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
                bodyRenderer: "fluid.pager.selfRender",
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
                },
                pagerBar: {
                    type: "fluid.pager.pagerBar",
                    options: {
                        pageList: {
                            type: "fluid.pager.renderedPageList"
                        }
                    }
                }
            };
           
            return fluid.pager(container, fluid.merge("replace", defaultSetupOptions, options));
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
    
        // This is a placeholder test. It knows too much about the implementation details. 
        // This will be replaced with a better test as the public API of the Pager is developed
        tests.test("Pager setup", function () {
            var pager = fluid.pager("#gradebook");
            
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
            var pager = fluid.pager("#gradebook", options);
            
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
            var pager = fluid.pager("#gradebook", options);
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
            var pager = fluid.pager("#plants", options);
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
            var pager = fluid.pager("#gradebook");
    
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
            expect(1);
            var pager = fluid.pager("#plants", {
                bodyRenderer: "fluid.pager.selfRender",
                dataModel: {}
            });
            jqUnit.assertTrue("Pager has been successfully created", pager);
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
        
    });
})(jQuery);
