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
        
        jqUnit.assertTrue("First is selected - top", 
            firstLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
        jqUnit.assertTrue("First is selected - bottom", 
            firstLinkBottom.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
    });
    
    tests.test("Click link", function () {      
        var pager = new fluid.Pager("gradebook", options);
        var link1 = $("#top1");        
        var link1Bottom = $("#bottom1");        
        var link2 = $("#top2");
        var anchor2 = $("a", link2);
        var link2Bottom = $("#bottom2");
        
        jqUnit.assertFalse("Initially, no link has been clicked", fluid.pageChangedTo);
        anchor2.simulate("click");
        jqUnit.assertEquals("Link 2 has been clicked", "top2", fluid.pageChangedTo);        

        jqUnit.assertTrue("Link 2 top is styled as current", 
            link2.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
        jqUnit.assertTrue("Link 2 bottom is styled as current", 
            link2Bottom.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));

        jqUnit.assertFalse("Link 1 not current", 
            link1.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));        
        jqUnit.assertFalse("Link 1 bottom not current", 
            link1Bottom.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
            
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

        jqUnit.assertTrue("Initially, first is selected", 
            firstLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
//        jqUnit.assertTrue("Initially, next link is disabled", 
  //          nextLink.hasClass(fluid.Pager.prototype.defaults.styles.???));
        nextLink.simulate("click");
        jqUnit.assertTrue("After clicking next, second is selected",
            secondLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
        jqUnit.assertFalse("After clicking next, first is not selected",
            firstLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
        previousLink.simulate("click");
        jqUnit.assertTrue("After clicking previous, first is selected",
            firstLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
        jqUnit.assertFalse("After clicking previous, second is not selected",
            secondLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
        previousLink.simulate("click");
        jqUnit.assertTrue("After clicking previous when on the first page, first is still selected",
            firstLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));
        lastLink.simulate("click");
        nextLink.simulate("click");
        jqUnit.assertTrue("After clicking next when on the last page, last is still selected",
            lastLink.hasClass(fluid.Pager.prototype.defaults.styles.currentPage));

    });
    
});
