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
    
    var tests = new jqUnit.TestCase("Pager Tests");
    
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
    
    tests.test("Click link", function () {
        var options = {
            pageChangedCallback: function (pageLink) {
                fluid.pageChangedTo = pageLink.id;
            }
        };
        
        var pager = new fluid.Pager("gradebook", options);
        
        var link2 = $("#top2");
        jqUnit.assertFalse("Initially, no link has been clicked", fluid.pageChangedTo);
        link2.click();
        jqUnit.assertEquals("Link 2 has been clicked", "top2", fluid.pageChangedTo);        
        
    });
    
    tests.test("Pager Bar", function () {
        var pagerTop = $("#pager-top");
        var pagerBar = fluid.pagerBar(pagerTop, {});
        jqUnit.assertEquals("Pager bar is set", pagerTop, pagerBar.bar);        
    });
    
    tests.test("Pager Link Display", function () {
        var pagerTop = $("#pager-top");
        var pageLinks = $(".page-link", pagerTop);
        var previous = $("#previous-top");
        var next = $("#next-top");
        
        var linkDisplay = fluid.pagerLinkDisplay(pageLinks, previous, next);
        jqUnit.assertEquals("Link Display DOM: pageLinks are set", 3, linkDisplay.pageLinks.length);        
        jqUnit.assertEquals("Link Display DOM: previous is set", "previous-top", linkDisplay.previous[0].id);        
        jqUnit.assertEquals("Link Display DOM: next is set", "next-top", linkDisplay.next[0].id);        
    });
});
