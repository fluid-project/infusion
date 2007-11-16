/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

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

function testNextItemForNonOrderableReturnsTheFirstItem() {
    var rightSibling = listHandler1.getRightSibling(dojo.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getRightSibling the first orderable should be returned.", 
        dojo.byId(firstItemId), rightSibling);  
        
    var leftSibling = listHandler1.getLeftSibling(dojo.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getLeftSibling the first orderable should be returned.", 
        dojo.byId(firstItemId), leftSibling);

    var itemBelow = listHandler1.getItemBelow(dojo.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getItemBelow the first orderable should be returned", 
        dojo.byId(firstItemId), itemBelow);

    var itemAbove = listHandler1.getItemAbove(dojo.byId(nonOrderabeItemId));
    assertEquals("When a non-orderable is passed to getItemAbove the first orderable should be returned.", 
        dojo.byId(firstItemId), itemAbove);
        
}

// TODO: expand the movement test 
function testMovement() {
    var theList = dojo.byId("list1");
    	
    listItems = theList.getElementsByTagName("li");
    
    assertEquals("Before moving anything, expect first is first", firstItemId, listItems[0].id);
    assertEquals("Before moving anything, expect second is second", secondItemId, listItems[1].id);
    assertEquals("Before moving anything, expect third is third", thirdItemId, listItems[2].id);
    assertEquals("Before moving anything, expect fourth is fourth", fourthItemId, listItems[3].id);
    assertEquals("Before moving anything, expect last is last", lastItemId, listItems[4].id);

    listHandler1.moveItemDown(listItems[0]);
    
    listItemsAfterMove = theList.getElementsByTagName("li");
    
    assertEquals("After, expect second is first", secondItemId, listItemsAfterMove[0].id);
    assertEquals("After, expect first is second", firstItemId, listItemsAfterMove[1].id);
    assertEquals("After, expect third is third", thirdItemId, listItemsAfterMove[2].id);
    assertEquals("After, expect fourth is fourth", fourthItemId, listItemsAfterMove[3].id);
    assertEquals("After, expect last is last", lastItemId, listItemsAfterMove[4].id);

}

