/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2013 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    
    // cf. ancient SVN-era version in bitbucket at https://bitbucket.org/fluid/infusion/src/adf319d9b279/branches/FLUID-2881/src/webapp/components/pager/js/Table.js
    
    fluid.registerNamespace("fluid.table");
    
    fluid.table.findColumnDef = function (columnDefs, key) {
        return fluid.find_if(columnDefs, function (def) {
            return def.key === key;
        });
    };
    
    fluid.table.getRoots = function (target, overallThat, index) {
        target.shortRoot = index;
        target.longRoot = fluid.pathUtil.composePath(overallThat.options.dataOffset, target.shortRoot);
    };
    
    // TODO: This crazed variable expansion system was a sketch for what eventually became the "protoComponent expansion system" delivered in 1.x versions of
    // Infusion. It in turn should be abolished when FLUID-4260 is implemented, allowing users to code with standard Fluid components and standard IoC references 
    
    fluid.table.expandPath = function (EL, shortRoot, longRoot) {
        if (EL.charAt(0) === "*") {
            return longRoot + EL.substring(1); 
        } else {
            return EL.replace("*", shortRoot);
        }
    };
    
    fluid.table.fetchValue = function (that, dataModel, index, valuebinding, roots) {
        fluid.table.getRoots(roots, that, index);

        var path = fluid.table.expandPath(valuebinding, roots.shortRoot, roots.longRoot);
        return fluid.get(dataModel, path);
    };
    
    fluid.table.rowComparator = function (sortDir) {
        return function (arec, brec) {
            return (arec.value - brec.value) * sortDir;
        };  
    }
    
    fluid.table.basicSorter = function (overallThat, model) {        
        var dataModel = overallThat.options.dataModel;
        var roots = {};
        var columnDefs = getColumnDefs(overallThat);
        var columnDef = fluid.table.findColumnDef(columnDefs, model.sortKey);
        var sortrecs = [];
        for (var i = 0; i < model.totalRange; ++i) {
            sortrecs[i] = {
                index: i,
                value: fluid.table.fetchValue(overallThat, dataModel, i, columnDef.valuebinding, roots)
            };
        }

        sortrecs.sort(fluid.table.rowComparator(model.sortDir));
        return fluid.getMembers(sortrecs, "index");
    };

    
    fluid.pagedTable.directModelFilter = function (model, pagerModel, perm) {
        var togo = [];
        var limit = fluid.pager.computePageLimit(pagerModel);
        for (var i = pagerModel.pageIndex * pagerModel.pageSize; i < limit; ++i) {
            var index = perm ? perm[i] : i;
            togo[togo.length] = {index: index, row: model[index]};
        }
        return togo;
    };
   
    // sets opts.EL, returns ID
    fluid.table.IDforColumn = function (columnDef, opts) {
        var options = opts.options;
        var EL = columnDef.valuebinding;
        var key = columnDef.key;
        if (!EL) {
            fluid.fail("Error in definition for column with key " + key + ": valuebinding is not set");
        }
        opts.EL = fluid.table.expandPath(EL, opts.shortRoot, opts.longRoot);
        if (!key) {
            var segs = fluid.model.parseEL(EL);
            key = segs[segs.length - 1];
        }
        var ID = (options.keyPrefix ? options.keyPrefix : "") + key;
        return ID;
    };
   
    
    fluid.table.bigHeaderForKey = function (key, opts) {
        var id = opts.options.renderOptions.idMap["header:" + key];
        var smallHeader = fluid.jById(id);
        if (smallHeader.length === 0) {
            return null;
        }
        var headerSortStylisticOffset = opts.overallOptions.selectors.headerSortStylisticOffset;
        var bigHeader = fluid.findAncestor(smallHeader, function (element) {
            return $(element).is(headerSortStylisticOffset); 
        });
        return bigHeader;
    };
   
    fluid.table.setSortHeaderClass = function (styles, element, sort) {
        element = $(element);
        element.removeClass(styles.ascendingHeader);
        element.removeClass(styles.descendingHeader);
        if (sort !== 0) {
            element.addClass(sort === 1 ? styles.ascendingHeader : styles.descendingHeader);
            // aria-sort property are specified in the w3 WAI spec, ascending, descending, none, other.
            // since pager currently uses ascending and descending, we do not support the others.
            // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-sort
            element.attr("aria-sort", sort === 1 ? "ascending" : "descending"); 
        }
    };
    
    fluid.table.isCurrentColumnSortable = function (columnDefs, model) {
        var columnDef = model.sortKey ? fluid.table.findColumnDef(columnDefs, model.sortKey) : null;
        return columnDef ? columnDef.sortable : false;
    };
    
    fluid.table.setModelSortHeaderClass = function (newModel, opts) {
        var styles = opts.overallOptions.styles;
        var sort = fluid.table.isCurrentColumnSortable(opts.columnDefs, newModel) ? newModel.sortDir : 0;
        fluid.table.setSortHeaderClass(styles, bigHeaderForKey(newModel.sortKey, opts), sort);
    };
   
    
    fluid.table.generateColumnClick = function (overallThat, columnDef, opts) {
        return function () {
            if (columnDef.sortable === true) {
                var model = overallThat.model;
                var newModel = fluid.copy(model);
                var styles = overallThat.options.styles;
                var oldKey = model.sortKey;
                if (columnDef.key !== model.sortKey) {
                    newModel.sortKey = columnDef.key;
                    newModel.sortDir = 1;
                    var oldBig = bigHeaderForKey(oldKey, opts);
                    if (oldBig) {
                        setSortHeaderClass(styles, oldBig, 0);
                    }
                } else if (newModel.sortKey === columnDef.key) {
                    newModel.sortDir = -1 * newModel.sortDir;
                } else {
                    return false;
                }
                newModel.pageIndex = 0;
                fluid.pager.fireModelChange(overallThat, newModel, true);
                fluid.table.setModelSortHeaderClass(newModel, opts);                
            }
            return false;
        };
    };
   
    fluid.table.fetchHeaderDecorators = function (decorators, columnDef) {
        return decorators[columnDef.sortable ? "sortableHeader" : "unsortableHeader"];
    };
   
    fluid.table.generateHeader = function (overallThat, newModel, columnDefs, opts) {
        var sortableColumnTxt = opts.options.strings.sortableColumnText;
        if (newModel.sortDir === 1) {
            sortableColumnTxt = opts.options.strings.sortableColumnTextAsc;
        } else if (newModel.sortDir === -1) {
            sortableColumnTxt = opts.options.strings.sortableColumnTextDesc;
        }

        return {
            children:  
                fluid.transform(columnDefs, function (columnDef) {
                    return {
                        ID: iDforColumn(columnDef, opts),
                        value: columnDef.label,
                        decorators: [ 
                            {"jQuery": ["click", fluid.table.generateColumnClick(overallThat, columnDef, opts)]},
                            {identify: "header:" + columnDef.key},
                            {type: "attrs", attributes: { title: (columnDef.key === newModel.sortKey) ? sortableColumnTxt : opts.options.strings.sortableColumnText}}
                        ].concat(fluid.table.fetchHeaderDecorators(opts.overallOptions.decorators, columnDef))
                    };
                })  
        };
    };
   
    fluid.table.expandVariables = function (value, opts) {
        var togo = "";
        var index = 0;
        while (true) {
            var nextindex = value.indexOf("${", index);
            if (nextindex === -1) {
                togo += value.substring(index);
                break;
            } else {
                togo += value.substring(index, nextindex);
                var endi = value.indexOf("}", nextindex + 2);
                var EL = value.substring(nextindex + 2, endi);
                if (EL === "VALUE") {
                    EL = opts.EL;
                } else {
                    EL = fluid.table.expandPath(EL, opts.shortRoot, opts.longRoot);
                }
                var val = fluid.get(opts.dataModel, EL);
                togo += val;
                index = endi + 1;
            }
        }
        return togo;
    };
   
    fluid.table.expandPaths = function (target, tree, opts) {
        for (var i in tree) {
            var val = tree[i];
            if (val === fluid.VALUE) {
                if (i === "valuebinding") {
                    target[i] = opts.EL;
                } else {
                    target[i] = {"valuebinding" : opts.EL};
                }
            } else if (i === "valuebinding") {
                target[i] = fluid.table.expandPath(tree[i], opts);
            } else if (typeof (val) === "object") {
                target[i] = val.length !== undefined ? [] : {};
                fluid.table.expandPaths(target[i], val, opts);
            } else if (typeof (val) === "string") {
                target[i] = fluid.table.expandVariables(val, opts);
            } else {
                target[i] = tree[i];
            }
        }
        return target;
    };
   
    fluid.table.expandColumnDefs = function (filteredRow, opts) {
        var tree = fluid.transform(opts.columnDefs, function (columnDef) {
            var ID = fluid.table.IDforColumn(columnDef, opts);
            var togo;
            if (!columnDef.components) {
                return {
                    ID: ID,
                    valuebinding: opts.EL
                };
            } else if (typeof columnDef.components === "function") {
                togo = columnDef.components(filteredRow.row, filteredRow.index);
            } else {
                togo = columnDef.components;
            }
            togo = fluid.table.expandPaths({}, togo, opts);
            togo.ID = ID;
            return togo;
        });
        return tree;
    };
   
    fluid.table.fetchDataModel = function (dataModel, dataOffset) {
        return fluid.get(dataModel, dataOffset);
    };
   
   
    /** A body renderer implementation which uses the Fluid renderer to render a table section **/
   
    fluid.table.selfRender = function (overallThat, inOptions) {
        var that = fluid.initView("fluid.table.selfRender", overallThat.container, inOptions);
        var options = that.options;
        var root = that.locate("root");
        var template = fluid.selfRender(root, {}, options.renderOptions);
        root.addClass(options.styles.root);
        var columnDefs = getColumnDefs(overallThat);
        var expOpts = {options: options, columnDefs: columnDefs, overallOptions: overallThat.options, dataModel: overallThat.options.dataModel, idMap: idMap};
        var directModel = overallThat.fetchDataModel();

        return {
            returnedOptions: {
                listeners: {
                    onModelChange: function (newModel, oldModel) {
                        var filtered = overallThat.options.modelFilter(directModel, newModel, overallThat.permutation);
                        var tree = fluid.transform(filtered, 
                            function (filteredRow) {
                                fluid.table.getRoots(expOpts, overallThat, filteredRow.index);
                                if (columnDefs === "explode") {
                                    return fluid.explode(filteredRow.row, expOpts.longRoot);
                                } else if (columnDefs.length) {
                                    return fluid.table.expandColumnDefs(filteredRow, expOpts);
                                }
                            });
                        var fullTree = {};
                        fullTree[options.row] = tree;
                        if (typeof (columnDefs) === "object") {
                            fullTree[options.header] = generateHeader(overallThat, newModel, columnDefs, expOpts);
                        }
                        options.renderOptions = options.renderOptions || {};
                        options.renderOptions.model = expOpts.dataModel;
                        fluid.reRender(template, root, fullTree, options.renderOptions);
                        overallThat.events.afterRender.fire(overallThat);
                        fluid.table.setModelSortHeaderClass(newModel, expOpts); // TODO, should this not be actually renderable?
                    }
                }
            }
        };
    };

    fluid.defaults("fluid.table.selfRender", {
        selectors: {
            root: ".flc-pager-body-template"
        },
        styles: {
            root: "fl-pager"
        },
        keyStrategy: "id",
        keyPrefix: "",
        row: "row:",
        header: "header:",
        
        strings: {
            sortableColumnText: "Select to sort",
            sortableColumnTextDesc: "Select to sort in ascending, currently in descending order.",
            sortableColumnTextAsc: "Select to sort in descending, currently in ascending order."
        },

        // Options passed upstream to the renderer
        renderOptions: {}
    });
    
    
    fluid.table.checkTotalRange = function (totalRange, pagerBar) {
        if (totalRange === undefined && !pagerBar) {
            fluid.fail("Error in Pager configuration - cannot determine total range, " +
                    " since not configured in model.totalRange and no PagerBar is configured");
        }
    };
    
    fluid.defaults("fluid.table", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        mergePolicy: {
            dataModel: "preserve"
        },
        components: {
            bodyRenderer: {
                type: "fluid.table.selfRender"
            }
        },
        listeners: {
            onCreate: {
                funcName: "fluid.table.checkTotalRange",
                namespace: "checkTotalRange",
                args: ["{that}.model.totalRange", "{that}.pagerBar"]
            }  
        },
        modelFilter: fluid.table.directModelFilter, // TODO: no implementation for this yet
        sorter: fluid.table.basicSorter,
        members: {
            dataModel: {
                expander: {
                    func: "{that}.fetchDataModel"
                }
            }
        },
        invokers: {
             fetchDataModel: {
                 funcName: "fluid.table.fetchDataModel",
                 args: ["{that}.options.dataModel", "{that}.options.dataOffset"]
             }
        },
        // Offset of the tree's "main" data from the overall dataModel root
        dataOffset: "",
        // strategy for generating a tree row, either "explode" or an array of columnDef objects
        columnDefs: [], // [{key: "columnName", valuebinding: "*.valuePath", sortable: true/false}]
    });
    
})(jQuery, fluid_1_5);