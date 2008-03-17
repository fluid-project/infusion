/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Ensure the demo namespace exists
var demo = demo || {};
demo.unorderedList = function () {

    // Using the DOM node instead of a jQuery to ensure this behaviour works.
    var findList1 = function () { return jQuery ("#list1")[0]; };

    var listMovableFinder = function  () {
        // This is returning the list instead of a jQuery object to ensure that people 
        // can use an orderable finder function that doesn't use jQuery
        return jQuery ("[id^=list1item]", findList1 ()).get ();
    };
    
    var callbackConfirmer = function () {
        demo.unorderedList.orderChangedCallbackWasCalled = true;
    };
    
    return {
        createListLayoutHandler : function  () {
            return new fluid.ListLayoutHandler (listMovableFinder, {
                    orderChangedCallback: callbackConfirmer
                });
        },

        createListReorderer : function  () {
            return new fluid.Reorderer (findList1 (), listMovableFinder, demo.unorderedList.createListLayoutHandler ());
        }
    };
} ();