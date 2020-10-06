/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when
 * testing with the data in the portlets.html file.
 */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.testUtils");

    fluid.testUtils.moduleLayout = {

        portalRootId: "portlet-reorderer-root",
        portletIds: ["portlet0", "portlet1", "portlet2", "portlet3", "portlet4", "portlet5", "portlet6", "portlet7", "portlet8", "portlet9"],

        column1id: "c1",
        column2id: "c2",
        column3id: "c3",
        column4id: "c4",

        columnSelector: "[id^='c']",
        portletSelector: "[id^='portlet']",

        emptyLayout: { id: "t3", columns: [] },

        fullLayout: {
            "id": "portlet-reorderer-root",
            "columns": [
                { "id": "c1", "children": ["portlet1", "portlet2", "portlet3", "portlet4"]},
                { "id": "c2", "children": ["portlet5", "portlet6"]},
                { "id": "c3", "children": ["portlet7", "portlet8", "portlet9"]},
                { "id": "c4", "children": []}
            ]
        },

        // Permissions are no longer supported, this table is listed here for historical reasons
        dropTargetPerms: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // portlet 1
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // portlet 2
            [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],   // portlet 3
            [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],   // portlet 4
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],   // portlet 5
            [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],   // portlet 6
            [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],   // portlet 7
            [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],   // portlet 8
            [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1]    // portlet 9
        ],

        initReorderer: function () {
            var options = {
                selectors: {
                    columns: fluid.testUtils.moduleLayout.columnSelector,
                    modules: fluid.testUtils.moduleLayout.portletSelector,
                    dropWarning: jQuery("#drop-warning"),
                    lockedModules: ".locked"
                }
            };
            return fluid.reorderLayout("#" + fluid.testUtils.moduleLayout.portalRootId, options);
        },

        container: function () {
            return jQuery("#" + fluid.testUtils.moduleLayout.portalRootId);
        },

        allColumns: function () {
            return jQuery("[id^=c]");
        },

        allPortlets: function () {
            return jQuery("div[id^=portlet]");
        }
    };
})();
