/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University
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
    
    fluid.registerNamespace("fluid.pager");
    
    /******************
     * Pager Bar View *
     ******************/
    
    fluid.pager.updateStyles = function (pageListThat, newModel, oldModel) {
        if (!pageListThat.pageLinks) {
            return;
        }
        if (oldModel.pageIndex !== undefined) {
            var oldLink = pageListThat.pageLinks.eq(oldModel.pageIndex);
            oldLink.removeClass(pageListThat.options.styles.currentPage);
        }
        var pageLink = pageListThat.pageLinks.eq(newModel.pageIndex);
        pageLink.addClass(pageListThat.options.styles.currentPage); 
    };
    
    fluid.pager.bindLinkClick = function (link, initiatePageChange, eventArg) {
        link.unbind("click.fluid.pager");
        link.bind("click.fluid.pager", function () {
            event.fire(eventArg);
        });
    };
    
    // 10 -> 1, 11 -> 2
    fluid.pager.computePageCount = function (model) {
        model.pageCount = Math.max(1, Math.floor((model.totalRange - 1) / model.pageSize) + 1);
    }
    
    fluid.pager.computePageLimit = function (model) {
        return Math.min(model.totalRange, (model.pageIndex + 1) * model.pageSize);
    };
    
    fluid.page.bindLinkClicks = function (pageLinks, initiatePageChange) {
        fluid.each(pageLinks, function (pageLink, i) {
            fluid.pager.bindLinkClick($(pageLink), initiatePageChange, {pageIndex: i});
        });
    };
    
    fluid.defaults("fluid.pager.directPageList", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: {
                funcName: "fluid.pager.bindLinkClicks",
                args: ["{that}.pageLinks", "{pager}.events.initiatePageChange"]
            },
            "{pager}.events.onModelChange": {
                funcName: "fluid.pager.updateStyles",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // newModel, oldModel
            }
        },
        members: {
            pageLinks: "{that}.dom.pageLinks",
            defaultModel: {
                totalRange: "{that}.pageLinks.length"
            }
        }
    });
    
    /** Returns an array of size count, filled with increasing integers, 
     *  starting at 0 or at the index specified by first. 
     */
    
    fluid.iota = function (count, first) {
        first = first || 0;
        var togo = [];
        for (var i = 0; i < count; ++i) {
            togo[togo.length] = first++;
        }
        return togo;
    };
    
    fluid.pager.everyPageStrategy = fluid.iota;
    
    fluid.pager.gappedPageStrategy = function (locality, midLocality) {
        if (!locality) {
            locality = 3;
        }
        if (!midLocality) {
            midLocality = locality;
        }
        return function (count, first, mid) {
            var togo = [];
            var j = 0;
            var lastSkip = false;
            for (var i = 0; i < count; ++i) {
                if (i < locality || (count - i - 1) < locality || (i >= mid - midLocality && i <= mid + midLocality)) {
                    togo[j++] = i;
                    lastSkip = false;
                } else if (!lastSkip) {
                    togo[j++] = -1;
                    lastSkip = true;
                }
            }
            return togo;
        };
    };
    
    /**
     * An impl of a page strategy that will always display same number of page links (including skip place holders). 
     * @param   endLinkCount    int     The # of elements first and last trunks of elements
     * @param   midLinkCount    int     The # of elements from beside the selected #
     * @author  Eric Dalquist
     */
    fluid.pager.consistentGappedPageStrategy = function (endLinkCount, midLinkCount) {
        if (!endLinkCount) {
            endLinkCount = 1;
        }
        if (!midLinkCount) {
            midLinkCount = endLinkCount;
        }
        var endWidth = endLinkCount + 2 + midLinkCount;

        return function (count, first, mid) {
            var pages = [];
            var anchoredLeft = mid < endWidth;
            var anchoredRight = mid >= count - endWidth;
            var anchoredEndWidth = endWidth + midLinkCount;
            var midStart = mid - midLinkCount;
            var midEnd = mid + midLinkCount;
            var lastSkip = false;
            
            for (var page = 0; page < count; page++) {
                if (page < endLinkCount || // start pages
                        count - page <= endLinkCount || // end pages
                        (anchoredLeft && page < anchoredEndWidth) || // pages if no skipped pages between start and mid
                        (anchoredRight && page >= count - anchoredEndWidth) || // pages if no skipped pages between mid and end
                        (page >= midStart && page <= midEnd) // pages around the mid
                        ) {
                    pages.push(page);
                    lastSkip = false;
                } else if (!lastSkip) {
                    pages.push(-1);
                    lastSkip = true;
                }
            }
            return pages;
        };
    };
    
    fluid.pager.rendereredPageList.assembleComponent = function (page, isCurrent, initiatePageChange, currentPageStyle, currentPageIndexMsg) {
        var obj = {
            ID: "page-link:link",
            localID: page + 1,
            value: page + 1,
            pageIndex: page,
            decorators: [
                {
                    type: "jQuery",
                    func: "click", 
                    args: function (event) {
                        initiatePageChange.fire({pageIndex: page});
                        event.preventDefault();
                    }
                }
            ]
        };
        
        if (isCurrent) {
            obj.current = true;
            obj.decorators = obj.decorators.concat([
                {
                    type: "addClass",
                    classes: currentPageStyle
                },
                {
                    type: "jQuery",
                    func: "attr", 
                    args: ["aria-label", currentPageIndexMsg] 
                }
            ]);
        }
        
        return obj;
    };
    
    fluid.pager.renderedPageList.onModelChange = function (that, newModel, oldModel) {
       function pageToComponent(current) {
            return function (page) {
                return page === -1 ? {
                    ID: "page-link:skip"
                } : that.assembleComponent(page, page === current);
            };
        }
      
        var pages = that.options.pageStrategy(newModel.pageCount, 0, newModel.pageIndex);
        var pageTree = fluid.transform(pages, pageToComponent(newModel.pageIndex));
        if (pageTree.length > 1) {
            pageTree[pageTree.length - 1].value = pageTree[pageTree.length - 1].value + that.options.strings.last;
        }
        that.events.onRenderPageLinks.fire(pageTree, newModel);
        that.refreshView();
        //fluid.reRender(template, root, pageTree, renderOptions);
        fluid.pager.updateStyles(that, newModel, oldModel);  
    }
    
    fluid.pager.renderedPageList.renderLinkBody = function (linkBody, rendererOptions) {
        if (linkBody) {
            rendererOptions.cutpoints.push({
                id: "payload-component",
                selector: linkBody
            });
        }  
    };
    
    fluid.defaults("fluid.pager.renderedPageList", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        rendererOptions: {
            cutpoints: [ 
                {
                    id: "page-link:link",
                    selector: "{pagerBar}.options.selectors.pageLinks"
                },
                {
                    id: "page-link:skip",
                    selector: "{pagerBar}.options.selectors.pageLinkSkip"
                }
            ]
        },
        templateSource: "{that}.dom.root",
        renderTarget: "{that}.dom.root",
        renderOnInit: true,
        listeners: {
            onCreate: {
                funcName: "fluid.pager.rendererdPageList.renderLinkBody", 
                args: ["{that}.options.linkBody", "{that}.options.rendererOptions"]  
            },
            "{pager}.onModelChange": {
                funcName: "fluid.pager.renderedPageList.onModelChange",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        invokers: {
            assembleComponent: {
            funcName: "fluid.pager.rendereredPageList.assembleComponent", 
            args: ["{arguments}.0", "{arguments}.1", 
                   "{pager}.events.initiatePageChange", "{pagerBar}.options.styles.currentPage", "{pagerBar}.options.strings.currentPageIndexMsg"]
            }
        },
        
        selectors: {
            root: ".flc-pager-links"
        },
        strings: "{pager}.options.strings",
        linkBody: "a",
        pageStrategy: fluid.pager.everyPageStrategy
    });
    
    
    fluid.defaults("fluid.pager.previousNext", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        members: {
            previous: "{that}.dom.previous",
            next: "{that}.dom.next"
        },
        selectors: {
            previous: ".flc-pager-previous",
            next: ".flc-pager-next"
        },
        listeners: {
            onCreate: [{
                funcName: "fluid.pager.bindLinkClick", 
                args: ["{that}.previous", "{that}.events.initiatePageChange", {relativePage: -1}]
            }, {
                funcName: "fluid.pager.bindLinkClick", 
                args: ["{that}.next", "{that}.events.initiatePageChange", {relativePage: +1}]
            }
            ],
            onModelChange: {
                funcName: "fluid.pager.previousNext.update",
                args: ["{that}", "{that}.options.styles.disabled", "{arguments}.0"] // newModel
            }
        }
    });
    
    fluid.pager.previousNext.update = function (that, disabledStyle, newModel) {
        that.previous.toggleClass(disabledStyle, newModel.pageIndex === 0);
        that.next.toggleClass(disabledStyle, newModel.pageIndex === newModel.pageCount - 1);
    };
    
    fluid.pager.previousNext = function (container, events, options) {
        var that = fluid.initView("fluid.pager.previousNext", container, options);
        that.previous = that.locate("previous");
        fluid.pager.bindLinkClick(that.previous, events, {relativePage: -1});
        that.next = that.locate("next");
        fluid.pager.bindLinkClick(that.next, events, {relativePage: +1});
        events.onModelChange.addListener(
            function (newModel, oldModel, overallThat) {
                updatePreviousNext(that, options, newModel);
            }
        );
        return that;
    };

    
    fluid.defaults("fluid.pager.pagerBar", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            pageList: {
                type: "fluid.pager.renderedPageList",
                container: "{that}.container",
                options: {
                    pageStrategy: fluid.pager.gappedPageStrategy(3, 1)
                }
            },
            previousNext: {
                type: "fluid.pager.previousNext",
                container: "{that}.container",
                options: {
                    selectors: {
                        previous: "{pagerBar}.options.selectors.previous",
                        next: "{pagerBar}.options.selectors.next"
                    }
                }
            }
        },
        events: {
            initiatePageChange: null,
            onModelChange: null  
        },
        
        selectors: {
            pageLinks: ".flc-pager-pageLink",
            pageLinkSkip: ".flc-pager-pageLink-skip",
            previous: ".flc-pager-previous",
            next: ".flc-pager-next"
        },
        
        styles: {
            currentPage: "fl-pager-currentPage",
            disabled: "fl-pager-disabled"
        },
        
        strings: {
            currentPageIndexMsg: "Current page"
        }
    });

    function getColumnDefs(that) { // TODO: What on earth is this function for
        return that.options.columnDefs;
    }

    fluid.table.findColumnDef = function (columnDefs, key) {
        return fluid.find_if(columnDefs, function (def) {
            return def.key === key;
        });
    };
    
    fluid.table.getRoots = function (target, overallThat, index) {
        target.shortRoot = index;
        target.longRoot = fluid.pathUtil.composePath(overallThat.options.dataOffset, target.shortRoot);
    };
    
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
        var columnDef = fluid.pager.findColumnDef(columnDefs, model.sortKey);
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
    
    function expandVariables(value, opts) {
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
                    EL = expandPath(EL, opts.shortRoot, opts.longRoot);
                }
                var val = fluid.get(opts.dataModel, EL);
                togo += val;
                index = endi + 1;
            }
        }
        return togo;
    }
   
    function expandPaths(target, tree, opts) {
        for (var i in tree) {
            var val = tree[i];
            if (val === fluid.VALUE) {
                if (i === "valuebinding") {
                    target[i] = opts.EL;
                } else {
                    target[i] = {"valuebinding" : opts.EL};
                }
            } else if (i === "valuebinding") {
                target[i] = expandPath(tree[i], opts);
            } else if (typeof (val) === 'object') {
                target[i] = val.length !== undefined ? [] : {};
                expandPaths(target[i], val, opts);
            } else if (typeof (val) === 'string') {
                target[i] = expandVariables(val, opts);
            } else {
                target[i] = tree[i];
            }
        }
        return target;
    }
   
    // sets opts.EL, returns ID
    fluid.table.IDforColumn = function (columnDef, opts) {
        var options = opts.options;
        var EL = columnDef.valuebinding;
        var key = columnDef.key;
        if (!EL) {
            fluid.fail("Error in definition for column with key " + key + ": valuebinding is not set");
        }
        opts.EL = expandPath(EL, opts.shortRoot, opts.longRoot);
        if (!key) {
            var segs = fluid.model.parseEL(EL);
            key = segs[segs.length - 1];
        }
        var ID = (options.keyPrefix ? options.keyPrefix : "") + key;
        return ID;
    };
   
    function expandColumnDefs(filteredRow, opts) {
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
            togo = expandPaths({}, togo, opts);
            togo.ID = ID;
            return togo;
        });
        return tree;
    }
   
    fluid.table.fetchDataModel = function (dataModel, dataOffset) {
        return fluid.get(dataModel, dataOffset);
    };
   
    
    function bigHeaderForKey(key, opts) {
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
    }
   
    function setSortHeaderClass(styles, element, sort) {
        element = $(element);
        element.removeClass(styles.ascendingHeader);
        element.removeClass(styles.descendingHeader);
        if (sort !== 0) {
            element.addClass(sort === 1 ? styles.ascendingHeader : styles.descendingHeader);
            // aria-sort property are specified in the w3 WAI spec, ascending, descending, none, other.
            // since pager currently uses ascending and descending, we do not support the others.
            // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-sort
            element.attr('aria-sort', sort === 1 ? 'ascending' : 'descending'); 
        }
    }
    
    function isCurrentColumnSortable(columnDefs, model) {
        var columnDef = model.sortKey ? fluid.pager.findColumnDef(columnDefs, model.sortKey) : null;
        return columnDef ? columnDef.sortable : false;
    }
    
    function setModelSortHeaderClass(newModel, opts) {
        var styles = opts.overallOptions.styles;
        var sort = isCurrentColumnSortable(opts.columnDefs, newModel) ? newModel.sortDir : 0;
        setSortHeaderClass(styles, bigHeaderForKey(newModel.sortKey, opts), sort);
    }
   
    fluid.pager.fireModelChange = function (that, newModel, forceUpdate) {
        computePageCount(newModel);
        if (newModel.pageIndex >= newModel.pageCount) {
            newModel.pageIndex = newModel.pageCount - 1;
        }
        if (forceUpdate || newModel.pageIndex !== that.model.pageIndex || newModel.pageSize !== that.model.pageSize || newModel.sortKey !== that.model.sortKey ||
                newModel.sortDir !== that.model.sortDir) {
            var sorted = isCurrentColumnSortable(getColumnDefs(that), newModel) ? 
                that.options.sorter(that, newModel) : null;
            that.permutation = sorted;
            that.events.onModelChange.fire(newModel, that.model, that);
            fluid.model.copyModel(that.model, newModel);
        }
    }

    fluid.pager.generateColumnClick = function (overallThat, columnDef, opts) {
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
                setModelSortHeaderClass(newModel, opts);                
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
                            {"jQuery": ["click", fluid.pager.generateColumnClick(overallThat, columnDef, opts)]},
                            {identify: "header:" + columnDef.key},
                            {type: "attrs", attributes: { title: (columnDef.key === newModel.sortKey) ? sortableColumnTxt : opts.options.strings.sortableColumnText}}
                        ].concat(fluid.table.fetchHeaderDecorators(opts.overallOptions.decorators, columnDef))
                    };
                })  
        };
    };
   
    /** A body renderer implementation which uses the Fluid renderer to render a table section **/
   
    fluid.pager.selfRender = function (overallThat, inOptions) {
        var that = fluid.initView("fluid.pager.selfRender", overallThat.container, inOptions);
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
                                getRoots(expOpts, overallThat, filteredRow.index);
                                if (columnDefs === "explode") {
                                    return fluid.explode(filteredRow.row, expOpts.longRoot);
                                } else if (columnDefs.length) {
                                    return expandColumnDefs(filteredRow, expOpts);
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
                        setModelSortHeaderClass(newModel, expOpts); // TODO, should this not be actually renderable?
                    }
                }
            }
        };
    };

    fluid.defaults("fluid.pager.selfRender", {
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

    fluid.pager.summaryAria = function (element) {
        element.attr({
            "aria-relevant": "all",
            "aria-atomic": "false",
            "aria-live": "assertive",
            "role": "status"
        });
    };
    
    
    fluid.defaults("fluid.pager.summary", { 
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: {
               funcName: "fluid.pager.summaryAria",
               args: "{that}.container"
            },
            onModelChange: {
                funcName: "fluid.pager.summary.onModelChange",
                args: ["{that}.container", "{arguments}.0", "{arguments}.1"] 
            }
        },
        events: {
            onModelChange: null
        }
    });

    fluid.pager.summary.onModelChange = function (node, newModel, oldModel) {
        var text = fluid.stringTemplate(options.message, {
            first: newModel.pageIndex * newModel.pageSize + 1,
            last: fluid.pager.computePageLimit(newModel),
            total: newModel.totalRange,
            currentPage: newModel.pageIndex + 1
        });
        if (node.length > 0) {
            node.text(text);
        }
    };
    
    fluid.pager.directPageSize = function (that) {
        var node = that.locate("pageSize");
        if (node.length > 0) {
            that.events.onModelChange.addListener(
                function (newModel, oldModel) {
                    if (node.val() !== newModel.pageSize) {
                        node.val(newModel.pageSize);
                    }
                }
            );
            node.change(function () {
                that.events.initiatePageSizeChange.fire(node.val());
            });
        }
    };

    fluid.pagedTable.rangeAnnotator.onRenderPageLinks = function (that, tree, newModel) {
        var roots = {};
        var column = that.options.annotateColumnRange;
        if (!column) {
            return;
        }
        var dataModel = that.options.dataModel;
        // TODO: reaching into another component's options like this is a bit unfortunate
        var columnDefs = getColumnDefs(that);
        var columnDef = fluid.pager.findColumnDef(columnDefs, column);
        
        function fetchValue(index) {
            index = that.permutation ? that.permutation[index] : index;
            return fluid.table.fetchValue(that, dataModel, index, columnDef.valuebinding, roots);
        }
        var tModel = {};
        fluid.model.copyModel(tModel, newModel);
        
        fluid.transform(tree, function (cell) {
            if (cell.ID === "page-link:link") {
                var page = cell.pageIndex;
                var start = page * tModel.pageSize;
                tModel.pageIndex = page;
                var limit = fluid.pager.computePageLimit(tModel);
                var iValue = fetchValue(start);
                var lValue = fetchValue(limit - 1);
                
                var tooltipOpts = fluid.copy(that.options.tooltip.options) || {};
                
                if (!tooltipOpts.content) {
                    tooltipOpts.content = function () { 
                        return fluid.stringTemplate(that.options.markup.rangeAnnotation, {
                            first: iValue,
                            last: lValue
                        });
                    };
                }
                
                if (!cell.current) {
                    var decorators = [
                        {
                            type: "fluid",
                            func: that.options.tooltip.type,
                            options: tooltipOpts
                        }
                    ];
                    cell.decorators = cell.decorators.concat(decorators);
                }
            }
        });
    };

    fluid.defaults("fluid.pagedTable.rangeAnnotator", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{pagedTable}.events.onRenderPageLinks": {
                funcName: "fluid.pagedTable.rangeAnnotator.onRenderPageLinks",
                args: ["{pagedTable}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    fluid.pager.initiatePageChangeListener = function (that, arg) {
        var newModel = fluid.copy(that.model);
        if (arg.relativePage !== undefined) {
            newModel.pageIndex = that.model.pageIndex + arg.relativePage;
        } else {
            newModel.pageIndex = arg.pageIndex;
        }
        if (newModel.pageIndex === undefined || newModel.pageIndex < 0) {
            newModel.pageIndex = 0;
        }
        fluid.pager.fireModelChange(that, newModel, arg.forceUpdate);
    };
    
    fluid.pager.initiatePageSizeChangeListener = function (that, arg) {
        var newModel = fluid.copy(that.model);
        newModel.pageSize = arg;
        fluid.pager.fireModelChange(that, newModel);     
    };

    /*******************
     * Pager Component *
     *******************/

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
    
    fluid.defaults("fluid.pagedTable", {
        gradeNames: ["fluid.pager", "fluid.table", "autoInit"],
        components: {
            rangeAnnotator: {
                type: "fluid.pager.rangeAnnotator"
            }  
        },
        tooltip: { // TODO: This is not currently a real component but just a house for options
            type: "fluid.tooltip" 
        },
        invokers: {
            acquireDefaultRange: {
                funcName: "fluid.identity",
                args: "{that}.dataModel.length"
            }
        },
        modelFilter: fluid.pagedTable.directModelFilter,
        model: {
            pageSize: 10  
        }
    });
    
    fluid.defaults("fluid.pager", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            initiatePageChange: null,
            initiatePageSizeChange: null,
            onModelChange: null,
            onRenderPageLinks: null,
            afterRender: null
        },
        listeners: {
            onCreate: [ {
                namespace: "containerRole",
                "this": "{container}",
                method: "attr",
                args: ["role", "application"]  
            }, {
                func: "{that}.events.initiatePageChange.fire",
                args: {  
                    pageIndex: "{that}.model.pageIndex",
                    forceUpdate: true
                }
            }
            ],
            initiatePageChange: {
                funcName: "fluid.pager.initiatePageChangeListener",
                args: ["{that}", "{arguments}.0"]   
            },
            initiatePageSizeChange: {
                funcName: "fluid.pager.initiatePageSizeChangeListener",
                args: ["{that}", "{arguments}.0"]   
            }
        },
        invokers: {
            acquireDefaultRange: {
                funcName: "fluid.identity",
                args: "{that}.pagerBar.pageList.defaultModel.totalRange"
            }
        },
        components: {
            summary: {
                type: "fluid.pager.summary",
                container: "{that}.dom.summary",
                options: {
                    message: "Viewing page %currentPage. Showing records %first - %last of %total items."
                },
                events: {
                    onModelChange: "{pager}.events.onModelChange"
                }
            },
            pageSize: {
                type: "fluid.pager.directPageSize"
            },
            bodyRenderer: {
                type: "fluid.pager.selfRender"
            }
        },
        dynamicComponents: {
            pagerBar: {
                source: "{that}.dom.pagerBar",
                type: "fluid.pager.pagerBar",
                container: "{source}",
                options: {
                    strings: "{pager}.options.strings",
                    events: {
                        initiatePageChange: "{pager}.events.initiatePageChange",
                        onModelChange: "{pager}.events.onModelChange"
                    }
                }
            }
        },

        model: {
            pageIndex: 0, // TODO: this was originally undefined - why?
            pageSize: 1,
            totalRange: {
                expander: {
                    func: "{that}.acquireDefaultRange"
                }
            }
        },
        
        annotateColumnRange: undefined, // specify a "key" from the columnDefs
        
        selectors: {
            pagerBar: ".flc-pager-top, .flc-pager-bottom",
            summary: ".flc-pager-summary",
            pageSize: ".flc-pager-page-size",
            headerSortStylisticOffset: ".flc-pager-sort-header"
        },
        
        styles: {
            ascendingHeader: "fl-pager-asc",
            descendingHeader: "fl-pager-desc"
        },
        
        decorators: {
            sortableHeader: [],
            unsortableHeader: []
        },
        
        strings: {
            last: " (last)"
        },
        
        markup: {
            rangeAnnotation: "<b> %first </b><br/>&mdash;<br/><b> %last </b>"
        }
    });
})(jQuery, fluid_1_5);
