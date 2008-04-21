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

demo.initTodoList = function () {
    var todoListContainer = fluid.utils.jById ("todo-list");

    // The orderable finder identifies the orderable element by their unique id prefix.
    var myOrderableFinder = function () {
        return jQuery ("[id^=myUniquePrefix]", todoListContainer);
    };

    var layoutHandler = new fluid.ListLayoutHandler (myOrderableFinder);

    return new fluid.Reorderer (todoListContainer, myOrderableFinder, layoutHandler);
};
