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
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var rightSibling = gridHandler._getRightSiblingInfo(dojo.byId(firstReorderableId));
	assertEquals("The item to the right of the first image should be the second image", 
		dojo.byId(secondReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the first image", rightSibling.hasWrapped);

	rightSibling = gridHandler._getRightSiblingInfo(dojo.byId(thirdReorderableId));
	assertEquals("The item to the right of the third image should be the fourth image", 
		dojo.byId(fourthReorderableId), rightSibling.item);
	assertFalse("No wrap to the right of the third image", rightSibling.hasWrapped);

	rightSibling = gridHandler._getRightSiblingInfo(dojo.byId(lastReorderableId));
	assertEquals("The item to the right of the last image should be the first image", 
		dojo.byId(firstReorderableId), rightSibling.item);
	assertTrue("Wrap to the right of the last image", rightSibling.hasWrapped);	
	
	rightSibling = gridHandler._getRightSiblingInfo(dojo.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to getRightSiblingInfo the first orderable should be returned.", 
		firstReorderableId, rightSibling.item.id);
	assertFalse("No wrap when non-reorderable is passed in.", rightSibling.hasWrapped);	
}

function testGetLeftSiblingInfo() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);

	var leftSibling = gridHandler._getLeftSiblingInfo(dojo.byId(fourthReorderableId));
	assertEquals("The item to the left of the fourth image should be the third image", 
		dojo.byId(thirdReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the fourth image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(dojo.byId(lastReorderableId));
	assertEquals("The item to the left of the last image should be the second last image", 
		dojo.byId(secondLastReorderableId), leftSibling.item);
	assertFalse("No wrap to the left of the last image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(dojo.byId(firstReorderableId));
	assertEquals("The item to the left of the first image should be the last image", 
		dojo.byId(lastReorderableId), leftSibling.item);
	assertTrue("Wrap to the left of the first image", leftSibling.hasWrapped);

	leftSibling = gridHandler._getLeftSiblingInfo(dojo.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to getLeftSiblingInfo the first orderable should be returned.", 
		firstReorderableId, leftSibling.item.id);
	assertFalse("No wrap when non-reorderable is passed in.", leftSibling.hasWrapped);	

}

function testGetItemInfoBelow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	
	var itemInfo = gridHandler._getItemInfoBelow(dojo.byId(firstReorderableId));
	assertEquals("Since there are 3 colums in the grid, the item below the first image should be the fourth image", 
		dojo.byId(fourthReorderableId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(thirdReorderableId));
	assertEquals("the item below the third image should be the sixth image", 
		dojo.byId(sixthReorderableId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(thirdLastReorderableId));
	assertEquals("the item below the third last image should be the third image", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertTrue("wrap below third last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(secondLastReorderableId));
	assertEquals("the item below the second last image should be the first image", 
		dojo.byId(firstReorderableId), itemInfo.item);
	assertTrue("wrap below second last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(lastReorderableId));
	assertEquals("the item below the last image should be the second image", 
		dojo.byId(secondReorderableId), itemInfo.item);
	assertTrue("wrap below last image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to _getItemInfoBelow the first orderable should be returned.", 
		firstReorderableId, itemInfo.item.id);
	assertFalse("No wrap when non-reorderable is passed in.", itemInfo.hasWrapped);	

}

function testGetItemInfoAbove() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	dojo.removeClass(dojo.byId(lightboxRootId), "width-3-thumb");
	dojo.addClass(dojo.byId(lightboxRootId), "width-4-thumb");
		
	var itemInfo = gridHandler._getItemInfoAbove(dojo.byId(seventhReorderableId));
	assertEquals("the item above the seventh image should be the third image", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertFalse("no wrap above seventh image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(lastReorderableId));
	assertEquals("the item above the last image should be the tenth image", 
		dojo.byId(tenthReorderableId), itemInfo.item);
	assertFalse("no wrap above tenth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(firstReorderableId));
	assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
		dojo.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastReorderableId), itemInfo.item);
	assertTrue("wrap above second image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the fourth last image", 
		dojo.byId(fourthLastReorderableId), itemInfo.item);
	assertTrue("wrap above third image", itemInfo.hasWrapped);
	
	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(fourthReorderableId));
	assertEquals("the item above the fourth image should be the third last image", 
		dojo.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("wrap above fourth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to _getItemInfoAbove the first orderable should be returned.", 
		firstReorderableId, itemInfo.item.id);
	assertFalse("No wrap when non-reorderable is passed in.", itemInfo.hasWrapped);	

	// Test with grid size 3
	dojo.removeClass(dojo.byId(lightboxRootId), "width-4-thumb");
	dojo.addClass(dojo.byId(lightboxRootId), "width-3-thumb");
	
	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(fifthReorderableId));
	assertEquals("the item above the fifth image should be the second image", 
		dojo.byId(secondReorderableId), itemInfo.item);
	assertFalse("no wrap above fifth image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(firstReorderableId));
	assertEquals("the item above the first image should be the second last image", 
		dojo.byId(secondLastReorderableId), itemInfo.item);
	assertTrue("wrap above first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(secondReorderableId));
	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastReorderableId), itemInfo.item );
	assertTrue("wrap above second image", itemInfo.hasWrapped);
		
	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the third last image", 
		dojo.byId(thirdLastReorderableId), itemInfo.item);
	assertTrue("no wrap above third image", itemInfo.hasWrapped);
			
}

function testGetItemInfoBelowOneRow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	dojo.addClass(dojo.byId(lightboxRootId), "width-all-thumb");
	
	var itemInfo = gridHandler._getItemInfoBelow(dojo.byId(firstReorderableId));
	assertEquals("Since there is only 1 row, the item below the first image should be itself", 
		dojo.byId(firstReorderableId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(thirdReorderableId));
	assertEquals("Since there is only 1 row, the item below the third image should be itself", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoBelow(dojo.byId(lastReorderableId));
	assertEquals("Since there is only 1 row, the item below the last image should be itself", 
		dojo.byId(lastReorderableId), itemInfo.item);
	assertFalse("no wrap below last image", itemInfo.hasWrapped);
	
}

function testGetItemInfoAboveOneRow() {
	var gridHandler = new fluid.GridLayoutHandler(findOrderableByDivAndId);
	var imageList = dojo.byId(lightboxRootId);
	gridHandler.setReorderableContainer(imageList);
	dojo.addClass(dojo.byId(lightboxRootId), "width-all-thumb");
	
	var itemInfo = gridHandler._getItemInfoAbove(dojo.byId(firstReorderableId));
	assertEquals("Since there is only 1 row, the item above the first image should be itself", 
		dojo.byId(firstReorderableId), itemInfo.item);
	assertFalse("no wrap below first image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(thirdReorderableId));
	assertEquals("Since there is only 1 row, the item above the third image should be itself", 
		dojo.byId(thirdReorderableId), itemInfo.item);
	assertFalse("no wrap below third image", itemInfo.hasWrapped);

	itemInfo = gridHandler._getItemInfoAbove(dojo.byId(lastReorderableId));
	assertEquals("Since there is only 1 row, the item above the last image should be itself", 
		dojo.byId(lastReorderableId), itemInfo.item);
	assertFalse("no wrap below last image", itemInfo.hasWrapped);
	
}
