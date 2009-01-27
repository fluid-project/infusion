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
     *  - write tests 
     *  - get and implement a design for the table of contents 
     *  - integrate table of contents with UI Options
     */ 
    
    function generateTOC(headings) {
        var parsedTemplate = fluid.selfRender(jQuery("[id=toc]"), generateTree(headings));
    }
    
    function insertAnchor(el) {
        var a = jQuery("<a name='" + el.text() + "' />");
        el.before(a);
    }
    
    function generateTree(els) {
        var tree = {}, anchorList = [], i, anchorNode, heading;
    
        for(i=0; i<els.length; i++) {
            heading = els.eq(i);
            insertAnchor(heading);
            anchorNode = {ID: "toc_anchor"};
            anchorNode.linktext = heading.text();
            anchorNode.target = "#" + heading.text();
            anchorList.push(anchorNode);
        }
    
        tree["toc_item:"] = anchorList;    
        return tree;
    }
    
    fluid.tableOfContents = function (container, options) {
        var that = fluid.initView("fluid.tableOfContents", container, options);
        generateTOC(that.locate("headings"));
    }
    
    fluid.defaults("fluid.tableOfContents", {  
        selectors: {
            headings: "h1,h2,h3"
        }
    });

})(jQuery, fluid_0_8);
