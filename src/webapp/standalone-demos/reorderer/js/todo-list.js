/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Ensure the demo namespace exists
var demo = demo || {};

demo.initTodoList = function () {
    var options = {
        selectors: {
            movables: "[id^=myUniquePrefix]"
        }
    };
    return fluid.reorderList("#todo-list", options);
};
