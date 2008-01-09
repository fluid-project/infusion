/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

function testGetRightSibling() {
	var rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(firstItemId));
	assertEquals("The item to the right of the first item should be the second item", 
		fluid.testUtils.byId(secondItemId), rightSibling);
		
	rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(thirdItemId));
	assertEquals("The item to the right of the third item should be the fourth item", 
		fluid.testUtils.byId(fourthItemId), rightSibling);
}

function testGetRightSiblingWrap() {
	var rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(lastItemId));
	assertEquals("The item to the right of the last item should be the first item", 
		fluid.testUtils.byId(firstItemId), rightSibling);	
}

function testGetLeftSibling() {
	var leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(secondItemId));
	assertEquals("The item to the left of the second item should be the first item", 
		fluid.testUtils.byId(firstItemId), leftSibling);

	leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(lastItemId));
	assertEquals("The item to the left of the last item should be the fourth item", 
		fluid.testUtils.byId(fourthItemId), leftSibling);
}

function testGetLeftSiblingWrap() {
	leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(firstItemId));
	assertEquals("The item to the left of the first item should be the last item", 
		fluid.testUtils.byId(lastItemId), leftSibling);
}

function testGetItemBelow() {
	var itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(firstItemId));
	assertEquals("The item to the right of the first item should be the second item", 
		fluid.testUtils.byId(secondItemId), itemBelow);

	itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(thirdItemId));
	assertEquals("The item to the right of the third item should be the fourth item", 
		fluid.testUtils.byId(fourthItemId), itemBelow);
}

function testGetItemBelowWrap() {
	itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(lastItemId));
	assertEquals("The item to the right of the last item should be the first item", 
		fluid.testUtils.byId(firstItemId), itemBelow);	
}

function testGetItemAbove() {
	var itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(secondItemId));
	assertEquals("The item to the left of the second item should be the first item", 
		fluid.testUtils.byId(firstItemId), itemAbove);

	itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(lastItemId));
	assertEquals("The item to the left of the last item should be the fourth item", 
		fluid.testUtils.byId(fourthItemId), itemAbove);
}

function testGetItemAboveWrap() {
	itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(firstItemId));
	assertEquals("The item to the left of the first item should be the last item", 
		fluid.testUtils.byId(lastItemId), itemAbove);
}

function testNextItemForNonOrderableReturnsTheFirstItem() {
    var rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getRightSibling the first orderable should be returned.", 
        fluid.testUtils.byId(firstItemId), rightSibling);  
        
    var leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getLeftSibling the first orderable should be returned.", 
        fluid.testUtils.byId(firstItemId), leftSibling);

    var itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getItemBelow the first orderable should be returned", 
        fluid.testUtils.byId(firstItemId), itemBelow);

    var itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getItemAbove the first orderable should be returned.", 
        fluid.testUtils.byId(firstItemId), itemAbove);
        
}

// TODO: expand the movement test 
function testMovement() {
    var listItems = jQuery("li", jQuery("#list1"));
    
    assertEquals("Before moving anything, expect first is first", firstItemId, listItems[0].id);
    assertEquals("Before moving anything, expect second is second", secondItemId, listItems[1].id);
    assertEquals("Before moving anything, expect third is third", thirdItemId, listItems[2].id);
    assertEquals("Before moving anything, expect fourth is fourth", fourthItemId, listItems[3].id);
    assertEquals("Before moving anything, expect last is last", lastItemId, listItems[4].id);

    listHandler1.moveItemDown(listItems[0]);
    
    var listItemsAfterMove = jQuery("li", jQuery("#list1"));
    
    assertEquals("After, expect second is first", secondItemId, listItemsAfterMove[0].id);
    assertEquals("After, expect first is second", firstItemId, listItemsAfterMove[1].id);
    assertEquals("After, expect third is third", thirdItemId, listItemsAfterMove[2].id);
    assertEquals("After, expect fourth is fourth", fourthItemId, listItemsAfterMove[3].id);
    assertEquals("After, expect last is last", lastItemId, listItemsAfterMove[4].id);

}

