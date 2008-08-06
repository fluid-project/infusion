/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

(function ($) {
    $(document).ready (function () {
        var portletLHTests = new jqUnit.TestCase ("ModuleLayoutHandler Tests", setUp, tearDown);
    
        portletLHTests.test ("GetItemAbove", function () {
            var itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet9id)[0]);
            jqUnit.assertEquals (portlet8id+" should be above "+portlet9id,
                portlet8id, itemAbove.id);
        
            itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet1id)[0]);
            jqUnit.assertEquals (portlet1id +" is at the top of the column, so nothing is 'above' it",
                jQuery ("#" + portlet1id)[0], itemAbove);
        
            itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet7id)[0]);
            jqUnit.assertEquals (portlet7id +" is at the top of the column, expected nothing 'above' it but got " + itemAbove.id,
                jQuery ("#" + portlet7id)[0], itemAbove);
        
            itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet4id)[0]);
            jqUnit.assertEquals (portlet3id+" should be above "+portlet4id,
                jQuery ("#" + portlet3id)[0], itemAbove);
        
            itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet8id)[0]);
            jqUnit.assertEquals (portlet7id+" should be above "+portlet8id,
                jQuery ("#" + portlet7id)[0], itemAbove);
        
            itemAbove = portletHandler.getItemAbove (jQuery ("#" + portlet2id)[0]);
            jqUnit.assertEquals (portlet1id+" should be above "+portlet2id,
                jQuery ("#" + portlet1id)[0], itemAbove);
        });
        
        portletLHTests.test ("GetItemBelow", function () {
            var itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet3id)[0]);
            jqUnit.assertEquals(portlet4id+" should be below "+portlet3id,
                jQuery ("#" + portlet4id)[0], itemBelow);
        
            itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet7id)[0]);
            jqUnit.assertEquals(portlet8id+" should be below "+portlet7id,
                jQuery ("#" + portlet8id)[0], itemBelow);
        
            itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet8id)[0]);
            jqUnit.assertEquals(portlet9id+" should be below "+portlet8id,
                jQuery ("#" + portlet9id)[0], itemBelow);
        
            itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet4id)[0]);
            jqUnit.assertEquals(portlet4id.id+" is at the bottom of the column, so nothing is 'below' it",
                jQuery ("#" + portlet4id)[0], itemBelow);
        
            itemBelow = portletHandler.getItemBelow(jQuery ("#" + portlet9id)[0]);
            jqUnit.assertEquals(portlet9id.id+" is at the bottom of the column, so nothing is 'below' it",
                jQuery ("#" + portlet9id)[0], itemBelow);
        
            itemBelow = portletHandler.getItemBelow (jQuery ("#" + portlet1id)[0]);
            jqUnit.assertEquals (portlet2id+" should be below "+portlet1id,
                jQuery ("#" + portlet2id)[0], itemBelow);
        
        });
        
        portletLHTests.test ("GetLeftSibling", function () {
            var leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet5id)[0]);
            jqUnit.assertEquals(portlet1id+" should to the left of "+portlet5id,
                jQuery ("#" + portlet1id)[0], leftSibling);
        
            leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet6id)[0]);
            jqUnit.assertEquals(portlet1id+" should to the left of "+portlet6id,
                jQuery ("#" + portlet1id)[0], leftSibling);
        
            leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet9id)[0]);
            jqUnit.assertEquals(portlet5id+" should to the left of "+portlet9id,
                jQuery ("#" + portlet5id)[0], leftSibling);
        
            leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet1id)[0]);
            jqUnit.assertEquals(portlet1id+" is at the far left, so nothing is to the left",
                jQuery ("#" + portlet1id)[0], leftSibling);
        
            leftSibling = portletHandler.getLeftSibling(jQuery ("#" + portlet3id)[0]);
            jqUnit.assertEquals(portlet3id+" is at the far left, so nothing is to the left",
                jQuery ("#" + portlet3id)[0], leftSibling);
        });
        
        portletLHTests.test ("GetRightSibling", function () {
            var rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet2id)[0]);
            jqUnit.assertEquals(portlet5id+" should to the right of "+portlet2id,
                jQuery ("#" + portlet5id)[0], rightSibling);
        
            rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet4id)[0]);
            jqUnit.assertEquals(portlet5id+" should to the right of "+portlet4id,
                jQuery ("#" + portlet5id)[0], rightSibling);
        
            rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet6id)[0]);
            jqUnit.assertEquals(portlet8id+" should to the right of "+portlet6id,
                jQuery ("#" + portlet7id)[0], rightSibling);
        
            rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet7id)[0]);
            jqUnit.assertEquals(portlet7id+" is at the far right, so nothing is to the right",
                jQuery ("#" + portlet7id)[0], rightSibling);
        
            rightSibling = portletHandler.getRightSibling(jQuery ("#" + portlet9id)[0]);
            jqUnit.assertEquals(portlet9id+" is at the far right, so nothing is to the right",
                jQuery ("#" + portlet9id)[0], rightSibling);
        });
        
        portletLHTests.test ("MoveItemDown", function () {
            var portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("Before move, portlet 3 should be at index 2", portlet3id, portletList[2].id);
            jqUnit.assertEquals("Before move, portlet 4 should be at index 3", portlet4id, portletList[3].id);
        
            portletHandler.moveItemDown (jQuery ("#"+portlet3id)[0]);
            portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("After move, portlet 4 should be at index 2", portlet4id, portletList[2].id);
            jqUnit.assertEquals("After move, portlet 3 should be at index 3", portlet3id, portletList[3].id);
        
        });
        
        portletLHTests.test ("MoveItemUp", function () {
            var portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("Before move portlet 3 is in third position", portlet3id, portletList[2].id);
            jqUnit.assertEquals("Before move portlet 4 is in fourth position", portlet4id, portletList[3].id);
            jqUnit.assertEquals("Before move portlet 8 is in second last position", portlet8id, portletList[7].id);
            jqUnit.assertEquals("Before move portlet 9 is in last position", portlet9id, portletList[8].id);
        
            portletHandler.moveItemUp (jQuery ("#" + portlet9id)[0]);
            portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("After move portlet 8 is in last position", portlet8id, portletList[8].id);
            jqUnit.assertEquals("After move portlet 9 is in second last position", portlet9id, portletList[7].id);
        
            // Invalid move - should not work
            portletHandler.moveItemUp (jQuery ("#" + portlet4id)[0]);
            portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("After move portlet 3 is in third position", portlet3id, portletList[2].id);
            jqUnit.assertEquals("After move portlet 4 is in fourth position", portlet4id, portletList[3].id);
        });
        
        portletLHTests.test ("MoveItemRight", function () {
            var cols = jQuery ("td");
            var col1PortletList = jQuery ("div[id^=portlet]", cols.get (0));
            var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
        
            jqUnit.assertEquals ("Before move column 1 has 4 portlets", 4, col1PortletList.length);
            jqUnit.assertEquals ("Before move column 2 has 2 portlets", 2, col2PortletList.length);
            jqUnit.assertEquals ("Before move portlet 3 is in third position column 1", portlet3id, col1PortletList[2].id);
            jqUnit.assertEquals ("Before move portlet 4 is in fourth position column 1", portlet4id, col1PortletList[3].id);
            jqUnit.assertEquals ("Before move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
            jqUnit.assertEquals ("Before move portlet 6 is in second position column 2", portlet6id, col2PortletList[1].id);
        
            portletHandler.moveItemRight (jQuery ("#" + portlet3id)[0]);
            col1PortletList = jQuery("div[id^=portlet]", cols.get (0));
            col2PortletList = jQuery("div[id^=portlet]", cols.get (1));
        
            jqUnit.assertEquals ("After move column 1 has 3 portlets", 3, col1PortletList.length);
            jqUnit.assertEquals ("After move column 2 has 3 portlets", 3, col2PortletList.length);
            jqUnit.assertEquals ("After move portlet 4 is in third position column 1", portlet4id, col1PortletList[2].id);
            jqUnit.assertEquals ("After move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
            jqUnit.assertEquals ("After move portlet 3 is in second position column 2", portlet3id, col2PortletList[1].id);
            jqUnit.assertEquals ("After move portlet 6 is in third position column 2", portlet6id, col2PortletList[2].id);
        
        });
        
        portletLHTests.test ("MoveItemLeft", function () {
            var cols = jQuery ("td");
            var col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
            var col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));
        
            jqUnit.assertEquals ("Before move, col2 should have 2 portlets", 2, col2PortletList.length);
            jqUnit.assertEquals ("Before move, col3 should have 3 portlets", 3, col3PortletList.length);
            jqUnit.assertEquals ("Before move portlet 7 is in third position column 3", portlet7id, col3PortletList[0].id);
            jqUnit.assertEquals ("Before move portlet 8 is in fourth position column 3", portlet8id, col3PortletList[1].id);
            jqUnit.assertEquals ("Before move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
            jqUnit.assertEquals ("Before move portlet 6 is in second position column 2", portlet6id, col2PortletList[1].id);
        
            portletHandler.moveItemLeft (jQuery ("#" + portlet7id)[0]);
            col2PortletList = jQuery ("div[id^=portlet]", cols.get (1));
            col3PortletList = jQuery ("div[id^=portlet]", cols.get (2));
        
            jqUnit.assertEquals ("After move, col2 should have 3 portlets", 3, col2PortletList.length);
            jqUnit.assertEquals ("After move, col3 should have 2 portlets", 2, col3PortletList.length);
            jqUnit.assertEquals ("After move portlet 8 is in first position column 3", portlet8id, col3PortletList[0].id);
            jqUnit.assertEquals ("After move portlet 7 is in second position column 2", portlet7id, col2PortletList[1].id);
            jqUnit.assertEquals ("After move portlet 5 is in first position column 2", portlet5id, col2PortletList[0].id);
            jqUnit.assertEquals ("After move portlet 6 is in third position column 2", portlet6id, col2PortletList[2].id);
        
        });
        
        portletLHTests.test("DefaultPerms", function () {
            var layoutHandler = fluid.moduleLayoutHandler(null, {moduleLayout: {layout: layoutClone}});
            var portlet1 = fluid.utils.jById(portlet1id)[0];
            var portlet2 = fluid.utils.jById(portlet2id)[0];
    
            // Sniff test the layout handler that was created. 
            var itemAbove = layoutHandler.getItemAbove(portlet2);
            jqUnit.assertEquals("portlet 1 is above portlet 2", portlet1id, itemAbove.id);
            
            var itemBelow = layoutHandler.getItemBelow(portlet2);
            jqUnit.assertEquals("portlet 3 is below portlet 2", portlet3id, itemBelow.id);
    
            var leftSibling = layoutHandler.getLeftSibling(portlet2);
            jqUnit.assertEquals("nothing is left of portlet 2", portlet2id, leftSibling.id);
            
            var rightSibling = layoutHandler.getRightSibling(portlet2);
            jqUnit.assertEquals("portlet 5 is right of portlet 2", portlet5id, rightSibling.id);
    
            var portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("Before move, order is 1, 2, 3, 4", portlet1id, portletList[0].id);
            jqUnit.assertEquals("Before move, order is 1, 2, 3, 4", portlet2id, portletList[1].id);
            jqUnit.assertEquals("Before move, order is 1, 2, 3, 4", portlet3id, portletList[2].id);
            jqUnit.assertEquals("Before move, order is 1, 2, 3, 4", portlet4id, portletList[3].id);
        
            layoutHandler.moveItemUp(portlet2);
            portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("After move, order is 2, 1, 3, 4", portlet2id, portletList[0].id);
            jqUnit.assertEquals("After move, order is 2, 1, 3, 4", portlet1id, portletList[1].id);
            jqUnit.assertEquals("After move, order is 2, 1, 3, 4", portlet3id, portletList[2].id);
            jqUnit.assertEquals("After move, order is 2, 1, 3, 4", portlet4id, portletList[3].id);
            
            layoutHandler.moveItemDown(portlet1);
            portletList = jQuery("div[id^=portlet]");
            jqUnit.assertEquals("After move down, order is 2, 3, 1, 4", portlet2id, portletList[0].id);
            jqUnit.assertEquals("After move down, order is 2, 3, 1, 4", portlet3id, portletList[1].id);
            jqUnit.assertEquals("After move down, order is 2, 3, 1, 4", portlet1id, portletList[2].id);
            jqUnit.assertEquals("After move down, order is 2, 3, 1, 4", portlet4id, portletList[3].id);
        });
    
    });
})(jQuery);
