function testGetRightSibling() {
	var rightSibling = listHandler1.getRightSibling(dojo.byId(firstItemId));
	assertEquals("The item to the right of the first item should be the second item", 
		dojo.byId(secondItemId), rightSibling);
		
	rightSibling = listHandler1.getRightSibling(dojo.byId(thirdItemId));
	assertEquals("The item to the right of the third item should be the fourth item", 
		dojo.byId(fourthItemId), rightSibling);
}

function testGetRightSiblingWrap() {
	var rightSibling = listHandler1.getRightSibling(dojo.byId(lastItemId));
	assertEquals("The item to the right of the last item should be the first item", 
		dojo.byId(firstItemId), rightSibling);	
}

    // TODO: write this test
    // "When a non-orderable is passed to getRightSibling the first orderable should be returned.", 

function testGetLeftSibling() {
	var leftSibling = listHandler1.getLeftSibling(dojo.byId(secondItemId));
	assertEquals("The item to the left of the second item should be the first item", 
		dojo.byId(firstItemId), leftSibling);

	leftSibling = listHandler1.getLeftSibling(dojo.byId(lastItemId));
	assertEquals("The item to the left of the last item should be the fourth item", 
		dojo.byId(fourthItemId), leftSibling);
}

function testGetLeftSiblingWrap() {
	leftSibling = listHandler1.getLeftSibling(dojo.byId(firstItemId));
	assertEquals("The item to the left of the first item should be the last item", 
		dojo.byId(lastItemId), leftSibling);
}

    // TODO: write this test
    //"When a non-orderable is passed to getLeftSibling the first orderable should be returned.", 

function testGetItemBelow() {
	var itemBelow = listHandler1.getItemBelow(dojo.byId(firstItemId));
	assertEquals("The item to the right of the first item should be the second item", 
		dojo.byId(secondItemId), itemBelow);

	itemBelow = listHandler1.getItemBelow(dojo.byId(thirdItemId));
	assertEquals("The item to the right of the third item should be the fourth item", 
		dojo.byId(fourthItemId), itemBelow);
}

function testGetItemBelowWrap() {
	itemBelow = listHandler1.getItemBelow(dojo.byId(lastItemId));
	assertEquals("The item to the right of the last item should be the first item", 
		dojo.byId(firstItemId), itemBelow);	
}

    // TODO: write this test
    // "When a non-orderable is passed to getItemBelow the first orderable should be returned.", 

function testGetItemAbove() {
	var itemAbove = listHandler1.getItemAbove(dojo.byId(secondItemId));
	assertEquals("The item to the left of the second item should be the first item", 
		dojo.byId(firstItemId), itemAbove);

	itemAbove = listHandler1.getItemAbove(dojo.byId(lastItemId));
	assertEquals("The item to the left of the last item should be the fourth item", 
		dojo.byId(fourthItemId), itemAbove);
}

function testGetItemAboveWrap() {
	itemAbove = listHandler1.getItemAbove(dojo.byId(firstItemId));
	assertEquals("The item to the left of the first item should be the last item", 
		dojo.byId(lastItemId), itemAbove);
}


    // TODO: write this test
    //"When a non-orderable is passed to getItemAbove the first orderable should be returned.", 

// TODO: write movement tests

