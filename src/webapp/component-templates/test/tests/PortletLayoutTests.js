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

