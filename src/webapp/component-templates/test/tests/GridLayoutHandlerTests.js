function testGetRightSibling() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setGrid(imageList);

	var rightSibling = gridHandler.getRightSibling(dojo.byId(firstImageId))
	assertEquals("The item to the right of the first image should be the second image", 
		dojo.byId(secondImageId), rightSibling.item);
	assertFalse("No wrap to the right of the first image", rightSibling.hasWrapped);

	rightSibling = gridHandler.getRightSibling(dojo.byId(thirdImageId))
	assertEquals("The item to the right of the third image should be the fourth image", 
		dojo.byId(fourthImageId), rightSibling.item);
	assertFalse("No wrap to the right of the third image", rightSibling.hasWrapped);

	rightSibling = gridHandler.getRightSibling(dojo.byId(lastImageId))
	assertEquals("The item to the right of the last image should be the first image", 
		dojo.byId(firstImageId), rightSibling.item);
	assertTrue("Wrap to the right of the last image", rightSibling.hasWrapped);	
}

function testGetLeftSibling() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setGrid(imageList);

	var leftSibling = gridHandler.getLeftSibling(dojo.byId(fourthImageId))
	assertEquals("The item to the left of the fourth image should be the third image", 
		dojo.byId(thirdImageId), leftSibling.item);
	assertFalse("No wrap to the left of the fourth image", leftSibling.hasWrapped);

	leftSibling = gridHandler.getLeftSibling(dojo.byId(lastImageId))
	assertEquals("The item to the left of the last image should be the second last image", 
		dojo.byId(secondLastImageId), leftSibling.item);
	assertFalse("No wrap to the left of the last image", leftSibling.hasWrapped);

	leftSibling = gridHandler.getLeftSibling(dojo.byId(firstImageId))
	assertEquals("The item to the left of the first image should be the last image", 
		dojo.byId(lastImageId), leftSibling.item);
	assertTrue("Wrap to the left of the first image", leftSibling.hasWrapped);


}

function testGetItemBelow() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setGrid(imageList);
	gridHandler.numOfColumnsInGrid = 3;
	
	var itemInfo = gridHandler.getItemBelow(dojo.byId(firstImageId));
	assertEquals("Since there are 3 colums in the grid, the item below the first image should be the fourth image", 
		dojo.byId(fourthImageId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(thirdImageId));
	assertEquals("the item below the third image should be the sixth image", 
		dojo.byId(sixthImageId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(thirdLastImageId));
	assertEquals("the item below the third last image should be the third image", 
		dojo.byId(thirdImageId), itemInfo.item);
	assertTrue("wrap below third last image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(secondLastImageId));
	assertEquals("the item below the second last image should be the first image", 
		dojo.byId(firstImageId), itemInfo.item);
	assertTrue("wrap below second last image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemBelow(dojo.byId(lastImageId));
	assertEquals("the item below the last image should be the second image", 
		dojo.byId(secondImageId), itemInfo.item);
	assertTrue("wrap below last image", itemInfo.hasWrapped);

}

function testGetItemAbove() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setGrid(imageList);
	gridHandler.numOfColumnsInGrid = 4;
	
	var itemInfo = gridHandler.getItemAbove(dojo.byId(seventhImageId));
	assertEquals("the item above the seventh image should be the third image", 
		dojo.byId(thirdImageId), itemInfo.item);
	assertFalse("no wrap above seventh image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(lastImageId));
	assertEquals("the item above the last image should be the tenth image", 
		dojo.byId(tenthImageId), itemInfo.item);
	assertFalse("no wrap above tenth image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(firstImageId));
	assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
		dojo.byId(secondLastImageId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(secondImageId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastImageId), itemInfo.item);
	assertTrue("wrap above second image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(thirdImageId));
	assertEquals("the item above the third image should be the fourth last image", 
		dojo.byId(fourthLastImageId), itemInfo.item);
	assertTrue("wrap above third image", itemInfo.hasWrapped);
	
	itemInfo = gridHandler.getItemAbove(dojo.byId(fourthImageId));
	assertEquals("the item above the fourth image should be the third last image", 
		dojo.byId(thirdLastImageId), itemInfo.item);
	assertTrue("wrap above fourth image", itemInfo.hasWrapped);

	// Test with grid size 3
	gridHandler.numOfColumnsInGrid = 3;
	
	itemInfo = gridHandler.getItemAbove(dojo.byId(fifthImageId));
	assertEquals("the item above the fifth image should be the second image", 
		dojo.byId(secondImageId), itemInfo.item);
	assertFalse("no wrap above fifth image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(firstImageId));
	assertEquals("the item above the first image should be the second last image", 
		dojo.byId(secondLastImageId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler.getItemAbove(dojo.byId(secondImageId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastImageId), itemInfo.item );
	assertTrue("wrap above second image", itemInfo.hasWrapped);
		
	itemInfo = gridHandler.getItemAbove(dojo.byId(thirdImageId));
	assertEquals("the item above the third image should be the third last image", 
		dojo.byId(thirdLastImageId), itemInfo.item);
	assertTrue("no wrap above third image", itemInfo.hasWrapped);
		
	
}

function testUpdateGrideWidth() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setGrid(imageList);
	var oldNumCols = gridHandler.numOfColumnsInGrid;

	// change the width
	dojo.removeClass(dojo.byId(lightboxParentId), "full-width");
	dojo.addClass(dojo.byId(lightboxParentId), "half-width");
	gridHandler.updateGridWidth();
	assertEquals("after resize, the grid width should be "+oldNumCols/2, oldNumCols/2, gridHandler.numOfColumnsInGrid);

	// change it back
	dojo.removeClass(dojo.byId(lightboxParentId), "half-width");
	dojo.addClass(dojo.byId(lightboxParentId), "full-width");
	gridHandler.updateGridWidth()
	assertEquals("after resize, the grid width should be "+oldNumCols, oldNumCols, gridHandler.numOfColumnsInGrid);
}