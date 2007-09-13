// All the test function names for the JsUnit tests.  Needed for running JsUnit in 
// IE and Safari.
//
function exposeTestFunctionNames() {
    return [
        // ListLayoutHandlerTests.js
        "testGetRightSibling",
        "testGetLeftSibling",
        "testGetItemBelow",
        "testGetItemAbove"]
}

function testGetRightSibling() {
	var listHandler = new fluid.ListLayoutHandler();
	var list = dojo.byId("list2");
	listHandler.setReorderableContainer(list);

	var rightSibling = listHandler.getRightSibling(dojo.byId("list2item1"));
	assertEquals("The item to the right of the first item should be the second item", 
		dojo.byId("list2item2"), rightSibling);

	rightSibling = listHandler.getRightSibling(dojo.byId("list2item3"));
	assertEquals("The item to the right of the third item should be the fourth item", 
		dojo.byId("list2item4"), rightSibling);

	rightSibling = listHandler.getRightSibling(dojo.byId("list2item5"));
	assertEquals("The item to the right of the last item should be the first item", 
		dojo.byId("list2item1"), rightSibling);
	
	// TODO: write this test
	// "When a non-orderable is passed to getRightSibling the first orderable should be returned.", 

}

function testGetLeftSibling() {
	var listHandler = new fluid.ListLayoutHandler();
	var list = dojo.byId("list2");
	listHandler.setReorderableContainer(list);

	var leftSibling = listHandler.getLeftSibling(dojo.byId("list2item2"));
	assertEquals("The item to the left of the second item should be the first item", 
		dojo.byId("list2item1"), leftSibling);

	leftSibling = listHandler.getLeftSibling(dojo.byId("list2item5"));
	assertEquals("The item to the left of the last item should be the fourth item", 
		dojo.byId("list2item4"), leftSibling);

	leftSibling = listHandler.getLeftSibling(dojo.byId("list2item1"));
	assertEquals("The item to the left of the first item should be the last item", 
		dojo.byId("list2item5"), leftSibling);

	// TODO: write this test
	//"When a non-orderable is passed to getLeftSibling the first orderable should be returned.", 

}

function testGetItemBelow() {
	var listHandler = new fluid.ListLayoutHandler();
	var list = dojo.byId("list2");
	listHandler.setReorderableContainer(list);

	var itemBelow = listHandler.getItemBelow(dojo.byId("list2item1"));
	assertEquals("The item to the right of the first item should be the second item", 
		dojo.byId("list2item2"), itemBelow);

	itemBelow = listHandler.getItemBelow(dojo.byId("list2item3"));
	assertEquals("The item to the right of the third item should be the fourth item", 
		dojo.byId("list2item4"), itemBelow);

	itemBelow = listHandler.getItemBelow(dojo.byId("list2item5"));
	assertEquals("The item to the right of the last item should be the first item", 
		dojo.byId("list2item1"), itemBelow);
	
	// TODO: write this test
	// "When a non-orderable is passed to getItemBelow the first orderable should be returned.", 

}

function testGetItemAbove() {
	var listHandler = new fluid.ListLayoutHandler();
	var list = dojo.byId("list2");
	listHandler.setReorderableContainer(list);

	var itemAbove = listHandler.getItemAbove(dojo.byId("list2item2"));
	assertEquals("The item to the left of the second item should be the first item", 
		dojo.byId("list2item1"), itemAbove);

	itemAbove = listHandler.getItemAbove(dojo.byId("list2item5"));
	assertEquals("The item to the left of the last item should be the fourth item", 
		dojo.byId("list2item4"), itemAbove);

	itemAbove = listHandler.getItemAbove(dojo.byId("list2item1"));
	assertEquals("The item to the left of the first item should be the last item", 
		dojo.byId("list2item5"), itemAbove);

	// TODO: write this test
	//"When a non-orderable is passed to getItemAbove the first orderable should be returned.", 

}

// TODO: write movement tests