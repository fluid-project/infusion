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
     *  - move the template out into UIOptions.html
     *  - get and implement a design for the table of contents 
     *  - integrate table of contents with UI Options
     *  - make the toc template pluggable
     *  - make sure getting headings using something other then a selector works
     *  - move interesting parts of the template to the defaults ie. anchor
     */ 
    

    /**
     * Inserts an anchor into the page in front of the element.
     * @param {Object} el
     */    
    var insertAnchor = function (el) {
        var a = $("<a name='" + el.text() + "' />");
        el.before(a);
    };
    
    /**
     * Creates the renderer tree that matches the table of contents template
     * @param {jQuery Object} headings - the headings to be put into the table of contents
     */
    var generateTree = function (headings) {
        var tree = {children: []};
        
        // A stack of arrays used for generating the tree
        var stack = [];
        stack.push(tree.children);
        
        // Creates an item tree node for the table of contents
        var createItem = function (id, text) {
            var item = {
                ID: id,
                children: [{
                    ID: "anchor",
                    linktext: text,
                    target: "#" + text
                }]
            };
            return item;
        };
        
        // Creates a generic tree node
        var createNode = function (id) {
            var node = {
                ID: id,
                children: []
            };
            return node;    
        };

        // Tag names used to create the nested structure of the table of contents
        var levels = ["H1", "H2", "H3", "H4"]; // hard coded tag names - will be parameterized
        var prevLevel = -1;
        var heading, level, i, tagName, name, node, prefix;
        
        for (i = 0; i < headings.length; i++) {
            heading = headings.eq(i);
            insertAnchor(heading);

            tagName = heading[0].tagName;
            level = levels.indexOf(tagName);
            
            if (level > prevLevel) {
                // create the ul node
                prefix = prevLevel > -1 ? levels[prevLevel] + "item:": null;
                name = prefix ? prefix + tagName + "-ul": tagName + "-ul:";
                node = createNode(name);
                node.children.push(createItem(tagName + "item:li", heading.text()));

                stack[stack.length-1].push(node);
                stack.push(node.children);                

                prevLevel++;
            } else if (level === prevLevel) {
                stack[stack.length-1].push(createItem(tagName + "item:li", heading.text()));
            } else {
                stack.pop();
                stack[stack.length-1].push(createItem(tagName + "item:li", heading.text()));
                prevLevel--;
            }
        }

        return tree;
    };

    var buildTOC = function (headings) {
        var parsedTemplate2 = fluid.selfRender($("[id=toc]"), generateTree(headings));
    };

    fluid.tableOfContents = function (container, options) {
        var that = fluid.initView("fluid.tableOfContents", container, options);
        buildTOC(that.locate("headings"));
    };
    
    fluid.defaults("fluid.tableOfContents", {  
        selectors: {
            headings: ":header"
        }
    });

})(jQuery, fluid_0_8);
