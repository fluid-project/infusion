/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when testing with the data in the unordered-list.html file.
 */

// The ids of the items in the first list
var firstItemId = "list1item1";
var secondItemId = "list1item2";
var thirdItemId = "list1item3";
var fourthItemId = "list1item4";
var lastItemId = "list1item5"; 
var nonOrderabeItemId = "reorderer-script";       
        
// All the test function names for the JsUnit tests that test against the unordered-list.html file.  
// This is needed for running JsUnit in IE and Safari.
// It's a very brittle and annoying way of specifying test names and should be fixed. [FLUID-35]

function exposeTestFunctionNames() {
    return [
        // ListLayoutHandlerTests.js
        "testGetRightSibling",
        "testGetRightSiblingWrap",
        "testGetLeftSibling",
        "testGetLeftSiblingWrap",
        "testGetItemBelow",
        "testGetItemBelowWrap",
        "testGetItemAbove",
        "testGetItemAboveWrap",
        "testNextItemForNonOrderableReturnsTheFirstItem",
        "testMovement"
    ];
}

var listHandler1;

function listOrderableFinder (containerEl) {
    return dojo.query ("[id^=list1item]", containerEl);
}

// This setUp will be called before each of the tests that are included in unordered-list.html 
function setUp() {
    listHandler1 = new fluid.ListLayoutHandler(listOrderableFinder);
    var list = dojo.byId("list1");
    listHandler1.setReorderableContainer(list);

}


