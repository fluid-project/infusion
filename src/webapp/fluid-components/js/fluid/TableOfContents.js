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
    var generateTree = function (headings, levels) {
        var items = {
            "children:" : fluid.transform(headings, function(heading) {
                          return {
                 ID: "level" + (levels.indexOf(heading.tagName) + 1) + ":item",
                 children: [{
                     ID: "anchor",
                     linktext: heading.innerHTML,
                     target: "#" + heading.innerHTML
                 }]
             }; 
        })};
 
        var tree = {children: []};
        
        // A stack of arrays used for generating the tree
        var stack = [];
        stack.push(tree.children);
        
        // Creates an item tree node for the table of contents
        var createItem = function (id, text) {
            var item = {
                ID: id,
                children: [{
                    ID: "link",
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

        var prevLevel = -1;
        var heading, level, i, tagName, name, node, prefix;
        
        for (i = 0; i < headings.length; i++) {
            heading = headings.eq(i);
            insertAnchor(heading);

            tagName = heading[0].tagName;
            level = levels.indexOf(tagName);
            
            if (level > prevLevel) {
                // create the ul nodes
                while (level > prevLevel ) {
                    // TODO: clean up this name creation stuff
                    prevLevel++;
                    prefix = prevLevel > 0 ? "level" + prevLevel + ":": null;
                    name = prefix ? prefix + "level" + (prevLevel+1) + "s": "level" + (prevLevel+1) + "s:";
                    node = createNode(name);
                    stack[stack.length-1].push(node);
                    stack.push(node.children);
                }
                node.children.push(createItem("level" + (level+1) + ":item", heading.text()));
            } else if (level === prevLevel) {
                stack[stack.length-1].push(createItem("level" + (level+1) + ":item", heading.text()));
            } else {
                while (level < prevLevel) {
                    stack.pop();
                    prevLevel--;                    
                }
                 stack[stack.length-1].push(createItem("level" + (level+1) + ":item", heading.text()));
            }
        }

        return tree;
    };

    var buildTOC = function (headings, levels) {
        var parsedTemplate2 = fluid.selfRender($("[id=toc]"), generateTree(headings, levels));
    };

    fluid.tableOfContents = function (container, options) {
        var that = fluid.initView("fluid.tableOfContents", container, options);
        buildTOC(that.locate("headings"), that.options.levels);
    };
    
    fluid.defaults("fluid.tableOfContents", {  
        selectors: {
            headings: ":header"
        }, 
        levels: ["H1", "H2", "H3", "H4", "H5", "H6"]
    });

})(jQuery, fluid_0_8);
