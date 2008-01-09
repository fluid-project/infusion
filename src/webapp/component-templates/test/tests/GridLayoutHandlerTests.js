/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

function testGetRightSiblingInfo() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = fluid.testUtils.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var rightSibling = gridHandler._getRightSiblingInfo(fluid.testUtils.byId(firstReorderableId));
	assertEquals("The item to the right of the first image should be the second image", 
		fluid.testUtils.byId(secondReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the first image", rightSibling.hasWrapped);

	rightSibling = gridHandler._getRightSiblingInfo(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("The item to the right of the third image should be the fourth image", 
		fluid.testUtils.byId(fourthReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the third image", rightSibling.hasWrapped);

	rightSibling = gridHandler._getRightSiblingInfo(fluid.testUtils.byId(lastReorderableId));
	assertEquals("The item to the right of the last image should be the first image", 
		fluid.testUtils.byId(firstReorderableId), rightSibling.item);
	assertTrue("Wrap to the right of the last image", rightSibling.hasWrapped);	
	
	rightSibling = gridHandler._getRightSiblingInfo(fluid.testUtils.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to getRightSiblingInfo the first orderable should be returned.", 
		firstReorderableId, rightSibling.item.id);
}

function testGetLeftSiblingInfo() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = fluid.testUtils.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var leftSibling = gridHandler._getLeftSiblingInfo(fluid.testUtils.byId(fourthReorderableId));
	assertEquals("The item to the left of the fourth image should be the third image", 
		fluid.testUtils.byId(thirdReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the fourth image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(fluid.testUtils.byId(lastReorderableId));
	assertEquals("The item to the left of the last image should be the second last image", 
		fluid.testUtils.byId(secondLastReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the last image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(fluid.testUtils.byId(firstReorderableId));
	assertEquals("The item to the left of the first image should be the last image", 
		fluid.testUtils.byId(lastReorderableId), leftSibling.item);
	assertTrue("Wrap to the left of the first image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(fluid.testUtils.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to getLeftSiblingInfo the first orderable should be returned.", 
		firstReorderableId, leftSibling.item.id);
	assertFalse("No wrap when non-reorderable is passed in.", leftSibling.hasWrapped);	

}

function testGetItemInfoBelow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = fluid.testUtils.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	
	var itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(firstReorderableId));
	assertEquals("Since there are 3 colums in the grid, the item below the first image should be the fourth image", 
		fluid.testUtils.byId(fourthReorderableId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("the item below the third image should be the sixth image", 
		fluid.testUtils.byId(sixthReorderableId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(thirdLastReorderableId));
	assertEquals("the item below the third last image should be the third image", 
		fluid.testUtils.byId(thirdReorderableId), itemInfo.item);
	assertTrue("wrap below third last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(secondLastReorderableId));
	assertEquals("the item below the second last image should be the first image", 
		fluid.testUtils.byId(firstReorderableId), itemInfo.item);
	assertTrue("wrap below second last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(lastReorderableId));
	assertEquals("the item below the last image should be the second image", 
		fluid.testUtils.byId(secondReorderableId), itemInfo.item);
	assertTrue("wrap below last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to _getItemInfoBelow the first orderable should be returned.", 
		firstReorderableId, itemInfo.item.id);

}

function testGetItemInfoAbove() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = jQuery ("[id=" + lightboxRootId + "]");
	gridHandler.setReorderableContainer(imageList);
	imageList.removeClass ("width-3-thumb");
	imageList.addClass ("width-4-thumb");
		
	var itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(seventhReorderableId));
	assertEquals("the item above the seventh image should be the third image", 
		fluid.testUtils.byId(thirdReorderableId), itemInfo.item);
	assertFalse("no wrap above seventh image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(lastReorderableId));
	assertEquals("the item above the last image should be the tenth image", 
		fluid.testUtils.byId(tenthReorderableId), itemInfo.item);
	assertFalse("no wrap above tenth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(firstReorderableId));
	assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
		fluid.testUtils.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		fluid.testUtils.byId(lastReorderableId), itemInfo.item);
	assertTrue("wrap above second image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the fourth last image", 
		fluid.testUtils.byId(fourthLastReorderableId), itemInfo.item);
	assertTrue("wrap above third image", itemInfo.hasWrapped);
	
	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(fourthReorderableId));
	assertEquals("the item above the fourth image should be the third last image", 
		fluid.testUtils.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("wrap above fourth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to _getItemInfoAbove the first orderable should be returned.", 
		firstReorderableId, itemInfo.item.id);

	// Test with grid size 3
	imageList.removeClass ("width-4-thumb");
	imageList.addClass ("width-3-thumb");
	
	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(fifthReorderableId));
	assertEquals("the item above the fifth image should be the second image", 
		fluid.testUtils.byId(secondReorderableId), itemInfo.item);
	assertFalse("no wrap above fifth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(firstReorderableId));
	assertEquals("the item above the first image should be the second last image", 
		fluid.testUtils.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		fluid.testUtils.byId(lastReorderableId), itemInfo.item );
	assertTrue("wrap above second image", itemInfo.hasWrapped);
		
	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the third last image", 
		fluid.testUtils.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("no wrap above third image", itemInfo.hasWrapped);
			
}

function testGetItemInfoBelowOneRow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
    var imageList = jQuery ("[id=" + lightboxRootId + "]");
	gridHandler.setReorderableContainer(imageList);
	imageList.addClass ("width-all-thumb");
	
	var itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(firstReorderableId));
	assertEquals("Since there is only 1 row, the item below the first image should be itself", 
		fluid.testUtils.byId(firstReorderableId), itemInfo.item);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("Since there is only 1 row, the item below the third image should be itself", 
		fluid.testUtils.byId(thirdReorderableId), itemInfo.item);

	itemInfo = gridHandler._getItemInfoBelow(fluid.testUtils.byId(lastReorderableId));
	assertEquals("Since there is only 1 row, the item below the last image should be itself", 
		fluid.testUtils.byId(lastReorderableId), itemInfo.item);
	
}

function testGetItemInfoAboveOneRow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
    var imageList = jQuery ("[id=" + lightboxRootId + "]");
	gridHandler.setReorderableContainer(imageList);
	imageList.addClass ("width-all-thumb");
	
	var itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(firstReorderableId));
	assertEquals("Since there is only 1 row, the item above the first image should be itself", 
		fluid.testUtils.byId(firstReorderableId), itemInfo.item);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("Since there is only 1 row, the item above the third image should be itself", 
		fluid.testUtils.byId(thirdReorderableId), itemInfo.item);

	itemInfo = gridHandler._getItemInfoAbove(fluid.testUtils.byId(lastReorderableId));
	assertEquals("Since there is only 1 row, the item above the last image should be itself", 
		fluid.testUtils.byId(lastReorderableId), itemInfo.item);
	
}
