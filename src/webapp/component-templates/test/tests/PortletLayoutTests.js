/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/
 
function testCalcColumnIndex () {
    var portletLayout = new fluid.PortletLayout();

    // Column 0
    var item = jQuery ("#" + col1portlet1id)[0];
    assertEquals (col1portlet1id + " should be in 1st column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet2id)[0];
    assertEquals (col1portlet2id + " should be in 1st column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet3id)[0];
    assertEquals (col1portlet3id + " should be in 1st column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet4id)[0];
    assertEquals (col1portlet4id + " should be in 1st column", 0, portletLayout.calcColumnIndex (item, layout));
    
    // Column 1
    item = jQuery ("#" + col2portlet1id)[0];
    assertEquals (col2portlet1id + " should be in 2nd column", 1, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col2portlet2id)[0];
    assertEquals (col2portlet2id + " should be in 2nd column", 1, portletLayout.calcColumnIndex (item, layout));
    
    // Column 2
    item = jQuery ("#" + col3portlet1id)[0];
    assertEquals (col3portlet1id + " should be in 3rd column", 2, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col3portlet2id)[0];
    assertEquals (col3portlet2id + " should be in 3rd column", 2, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col3portlet3id)[0];
    assertEquals (col3portlet3id + " should be in 3rd column", 2, portletLayout.calcColumnIndex (item, layout));
    
    // Not in any column.
    item = jQuery ("#" + portalRootId);
    assertEquals (portalRootId + " should not be in any column", -1, portletLayout.calcColumnIndex (item, layout));
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

function testCalcItemIndexInAnyColumn () {
    var portletLayout = new fluid.PortletLayout();
    
    // Column indices.
    var col0 = 0;
    var col1 = 1;
    var col2 = 2;
    
    var item = jQuery ("#" + col1portlet1id)[0];
    assertEquals ("portlet1 (no column index provided) should have index 0", 0, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet1 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet1 should have index 0 ", 0, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));

    item = jQuery ("#" + col1portlet2id)[0];
    assertEquals ("portlet2 (no column index provided) should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet2 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet2 should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
          
    item = jQuery ("#" + col1portlet3id)[0];
    assertEquals ("portlet3 (no column index provided) should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet3 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet3 should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
          
    item = jQuery ("#" + col1portlet4id)[0];
    assertEquals ("portlet4 (no column index provided) should have index 3", 3, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet4 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet4 should have index 3", 3, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
          
    item = jQuery ("#" + col2portlet1id)[0];
    assertEquals ("portlet5 (no column index provided) should have index 0", 0, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet5 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
    assertEquals ("portlet5 should have index 0", 0, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
          
    item = jQuery ("#" + col2portlet2id)[0];
    assertEquals ("portlet6 (no column index provided) should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet6 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
    assertEquals ("portlet6 should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
          
    item = jQuery ("#" + col3portlet1id)[0];
    assertEquals ("portlet7 (no column index provided) should have index 0", 0, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet7 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet7 should have index 0", 0, portletLayout.calcItemIndexInAnyColumn (item, layout, col2));
          
    item = jQuery ("#" + col3portlet2id)[0];
    assertEquals ("portlet8 (no column index provided) should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet8 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col0));
    assertEquals ("portlet8 should have index 1", 1, portletLayout.calcItemIndexInAnyColumn (item, layout, col2));
    
    item = jQuery ("#" + col3portlet3id)[0];
    assertEquals ("portlet9 (no column index provided) should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout));
    assertEquals ("portlet9 should have index -1", -1, portletLayout.calcItemIndexInAnyColumn (item, layout, col1));
    assertEquals ("portlet9 should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout, col2));
    
    // test null / undefined column.
    var undefinedColumn;      
    assertEquals ("portlet9 (undefined column index provided) should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout,undefinedColumn));
    assertEquals ("portlet9 (null column index provided) should have index 2", 2, portletLayout.calcItemIndexInAnyColumn (item, layout, null));
}   // end testCalcItemIndexInAnyColumn().

function testCalcItemIndexInColumn () {
    var portletLayout = new fluid.PortletLayout();
    var orderables = portletOrderableFinder();
   
    var item = jQuery ("#" + col1portlet1id)[0];
    var itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("Index of first orderable portlet in column 0 should be 0", 0, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("First orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("First orderable portlet should not exist in column 2", -1, itemIndex);
    
    item = jQuery ("#" + col1portlet2id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("Index of 2nd orderable portlet in column 0 should be 1", 1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("2nd orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("2nd orderable portlet should not exist in column 2", -1, itemIndex);

    item = jQuery ("#" + col1portlet3id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("Index of 3rd orderable portlet in column 0 should be 2", 2, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("3rd orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("3rd orderable portlet should not exist in column 2", -1, itemIndex);

    item = jQuery ("#" + col1portlet4id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("Index of 4th orderable portlet in column 0 should be 3", 3, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("4th orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("4th orderable portlet should not exist in column 2", -1, itemIndex);

    item = jQuery ("#" + col2portlet1id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("Index of 1st orderable portlet in column 1 should be 0", 0, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("5th orderable portlet should not exist in column 0", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("5th orderable portlet should not exist in column 2", -1, itemIndex);

    item = jQuery ("#" + col2portlet2id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("Index of 2nd orderable portlet in column 1 should be 1", 1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("5th orderable portlet should not exist in column 0", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("5th orderable portlet should not exist in column 2", -1, itemIndex);
    
    item = jQuery ("#" + col3portlet1id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("Index of 1st orderable portlet in column 2 should be 0", 0, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("1st orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("1st orderable portlet should not exist in column 0", -1, itemIndex);

    item = jQuery ("#" + col3portlet2id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("Index of 1st orderable portlet in column 2 should be 1", 1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("1st orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("1st orderable portlet should not exist in column 0", -1, itemIndex);

    item = jQuery ("#" + col3portlet3id)[0];
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("Index of 1st orderable portlet in column 2 should be 2", 2, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("1st orderable portlet should not exist in column 1", -1, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("1st orderable portlet should not exist in column 0", -1, itemIndex);
}   // end testCalcItemIndexInColumn().
