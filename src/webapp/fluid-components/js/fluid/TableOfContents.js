/*
Copyright 2009 University of Toronto

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
     *  - get and implement a design for the table of contents 
     *  - integrate table of contents with UI Options
     *  - make the toc template pluggable
     *  - make sure getting headings using something other then a selector works
     *  - move interesting parts of the template to the defaults ie. link
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
     * Creates a generic tree node
     */
    var createNode = function (id) {
        var node = {
            ID: id,
            children: []
        };
        return node;
    };

    /**
     * Creates the renderer tree that matches the table of contents template
     * @param {jQuery Object} headings - the headings to be put into the table of contents
     */
    var createTree = function (headings, levels) {
        
        // Builds the tree recursively 
        var generateTree = function (nodes, items, level) {
            if (items.length === 0) {
                return;
            }
            
            var item = items[0];
            
            if (level === item.level) {
                nodes[nodes.length - 1].push(item.leaf);
                items.shift();
                return generateTree(nodes, items, level);
            }
            
            if (level < item.level) {
                var prefix = level > -1 ? "level" + (level + 1) + ":" : "";
                var postfix = level === -1 ? "s:" : "s";
                var name = prefix + "level" + (level + 2) + postfix;
                var myNode = createNode(name);
                nodes[nodes.length - 1].push(myNode);
                nodes.push(myNode.children);
                return generateTree(nodes, items, level + 1);
            }
            
            if (level > item.level) {
                nodes.pop();
                return generateTree(nodes, items, level - 1);
            }
        };

        var tree = {
            children: []
        };
        
        // Leaf nodes for the renderer tree from the headings
        var items = fluid.transform(headings, function (heading) {
                var level = $.inArray(heading.tagName, levels);
                var text = $(heading).text();
                return {
                    level: level,
                    leaf: {
                        ID: "level" + (level + 1) + ":item",
                        children: [{
                            ID: "link",
                            linktext: text,
                            target: "#" + text
                        }]
                    }
                };
            });

        generateTree([tree.children], items, -1);
        
        return tree;
    };
    
    var buildTOC = function (container, headings, levels, templateURL, afterRender) {
        // Insert anchors into the page that the table of contents will link to
        headings.each(function (i, el) {
            insertAnchor($(el));
        });
        
        // Data structure needed by fetchResources
        var resources = {
            toc: {
                href: templateURL
            }
        };
        
        // Get the template, create the tree and render the table of contents
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["toc"], {});
            var node = $("<div></div>");
            fluid.reRender(templates, node, createTree(headings, levels), {});
            container.prepend(node);
            afterRender.fire();
        });
    };

    fluid.tableOfContents = function (container, options) {
        var that = fluid.initView("fluid.tableOfContents", container, options);
        var templateHref = that.options.template.path + that.options.template.href;
        buildTOC(that.container, that.locate("headings"), that.options.levels, templateHref, that.events.afterRender);
        
        return that;
    };
    
    fluid.defaults("fluid.tableOfContents", {  
        selectors: {
            headings: ":header"
        },
        events: {
            afterRender: null
        },
        template: {
            path: "",
            href: "fluid-components/html/templates/TableOfContents.html"
        },
        levels: ["H1", "H2", "H3", "H4", "H5", "H6"]
    });

})(jQuery, fluid_0_8);
