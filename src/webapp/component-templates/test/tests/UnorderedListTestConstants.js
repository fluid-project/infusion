/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when testing with the data in the unordered-list.html file.
 */

// Using the DOM node instead of a jQuery to ensure this behaviour works.
var findList1 = function () { return jQuery ("#list1")[0]; };

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

function exposeTestFunctionNames () {
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

function listMovableFinder () {
	// This is returning the list instead of a jQuery object to ensure that people 
	// can use an orderable finder function that doesn't use jQuery
    return jQuery ("[id^=list1item]", findList1 ()).get ();
}

function callbackConfirmer () {
    fluid.testUtils.orderChangedCallbackWasCalled = true;
}

function createListLayoutHandler () {
    var layoutParams = {
        findMovables: listMovableFinder,
        orderChangedCallback: callbackConfirmer
    };
    return new fluid.ListLayoutHandler (layoutParams);
}

function createListReorderer () {
    return new fluid.Reorderer (findList1 (), listMovableFinder, createListLayoutHandler ());
}

var listHandler1;

// This setUp will be called before each of the tests that are included in unordered-list.html 
function setUp () {
    listHandler1 = createListLayoutHandler ();
}



