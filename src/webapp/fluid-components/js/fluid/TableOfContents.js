/*
Copyright 2009 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_8*/

fluid_0_8 = fluid_0_8 || {};

(function ($, fluid) {

    /*
     *  TODO: 
     *  - retrieve the headings in document order
     *  - indent based on heading level
     *  - move the template out into UIOptions.html
     *  - get and implement a design for the table of contents 
     *  - integrate table of contents with UI Options
     *  - make the toc template pluggable
     */ 
    
    
    var insertAnchor = function (el) {
        var a = $("<a name='" + el.text() + "' />");
        el.before(a);
    };
    
    var generateTree = function (headings) {
        var i, tree = {}, tocItems = [], tocItem, heading;
    
        for (i = 0; i < headings.length; i++) {
            heading = headings.eq(i);
            insertAnchor(heading);
            tocItem = {ID: "toc_anchor"};
            tocItem.linktext = heading.text();
            tocItem.target = "#" + heading.text();
            tocItems.push(tocItem);
        }
    
        tree["toc_item:"] = tocItems;    
        return tree;
    };
    
    var buildTOC = function (headings) {
        var parsedTemplate = fluid.selfRender($("[id=toc]"), generateTree(headings));
    };

    fluid.tableOfContents = function (container, options) {
        var that = fluid.initView("fluid.tableOfContents", container, options);
        buildTOC(that.locate("headings"));
    };
    
    fluid.defaults("fluid.tableOfContents", {  
        selectors: {
            headings: "h1,h2,h3"
        }
    });

})(jQuery, fluid_0_8);
