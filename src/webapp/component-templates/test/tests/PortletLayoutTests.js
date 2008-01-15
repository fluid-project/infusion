/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/
 
function testCalcColumnAndItemIndex () {
    var portletLayout = new fluid.PortletLayout();

    // Tests for column index:
    // Column 0
    var item = jQuery ("#" + col1portlet1id)[0];
    assertEquals (col1portlet1id + " should be in 1st column", 0, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col1portlet2id)[0];
    assertEquals (col1portlet2id + " should be in 1st column", 0, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col1portlet3id)[0];
    assertEquals (col1portlet3id + " should be in 1st column", 0, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col1portlet4id)[0];
    assertEquals (col1portlet4id + " should be in 1st column", 0, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Column 1
    item = jQuery ("#" + col2portlet1id)[0];
    assertEquals (col2portlet1id + " should be in 2nd column", 1, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col2portlet2id)[0];
    assertEquals (col2portlet2id + " should be in 2nd column", 1, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Column 2
    item = jQuery ("#" + col3portlet1id)[0];
    assertEquals (col3portlet1id + " should be in 3rd column", 2, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col3portlet2id)[0];
    assertEquals (col3portlet2id + " should be in 3rd column", 2, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    item = jQuery ("#" + col3portlet3id)[0];
    assertEquals (col3portlet3id + " should be in 3rd column", 2, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Not in any column.
    item = jQuery ("#" + portalRootId);
    assertEquals (portalRootId + " should not be in any column", -1, portletLayout.calcColumnAndItemIndex (item, layout).columnIndex);
    
    // Tests for item index:    
    item = jQuery ("#" + col1portlet1id)[0];
    assertEquals ("portlet1 (no column index provided) should have index 0", 0, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);

    item = jQuery ("#" + col1portlet2id)[0];
    assertEquals ("portlet2 (no column index provided) should have index 1", 1, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col1portlet3id)[0];
    assertEquals ("portlet3 (no column index provided) should have index 2", 2, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col1portlet4id)[0];
    assertEquals ("portlet4 (no column index provided) should have index 3", 3, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col2portlet1id)[0];
    assertEquals ("portlet5 (no column index provided) should have index 0", 0, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col2portlet2id)[0];
    assertEquals ("portlet6 (no column index provided) should have index 1", 1, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col3portlet1id)[0];
    assertEquals ("portlet7 (no column index provided) should have index 0", 0, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
          
    item = jQuery ("#" + col3portlet2id)[0];
    assertEquals ("portlet8 (no column index provided) should have index 1", 1, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);
    
    item = jQuery ("#" + col3portlet3id)[0];
    assertEquals ("portlet9 (no column index provided) should have index 2", 2, portletLayout.calcColumnAndItemIndex (item, layout).itemIndex);    
    
}   // end testCalcNextColumnIndex().
 
function testFindFirstOrderableSiblingInColumn () {
    var portletLayout = new fluid.PortletLayout();
    var orderables = portletOrderableFinder();
    
    // Test for existing moveable portlets in the three columns.
    var portlet = portletLayout.findFirstOrderableSiblingInColumn (0, orderables, layout);
    assertEquals ("First orderable portlet in column 1 should be " + col1portlet3id, jQuery ("#" + col1portlet3id)[0], portlet);

    portlet = portletLayout.findFirstOrderableSiblingInColumn (1, orderables, layout);
    assertEquals ("First orderable portlet in column 2 should be " + col2portlet2id, jQuery ("#" + col2portlet2id)[0], portlet);
    portlet = portletLayout.findFirstOrderableSiblingInColumn (2, orderables, layout);
    assertEquals ("First orderable portlet in column 3 should be " + col3portlet1id, jQuery ("#" + col3portlet1id)[0], portlet);

    // Test for a non-existetnt column.
    portlet = portletLayout.findFirstOrderableSiblingInColumn (4, orderables, layout);
    assertNull ("No column 4 -- no 'first orderable portlet'", portlet);
    
}   // end testFindFirstOrderableSiblingInColumn().

function testNumItemsInColumn() {
    var portletLayout = new fluid.PortletLayout();
    
    var numItems = portletLayout.numItemsInColumn (0, layout);
    assertEquals ("Number of portlets in column 1 should be 4", 4, numItems);
    numItems = portletLayout.numItemsInColumn (1, layout);
    assertEquals ("Number of portlets in column 2 should be 2", 2, numItems);
    numItems = portletLayout.numItemsInColumn (2, layout);
    assertEquals ("Number of portlets in column 3 should be 3", 3, numItems);

    // Test 'non-existent' column by passing in a negative column index, and one definitely too large.
    numItems = portletLayout.numItemsInColumn (-1, layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
    numItems = portletLayout.numItemsInColumn (1000000, layout);
    assertEquals ("Number of portlets in non-existent column should be -1", -1, numItems);
}
