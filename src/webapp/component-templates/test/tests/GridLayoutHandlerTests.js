var numOfImages = 14;
var firstImageId = "gallery:::gallery-thumbs:::lightbox-cell::0:";
var secondImageId = "gallery:::gallery-thumbs:::lightbox-cell::1:";
var fifthImageId = "gallery:::gallery-thumbs:::lightbox-cell::4:";
var secondLastImageId = "gallery:::gallery-thumbs:::lightbox-cell::12:";
var lastImageId = "gallery:::gallery-thumbs:::lightbox-cell::13:";


function testGetItemBelow() {
	var gridHandler = new GridLayoutHandler();
	var imageList = dojo.byId("gallery:::gallery-thumbs:::");
	gridHandler.setGrid(imageList);
	gridHandler.numOfColumnsInGrid = 4;
	
	assertEquals("Since there are 4 colums in the grid, the item below the first image should be the fifth image", 
		dojo.byId(fifthImageId), gridHandler.getItemBelow(dojo.byId(firstImageId)));

	assertEquals("the item below the last image should be the second image", 
		dojo.byId(secondImageId), gridHandler.getItemBelow(dojo.byId(lastImageId)));
}