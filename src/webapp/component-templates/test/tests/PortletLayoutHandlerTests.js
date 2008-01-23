function testGetItemAbove() {
    var itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet9id)[0]);
    assertEquals(portlet8id+" should be above "+portlet9id,
        jQuery ("#" + portlet8id)[0], itemAbove);

	itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet1id)[0]);
	assertEquals(portlet1id +" is at the top of the column, so nothing is 'above' it",
		jQuery ("#" + portlet1id)[0], itemAbove);

	itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet7id)[0]);
	assertEquals(portlet7id +" is at the top of the column, expected nothing 'above' it but got " + itemAbove.id,
		jQuery ("#" + portlet7id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet4id)[0]);
    assertEquals(portlet3id+" should be above "+portlet4id,
        jQuery ("#" + portlet3id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet8id)[0]);
    assertEquals(portlet7id+" should be above "+portlet8id,
        jQuery ("#" + portlet7id)[0], itemAbove);

    itemAbove = portletHandler.getItemAbove(jQuery ("#" + portlet9id)[0]);
    assertEquals(portlet8id+" should be above "+portlet9id,
        jQuery ("#" + portlet8id)[0], itemAbove);
}

function testGetItemBelow() {
	var itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet3id)[0]);
	assertEquals(portlet4id+" should be below "+portlet3id,
		jQuery ("#" + portlet4id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet7id)[0]);
	assertEquals(portlet8id+" should be below "+portlet7id,
		jQuery ("#" + portlet8id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet8id)[0]);
	assertEquals(portlet9id+" should be below "+portlet8id,
		jQuery ("#" + portlet9id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet4id)[0]);
	assertEquals(portlet4id.id+" is at the bottom of the column, so nothing is 'below' it",
		jQuery ("#" + portlet4id)[0], itemBelow);

	itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet9id)[0]);
	assertEquals(portlet9id.id+" is at the bottom of the column, so nothing is 'below' it",
		jQuery ("#" + portlet9id)[0], itemBelow);

}

function testGetLeftSibling() {
	var leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet5id)[0]);
	assertEquals(portlet3id+" should to the left of "+portlet5id,
		jQuery ("#" + portlet3id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet6id)[0]);
	assertEquals(portlet3id+" should to the left of "+portlet6id,
		jQuery ("#" + portlet3id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet9id)[0]);
	assertEquals(portlet6id+" should to the left of "+portlet9id,
		jQuery ("#" + portlet6id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet1id)[0]);
	assertEquals(portlet1id+" is at the far left, so nothing is to the left",
		jQuery ("#" + portlet1id)[0], leftSibling);

	leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet3id)[0]);
	assertEquals(portlet3id+" is at the far left, so nothing is to the left",
		jQuery ("#" + portlet3id)[0], leftSibling);
}

function testGetRightSibling() {
	var rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet1id)[0]);
	assertEquals(portlet6id+" should to the right of "+portlet1id,
		jQuery ("#" + portlet6id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet4id)[0]);
	assertEquals(portlet6id+" should to the right of "+portlet4id,
		jQuery ("#" + portlet6id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet6id)[0]);
	assertEquals(portlet7id+" should to the right of "+portlet6id,
		jQuery ("#" + portlet7id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet7id)[0]);
	assertEquals(portlet7id+" is at the far right, so nothing is to the right",
		jQuery ("#" + portlet7id)[0], rightSibling);

	rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet9id)[0]);
	assertEquals(portlet9id+" is at the far right, so nothing is to the right",
		jQuery ("#" + portlet9id)[0], rightSibling);
}

function testMoveItemDown() {
    var portletList = jQuery("div[id^=portlet]");
    assertEquals(portlet3id, portletList[2].id);
    assertEquals(portlet4id, portletList[3].id);

	portletHandler.moveItemDown (jQuery ("#" + portlet3id)[0]);
	portletList = jQuery("div[id^=portlet]");
	assertEquals(portlet4id, portletList[2].id);
    assertEquals(portlet3id, portletList[3].id);
}

