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
    var item = jQuery ("#" + portlet1id)[0];
    assertEquals (portlet1id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet2id)[0];
    assertEquals (portlet2id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet3id)[0];
    assertEquals (portlet3id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet4id)[0];
    assertEquals (portlet4id + " should be in 1st column", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Column 1
    item = jQuery ("#" + portlet5id)[0];
    assertEquals (portlet5id + " should be in 2nd column", 1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet6id)[0];
    assertEquals (portlet6id + " should be in 2nd column", 1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Column 2
    item = jQuery ("#" + portlet7id)[0];
    assertEquals (portlet7id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet8id)[0];
    assertEquals (portlet8id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + portlet9id)[0];
    assertEquals (portlet9id + " should be in 3rd column", 2, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Not in any column.
    item = jQuery (portalRootSelector);
    assertEquals (portalRootSelector + " should not be in any column", -1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Tests for item index:    
    item = jQuery ("#" + portlet1id)[0];
    assertEquals ("portlet1 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);

    item = jQuery ("#" + portlet2id)[0];
    assertEquals ("portlet2 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet3id)[0];
    assertEquals ("portlet3 (no column index provided) should have index 2", 2, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet4id)[0];
    assertEquals ("portlet4 (no column index provided) should have index 3", 3, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet5id)[0];
    assertEquals ("portlet5 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet6id)[0];
    assertEquals ("portlet6 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet7id)[0];
    assertEquals ("portlet7 (no column index provided) should have index 0", 0, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + portlet8id)[0];
    assertEquals ("portlet8 (no column index provided) should have index 1", 1, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
    
    item = jQuery ("#" + portlet9id)[0];
    assertEquals ("portlet9 (no column index provided) should have index 2", 2, fluid.portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);    
    
}   // end testCalcNextColumnIndex().
 
function testFindFirstOrderableSiblingInColumn () {
    var orderables = portletOrderableFinder();
    
    // Test for existing moveable portlets in the three columns.
    var portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (0, orderables, layout);
    assertEquals ("First orderable portlet in column 1 should be " + portlet3id, jQuery ("#" + portlet3id)[0], portlet);

    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (1, orderables, layout);
    assertEquals ("First orderable portlet in column 2 should be " + portlet6id, jQuery ("#" + portlet6id)[0], portlet);
    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (2, orderables, layout);
    assertEquals ("First orderable portlet in column 3 should be " + portlet7id, jQuery ("#" + portlet7id)[0], portlet);

    // Test for a non-existetnt column.
    portlet = fluid.portletLayout.findFirstOrderableSiblingInColumn (4, orderables, layout);
    assertNull ("No column 4 -- no 'first orderable portlet'", portlet);
    
}   // end testFindFirstOrderableSiblingInColumn().

function testFindLinearIndex() {    
    var index = fluid.portletLayout.findLinearIndex (portlet1id, layout);
    assertEquals(0, index);

    index = fluid.portletLayout.findLinearIndex (portlet3id, layout);
    assertEquals(2, index);

    index = fluid.portletLayout.findLinearIndex (portlet9id, layout);
    assertEquals(8, index);
    
    index = fluid.portletLayout.findLinearIndex ("doesNotExist", layout);
    assertEquals(-1, index);
    
}

function testNumItemsInColumn() {    
    var numItems = fluid.portletLayout.numItemsInColumn (0, layout);
    assertEquals ("Number of portlets in column 1 should be 4", 4, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (1, layout);
    assertEquals ("Number of portlets in column 2 should be 2", 2, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (2, layout);
    assertEquals ("Number of portlets in column 3 should be 3", 3, numItems);

    // Test 'non-existent' column by passing in a negative column index, and one definitely too large.
    numItems = fluid.portletLayout.numItemsInColumn (-1, layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
    numItems = fluid.portletLayout.numItemsInColumn (1000000, layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
}

function testNumColumns() {
    assertEquals("Number of columns in test layout should be 3", 3, fluid.portletLayout.numColumns(layout));
    assertEquals("Number of columns in empty layout should be 0", 0, fluid.portletLayout.numColumns(emptyLayout));
}

function testUpdateLayout () {
    var item = jQuery ("#" + portlet3id)[0];
    var relatedItem = jQuery ("#" + portlet6id)[0];
    var layoutClone = fluid.testUtils.cloneObj(layout);
    
    isOriginalOrderTest("Before doing anyting", layoutClone);    

    // Move to invalid location
    fluid.portletLayout.updateLayout (item, undefined, fluid.position.BEFORE, layoutClone);

    isOriginalOrderTest("After invalid move attempt", layoutClone);    
    
    // Move before
    fluid.portletLayout.updateLayout (item, relatedItem, fluid.position.BEFORE, layoutClone);
    assertEquals ("After move, Portlet 3 should be before Portlet 6", portlet3id, layoutClone.columns[1].children[1]);
    assertEquals ("After move, Portlet 6 should be third in the column", portlet6id, layoutClone.columns[1].children[2]);
    assertEquals ("After move, Portlet 3 should not be in column 1", -1, jQuery.inArray( portlet3id, layoutClone.columns[0]));
     
    // Move after
    relatedItem = jQuery ("#" + portlet8id)[0];
    fluid.portletLayout.updateLayout (item, relatedItem, fluid.position.AFTER, layoutClone);
    assertEquals ("After move, Portlet 3 should be after Portlet 8", portlet3id, layoutClone.columns[2].children[2]);
    assertEquals ("After move, Portlet 8 should be second in the column", portlet8id, layoutClone.columns[2].children[1]);
    assertEquals ("After move, Portlet 3 should not be in column 2", -1, jQuery.inArray( portlet3id, layoutClone.columns[1]));
      
    // Move within same column
    relatedItem = jQuery ("#" + portlet7id)[0];
    fluid.portletLayout.updateLayout (item, relatedItem, fluid.position.BEFORE, layoutClone);
    assertEquals ("After move, Portlet 3 should be before Portlet 7", portlet3id, layoutClone.columns[2].children[0]);
    assertEquals ("After move, Portlet 7 should be second in the column", portlet7id, layoutClone.columns[2].children[1]);
}


function testFirstDroppableTargetSkipColumn() {
    var moveRight = 1;
    var moveLeft = -1;

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
    var nextColIndex = 1;
    var expected = { id: portlet3id, position: fluid.position.BEFORE };
    var actual = fluid.portletLayout.firstDroppableTarget (portlet1id, nextColIndex, moveRight, smallLayout, smallDropTargetPerms);
    assertEquals ("Moving portlet1 right, should find portlet3...", expected.id, actual.id);
    assertEquals ("...moving portlet1 right, should find BEFORE (0)", expected.position, actual.position);

    // Test move portlet 3 left, expect it can't be dropped in column 2
    nextColIndex = 1;
    expected = { id: portlet1id, position: fluid.position.BEFORE };
    actual = fluid.portletLayout.firstDroppableTarget (portlet3id, nextColIndex, moveLeft, smallLayout, smallDropTargetPerms);
    assertEquals ("Moving portlet3 left, should find portlet1...", expected.id, actual.id);
    assertEquals ("...moving portlet3 left, should find BEFORE (0)", expected.position, actual.position);
    
}

function testFirstDroppableTarget() {
    var moveRight = 1;
    var moveLeft = -1;

    // Given: moving the last portlet in the 1st column (portlet4),
    // Find: the first portlet in the 2nd column where it can drop.
    // Result should be "after portlet five"
    var nextColIndex = 1;
    var expected = { id: portlet5id, position: fluid.position.AFTER };
    var actual = fluid.portletLayout.firstDroppableTarget (portlet4id, nextColIndex, moveRight, layout, dropTargetPerms);
    assertEquals ("Moving portlet4 right, should find portlet5...", expected.id, actual.id);
    assertEquals ("...moving portlet4 right, should find AFTER (1)", expected.position, actual.position);
    
    // Can't move portlet1 nor portlet2 right at all (they are fixed).
    actual = fluid.portletLayout.firstDroppableTarget (portlet1id, nextColIndex, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet1 right at all", portlet1id, actual.id);
    actual = fluid.portletLayout.firstDroppableTarget (portlet2id, nextColIndex, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet2 right at all", portlet2id, actual.id);
    
    // Can't move portlet5 left nor right (it's fixed).
    nextColIndex = 2;
    actual = fluid.portletLayout.firstDroppableTarget (portlet5id, nextColIndex, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet5id right at all", portlet5id, actual.id);
    nextColIndex = 0;
    actual = fluid.portletLayout.firstDroppableTarget (portlet5id, nextColIndex, moveLeft, layout, dropTargetPerms);
    assertEquals ("Can't move portlet5id left at all", portlet5id, actual.id);
    
    // Can't move any portlet in first column left.
    var noSuchColumn = -1;
    actual = fluid.portletLayout.firstDroppableTarget (portlet1id, noSuchColumn, moveLeft, layout, dropTargetPerms);
    assertEquals ("Can't move portlet1 left at all", portlet1id, actual.id);
    
    actual = fluid.portletLayout.firstDroppableTarget (portlet2id, noSuchColumn, moveLeft, layout, dropTargetPerms);
    assertEquals ("Can't move portlet2 left at all", portlet2id, actual.id);
    
    actual = fluid.portletLayout.firstDroppableTarget (portlet3id, noSuchColumn, moveLeft, layout, dropTargetPerms);
    assertEquals ("Can't move portlet3 left at all", portlet3id, actual.id);
    
    actual = fluid.portletLayout.firstDroppableTarget (portlet4id, noSuchColumn, moveLeft, layout, dropTargetPerms);
    assertEquals ("Can't move portlet4 left at all", portlet4id, actual.id);

    // Can't move any portlet in last column right.
    noSuchColumn = 3;
    actual = fluid.portletLayout.firstDroppableTarget (portlet7id, noSuchColumn, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet7id left at all", portlet7id, actual.id);
    
    actual = fluid.portletLayout.firstDroppableTarget (portlet8id, noSuchColumn, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet8id left at all", portlet8id, actual.id);
    
    actual = fluid.portletLayout.firstDroppableTarget (portlet9id, noSuchColumn, moveRight, layout, dropTargetPerms);
    assertEquals ("Can't move portlet9id left at all", portlet9id, actual.id);
   
    // Moving portlet7 left, should give "after portlet5".
    nextColIndex = 1;
    expected = { id: portlet5id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstDroppableTarget (portlet7id, nextColIndex, moveLeft, layout, dropTargetPerms);
    assertEquals ("Moving portlet7 left, should find portlet5...", expected.id, actual.id);
    assertEquals ("...moving portlet7 left, should find AFTER (1)", expected.position, actual.position);
     
    // Moving portlet 6 left, should give "after portlet3".
    nextColIndex = 0;
    expected = { id: portlet3id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstDroppableTarget (portlet6id, nextColIndex, moveLeft, layout, dropTargetPerms);
    assertEquals ("Moving portlet6 left, should find portlet3...", expected.id, actual.id);
    assertEquals ("...moving portlet6 left, should find AFTER (1)", expected.position, actual.position);   

    // Moving portlet 6 right, should give "after portlet7".
    nextColIndex = 2;
    expected = { id: portlet7id, position: fluid.position.AFTER };
    actual = fluid.portletLayout.firstDroppableTarget (portlet6id, nextColIndex, moveRight, layout, dropTargetPerms);
    assertEquals ("Moving portlet6 right, should find portlet7...", expected.id, actual.id);
    assertEquals ("...moving portlet6 right, should find AFTER (1)", expected.position, actual.position);   
}

function testCanMove() {
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet1id, fluid.position.BEFORE, layout, dropTargetPerms));
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet1id, fluid.position.AFTER, layout, dropTargetPerms));

    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet7id, fluid.position.BEFORE, layout, dropTargetPerms));
    assertFalse (fluid.portletLayout.canMove (portlet1id, portlet7id, fluid.position.AFTER, layout, dropTargetPerms));

    assertFalse (fluid.portletLayout.canMove (portlet3id, portlet7id, fluid.position.BEFORE, layout, dropTargetPerms));
    assertTrue (fluid.portletLayout.canMove (portlet3id, portlet7id, fluid.position.AFTER, layout, dropTargetPerms));

    assertTrue (fluid.portletLayout.canMove (portlet9id, portlet9id, fluid.position.BEFORE, layout, dropTargetPerms));
    assertTrue (fluid.portletLayout.canMove (portlet9id, portlet9id, fluid.position.AFTER, layout, dropTargetPerms));
}

function testGetItemAt() {

    // top-left corner should be portlet1.
    var item = fluid.portletLayout.getItemAt (0, 0, layout);
    assertEquals ("Top left portlet should be portlet1", portlet1id, item.id);
    
    // bottom right = portlet9
    item = fluid.portletLayout.getItemAt (2, 2, layout);
    assertEquals ("Bottom right portlet should be portlet9", portlet9id, item.id);

    // portlet6 is in the middle
    item = fluid.portletLayout.getItemAt (1, 1, layout);
    assertEquals ("Bottom right portlet should be portlet6", portlet6id, item.id);

    // portlet4 is bottom of 1st column
    item = fluid.portletLayout.getItemAt (0, 3, layout);
    assertEquals ("Bottom right portlet should be portlet4", portlet4id, item.id);

    // null for invalid column (negative or too big)
    item = fluid.portletLayout.getItemAt (-1, 3, layout);
    assertNull ("Negative column index should give null result", item);
    item = fluid.portletLayout.getItemAt (999, 3, layout);
    assertNull ("Column index greater than number of columns should give null result", item);

    // null for invalid item index (negative or too big)
    item = fluid.portletLayout.getItemAt (0, -1, layout);
    assertNull ("Negative item index should give null result", item);
    item = fluid.portletLayout.getItemAt (0, 999, layout);
    assertNull ("Item index greater than number of items in column should give null result", item);
}
