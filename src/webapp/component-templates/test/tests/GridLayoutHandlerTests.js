function testGetRightSiblingAndPosition() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId("gallery:::gallery-thumbs:::");
	gridHandler.setGrid(imageList);

	var nextSiblingAndPos = gridHandler.getRightSiblingAndPosition(dojo.byId(firstImageId))
	assertEquals("The item to the right of the first image should be the second image", 
		dojo.byId(secondImageId), nextSiblingAndPos.item);
	assertEquals("The position to the right of the first image should be after", 
		"after", nextSiblingAndPos.position);

	nextSiblingAndPos = gridHandler.getRightSiblingAndPosition(dojo.byId(thirdImageId))
	assertEquals("The item to the right of the third image should be the fourth image", 
		dojo.byId(fourthImageId), nextSiblingAndPos.item);
	assertEquals("The position to the right of the third image should be after", 
		"after", nextSiblingAndPos.position);

	nextSiblingAndPos = gridHandler.getRightSiblingAndPosition(dojo.byId(lastImageId))
	assertEquals("The item to the right of the last image should be the first image", 
		dojo.byId(firstImageId), nextSiblingAndPos.item);
	assertEquals("The position to the right of the first image should be before", 
		"before", nextSiblingAndPos.position);	
}

function testGetItemBelow() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId("gallery:::gallery-thumbs:::");
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
	var imageList = dojo.byId("gallery:::gallery-thumbs:::");
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