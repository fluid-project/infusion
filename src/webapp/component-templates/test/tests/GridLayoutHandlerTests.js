var numOfImages = 14;
var firstImageId = "gallery:::gallery-thumbs:::lightbox-cell::0:";
var secondImageId = "gallery:::gallery-thumbs:::lightbox-cell::1:";
var thirdImageId = "gallery:::gallery-thumbs:::lightbox-cell::2:";
var fourthImageId = "gallery:::gallery-thumbs:::lightbox-cell::3:";
var fifthImageId = "gallery:::gallery-thumbs:::lightbox-cell::4:";
var seventhImageId = "gallery:::gallery-thumbs:::lightbox-cell::6:";
var tenthImageId = "gallery:::gallery-thumbs:::lightbox-cell::9:";
var fourthLastImageId = "gallery:::gallery-thumbs:::lightbox-cell::10:";
var thirdLastImageId = "gallery:::gallery-thumbs:::lightbox-cell::11:";
var secondLastImageId = "gallery:::gallery-thumbs:::lightbox-cell::12:";
var lastImageId = "gallery:::gallery-thumbs:::lightbox-cell::13:";

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
	gridHandler.numOfColumnsInGrid = 4;
	
	assertEquals("Since there are 4 colums in the grid, the item below the first image should be the fifth image", 
		dojo.byId(fifthImageId), gridHandler.getItemBelow(dojo.byId(firstImageId)));

	assertEquals("the item below the third image should be the seventh image", 
		dojo.byId(seventhImageId), gridHandler.getItemBelow(dojo.byId(thirdImageId)));

	assertEquals("the item below the third last image should be the fourth image", 
		dojo.byId(fourthImageId), gridHandler.getItemBelow(dojo.byId(thirdLastImageId)));

	assertEquals("the item below the second last image should be the first image", 
		dojo.byId(firstImageId), gridHandler.getItemBelow(dojo.byId(secondLastImageId)));

	assertEquals("the item below the last image should be the second image", 
		dojo.byId(secondImageId), gridHandler.getItemBelow(dojo.byId(lastImageId)));
}

function testGetItemAbove() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId("gallery:::gallery-thumbs:::");
	gridHandler.setGrid(imageList);
	gridHandler.numOfColumnsInGrid = 4;
	
	assertEquals("the item above the seventh image should be the third image", 
		dojo.byId(thirdImageId), gridHandler.getItemAbove(dojo.byId(seventhImageId)));

	assertEquals("the item above the last image should be the tenth image", 
		dojo.byId(tenthImageId), gridHandler.getItemAbove(dojo.byId(lastImageId)));

	assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
		dojo.byId(secondLastImageId), gridHandler.getItemAbove(dojo.byId(firstImageId)));

	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastImageId), gridHandler.getItemAbove(dojo.byId(secondImageId)));

	assertEquals("the item above the third image should be the fourth last image", 
		dojo.byId(fourthLastImageId), gridHandler.getItemAbove(dojo.byId(thirdImageId)));
	
	assertEquals("the item above the fourth image should be the third last image", 
		dojo.byId(thirdLastImageId), gridHandler.getItemAbove(dojo.byId(fourthImageId)));

	// Test with grid size 3
	gridHandler.numOfColumnsInGrid = 3;
	
	assertEquals("the item above the fifth image should be the second image", 
		dojo.byId(secondImageId), gridHandler.getItemAbove(dojo.byId(fifthImageId)));

	assertEquals("the item above the first image should be the second last image", 
		dojo.byId(secondLastImageId), gridHandler.getItemAbove(dojo.byId(firstImageId)));

	assertEquals("the item above the second image should be the last image", 
		dojo.byId(lastImageId), gridHandler.getItemAbove(dojo.byId(secondImageId)));
		
	assertEquals("the item above the third image should be the third last image", 
		dojo.byId(thirdLastImageId), gridHandler.getItemAbove(dojo.byId(thirdImageId)));

		
	
}