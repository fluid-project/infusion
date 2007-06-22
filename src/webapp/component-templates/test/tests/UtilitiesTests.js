
function testRemoveNonElementNodes() {

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
	assertEquals("before removing whitespace, we should have 4 elements", 4, elementNodeCount);
	assertEquals("before removing whitespace, we should have 6 non-elements", 6, otherNodeCount);
	
	FluidProject.Utilities.removeNonElementNodes(testNode);

	elementNodeCount = 0;
	otherNodeCount = 0;
	for (i=0;i<testNode.childNodes.length; i++) {
		if (testNode.childNodes[i].nodeType == 1) {
			elementNodeCount++;
		} else {
			otherNodeCount++;
		}
	}
	assertEquals("after removing whitespace, we should have 4 elements", 4, elementNodeCount);
	assertEquals("after removing whitespace, we should have 0 non-elements", 0, otherNodeCount);
	
}
