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
demo.portal = {};

demo.portal.layout = { 
    id:"portlet-reorderer-root",
    columns:[
        { id:"c1", children:["portlet1","portlet2","portlet3","portlet4"]},
        { id:"c2", children:["portlet5","portlet6"]},
        { id:"c3", children:["portlet7","portlet8","portlet9"]}
    ]
};

demo.portal.dropTargetPerms = [
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet1
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet2
    [[0,0], [0,1], [1,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet3  
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet4
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],    // portlet5
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet6
    [[0,0], [0,1], [1,1], [1,1], [0,1], [1,1], [1,1], [1,1], [1,1]],    // portlet7  
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]],    // portlet8
    [[0,0], [0,0], [0,1], [1,1], [0,1], [1,1], [0,1], [1,1], [1,1]]     // portlet9
]; 

demo.portal.findMovables = function () {
    return jQuery ("#portlet3,#portlet4,#portlet6,#portlet7,#portlet8,#portlet9");
};

