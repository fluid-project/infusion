/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

function isOriginalOrderTest(testStr, layoutObj) {
    assertEquals (testStr + ", Portlet1 should be 1st in column 1", portlet1id, layoutObj.columns[0].children[0]);
    assertEquals (testStr + ", Portlet2 should be 2nd in column 1", portlet2id, layoutObj.columns[0].children[1]);
    assertEquals (testStr + ", Portlet3 should be 3rd in column 1", portlet3id, layoutObj.columns[0].children[2]);
    assertEquals (testStr + ", Portlet4 should be 4th in column 1", portlet4id, layoutObj.columns[0].children[3]);
    assertEquals (testStr + ", Portlet5 should be 1st in column 2", portlet5id, layoutObj.columns[1].children[0]);
    assertEquals (testStr + ", Portlet6 should be 2nd in column 2", portlet6id, layoutObj.columns[1].children[1]);
    assertEquals (testStr + ", Portlet7 should be 1st in column 3", portlet7id, layoutObj.columns[2].children[0]);
    assertEquals (testStr + ", Portlet8 should be 2nd in column 3", portlet8id, layoutObj.columns[2].children[1]);
    assertEquals (testStr + ", Portlet9 should be 3rd in column 3", portlet9id, layoutObj.columns[2].children[2]);
    
}
 
