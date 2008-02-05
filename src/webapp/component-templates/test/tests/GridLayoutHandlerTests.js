/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */


function testGetItemBelow() {
    var gridHandler = createGridLayoutHandler ();
    
    var item = gridHandler.getItemBelow(fluid.testUtils.byId(firstReorderableId));
    assertEquals("Since there are 3 colums in the grid, the item below the first image should be the fourth image", 
        fluid.testUtils.byId(fourthReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(thirdReorderableId));
    assertEquals("the item below the third image should be the sixth image", 
        fluid.testUtils.byId(sixthReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(thirdImageId));
    assertEquals("When a non-orderable is passed to getItemBelow the first orderable should be returned.", 
        firstReorderableId, item.id);
}

function testGetItemBelowWrapped() {
    var gridHandler = createGridLayoutHandler ();

    var item = gridHandler.getItemBelow(fluid.testUtils.byId(thirdLastReorderableId));
    assertEquals("the item below the third last image should be the third image", 
        fluid.testUtils.byId(thirdReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(secondLastReorderableId));
    assertEquals("the item below the second last image should be the first image", 
        fluid.testUtils.byId(firstReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(lastReorderableId));
    assertEquals("the item below the last image should be the second image", 
        fluid.testUtils.byId(secondReorderableId), item);
}

function testGetItemBelowOneRow() {
    var container = jQuery ("[id=" + lightboxRootId + "]");
    var gridHandler = createGridLayoutHandler ();
    container.addClass ("width-all-thumb");
    
    var item = gridHandler.getItemBelow(fluid.testUtils.byId(firstReorderableId));
    assertEquals("Since there is only 1 row, the item below the first image should be itself", 
        fluid.testUtils.byId(firstReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(thirdReorderableId));
    assertEquals("Since there is only 1 row, the item below the third image should be itself", 
        fluid.testUtils.byId(thirdReorderableId), item);

    item = gridHandler.getItemBelow(fluid.testUtils.byId(lastReorderableId));
    assertEquals("Since there is only 1 row, the item below the last image should be itself", 
        fluid.testUtils.byId(lastReorderableId), item);
    
}
function testGetItemAbove() {
	var container = jQuery ("[id=" + lightboxRootId + "]");
    var gridHandler = createGridLayoutHandler ();
	container.removeClass ("width-3-thumb");
	container.addClass ("width-4-thumb");
		
	var item = gridHandler.getItemAbove(fluid.testUtils.byId(seventhReorderableId));
	assertEquals("the item above the seventh image should be the third image", 
		fluid.testUtils.byId(thirdReorderableId), item);

	item = gridHandler.getItemAbove(fluid.testUtils.byId(lastReorderableId));
	assertEquals("the item above the last image should be the tenth image", 
		fluid.testUtils.byId(tenthReorderableId), item);

	item = gridHandler.getItemAbove(fluid.testUtils.byId(thirdImageId));
	assertEquals("When a non-orderable is passed to getItemAbove the first orderable should be returned.", 
		firstReorderableId, item.id);

	// Test with grid size 3
	container.removeClass ("width-4-thumb");
	container.addClass ("width-3-thumb");
	
	item = gridHandler.getItemAbove(fluid.testUtils.byId(fifthReorderableId));
	assertEquals("the item above the fifth image should be the second image", 
		fluid.testUtils.byId(secondReorderableId), item);

	item = gridHandler.getItemAbove(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("the item above the third image should be the third last image", 
		fluid.testUtils.byId(thirdLastReorderableId), item);
			
}

function testGetItemAboveWrapped() {
    var container = jQuery ("[id=" + lightboxRootId + "]");
    var gridHandler = createGridLayoutHandler ();
    container.removeClass ("width-3-thumb");
    container.addClass ("width-4-thumb");

    var item = gridHandler.getItemAbove(fluid.testUtils.byId(firstReorderableId));
    assertEquals("Since there are 4 colums in the grid, the item above the first image should be the second last image", 
        fluid.testUtils.byId(secondLastReorderableId), item);

    item = gridHandler.getItemAbove(fluid.testUtils.byId(secondReorderableId));
    assertEquals("the item above the second image should be the last image", 
        fluid.testUtils.byId(lastReorderableId), item);

    item = gridHandler.getItemAbove(fluid.testUtils.byId(thirdReorderableId));
    assertEquals("the item above the third image should be the fourth last image", 
        fluid.testUtils.byId(fourthLastReorderableId), item);
    
    item = gridHandler.getItemAbove(fluid.testUtils.byId(fourthReorderableId));
    assertEquals("the item above the fourth image should be the third last image", 
        fluid.testUtils.byId(thirdLastReorderableId), item);

    // Test with grid size 3
    container.removeClass ("width-4-thumb");
    container.addClass ("width-3-thumb");
    
    item = gridHandler.getItemAbove(fluid.testUtils.byId(firstReorderableId));
    assertEquals("the item above the first image should be the second last image", 
        fluid.testUtils.byId(secondLastReorderableId), item);

    item = gridHandler.getItemAbove(fluid.testUtils.byId(secondReorderableId));
    assertEquals("the item above the second image should be the last image", 
        fluid.testUtils.byId(lastReorderableId), item );
        
}

function testGetItemAboveOneRow() {
	var container = jQuery ("[id=" + lightboxRootId + "]");
    var gridHandler = createGridLayoutHandler ();
	container.addClass ("width-all-thumb");
	
	var item = gridHandler.getItemAbove(fluid.testUtils.byId(firstReorderableId));
	assertEquals("Since there is only 1 row, the item above the first image should be itself", 
		fluid.testUtils.byId(firstReorderableId), item);

	item = gridHandler.getItemAbove(fluid.testUtils.byId(thirdReorderableId));
	assertEquals("Since there is only 1 row, the item above the third image should be itself", 
		fluid.testUtils.byId(thirdReorderableId), item);

	item = gridHandler.getItemAbove(fluid.testUtils.byId(lastReorderableId));
	assertEquals("Since there is only 1 row, the item above the last image should be itself", 
		fluid.testUtils.byId(lastReorderableId), item);
	
}
