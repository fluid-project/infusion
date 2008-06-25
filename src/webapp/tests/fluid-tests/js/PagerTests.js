/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

/*global $*/
/*global fluid*/
/*global jqUnit*/

$(document).ready(function () {
    var setUp = function () {
        fluid.pageChangedTo = false;
    };
    
    var tests = new jqUnit.TestCase("Pager Tests", setUp);
    
    var options = {
        pageWillChange: function (pageLink) {
            fluid.pageChangedTo = pageLink.id;
        }
    };

    /** Convenience test functions **/
    var enabled = function (str, link) {
        jqUnit.assertFalse(str + " link is enabled", 
            link.hasClass(fluid.Pager.prototype.defaults.styles.disabled));    
    };

    var disabled = function (str, link) {
        jqUnit.assertTrue(str + " link is disabled", 
            link.hasClass(fluid.Pager.prototype.defaults.styles.disabled));    
    };

    var current = function (str, link) {
        jqUnit.assertTrue(str + " link is selected", 
            link.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
    };

    var notCurrent = function (str, link) {
        jqUnit.assertFalse(str + " link is not selected", 
            link.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
    };

    // This is a placeholder test. It knows too much about the implementation details. 
    // This will be replaced with a better test as the public API of the Pager is developed
    tests.test("Pager setup", function () {
        var pager = new fluid.Pager("gradebook");
        
        // For now, the pager exposes the objects it contains.
        var pagerTop = pager.topBar; 
        jqUnit.assertEquals("Pager top is set", "pager-top", pagerTop.bar[0].id);

        var linkDisplay = pagerTop.linkDisplay;
        jqUnit.assertEquals("Page Links are set", 3, linkDisplay.pageLinks.length);        
        jqUnit.assertEquals("Previous is set", "previous-top", linkDisplay.previous[0].id);        
        jqUnit.assertEquals("Next is set", "next-top", linkDisplay.next[0].id);        
        
        var pagerBottom = pager.bottomBar; 
        jqUnit.assertEquals("Pager bottom is set", "pager-bottom", pagerBottom.bar[0].id);

        linkDisplay = pagerBottom.linkDisplay;
        jqUnit.assertEquals("Page Links are set", 3, linkDisplay.pageLinks.length);        
        jqUnit.assertEquals("Previous is set", "previous-bottom", linkDisplay.previous[0].id);        
        jqUnit.assertEquals("Next is set", "next-bottom", linkDisplay.next[0].id);

    });
    
    tests.test("Initially First Selected", function () {
        var pager = new fluid.Pager("gradebook");
        
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
    });
    
    tests.test("Click link", function () {      
        var pager = new fluid.Pager("gradebook", options);
        var link1 = $("#top1");        
        var link1Bottom = $("#bottom1");        
        var link2 = $("#top2");
        var anchor2 = $("a", link2);
        var link2Bottom = $("#bottom2");
        var previous = $("#previous-top");
        var next = $("#next-top");
        var previousBottom = $("#previous-bottom");
        var nextBottom = $("#next-bottom");

        jqUnit.assertFalse("Initially, no link has been clicked", fluid.pageChangedTo);
        anchor2.simulate("click");
        jqUnit.assertEquals("Link 2 has been clicked", "top2", fluid.pageChangedTo);        

        current("Link 2 top", link2);
        current("Link 2 bottom", link2Bottom);
        notCurrent("Link 1", link1);
        notCurrent("Link 1 bottom", link1Bottom);
        enabled("Next top", next);        
        enabled("Next bottom", nextBottom);
        enabled("Previous top", previous);
        enabled("Previous bottom", previousBottom);
        
        fluid.pageChangedTo = false;   
        anchor2.simulate("click");
        jqUnit.assertFalse("Link 2 clicked again - callback not called", fluid.pageChangedTo);        
        
    });
    
    tests.test("Links between top and bottom", function () {
        var pager = new fluid.Pager("plants", options);
        var nonPageLink = $("#chives");
        var topLink = $("#plants-top2");
        var pageLink = $("#plants-bottom2");
        
        jqUnit.assertFalse("Initially, no link has been clicked", fluid.pageChangedTo);
        nonPageLink.simulate("click");
        jqUnit.assertFalse("Non page link clicked", fluid.pageChangedTo);
        pageLink.simulate("click");
        // the following assert uses knowledge that the callback is always applied to the top bar
        jqUnit.assertEquals("Link 2 has been clicked", "plants-top2", fluid.pageChangedTo);
        jqUnit.assertTrue("Link 2 top is styled as current", 
            topLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
        jqUnit.assertTrue("Link 2 bottom is styled as current", 
            pageLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
    });
    
    tests.test("Pager Bar Init", function () {
        var pagerTop = $("#pager-top");
        var pagerBar = fluid.pagerBar(pagerTop, {});
        jqUnit.assertEquals("Pager bar is set", "pager-top", pagerBar.bar[0].id);    
    });
    
    tests.test("Pager Bar pageNumOfLink", function () {
        var pagerTop = $("#pager-top");
        var pagerBar = fluid.pagerBar(pagerTop, {pageLinks: ".page-link"});

        var nonPageLink = $("#chives");
        var topLinks = $(".page-link", pagerTop);
        jqUnit.assertEquals("First link is page 1", 1, pagerBar.pageNumOfLink(topLinks[0]));
        jqUnit.assertEquals("Anchor in second link is page 2", 2, pagerBar.pageNumOfLink($("a", topLinks[1])[0]));
        jqUnit.assertEquals("Last link is page 3", 3, pagerBar.pageNumOfLink(topLinks[2]));
        jqUnit.assertEquals("Page number of non-existant page is 0", 0, pagerBar.pageNumOfLink(nonPageLink));
    });
    
    tests.test("Pager Link Display", function () {
        var pagerTop = $("#pager-top");
        var pageLinks = $(".page-link", pagerTop);
        var previous = $("#previous-top");
        var next = $("#next-top");
        
        var linkDisplay = fluid.pagerLinkDisplay(pageLinks, previous, next);
        jqUnit.assertEquals("PageLinks are set", 3, linkDisplay.pageLinks.length);        
        jqUnit.assertEquals("Previous is set", "previous-top", linkDisplay.previous[0].id);        
        jqUnit.assertEquals("Next is set", "next-top", linkDisplay.next[0].id);        
    });
    
    tests.test("Pager Next/Previous", function () {
        var pager = new fluid.Pager("gradebook");

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
    
});
