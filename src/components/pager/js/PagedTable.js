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
    fluid.registerNamespace("fluid.pagedTable");

    // cf. ancient SVN-era version in bitbucket at https://bitbucket.org/fluid/infusion/src/adf319d9b279/branches/FLUID-2881/src/webapp/components/pager/js/PagedTable.js

    fluid.defaults("fluid.pagedTable.rangeAnnotator", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{pagedTable}.events.onRenderPageLinks": {
                funcName: "fluid.pagedTable.rangeAnnotator.onRenderPageLinks",
                args: ["{pagedTable}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    fluid.pagedTable.rangeAnnotator.onRenderPageLinks = function (that, tree, newModel) {
        var roots = {};
        var column = that.options.annotateColumnRange || (that.options.annotateSortedColumn ? newModel.sortKey : null);
        if (!column) {
            return;
        }
        var dataModel = that.options.dataModel;
        var columnDefs = that.options.columnDefs;
        var columnDef = fluid.table.findColumnDef(columnDefs, column);

        function fetchValue(index) {
            index = that.permutation ? that.permutation[index] : index;
            return fluid.table.fetchValue(that.options.dataOffset, dataModel, index, columnDef.valuebinding, roots);
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


    fluid.pagedTable.directModelFilter = function (model, pagerModel, perm) {
        var togo = [];
        var limit = fluid.pager.computePageLimit(pagerModel);
        for (var i = pagerModel.pageIndex * pagerModel.pageSize; i < limit; ++i) {
            var index = perm ? perm[i] : i;
            togo[togo.length] = {index: index, row: model[index]};
        }
        return togo;
    };

    fluid.defaults("fluid.pagedTable", {
        gradeNames: ["fluid.pager", "fluid.table", "autoInit"],
        components: {
            rangeAnnotator: {
                type: "fluid.pagedTable.rangeAnnotator"
            }
        },
        annotateSortedColumn: false,
        annotateColumnRange: undefined, // specify a "key" from the columnDefs

        tooltip: {
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


})(jQuery, fluid_1_5);