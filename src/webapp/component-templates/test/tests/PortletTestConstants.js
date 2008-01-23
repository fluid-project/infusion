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

// The id of the root node of the lightbox
var portalRootSelector = "#portlet-reorderer-root";

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
        "testCalcColumnAndItemIndex",
        "testFindFirstOrderableSiblingInColumn",
        "testNumItemsInColumn",
        "testNumColumns",
        "testUpdateLayout",

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

var layout = { 
    id:"t2",
    columns:[
        { id:"c1", children:["portlet1","portlet2","portlet3","portlet4"]},
        { id:"c2", children:["portlet5","portlet6"]   },
        { id:"c3", children:["portlet7","portlet8","portlet9"]}
    ]
};
				
var emptyLayout = { id:"t3", columns:[ ] };
  
var dropTargetPerms = [
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet1
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet2
    [[0,0], [0,1], [1,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet3  
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet4
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet5
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet6
    [[0,0], [0,1], [1,1], [1,1], [0,1], [1,1], [1,1], [1,1], [1,1]],    // portlet7  
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet8
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]]     // portlet9
];    

function portletOrderableFinder (containerEl) {
    return jQuery ("#portlet3,#portlet4,#portlet6,#portlet7,#portlet8,#portlet9");
}

function initPortletReorderer() {

    var portletFinder = function (containerEl) {
        return jQuery ("[id^=portlet]", containerEl);
    };

    var portletOrderableFinder = function (containerEl) {
        return jQuery ("#portlet3,#portlet4,#portlet6,#portlet7,#portlet8,#portlet9");
    };
    
    var portletReordererRoot = jQuery(portalRootSelector);

    var layoutHandlerParams = {
        orderableFinder: portletOrderableFinder,
        container: portletReordererRoot,
        portletLayout: layout,
        dropTargetPermissions: dropTargetPerms
    };
    
    return new fluid.Reorderer(portletReordererRoot, {
        layoutHandler: new fluid.PortletLayoutHandler (layoutHandlerParams),
        orderableFinder: portletOrderableFinder,
        droppableFinder: portletFinder,
        dropTargets: dropTargetPerms
    });
}

var portletRootClone;
var portletHandler;

// This setUp will be called before each of the tests that are included in portlets.html 
function setUp() {
	var table = jQuery (portalRootSelector);
    portletRootClone = table.clone();
    var layoutClone = fluid.testUtils.cloneObj(layout);
    
    var layoutHandlerParams = {
      orderableFinder: portletOrderableFinder,
      container: table,
      portletLayout: layoutClone,
      dropTargetPermissions: dropTargetPerms
    };
    
    portletHandler = new fluid.PortletLayoutHandler (layoutHandlerParams);
}

function tearDown() {
    jQuery (portalRootSelector).replaceWith (portletRootClone);
}

