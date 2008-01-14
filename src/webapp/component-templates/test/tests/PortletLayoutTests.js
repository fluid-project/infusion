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
    assertEquals (col1portlet1id + " should be in 0th column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet2id)[0];
    assertEquals (col1portlet2id + " should be in 0th column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet3id)[0];
    assertEquals (col1portlet3id + " should be in 0th column", 0, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col1portlet4id)[0];
    assertEquals (col1portlet4id + " should be in 0th column", 0, portletLayout.calcColumnIndex (item, layout));
    
    // Column 1
    item = jQuery ("#" + col2portlet1id)[0];
    assertEquals (col2portlet1id + " should be in 0th column", 1, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col2portlet2id)[0];
    assertEquals (col2portlet2id + " should be in 0th column", 1, portletLayout.calcColumnIndex (item, layout));
    
    // Column 2
    item = jQuery ("#" + col3portlet1id)[0];
    assertEquals (col3portlet1id + " should be in 0th column", 2, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col3portlet2id)[0];
    assertEquals (col3portlet2id + " should be in 0th column", 2, portletLayout.calcColumnIndex (item, layout));
    item = jQuery ("#" + col3portlet3id)[0];
    assertEquals (col3portlet3id + " should be in 0th column", 2, portletLayout.calcColumnIndex (item, layout));
    
    // Not in any column.
    item = jQuery ("#" + portalRootId);
    assertEquals (portalRootId + " should not be in any column", -1, portletLayout.calcColumnIndex (item, layout));

}   // end testCalcNextColumnIndex().
 
function testFindFirstOrderableSiblingInColumn () {
 	var portletLayout = new fluid.PortletLayout();
 	var orderables = portletOrderableFinder();
 	
 	// Test for existing moveable portlets in the three columns.
 	var portlet = portletLayout.findFirstOrderableSiblingInColumn (0, orderables, layout);
    assertEquals ("First orderable portlet in column 0 should be " + col1portlet3id, jQuery ("#" + col1portlet3id)[0], portlet);
    portlet = portletLayout.findFirstOrderableSiblingInColumn (1, orderables, layout);
    assertEquals ("First orderable portlet in column 1 should be " + col2portlet2id, jQuery ("#" + col2portlet2id)[0].id, portlet.id);
    portlet = portletLayout.findFirstOrderableSiblingInColumn (2, orderables, layout);
    assertEquals ("First orderable portlet in column 0 should be " + col3portlet1id, jQuery ("#" + col3portlet1id)[0].id, portlet.id);

    // Test for a non-existetnt column.
    portlet = portletLayout.findFirstOrderableSiblingInColumn (4, orderables, layout);
    assertNull ("No column 4 -- no 'first orderable portlet'", portlet);
 	
}   // end testFindFirstOrderableSiblingInColumn().

function testCalcIndexOfItemInAnyColumn () {
	var portletLayout = new fluid.PortletLayout();
    var orderables = portletOrderableFinder();
    var item = jQuery ("#" + col1portlet1id)[0];
    
    assertEquals ("portlet1 should be index 0", 0 ,portletLayout.calcIndexOfItemInAnyColumn (item, layout));
    assertEquals ("portlet1 should be index -1", -1 ,portletLayout.calcIndexOfItemInAnyColumn (item, layout, 1));
    assertEquals ("portlet1 should be index -1", 0 ,portletLayout.calcIndexOfItemInAnyColumn (item, layout, 0));
            
}

function testCalcItemIndexInColumn () {
    var portletLayout = new fluid.PortletLayout();
    var orderables = portletOrderableFinder();
   
    var item = jQuery ("#" + col1portlet1id)[0];
    var itemIndex = portletLayout.calcItemIndexInColumn (item, 0, layout);
    assertEquals ("Index of first orderable portlet in column 0 should be 0", 0, itemIndex);
    itemIndex = portletLayout.calcItemIndexInColumn (item, 1, layout);
    assertEquals ("First orderable portlet should not exist in column 1", -1, itemIndex)
    itemIndex = portletLayout.calcItemIndexInColumn (item, 2, layout);
    assertEquals ("First orderable portlet should not exist in column 2", -1, itemIndex)

}   // end testCalcItemIndexInColumn().
