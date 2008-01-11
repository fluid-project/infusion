
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
    var portletList = jQuery("div [id^=portlet]");
    assertEquals(col1portlet3id, portletList[2].id);
    assertEquals(col1portlet4id, portletList[3].id);

	portletHandler.moveItemDown (jQuery ("#" + col1portlet3id)[0]);
	portletList = jQuery("div [id^=portlet]");
	assertEquals(col1portlet4id, portletList[2].id);
    assertEquals(col1portlet3id, portletList[3].id);
}

function testMoveItemUp() {
    var portletList = jQuery("div [id^=portlet]");
    assertEquals("Before move portlet 3 is in third position", col1portlet3id, portletList[2].id);
    assertEquals("Before move portlet 4 is in fourth position", col1portlet4id, portletList[3].id);

    portletHandler.moveItemUp (jQuery ("#" + col1portlet4id)[0]);
    portletList = jQuery("div [id^=portlet]");
    assertEquals("After move portlet 4 is in third position", col1portlet4id, portletList[2].id);
    assertEquals("After move portlet 3 is in fourth position", col1portlet3id, portletList[3].id);
}