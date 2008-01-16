
function testIsFirstInColumn() {
	assertFalse(col1portlet4id+" should not be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col1portlet4id)[0]));
	assertFalse(col1portlet3id+" should not be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col1portlet3id)[0]));
	assertTrue(col1portlet1id+" should be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col1portlet1id)[0]));
	assertFalse(col2portlet2id+" should not be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col2portlet2id)[0]));
	assertTrue(col2portlet1id+" should be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col2portlet1id)[0]));
	assertFalse(col3portlet3id+" should not be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col3portlet3id)[0]));
	assertTrue(col3portlet1id+" should be first in column",
		portletHandler._isFirstInColumn(jQuery ("#" + col3portlet1id)[0]));
 }

function testIsLastInColumn() {
	assertFalse(col1portlet1id+" should not be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col1portlet1id)[0]));
	assertFalse(col1portlet3id+" should not be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col1portlet3id)[0]));
	assertTrue(col1portlet4id+" should be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col1portlet4id)[0]));
	assertFalse(col2portlet1id+" should not be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col2portlet1id)[0]));
	assertTrue(col2portlet2id+" should be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col2portlet2id)[0]));
	assertFalse(col3portlet1id+" should not be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col3portlet1id)[0]));
	assertTrue(col3portlet3id+" should be last in column",
		portletHandler._isLastInColumn(jQuery ("#" + col3portlet3id)[0]));
 }

function testGetItemAbove() {
    var itemAbove = portletHandler.getItemAbove(jQuery ("#" + col3portlet3id)[0]);
    assertEquals(col3portlet2id+" should be above "+col3portlet3id,
        jQuery ("#" + col3portlet2id)[0], itemAbove);

	itemAbove = portletHandler.getItemAbove(jQuery ("#" + col1portlet1id)[0]);
	assertEquals(col1portlet1id.id+" is at the top of the column, so nothing is 'above' it",
		jQuery ("#" + col1portlet1id)[0], itemAbove);

	itemAbove = portletHandler.getItemAbove(jQuery ("#" + col3portlet1id)[0]);
	assertEquals(col3portlet1id.id+" is at the top of the column, so nothing is 'above' it",
		jQuery ("#" + col3portlet1id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + col1portlet4id)[0]);
    assertEquals(col1portlet3id+" should be above "+col1portlet4id,
        jQuery ("#" + col1portlet3id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + col3portlet2id)[0]);
    assertEquals(col3portlet1id+" should be above "+col3portlet2id,
        jQuery ("#" + col3portlet1id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + col3portlet3id)[0]);
    assertEquals(col3portlet2id+" should be above "+col3portlet3id,
        jQuery ("#" + col3portlet2id)[0], itemAbove);
}

function testGetItemBelow() {
	var itemBelow = portletHandler.getItemBelow(jQuery ("#" + col1portlet3id)[0]);
	assertEquals(col1portlet4id+" should be below "+col1portlet3id,
		jQuery ("#" + col1portlet4id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + col3portlet1id)[0]);
	assertEquals(col3portlet2id+" should be below "+col3portlet1id,
		jQuery ("#" + col3portlet2id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + col3portlet2id)[0]);
	assertEquals(col3portlet3id+" should be below "+col3portlet2id,
		jQuery ("#" + col3portlet3id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + col1portlet4id)[0]);
	assertEquals(col1portlet4id.id+" is at the bottom of the column, so nothing is 'below' it",
		jQuery ("#" + col1portlet4id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + col3portlet3id)[0]);
	assertEquals(col3portlet3id.id+" is at the bottom of the column, so nothing is 'below' it",
		jQuery ("#" + col3portlet3id)[0], itemBelow);

}

function testIsInLeftmostColumn() {
	assertTrue(col1portlet1id+" should be in leftmost column",
		portletHandler._isInLeftmostColumn(jQuery ("#" + col1portlet1id)[0]));
	assertTrue(col1portlet4id+" should be in leftmost column",
		portletHandler._isInLeftmostColumn(jQuery ("#" + col1portlet4id)[0]));
	assertFalse(col2portlet1id+" should not be in leftmost column",
		portletHandler._isInLeftmostColumn(jQuery ("#" + col2portlet1id)[0]));
	assertFalse(col3portlet2id+" should not be in leftmost column",
		portletHandler._isInLeftmostColumn(jQuery ("#" + col3portlet2id)[0]));
}

function testIsInRightmostColumn() {
	assertTrue(col3portlet1id+" should be in rightmost column",
		portletHandler._isInRightmostColumn(jQuery ("#" + col3portlet1id)[0]));
	assertTrue(col3portlet3id+" should be in rightmost column",
		portletHandler._isInRightmostColumn(jQuery ("#" + col3portlet3id)[0]));
	assertFalse(col2portlet1id+" should not be in rightmost column",
		portletHandler._isInRightmostColumn(jQuery ("#" + col2portlet1id)[0]));
	assertFalse(col1portlet2id+" should not be in rightmost column",
		portletHandler._isInRightmostColumn(jQuery ("#" + col1portlet2id)[0]));
}

function testGetLeftSibling() {
	var leftSibling = portletHandler.getLeftSibling(jQuery ("#" + col2portlet1id)[0]);
	assertEquals(col1portlet3id+" should to the left of "+col2portlet1id,
		jQuery ("#" + col1portlet3id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + col2portlet2id)[0]);
	assertEquals(col1portlet3id+" should to the left of "+col2portlet2id,
		jQuery ("#" + col1portlet3id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + col3portlet3id)[0]);
	assertEquals(col2portlet2id+" should to the left of "+col3portlet3id,
		jQuery ("#" + col2portlet2id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + col1portlet1id)[0]);
	assertEquals(col1portlet1id+" is at the far left, so nothing is to the left",
		jQuery ("#" + col1portlet1id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + col1portlet3id)[0]);
	assertEquals(col1portlet3id+" is at the far left, so nothing is to the left",
		jQuery ("#" + col1portlet3id)[0], leftSibling);
}

function testGetRightSibling() {
	var rightSibling = portletHandler.getRightSibling(jQuery ("#" + col1portlet1id)[0]);
	assertEquals(col2portlet2id+" should to the right of "+col1portlet1id,
		jQuery ("#" + col2portlet2id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + col1portlet4id)[0]);
	assertEquals(col2portlet2id+" should to the right of "+col1portlet4id,
		jQuery ("#" + col2portlet2id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + col2portlet2id)[0]);
	assertEquals(col3portlet1id+" should to the right of "+col2portlet2id,
		jQuery ("#" + col3portlet1id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + col3portlet1id)[0]);
	assertEquals(col3portlet1id+" is at the far right, so nothing is to the right",
		jQuery ("#" + col3portlet1id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + col3portlet3id)[0]);
	assertEquals(col3portlet3id+" is at the far right, so nothing is to the right",
		jQuery ("#" + col3portlet3id)[0], rightSibling);
}

function testMoveItemDown() {
    var portletList = jQuery("div[id^=portlet]");
    assertEquals(col1portlet3id, portletList[2].id);
    assertEquals(col1portlet4id, portletList[3].id);

	portletHandler.moveItemDown (jQuery ("#" + col1portlet3id)[0]);
	portletList = jQuery("div[id^=portlet]");
	assertEquals(col1portlet4id, portletList[2].id);
    assertEquals(col1portlet3id, portletList[3].id);
}

function testMoveItemUp() {
    var portletList = jQuery("div[id^=portlet]");
    assertEquals("Before move portlet 3 is in third position", col1portlet3id, portletList[2].id);
    assertEquals("Before move portlet 4 is in fourth position", col1portlet4id, portletList[3].id);

    portletHandler.moveItemUp (jQuery ("#" + col1portlet4id)[0]);
    portletList = jQuery("div[id^=portlet]");
    assertEquals("After move portlet 4 is in third position", col1portlet4id, portletList[2].id);
    assertEquals("After move portlet 3 is in fourth position", col1portlet3id, portletList[3].id);
}

function testMoveItemRight() {
	var cols = jQuery ("td");
    var col1PortletList = jQuery ("div[id^=portlet]", cols.get (0));
    var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));

    assertEquals (4, col1PortletList.length);
    assertEquals (2, col2PortletList.length);
    assertEquals ("Before move portlet 3 is in third position column 1", col1portlet3id, col1PortletList[2].id);
    assertEquals ("Before move portlet 4 is in fourth position column 1", col1portlet4id, col1PortletList[3].id);
    assertEquals ("Before move portlet 5 is in first position column 2", col2portlet1id, col2PortletList[0].id);
    assertEquals ("Before move portlet 6 is in second position column 2", col2portlet2id, col2PortletList[1].id);

    portletHandler.moveItemRight (jQuery ("#" + col1portlet3id)[0]);
    col1PortletList = jQuery("div[id^=portlet]", cols.get (0));
    col2PortletList = jQuery("div[id^=portlet]", cols.get (1));

    assertEquals (3, col1PortletList.length);
    assertEquals (3, col2PortletList.length);
    assertEquals ("After move portlet 4 is in third position column 1", col1portlet4id, col1PortletList[2].id);
    assertEquals ("After move portlet 5 is in first position column 2", col2portlet1id, col2PortletList[0].id);
    assertEquals ("After move portlet 3 is in second position column 2", col1portlet3id, col2PortletList[1].id);
    assertEquals ("After move portlet 6 is in third position column 2", col2portlet2id, col2PortletList[2].id);

}

function testMoveItemLeft() {
    var cols = jQuery ("td");
    var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
    var col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));

    assertEquals ("Before move, col2 should have 2 portlets", 2, col2PortletList.length);
    assertEquals ("Before move, col3 should have 3 portlets", 3, col3PortletList.length);
    assertEquals ("Before move portlet 7 is in third position column 3", col3portlet1id, col3PortletList[0].id);
    assertEquals ("Before move portlet 8 is in fourth position column 3", col3portlet2id, col3PortletList[1].id);
    assertEquals ("Before move portlet 5 is in first position column 2", col2portlet1id, col2PortletList[0].id);
    assertEquals ("Before move portlet 6 is in second position column 2", col2portlet2id, col2PortletList[1].id);

    portletHandler.moveItemLeft (jQuery ("#" + col3portlet1id)[0]);
    col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
    col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));

    assertEquals ("After move, col2 should have 3 portlets", 3, col2PortletList.length);
    assertEquals ("After move, col3 should have 2 portlets", 2, col3PortletList.length);
    assertEquals ("After move portlet 8 is in first position column 3", col3portlet2id, col3PortletList[0].id);
    assertEquals ("After move portlet 7 is in second position column 2", col3portlet1id, col2PortletList[1].id);
    assertEquals ("After move portlet 5 is in first position column 2", col2portlet1id, col2PortletList[0].id);
    assertEquals ("After move portlet 6 is in third position column 2", col2portlet2id, col2PortletList[2].id);

}

function testCallbackReturnValue() {
    var newLayout = { id:"t2",
            columns:[{ id:"c1", children:["portlet1","portlet2","portlet3","portlet4"]},
                     { id:"c2", children:["portlet5","portlet7","portlet6"]   },
                     { id:"c3", children:["portlet8","portlet9"]}
                    ]
                };
    var layoutHandlerParams = {
      orderableFinder: portletOrderableFinder,
      container: jQuery ("#" + portalRootId),
      portletLayout: layout,
      dropTargetPermissions: dropTargets,
      orderChangedCallback: function () {return newLayout;}
    };
    portletHandler = new fluid.PortletLayoutHandler (layoutHandlerParams);

    // this test uses the layout handler's public api get methods instead of inspecting the dom
    assertEquals ("Before move portlet 7 is to the right of portlet 6", col3portlet1id,
            portletHandler.getRightSibling(jQuery("#"+col2portlet2id)[0]).id);
    
    portletHandler.moveItemLeft (jQuery ("#" + col3portlet1id)[0]);

    assertEquals ("After move portlet 7 is to the left of portlet 8", col3portlet1id,
            portletHandler.getLeftSibling(jQuery("#"+col3portlet2id)[0]).id);
}