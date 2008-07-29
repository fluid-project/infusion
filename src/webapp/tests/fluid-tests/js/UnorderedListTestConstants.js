/*
Copyright 2007-2008 University of Toronto

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
var firstItemId = "list1item1";
var secondItemId = "list1item2";
var thirdItemId = "list1item3";
var fourthItemId = "list1item4";
var lastItemId = "list1item5"; 
var nonOrderabeItemId = "para1";       

var listHandler1;
var orderChangedCallbackWasCalled;
var itemThatWasMoved;

var findList1 = function () { 
    return jQuery("#list1")[0]; 
};

var listMovableFinder = function  () {
    // This is returning the list instead of a jQuery object to ensure that people 
    // can use an orderable finder function that doesn't use jQuery
    return jQuery("[id^=list1item]", findList1()).get();
};

var callbackConfirmer = function(item){
    orderChangedCallbackWasCalled = true;
    itemThatWasMoved = item;
};

var createListLayoutHandler = function  () {
    var options = {
        orderChangedCallback: callbackConfirmer
    };
    
    return new fluid.ListLayoutHandler(listMovableFinder, options);
};

// This setUp will be called before each of the tests that are included in unordered-list.html 
function setUp() {
    orderChangedCallbackWasCalled = false;
    listHandler1 = createListLayoutHandler();
}