function testCalcColumnAndItemIndex () {
    // Tests for column index:
    // Column 0
    assertEquals (portlet1id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet1id, demo.portal.layout).columnIndex);
    assertEquals (portlet2id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet2id, demo.portal.layout).columnIndex);
    assertEquals (portlet3id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet3id, demo.portal.layout).columnIndex);
    assertEquals (portlet4id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet4id, demo.portal.layout).columnIndex);
    
    // Column 1
    assertEquals (portlet5id + " should be in 2nd column", 1, fluid.portletLayout.calcColumnAndItemIndex (portlet5id, demo.portal.layout).columnIndex);
    assertEquals (portlet6id + " should be in 2nd column", 1, fluid.portletLayout.calcColumnAndItemIndex (portlet6id, demo.portal.layout).columnIndex);
    
    // Column 2
    assertEquals (portlet7id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (portlet7id, demo.portal.layout).columnIndex);
    assertEquals (portlet8id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (portlet8id, demo.portal.layout).columnIndex);
    assertEquals (portlet9id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (portlet9id, demo.portal.layout).columnIndex);
    
    // Not in any column.
    var item = jQuery (demo.portal.portalRootSelector);
    assertEquals (demo.portal.portalRootSelector + " should not be in any column", -1, fluid.portletLayout.calcColumnAndItemIndex (item.id, demo.portal.layout).columnIndex);
    
    // Tests for item index:    
    assertEquals ("portlet1 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet1id, demo.portal.layout).itemIndex);
    assertEquals ("portlet2 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (portlet2id, demo.portal.layout).itemIndex);
    assertEquals ("portlet3 (no column index provided) should have index 2", 2, fluid.portletLayout.calcColumnAndItemIndex (portlet3id, demo.portal.layout).itemIndex);
    assertEquals ("portlet4 (no column index provided) should have index 3", 3, fluid.portletLayout.calcColumnAndItemIndex (portlet4id, demo.portal.layout).itemIndex);
    assertEquals ("portlet5 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet5id, demo.portal.layout).itemIndex);
    assertEquals ("portlet6 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (portlet6id, demo.portal.layout).itemIndex);
    assertEquals ("portlet7 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (portlet7id, demo.portal.layout).itemIndex);
    assertEquals ("portlet8 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (portlet8id, demo.portal.layout).itemIndex);
    assertEquals ("portlet9 (no column index provided) should have index 2", 2, fluid.portletLayout.calcColumnAndItemIndex (portlet9id, demo.portal.layout).itemIndex);    
    
}   // end testCalcNextColumnIndex().
 
function testFindFirstOrderableSiblingInColumn () {
    var orderables = demo.portal.findMovables ();
    
    // Test for existing moveable portlets in the three columns.
    var portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (0, orderables, demo.portal.layout);
    assertEquals ("First orderable portlet in column 1 should be " + portlet3id, jQuery ("#" + portlet3id)[0], portlet);

    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (1, orderables, demo.portal.layout);
    assertEquals ("First orderable portlet in column 2 should be " + portlet6id, jQuery ("#" + portlet6id)[0], portlet);
    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (2, orderables, demo.portal.layout);
    assertEquals ("First orderable portlet in column 3 should be " + portlet7id, jQuery ("#" + portlet7id)[0], portlet);

    // Test for a non-existetnt column.
    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (4, orderables, demo.portal.layout);
    assertNull ("No column 4 -- no 'first orderable portlet'", portlet);
    
}   // end testFindFirstOrderableSiblingInColumn().

function testFindLinearIndex() {    
    var index = fluid.portletLayout.findLinearIndex (portlet1id, demo.portal.layout);
    assertEquals(0, index);

    index = fluid.portletLayout.findLinearIndex (portlet3id, demo.portal.layout);
    assertEquals(2, index);

    index = fluid.portletLayout.findLinearIndex (portlet9id, demo.portal.layout);
    assertEquals(8, index);
    
    index = fluid.portletLayout.findLinearIndex ("doesNotExist", demo.portal.layout);
    assertEquals(-1, index);
    
}

function testNumItemsInColumn() {    
    var numItems = fluid.portletLayout.numItemsInColumn (0, demo.portal.layout);
    assertEquals ("Number of portlets in column 1 should be 4", 4, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (1, demo.portal.layout);
    assertEquals ("Number of portlets in column 2 should be 2", 2, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (2, demo.portal.layout);
    assertEquals ("Number of portlets in column 3 should be 3", 3, numItems);

    // Test 'non-existent' column by passing in a negative column index, and one definitely too large.
    numItems = fluid.portletLayout.numItemsInColumn (-1, demo.portal.layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (1000000, demo.portal.layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
}

function testNumColumns() {
    assertEquals("Number of columns in test layout should be 3", 3, fluid.portletLayout.numColumns (demo.portal.layout));
    assertEquals("Number of columns in empty layout should be 0", 0, fluid.portletLayout.numColumns (emptyLayout));
}

function testUpdateLayout () {
    var item = jQuery ("#" + portlet3id)[0];
    var relatedItem = jQuery ("#" + portlet6id)[0];
    var layoutClone = fluid.testUtils.cloneObj (demo.portal.layout);
    
    isOriginalOrderTest("Before doing anyting", layoutClone);    

    // Move to invalid location
    fluid.portletLayout.updateLayout (item.id, undefined, fluid.position.BEFORE, layoutClone);

    isOriginalOrderTest ("After invalid move attempt", layoutClone);    
    
    // Move before
    fluid.portletLayout.updateLayout (item.id, relatedItem.id, fluid.position.BEFORE, layoutClone);
    assertEquals ("After move, Portlet 3 should be before Portlet 6", portlet3id, layoutClone.columns[1].children[1]);
    assertEquals ("After move, Portlet 6 should be third in the column", portlet6id, layoutClone.columns[1].children[2]);
    assertEquals ("After move, Portlet 3 should not be in column 1", -1, jQuery.inArray( portlet3id, layoutClone.columns[0]));
     
    // Move after
    relatedItem = jQuery ("#" + portlet8id)[0];
    fluid.portletLayout.updateLayout (item.id, relatedItem.id, fluid.position.AFTER, layoutClone);
    assertEquals ("After move, Portlet 3 should be after Portlet 8", portlet3id, layoutClone.columns[2].children[2]);
    assertEquals ("After move, Portlet 8 should be second in the column", portlet8id, layoutClone.columns[2].children[1]);
    assertEquals ("After move, Portlet 3 should not be in column 2", -1, jQuery.inArray( portlet3id, layoutClone.columns[1]));
      
    // Move within same column
    relatedItem = jQuery ("#" + portlet7id)[0];
    fluid.portletLayout.updateLayout (item.id, relatedItem.id, fluid.position.BEFORE, layoutClone);
    assertEquals ("After move, Portlet 3 should be before Portlet 7", portlet3id, layoutClone.columns[2].children[0]);
    assertEquals ("After move, Portlet 7 should be second in the column", portlet7id, layoutClone.columns[2].children[1]);
}


function testFirstMoveableTargetSkipColumn() {
    var moveRight = fluid.direction.NEXT;
    var moveLeft = fluid.direction.PREVIOUS;

    var smallLayout = { 
        id:"t2",
        columns:[
            { id:"c1", children:["portlet1"]},
            { id:"c2", children:["portlet2"]},
            { id:"c3", children:["portlet3"]}
        ]
    };

    var smallDropTargetPerms = [
        [[0,0], [0,0], [1,1]],   // portlet1
        [[0,0], [0,0], [0,0]],   // portlet2
        [[1,1], [0,0], [0,0]]    // portlet3  
    ];
    
    // Test move portlet 1 right, expect it can't be dropped in column 2
    var expected = { id: portlet3id, position: fluid.position.BEFORE };
    var actual = fluid.portletLayout.firstMoveableTarget (portlet1id, moveRight, smallLayout, smallDropTargetPerms);
    assertEquals ("Moving portlet1 right, should find portlet3...", expected.id, actual.id);
    assertEquals ("...moving portlet1 right, should find BEFORE (0)", expected.position, actual.position);

    // Test move portlet 3 left, expect it can't be dropped in column 2
    expected = { id: portlet1id, position: fluid.position.BEFORE };
    actual = fluid.portletLayout.firstMoveableTarget (portlet3id, moveLeft, smallLayout, smallDropTargetPerms);
    assertEquals ("Moving portlet3 left, should find portlet1...", expected.id, actual.id);
    assertEquals ("...moving portlet3 left, should find BEFORE (0)", expected.position, actual.position);
}

function testFirstMoveableTarget() {
    var moveRight = fluid.direction.NEXT;
    var moveLeft = fluid.direction.PREVIOUS;

    // Given: moving the last portlet in the 1st column (portlet4),
    // Find: the first portlet in the 2nd column where it can drop.
    // Result should be "after portlet five"
    var expected = { id: portlet5id, position: fluid.position.AFTER };
    var actual = fluid.portletLayout.firstMoveableTarget (portlet4id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Moving portlet4 right, should find portlet5...", expected.id, actual.id);
    assertEquals ("...moving portlet4 right, should find AFTER (1)", expected.position, actual.position);
    
    // Can't move portlet1 nor portlet2 right at all (they are fixed).
    actual = fluid.portletLayout.firstMoveableTarget (portlet1id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet1 right at all", portlet1id, actual.id);
    actual = fluid.portletLayout.firstMoveableTarget (portlet2id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet2 right at all", portlet2id, actual.id);
    
    // Can't move portlet5 left nor right (it's fixed).
    actual = fluid.portletLayout.firstMoveableTarget (portlet5id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet5id right at all", portlet5id, actual.id);
    actual = fluid.portletLayout.firstMoveableTarget (portlet5id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet5id left at all", portlet5id, actual.id);
    
    // Can't move any portlet in first column left.
    actual = fluid.portletLayout.firstMoveableTarget (portlet1id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet1 left at all", portlet1id, actual.id);
    
    actual = fluid.portletLayout.firstMoveableTarget (portlet2id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet2 left at all", portlet2id, actual.id);
    
    actual = fluid.portletLayout.firstMoveableTarget (portlet3id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet3 left at all", portlet3id, actual.id);
    
    actual = fluid.portletLayout.firstMoveableTarget (portlet4id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet4 left at all", portlet4id, actual.id);

    // Can't move any portlet in last column right.
    actual = fluid.portletLayout.firstMoveableTarget (portlet7id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet7id left at all", portlet7id, actual.id);
    
    actual = fluid.portletLayout.firstMoveableTarget (portlet8id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet8id left at all", portlet8id, actual.id);
    
    actual = fluid.portletLayout.firstMoveableTarget (portlet9id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Can't move portlet9id left at all", portlet9id, actual.id);
   
    // Moving portlet7 left, should give "after portlet5".
    expected = { id: portlet5id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstMoveableTarget (portlet7id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Moving portlet7 left, should find portlet5...", expected.id, actual.id);
    assertEquals ("...moving portlet7 left, should find AFTER (1)", expected.position, actual.position);
     
    // Moving portlet 6 left, should give "after portlet3".
    expected = { id: portlet3id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstMoveableTarget (portlet6id, moveLeft, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Moving portlet6 left, should find portlet3...", expected.id, actual.id);
    assertEquals ("...moving portlet6 left, should find AFTER (1)", expected.position, actual.position);   

    // Moving portlet 6 right, should give "after portlet7".
    expected = { id: portlet7id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstMoveableTarget (portlet6id, moveRight, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("Moving portlet6 right, should find portlet7...", expected.id, actual.id);
    assertEquals ("...moving portlet6 right, should find AFTER (1)", expected.position, actual.position);   
}

function testCanMove() {
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet1id, fluid.position.BEFORE, demo.portal.layout, demo.portal.dropTargetPerms));
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet1id, fluid.position.AFTER, demo.portal.layout, demo.portal.dropTargetPerms));

    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet7id, fluid.position.BEFORE, demo.portal.layout, demo.portal.dropTargetPerms));
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet7id, fluid.position.AFTER, demo.portal.layout, demo.portal.dropTargetPerms));

    assertFalse (fluid.portletLayout.canMove (portlet3id, portlet7id, fluid.position.BEFORE, demo.portal.layout, demo.portal.dropTargetPerms));
    assertTrue (fluid.portletLayout.canMove (portlet3id, portlet7id, fluid.position.AFTER, demo.portal.layout, demo.portal.dropTargetPerms));

    assertTrue (fluid.portletLayout.canMove (portlet9id, portlet9id, fluid.position.BEFORE, demo.portal.layout, demo.portal.dropTargetPerms));
    assertTrue (fluid.portletLayout.canMove (portlet9id, portlet9id, fluid.position.AFTER, demo.portal.layout, demo.portal.dropTargetPerms));
}

function testGetItemAt() {

    // top-left corner should be portlet1.
    var itemId = fluid.portletLayout.getItemAt (0, 0, demo.portal.layout);
    assertEquals ("Top left portlet should be portlet1", portlet1id, itemId);
    
    // bottom right = portlet9
    itemId = fluid.portletLayout.getItemAt (2, 2, demo.portal.layout);
    assertEquals ("Bottom right portlet should be portlet9", portlet9id, itemId);

    // portlet6 is in the middle
    itemId = fluid.portletLayout.getItemAt (1, 1, demo.portal.layout);
    assertEquals ("Bottom right portlet should be portlet6", portlet6id, itemId);

    // portlet4 is bottom of 1st column
    itemId = fluid.portletLayout.getItemAt (0, 3, demo.portal.layout);
    assertEquals ("Bottom right portlet should be portlet4", portlet4id, itemId);

    // null for invalid column (negative or too big)
    itemId = fluid.portletLayout.getItemAt (-1, 3, demo.portal.layout);
    assertNull ("Negative column index should give null result", itemId);
    item = fluid.portletLayout.getItemAt (999, 3, demo.portal.layout);
    assertNull ("Column index greater than number of columns should give null result", itemId);

    // null for invalid item index (negative or too big)
    itemId = fluid.portletLayout.getItemAt (0, -1, demo.portal.layout);
    assertNull ("Negative item index should give null result", itemId);
    item = fluid.portletLayout.getItemAt (0, 999, demo.portal.layout);
    assertNull ("Item index greater than number of items in column should give null result", itemId);
}

function testNearestNextMoveableTarget() {
    
    // portlet3's nearest next is portlet4.
    var actual = fluid.portletLayout.nearestNextMoveableTarget (portlet3id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet3's nearest next target should be portlet4", portlet4id, actual.id);

    // portlet1 is fixed; its nearest next is itself
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet1id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet1's nearest next target should be itself", portlet1id, actual.id);

    // portlet2 is fixed; its nearest next is itself
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet2id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet2's nearest next target should be portlet2", portlet2id, actual.id);

    // portlet7's nearest next is portlet8.
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet7id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet7's nearest next target should be portlet8", portlet8id, actual.id);

    // portlet8's nearest next is portlet9.
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet8id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet7's nearest next target should be portlet8", portlet9id, actual.id);

    // portlet9 has no next since it is at the bottom of a column.
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet9id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet9 has no next since it is at the bottom of a column", portlet9id, actual.id);

    // portlet4 has no next since it is at the bottom of a column.
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet4id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet9 has no next since it is at the bottom of a column", portlet4id, actual.id);

    // portlet6 has no next since it is at the bottom of a column.
    actual = fluid.portletLayout.nearestNextMoveableTarget (portlet6id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet6 has no next since it is at the bottom of a column", portlet6id, actual.id);
}

function testNearestPreviousMoveableTarget() {
    
    // portlet3's can't move up since the portlets above it are fixed.
    var actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet3id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet3's can't move up; nearest previous should be itself", portlet3id, actual.id);

    // portlet4 can't move up since portlet3 has greater precedence.
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet4id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet4's can't move up; nearest previous should be itself", portlet4id, actual.id);

    // portlet1 is fixed; its nearest preivious is itself
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet1id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portle12's nearest next target should be portlet2", portlet1id, actual.id);

    // portlet2 is fixed; its nearest preivious is itself
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet2id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet2's nearest next target should be portlet2", portlet2id, actual.id);

    // portlet7 is at the top of the column.
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet7id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet7 has no previous since it is at the top of a column", portlet7id, actual.id);

    // portlet8's can't be moved up since portlet7 has greater precedence.
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet8id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet8's 't be moved up since portlet7 has greater precedence", portlet8id, actual.id);

    // portlet9's nearest previous is portlet8.
    actual = fluid.portletLayout.nearestPreviousMoveableTarget (portlet9id, demo.portal.layout, demo.portal.dropTargetPerms);
    assertEquals ("portlet9's nearest previous target should be portlet6", portlet8id, actual.id);
}

function testFirstItemInAdjacentColumn() {

    // portlet1 has no left neighbour, portlet5 is at the top of the next column.
    var actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet1id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet1's has no left neighbour since it is in the left-most column", portlet1id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet1id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet1's right neighbour should be portlet5", portlet5id, actualId);
    
    // portlet2 has no left neighbour, portlet5 is at the top of the next column.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet2id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet2 has no left neighbour since it is in the left-most column", portlet2id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet2id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet2's right neighbour should be portlet5", portlet5id, actualId);
    
    // portlet4 has no left neighbour, portlet5 is at the top of the next column.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet4id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet4 has no left neighbour since it is in the left-most column", portlet4id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet4id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet4's right neighbour should be portlet5", portlet5id, actualId);
    
    // portlet1 is at the top of the previous column wrt portlet5; portlet7 is at the top of the next column.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet5id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet1 is at the top of the column left of portlet5", portlet1id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet5id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet7 is at the top of the column right of portlet5", portlet7id, actualId);
    
    // portlet1 is at the top of the previous column wrt portlet6; portlet7 is at the top of the next column.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet6id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet1 is at the top of the column left of portlet6", portlet1id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet6id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet7 is at the top of the column right of portlet6", portlet7id, actualId);

    // portlet15 is at the top of the previous column wrt portlet7; portlet7 has no ritht neighbour.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet7id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet5 is at the top of the column left of portlet7", portlet5id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet7id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet7 has not right neighbour since it is in the right-most column", portlet7id, actualId);
    
    // portlet5 is at the top of the previous column wrt portlet9; portlet9 has no right neighbour.
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet9id, fluid.direction.PREVIOUS, demo.portal.layout);
    assertEquals ("portlet5 is at the top of the column left of portlet9", portlet5id, actualId);
    actualId = fluid.portletLayout.firstItemInAdjacentColumn (portlet9id, fluid.direction.NEXT, demo.portal.layout);
    assertEquals ("portlet9 has not right neighbour since it is in the right-most column", portlet9id, actualId);   
}

function testItemAboveBelow() {
    var above = fluid.direction.PREVIOUS;
    var below = fluid.direction.NEXT;
    
    // Above
    var itemAboveId = fluid.portletLayout.itemAboveBelow (portlet9id, above, demo.portal.layout);
    assertEquals (portlet8id+" should be above "+portlet9id,
        portlet8id, itemAboveId);

    itemAboveId = fluid.portletLayout.itemAboveBelow (portlet1id, above, demo.portal.layout);
    assertEquals (portlet1id +" is at the top of the column, so nothing is 'above' it",
        portlet1id, itemAboveId);

    itemAboveId = fluid.portletLayout.itemAboveBelow (portlet7id, above, demo.portal.layout);
    assertEquals (portlet7id +" is at the top of the column, expected nothing 'above' it but got " + itemAboveId,
        portlet7id, itemAboveId);

    itemAboveId = fluid.portletLayout.itemAboveBelow (portlet4id, above, demo.portal.layout);
    assertEquals (portlet3id+" should be above "+portlet4id,
        portlet3id, itemAboveId);

    itemAboveId = fluid.portletLayout.itemAboveBelow (portlet8id, above, demo.portal.layout);
    assertEquals (portlet7id+" should be above "+portlet8id,
        portlet7id, itemAboveId);

    itemAboveId = fluid.portletLayout.itemAboveBelow (portlet2id, above, demo.portal.layout);
    assertEquals (portlet1id+" should be above "+portlet2id,
        portlet1id, itemAboveId);

    // Below
    var itemBelowId = fluid.portletLayout.itemAboveBelow (portlet3id, below, demo.portal.layout);
    assertEquals (portlet4id+" should be below "+portlet3id,
        portlet4id, itemBelowId);

    itemBelowId = fluid.portletLayout.itemAboveBelow (portlet7id, below, demo.portal.layout);
    assertEquals (portlet8id+" should be below "+portlet7id,
        portlet8id, itemBelowId);

    itemBelowId = fluid.portletLayout.itemAboveBelow (portlet8id, below, demo.portal.layout);
    assertEquals (portlet9id+" should be below "+portlet8id,
        portlet9id, itemBelowId);

    itemBelowId = fluid.portletLayout.itemAboveBelow (portlet4id, below, demo.portal.layout);
    assertEquals (portlet4id.id+" is at the bottom of the column, so nothing is 'below' it",
        portlet4id, itemBelowId);

    itemBelowId = fluid.portletLayout.itemAboveBelow (portlet9id, below, demo.portal.layout);
    assertEquals (portlet9id.id+" is at the bottom of the column, so nothing is 'below' it",
        portlet9id, itemBelowId);

    itemBelowId = fluid.portletLayout.itemAboveBelow (portlet1id, below, demo.portal.layout);
    assertEquals (portlet2id+" should be below "+portlet1id,
        portlet2id, itemBelowId);

}   // end testItemAboveBelow().
