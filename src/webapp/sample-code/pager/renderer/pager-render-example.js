/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global demo*/
var demo = demo || {};

(function ($, fluid) {
    demo.initPager = function () {
        var selectorPrefix = "#students-page";
        
        var options = {
            dataModel: userTable,
            bodyRenderer: {
              type: "fluid.pager.selfRender",
              options: {
                root: "#body-template",
                row: "row:",
                cells: "explode"
              }
            },
            pagerBar: {type: "fluid.pager.pagerBar", options: {
              pageList: {type: "fluid.pager.renderedPageList",
                options: { 
                  linkBody: "a"
                }
              }
            }}
        };
        
        fluid.pager("#gradebook", options);
    };    
})(jQuery, fluid);
