/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global $*/
/*global fluid*/
/*global demo*/
/*global jqUnit*/

$(document).ready (function () {
    var listLHTests = new jqUnit.TestCase ("ListLayoutHandler Tests", setUp);

    listLHTests.test ("GetRightSibling", function () {
    	var rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(firstItemId));
    	jqUnit.assertEquals("The item to the right of the first item should be the second item", 
    		fluid.testUtils.byId(secondItemId), rightSibling);
    		
    	rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(thirdItemId));
    	jqUnit.assertEquals("The item to the right of the third item should be the fourth item", 
    		fluid.testUtils.byId(fourthItemId), rightSibling);
    });
    
    listLHTests.test ("GetRightSiblingWrap", function () {
    	var rightSibling = listHandler1.getRightSibling(fluid.testUtils.byId(lastItemId));
    	jqUnit.assertEquals("The item to the right of the last item should be the first item", 
    		fluid.testUtils.byId(firstItemId), rightSibling);	
    });
    
    listLHTests.test ("GetLeftSibling", function () {
    	var leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(secondItemId));
    	jqUnit.assertEquals("The item to the left of the second item should be the first item", 
    		fluid.testUtils.byId(firstItemId), leftSibling);
    
    	leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(lastItemId));
    	jqUnit.assertEquals("The item to the left of the last item should be the fourth item", 
    		fluid.testUtils.byId(fourthItemId), leftSibling);
    });
    
    listLHTests.test ("GetLeftSiblingWrap", function () {
    	leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(firstItemId));
    	jqUnit.assertEquals("The item to the left of the first item should be the last item", 
    		fluid.testUtils.byId(lastItemId), leftSibling);
    });
    
    listLHTests.test ("GetItemBelow", function () {
    	var itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(firstItemId));
    	jqUnit.assertEquals("The item below  the first item should be the second item", 
    		fluid.testUtils.byId(secondItemId), itemBelow);
    
    	itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(thirdItemId));
    	jqUnit.assertEquals("The item below the third item should be the fourth item", 
    		fluid.testUtils.byId(fourthItemId), itemBelow);
    });
    
    listLHTests.test ("GetItemBelowWrap", function () {
    	itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(lastItemId));
    	jqUnit.assertEquals("The item below the last item should be the first item", 
    		fluid.testUtils.byId(firstItemId), itemBelow);	
    });
    
    listLHTests.test ("GetItemAbove", function () {
    	var itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(secondItemId));
    	jqUnit.assertEquals("The item to the left of the second item should be the first item", 
    		fluid.testUtils.byId(firstItemId), itemAbove);
    
    	itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(lastItemId));
    	jqUnit.assertEquals("The item to the left of the last item should be the fourth item", 
    		fluid.testUtils.byId(fourthItemId), itemAbove);
    });
    
    listLHTests.test ("GetItemAboveWrap", function () {
    	itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(firstItemId));
    	jqUnit.assertEquals("The item to the left of the first item should be the last item", 
    		fluid.testUtils.byId(lastItemId), itemAbove);
    });
    
    listLHTests.test ("NextItemForNonOrderableReturnsTheFirstItem", function () {
        var rightSibling = listHandler1.getRightSibling(fluid.utils.jById(nonOrderabeItemId)[0]);
        jqUnit.assertEquals("When a non-orderable is passed to getRightSibling the first orderable should be returned.", 
            fluid.utils.jById(firstItemId)[0], rightSibling);  
            
        var leftSibling = listHandler1.getLeftSibling(fluid.testUtils.byId(nonOrderabeItemId));
        jqUnit.assertEquals("When a non-orderable is passed to getLeftSibling the first orderable should be returned.", 
            fluid.testUtils.byId(firstItemId), leftSibling);
    
        var itemBelow = listHandler1.getItemBelow(fluid.testUtils.byId(nonOrderabeItemId));
        jqUnit.assertEquals("When a non-orderable is passed to getItemBelow the first orderable should be returned", 
            fluid.testUtils.byId(firstItemId), itemBelow);
    
        var itemAbove = listHandler1.getItemAbove(fluid.testUtils.byId(nonOrderabeItemId));
        jqUnit.assertEquals("When a non-orderable is passed to getItemAbove the first orderable should be returned.", 
            fluid.testUtils.byId(firstItemId), itemAbove);
            
    });
    
    listLHTests.test ("Movement", function () {
        var listItems = jQuery("li", jQuery("#list1"));
        
        jqUnit.assertFalse("Before move, orderChangedCallback should not have been called", orderChangedCallbackWasCalled);
        jqUnit.assertEquals("Before moving anything, expect first is first", firstItemId, listItems[0].id);
        jqUnit.assertEquals("Before moving anything, expect second is second", secondItemId, listItems[1].id);
        jqUnit.assertEquals("Before moving anything, expect third is third", thirdItemId, listItems[2].id);
        jqUnit.assertEquals("Before moving anything, expect fourth is fourth", fourthItemId, listItems[3].id);
        jqUnit.assertEquals("Before moving anything, expect last is last", lastItemId, listItems[4].id);
    
        listHandler1.moveItemDown(listItems[0]);
        
        var listItemsAfterMove = jQuery("li", jQuery("#list1"));
        
        jqUnit.assertTrue("After, callback should have been called", orderChangedCallbackWasCalled);
        jqUnit.assertEquals("After, expect second is first", secondItemId, listItemsAfterMove[0].id);
        jqUnit.assertEquals("After, expect first is second", firstItemId, listItemsAfterMove[1].id);
        jqUnit.assertEquals("After, expect third is third", thirdItemId, listItemsAfterMove[2].id);
        jqUnit.assertEquals("After, expect fourth is fourth", fourthItemId, listItemsAfterMove[3].id);
        jqUnit.assertEquals("After, expect last is last", lastItemId, listItemsAfterMove[4].id);
    
    });

});
