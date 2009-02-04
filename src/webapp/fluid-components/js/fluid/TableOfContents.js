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
     *  - look into IE issues with rendering 
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
        // Creates leaf nodes for the renderer tree from the headings
        var items = {
            children: fluid.transform(headings, function (heading) {
                var jHeading = $(heading);
                var text = $(heading).text();
                return {
                    heading: jHeading,
                    ID: "level" + (levels.indexOf(heading.tagName) + 1) + ":item",
                    children: [{
                        ID: "link",
                        linktext: text,
                        target: "#" + text
                    }]
                };
            })
        };
        
        var tree = {
            children: []
        };
        
        // A stack of arrays used for generating the tree
        var stack = [];
        stack.push(tree.children);
        
        // Creates a generic tree node
        var createNode = function (id) {
            var node = {
                ID: id,
                children: []
            };
            return node;
        };
        
        var currLevel = -1;
        var level, nextLevel, i, name, node, prefix, item;
        
        for (i = 0; i < items.children.length; i++) {
            item = items.children[i];
            insertAnchor(item.heading);            
            level = levels.indexOf(item.heading[0].tagName);
            delete item.heading;
            
            if (level > currLevel) {
                // create the ul nodes
                while (level > currLevel) {
                    currLevel++;
                    nextLevel = currLevel + 1;
                    prefix = currLevel > 0 ? "level" + currLevel + ":" : null;
                    name = prefix ? prefix + "level" + nextLevel + "s" : "level" + nextLevel + "s:";
                    node = createNode(name);
                    
                    // attach the ul node to the tree and put it on the stack
                    stack[stack.length - 1].push(node);
                    stack.push(node.children);
                }
                
                // attach the current item to the tree
                stack[stack.length - 1].push(items.children[i]);
            } else if (level === currLevel) {
                // attach the current item to the tree
                stack[stack.length - 1].push(items.children[i]);
            } else {
                while (level < currLevel) {
                    stack.pop();
                    currLevel--;
                }
                // attach the current item to the tree
                stack[stack.length - 1].push(items.children[i]);
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
