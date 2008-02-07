/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when
 * testing with the data in the portlets.html file.
 */
 
var portalRootId = "portlet-reorderer-root";

var portlet1id = "portlet1";
var portlet2id = "portlet2";
var portlet3id = "portlet3";
var portlet4id = "portlet4";
var portlet5id = "portlet5";
var portlet6id = "portlet6";
var portlet7id = "portlet7";
var portlet8id = "portlet8";
var portlet9id = "portlet9";

// All the test function names for the JsUnit tests that test against the portlets.html file.  
// This is needed for running JsUnit in IE and Safari.
// It's a very brittle and annoying way of specifying test names and should be fixed. [FLUID-35]
function exposeTestFunctionNames() {
    return [
        // PortletLayoutTests.js
        "testCanMove",
        "testCalcColumnAndItemIndex",
        "testFindFirstOrderableSiblingInColumn",
        "testFindLinearIndex",
        "testNumItemsInColumn",
        "testNumColumns",
        "testUpdateLayout",
        "testFirstMoveableTarget",
        "testFirstMoveableTargetSkipColumn",
        "testGetItemAt",
        "testNearestNextMoveableTarget",
        "testNearestPreviousMoveableTarget",
        "testFirstItemInAdjacentColumn",
        "testItemAboveBelow",
        "testCreateFindItems",

        // PortletLayoutHandlerTests.js
		"testGetItemAbove",
		"testGetItemBelow",
		"testGetLeftSibling",
        "testGetRightSibling",
        "testMoveItemDown",
        "testMoveItemUp",
        "testMoveItemRight",
        "testMoveItemLeft",
        "testCallbackReturnValue"
    ];
}

var emptyLayout = { id:"t3", columns:[ ] };   

var portletRootClone;
var portletHandler;

/*
 * This setUp will be called before each of the tests that are included in portlets.html 
 * layout and dropTargetPerms are defined in portlets.js
 */
function setUp() {
	var table = fluid.utils.jById (portalRootId);
    portletRootClone = table.clone();
    var layoutClone = fluid.testUtils.cloneObj(demo.portal.layout);
    
    portletHandler = new fluid.PortletLayoutHandler (layoutClone, demo.portal.dropTargetPerms);
}

function tearDown() {
    fluid.utils.jById (portalRootId).replaceWith (portletRootClone);
}

