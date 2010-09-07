/*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/


/**
 * This file contains test constants and setup and teardown functions that are used when testing with the data in the unordered-list.html file.
 */

// The ids of the items in the first list
var itemIds = ["list1item1", "list1item2", "list1item3", "list1item4", "list1item5"];

var itemIds2 = fluid.testUtils.reorderer.prepend("list2item", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

var nonOrderabeItemId = "para1";       

var listHandler1;
var afterMoveCallbackWasCalled;
var itemThatWasMoved;

var findList1 = function () { 
    return jQuery("#list1")[0]; 
};

var listMovableFinder = function() {
    // This is returning the list instead of a jQuery object to ensure that people 
    // can use an orderable finder function that doesn't use jQuery
    return jQuery("[id^=list1item]", findList1()).get();
};

var callbackConfirmer = function(item){
    afterMoveCallbackWasCalled = true;
    itemThatWasMoved = item;
};

var createListLayoutHandler = function  () {
    var options = {
        afterMoveCallback: callbackConfirmer,
        selectors: {
          movables: listMovableFinder,
          selectables: listMovableFinder
        }
    };
    
    return fluid.listLayoutHandler(findList1(), options);
};

// This setUp will be called before each of the tests that are included in unordered-list.html 
function setUp() {
    afterMoveCallbackWasCalled = false;
    listHandler1 = createListLayoutHandler();
}