function testMoveItemUp() {
    var portletList = jQuery("div[id^=portlet]");
    assertEquals("Before move portlet 3 is in third position", portlet3id, portletList[2].id);
    assertEquals("Before move portlet 4 is in fourth position", portlet4id, portletList[3].id);

    portletHandler.moveItemUp (jQuery ("#" + portlet4id)[0]);
    portletList = jQuery("div[id^=portlet]");
    assertEquals("After move portlet 4 is in third position", portlet4id, portletList[2].id);
    assertEquals("After move portlet 3 is in fourth position", portlet3id, portletList[3].id);
}

function testMoveItemRight() {
	var cols = jQuery ("td");
    var col1PortletList = jQuery ("div[id^=portlet]", cols.get (0));
    var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));

    assertEquals (4, col1PortletList.length);
    assertEquals (2, col2PortletList.length);
    assertEquals ("Before move portlet 3 is in third position column 1", portlet3id, col1PortletList[2].id);
    assertEquals ("Before move portlet 4 is in fourth position column 1", portlet4id, col1PortletList[3].id);
    assertEquals ("Before move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
    assertEquals ("Before move portlet 6 is in second position column 2", portlet6id, col2PortletList[1].id);

    portletHandler.moveItemRight (jQuery ("#" + portlet3id)[0]);
    col1PortletList = jQuery("div[id^=portlet]", cols.get (0));
    col2PortletList = jQuery("div[id^=portlet]", cols.get (1));

    assertEquals (3, col1PortletList.length);
    assertEquals (3, col2PortletList.length);
    assertEquals ("After move portlet 4 is in third position column 1", portlet4id, col1PortletList[2].id);
    assertEquals ("After move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
    assertEquals ("After move portlet 3 is in second position column 2", portlet3id, col2PortletList[1].id);
    assertEquals ("After move portlet 6 is in third position column 2", portlet6id, col2PortletList[2].id);

}

function testMoveItemLeft() {
    var cols = jQuery ("td");
    var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
    var col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));

    assertEquals ("Before move, col2 should have 2 portlets", 2, col2PortletList.length);
    assertEquals ("Before move, col3 should have 3 portlets", 3, col3PortletList.length);
    assertEquals ("Before move portlet 7 is in third position column 3", portlet7id, col3PortletList[0].id);
    assertEquals ("Before move portlet 8 is in fourth position column 3", portlet8id, col3PortletList[1].id);
    assertEquals ("Before move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
    assertEquals ("Before move portlet 6 is in second position column 2", portlet6id, col2PortletList[1].id);

    portletHandler.moveItemLeft (jQuery ("#" + portlet7id)[0]);
    col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
    col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));

    assertEquals ("After move, col2 should have 3 portlets", 3, col2PortletList.length);
    assertEquals ("After move, col3 should have 2 portlets", 2, col3PortletList.length);
    assertEquals ("After move portlet 8 is in first position column 3", portlet8id, col3PortletList[0].id);
    assertEquals ("After move portlet 7 is in second position column 2", portlet7id, col2PortletList[1].id);
    assertEquals ("After move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
    assertEquals ("After move portlet 6 is in third position column 2", portlet6id, col2PortletList[2].id);

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
      container: jQuery (portalRootSelector),
      portletLayout: layout,
      dropTargetPermissions: dropTargetPerms,
      orderChangedCallback: function () {return newLayout;}
    };
    portletHandler = new fluid.PortletLayoutHandler (layoutHandlerParams);

    // this test uses the layout handler's public api get methods instead of inspecting the dom
    assertEquals ("Before move portlet 7 is to the right of portlet 6", portlet7id,
            portletHandler.getRightSibling(jQuery("#"+portlet6id)[0]).id);
    
    portletHandler.moveItemLeft (jQuery ("#" + portlet7id)[0]);

    assertEquals ("After move portlet 7 is to the left of portlet 8", portlet7id,
            portletHandler.getLeftSibling(jQuery("#"+portlet8id)[0]).id);
}