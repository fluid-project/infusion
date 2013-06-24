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
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, indent: 4 */

(function ($) {
    
    jqUnit.module("Pager Tests");
    
    fluid.registerNamespace("fluid.tests");
    
    fluid.demands("fluid.pager.pageList", ["fluid.tests.testMarkupPager", "fluid.pager.pagerBar"], {
        funcName: "fluid.pager.directPageList"  
    });
    
    /** Convenience markup driven pager creator **/
    var markupPager = function (container, options) {
        var options = $.extend(options, {
            gradeNames: "fluid.tests.testMarkupPager"
        });
       
        return fluid.pager(container, options);
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

    // This is a "white-box" test which depends on the exact internals of the Pager
    jqUnit.test("Pager setup", function () {
        var pager = markupPager("#gradebook");
        
        var pagerTop = pager.pagerBar; 
        jqUnit.assertEquals("Pager top is set", "pager-top", pagerTop.container[0].id);

        jqUnit.assertEquals("Page Links are set", 3, pagerTop.pageList.pageLinks.length);        
        jqUnit.assertEquals("Previous is set", "previous-top", pagerTop.previousNext.previous[0].id);        
        jqUnit.assertEquals("Next is set", "next-top", pagerTop.previousNext.next[0].id);        
        
        var pagerBottom = pager["pagerBar-1"]; 
        jqUnit.assertEquals("Pager bottom is set", "pager-bottom", pagerBottom.container[0].id);

        jqUnit.assertEquals("Page Links are set", 3, pagerBottom.pageList.pageLinks.length);        
        jqUnit.assertEquals("Previous is set", "previous-bottom", pagerBottom.previousNext.previous[0].id);        
        jqUnit.assertEquals("Next is set", "next-bottom", pagerBottom.previousNext.next[0].id);

    });
    
    fluid.tests.pagerModelChange = function (newModel, oldModel, pageChangeStats) {
        pageChangeStats.pageNum = newModel.pageIndex;
        pageChangeStats.oldPageNum = oldModel.pageIndex;      
    };

    // TODO: Write this up as a successful example of refactoring through use of the new framework    
    var pageChangeOptions = {
        members: {
            pageChangeStats: {}
        },
        listeners: {
            onModelChange: {
                funcName: "fluid.tests.pagerModelChange",
                args: ["{arguments}.0", "{arguments}.1", "{fluid.pager}.pageChangeStats"]

            }
        }
    };
    
    jqUnit.test("Initially First Selected", function () {
        var pager = markupPager("#gradebook", pageChangeOptions);
        
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
    
    jqUnit.test("Click link", function () {
        var pager = markupPager("#gradebook", pageChangeOptions);
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
    
    jqUnit.test("Links between top and bottom", function () {
        var pager = markupPager("#plants", pageChangeOptions);
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
    
    jqUnit.test("Pager Next/Previous", function () {
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
    
     /** 
     * Test consistentGappedPageStrategy Strategy
     */
    jqUnit.test("Pager consistentGappedPageStrategy", function () {            
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
 
})(jQuery);
