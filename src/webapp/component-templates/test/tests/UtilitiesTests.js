
function testRemoveNonElementNodes() {
	var utilities = new Utilities();
	
	var testNode = dojo.body();
	
	var elementNodeCount = 0;
	var otherNodeCount = 0;
	for (i=0;i<testNode.childNodes.length; i++) {
		if (testNode.childNodes[i].nodeType == 1) {
			elementNodeCount++;
		} else {
			otherNodeCount++;
		}
	}
	assertEquals("before removing whitespace, we should have 3 elements", 3, elementNodeCount);
	assertEquals("before removing whitespace, we should have 8 non-elements", 8, otherNodeCount);
	
	utilities.removeNonElementNodes(testNode);

	elementNodeCount = 0;
	otherNodeCount = 0;
	for (i=0;i<testNode.childNodes.length; i++) {
		if (testNode.childNodes[i].nodeType == 1) {
			elementNodeCount++;
		} else {
			otherNodeCount++;
		}
	}
	assertEquals("after removing whitespace, we should have 3 elements", 3, elementNodeCount);
	assertEquals("after removing whitespace, we should have 0 non-elements", 0, otherNodeCount);
	
}
