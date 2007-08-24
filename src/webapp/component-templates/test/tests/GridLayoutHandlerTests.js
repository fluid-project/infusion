function testGetRightSibling() {
	var gridHandler = new fluid.GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var rightSibling = gridHandler.getRightSibling(dojo.byId(firstReorderableId))
	assertEquals("The item to the right of the first image should be the second image", 
		dojo.byId(secondReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the first image", rightSibling.hasWrapped);

	rightSibling = gridHandler.getRightSibling(dojo.byId(thirdReorderableId))
	assertEquals("The item to the right of the third image should be the fourth image", 
		dojo.byId(fourthReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the third image", rightSibling.hasWrapped);

	rightSibling = gridHandler.getRightSibling(dojo.byId(LastReorderableId))
	assertEquals("The item to the right of the last image should be the first image", 
		dojo.byId(firstReorderableId), rightSibling.item);
	assertTrue("Wrap to the right of the last image", rightSibling.hasWrapped);	
}

function testGetLeftSibling() {
	var gridHandler = new fluid.GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var leftSibling = gridHandler.getLeftSibling(dojo.byId(fourthReorderableId))
	assertEquals("The item to the left of the fourth image should be the third image", 
		dojo.byId(thirdReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the fourth image", leftSibling.hasWrapped);

	leftSibling = gridHandler.getLeftSibling(dojo.byId(LastReorderableId))
	assertEquals("The item to the left of the last image should be the second last image", 
		dojo.byId(secondLastReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the last image", leftSibling.hasWrapped);

	leftSibling = gridHandler.getLeftSibling(dojo.byId(firstReorderableId))
	assertEquals("The item to the left of the first image should be the last image", 
		dojo.byId(LastReorderableId), leftSibling.item);
	assertTrue("Wrap to the left of the first image", leftSibling.hasWrapped);


}

function testGetItemBelow() {
	var gridHandler = new fluid.GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	gridHandler.numOfColumnsInGrid = 3;
	
	var itemInfo = gridHandler.getItemBelow(dojo.byId(firstReorderableId));
	assertEquals("Since there are 3 colums in the grid, the item below the first image should be the fourth image", 
		dojo.byId(fourthReorderableId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(thirdReorderableId));
	assertEquals("the item below the third image should be the sixth image", 
		dojo.byId(sixthReorderableId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(thirdLastReorderableId));
	assertEquals("the item below the third last image should be the third image", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertTrue("wrap below third last image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(secondLastReorderableId));
	assertEquals("the item below the second last image should be the first image", 
		dojo.byId(firstReorderableId), itemInfo.item);
	assertTrue("wrap below second last image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(LastReorderableId));
	assertEquals("the item below the last image should be the second image", 
		dojo.byId(secondReorderableId), itemInfo.item);
	assertTrue("wrap below last image", itemInfo.hasWrapped);

}

function testGetItemAbove() {
	var gridHandler = new fluid.GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	gridHandler.numOfColumnsInGrid = 4;
	
	var itemInfo = gridHandler.getItemAbove(dojo.byId(seventhReorderableId));
	assertEquals("the item above the seventh image should be the third image", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertFalse("no wrap above seventh image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(LastReorderableId));
	assertEquals("the item above the last image should be the tenth image", 
		dojo.byId(tenthReorderableId), itemInfo.item);
	assertFalse("no wrap above tenth image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(firstReorderableId));
	assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
		dojo.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(LastReorderableId), itemInfo.item);
	assertTrue("wrap above second image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the fourth last image", 
		dojo.byId(fourthLastReorderableId), itemInfo.item);
	assertTrue("wrap above third image", itemInfo.hasWrapped);
	
	itemInfo = gridHandler.getItemAbove(dojo.byId(fourthReorderableId));
	assertEquals("the item above the fourth image should be the third last image", 
		dojo.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("wrap above fourth image", itemInfo.hasWrapped);

	// Test with grid size 3
	gridHandler.numOfColumnsInGrid = 3;
	
	itemInfo = gridHandler.getItemAbove(dojo.byId(fifthReorderableId));
	assertEquals("the item above the fifth image should be the second image", 
		dojo.byId(secondReorderableId), itemInfo.item);
	assertFalse("no wrap above fifth image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(firstReorderableId));
	assertEquals("the item above the first image should be the second last image", 
		dojo.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(LastReorderableId), itemInfo.item );
	assertTrue("wrap above second image", itemInfo.hasWrapped);
		
	itemInfo = gridHandler.getItemAbove(dojo.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the third last image", 
		dojo.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("no wrap above third image", itemInfo.hasWrapped);
		
	
}

function testWindowDidResize() {
	var gridHandler = new fluid.GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	var oldNumCols = gridHandler.numOfColumnsInGrid;

	// change the width
	dojo.removeClass(dojo.byId(lightboxParentId), "full-width");
	dojo.addClass(dojo.byId(lightboxParentId), "half-width");
	gridHandler.windowDidResize();
	assertEquals("after resize, the grid width should be "+Math.floor(oldNumCols/2), Math.floor(oldNumCols/2), gridHandler.numOfColumnsInGrid);

	// change it back
	dojo.removeClass(dojo.byId(lightboxParentId), "half-width");
	dojo.addClass(dojo.byId(lightboxParentId), "full-width");
	gridHandler.windowDidResize()
	assertEquals("after resize, the grid width should be "+oldNumCols, oldNumCols, gridHandler.numOfColumnsInGrid);
}