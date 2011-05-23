/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    /******
    * ToC *
    *******/
    fluid.registerNamespace("fluid.tableOfContents");
    
    fluid.tableOfContents.insertAnchor = function (name, element) {
        $("<a></a>", {
            name: name,
            id: name
        }).insertBefore(element);
    };
    
    fluid.tableOfContents.generateGUID = function (baseName) {
        return baseName + "_toc_" + fluid.allocateGuid();
    };
    
    fluid.tableOfContents.finalInit = function (that) {
        var headings = that.locate("headings");
        that.tocAnchors = [];
        
        fluid.each(headings, function (heading) {
            var guid = that.generateGUID(heading.tagName);
            that.insertAnchor(guid, heading);
            that.tocAnchors.push("#" + guid);
        });
        
        that.model = that.modelBuilder.assembleModel(headings, that.tocAnchors);
        that.events.onReady.fire();
    };
    
    
    fluid.defaults("fluid.tableOfContents", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.tableOfContents.finalInit",
        components: {
            levels: {
                type: "fluid.tableOfContents.levels",
                container: "{fluid.tableOfContents}.dom.tocContainer",
                createOnEvent: "onReady",
                options: {
                    model: {
                        headings: "{fluid.tableOfContents}.model"
                    }
                }
            },
            modelBuilder: {
                type: "fluid.tableOfContents.modelBuilder"
            }
        },
        invokers: {
            insertAnchor: "fluid.tableOfContents.insertAnchor",
            generateGUID: "fluid.tableOfContents.generateGUID"
        },
        selectors: {
            headings: ":header",
            tocContainer: ".flc-toc-tocContainer"
        },
        events: {
            onReady: null
        }
    });
    
    /*******************
    * ToC ModelBuilder *
    ********************/
    fluid.registerNamespace("fluid.tableOfContents.modelBuilder");
    
    fluid.tableOfContents.modelBuilder.toModel = function (headingObjs, currentLevel) {
        currentLevel = currentLevel || 0;
        var model = [];
        
        while (headingObjs.length > 0) {
            var currentHeading = headingObjs[0];
            var segment = {};
            
            if (currentHeading.level < currentLevel) {
                break;
            }
            
            if (currentHeading.level > currentLevel) {
                segment.headings = fluid.tableOfContents.modelBuilder.toModel(headingObjs, currentLevel + 1);
                model.push(segment);
            }
            
            if (currentHeading.level === currentLevel) {
                headingObjs.shift();
                delete currentHeading.level;
                model.push(currentHeading);
            }
        }
        
        return model.length > 0 ? model : null;
    };
    
    fluid.tableOfContents.modelBuilder.convertToHeadingObjects = function (headings, anchors, levels, func) {
        var headingObjs = [];
        
        fluid.each(headings, function (heading, index) {
            var level = $.inArray(heading.tagName, levels);
            if (func(heading, level)) {
                headingObjs.push({
                    level: level,
                    text: $(heading).text(),
                    url: anchors[index]
                });
            }
        });
        
        return headingObjs;
    };
    
    fluid.tableOfContents.modelBuilder.validateHeading = function (heading, level) {
        return level >= 0;
    };
    
    fluid.tableOfContents.modelBuilder.finalInit = function (that) {
        that.assembleModel = function (headings, anchors) {
            var headingObjs = that.convertToHeadingObjects(headings, anchors, that.options.levels, that.validateHeading);
            return that.toModel(headingObjs);
        };
    };
    
    fluid.defaults("fluid.tableOfContents.modelBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.tableOfContents.modelBuilder.finalInit",
        invokers: {
            convertToHeadingObjects: "fluid.tableOfContents.modelBuilder.convertToHeadingObjects",
            validateHeading: "fluid.tableOfContents.modelBuilder.validateHeading",
            toModel: "fluid.tableOfContents.modelBuilder.toModel"
        },
        levels: ["H1", "H2", "H3", "H4", "H5", "H6"]
    });
    
    /*************
    * ToC Levels *
    **************/
    fluid.registerNamespace("fluid.tableOfContents.levels");
     
    fluid.tableOfContents.levels.finalInit = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.container.append(that.options.resources.template.resourceText);
            that.refreshView();
        });        
    };

    fluid.tableOfContents.levels.buildLevels = function (currentLevel, toLevel) {
        var nextLevel = currentLevel + 1;
        var repeatID = "level" + currentLevel + "s";
        var valueAs = "heading" + currentLevel;
        var pathAs = "heading" + currentLevel + "path";
        var controlledBy = currentLevel > 1 ? "{heading" + (currentLevel - 1) + "path}.headings"  : "headings";
        
        var tree = {
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: repeatID,
                controlledBy: controlledBy,
                valueAs: valueAs,
                pathAs: pathAs,
                tree: {
                    expander: [{
                        type: "fluid.renderer.condition",
                        condition: "{" + valueAs + "}.text",
                        trueTree: {
                            link: {
                                target: "${{" + pathAs + "}.url}",
                                linktext: "${{" + pathAs + "}.text}"
                            }
                        }
                    }]
                }
            }
        };
        
        if (nextLevel <= toLevel) {
            var segment = fluid.tableOfContents.levels.buildLevels(nextLevel, toLevel);
            tree.expander.tree.expander.push(segment.expander);
        }
        
        return tree;
    };
     
    fluid.tableOfContents.levels.produceTree = function (that) {
        return fluid.tableOfContents.levels.buildLevels(1, 6);
    };
     
    fluid.defaults("fluid.tableOfContents.levels", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "fluid.tableOfContents.levels.finalInit",
        produceTree: "fluid.tableOfContents.levels.produceTree",
        selectors: {
            level1s: ".flc-toc-levels-level1s",
            level2s: ".flc-toc-levels-level2s",
            level3s: ".flc-toc-levels-level3s",
            level4s: ".flc-toc-levels-level4s",
            level5s: ".flc-toc-levels-level5s",
            level6s: ".flc-toc-levels-level6s",
            link: ".flc-toc-levels-link"
        },
        repeatingSelectors: ["level1s", "level2s", "level3s", "level4s", "level5s", "level6s"],
        events: {},
        model: {
            headings: [] // [text: heading, url: linkURL, headings: [ an array of subheadings in the same format]
        },
        resources: {
            template: {
                forceCache: true,
                url: "../html/TableOfContents.html"
            }
        }
    });

})(jQuery, fluid_1_4);
