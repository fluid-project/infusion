/**
 * This file contains test constants and setup and teardown functions that are used when
 * testing with the data in the portlets.html file.
 */

// The id of the root node of the lightbox
var portalRootId = "reorderer-root";

var portlet1id = "portlet1";
var portlet2id = "portlet2";
var portlet3id = "portlet3";
var portlet4id = "portlet4";
var portlet5id = "portlet5";
var portlet6id = "portlet6";
var portlet7id = "portlet7";
var portlet8id = "portlet8";
var portlet9id = "portlet9";

// All the test function names for the JsUnit tests that test against the unordered-list.html file.  
// This is needed for running JsUnit in IE and Safari.
// It's a very brittle and annoying way of specifying test names and should be fixed. [FLUID-35]

function exposeTestFunctionNames() {
    return [
        // PortletLayoutHandlerTests.js
		"testGetItemAbove",
		"testGetItemBelow",
		"testGetLeftSibling",
        "testGetRightSibling",
        "testMoveItemDown",
        "testMoveItemUp",
        "testMoveItemRight",
        "testMoveItemLeft",
        "testCallbackReturnValue",
		
		// PortletLayoutTests.js
		"testCalcColumnAndItemIndex",
		"testFindFirstOrderableSiblingInColumn",
		"testNumItemsInColumn",
		"testNumColumns"
    ];
}

var portletHandler;

	function portletOrderableFinder (containerEl) {
        return jQuery ("#portlet3,#portlet4,#portlet6,#portlet7,#portlet8,#portlet9");
	}

var layout = { id:"t2",
			columns:[{ id:"c1", children:["portlet1","portlet2","portlet3","portlet4"]},
					 { id:"c2", children:["portlet5","portlet6"]   },
					 { id:"c3", children:["portlet7","portlet8","portlet9"]}
					]
				};
				
var emptyLayout = { id:"t3", columns:[ ] };
	
var dropTargets = {
    portlet1:{portlet1:[1,1],portlet2:[1,1],portlet3:[1,1],portlet4:[1,1],
    	   portlet5:[1,1],portlet6:[1,1],
		   portlet7:[1,1],portlet8:[1,1],portlet9:[1,1]},
	portlet2:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,0],portlet4:[0,0],
    	   portlet5:[0,0],portlet6:[0,0],
		   portlet7:[0,0],portlet8:[0,0],portlet9:[0,0]},
	portlet3:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,0],portlet4:[0,0],
    	   portlet5:[0,0],portlet6:[0,0],
		   portlet7:[0,0],portlet8:[0,0],portlet9:[0,0]},
	portlet4:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,1],portlet4:[1,1],
    	   portlet5:[0,1],portlet6:[1,1],
		   portlet7:[0,1],portlet8:[1,1],portlet9:[1,1]},
	portlet5:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,0],portlet4:[0,0],
    	   portlet5:[0,0],portlet6:[0,0],
		   portlet7:[0,0],portlet8:[0,0],portlet9:[0,0]},
	portlet6:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,1],portlet4:[1,1],
    	   portlet5:[0,1],portlet6:[1,1],
		   portlet7:[0,1],portlet8:[1,1],portlet9:[1,1]},
	portlet7:{portlet1:[0,0],portlet2:[0,1],portlet3:[1,1],portlet4:[1,1],
    	   portlet5:[0,1],portlet6:[1,1],
		   portlet7:[1,1],portlet8:[1,1],portlet9:[1,1]},
	portlet8:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,1],portlet4:[1,1],
    	   portlet5:[0,1],portlet6:[1,1],
		   portlet7:[0,1],portlet8:[1,1],portlet9:[1,1]},
	portlet9:{portlet1:[0,0],portlet2:[0,0],portlet3:[0,1],portlet4:[1,1],
    	   portlet5:[0,1],portlet6:[1,1],
		   portlet7:[0,1],portlet8:[1,1],portlet9:[1,1]}
};

// This setUp will be called before each of the tests that are included in portlets.html 
var portletRootClone;
function setUp() {
	var table = jQuery ("#" + portalRootId);
    portletRootClone = table.clone();
    var layoutHandlerParams = {
      orderableFinder: portletOrderableFinder,
      container: table,
      portletLayout: layout,
      dropTargetPermissions: dropTargets
    };
	portletHandler = new fluid.PortletLayoutHandler (layoutHandlerParams);
}

function tearDown() {
    jQuery ("#" + portalRootId).replaceWith (portletRootClone);
}


