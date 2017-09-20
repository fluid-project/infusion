/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2014 OCAD University
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};

(function ($, fluid) {
    "use strict";

    /**
     * Main example initialization
     */
    example.initPager = function () {
        var resources = {
            users: {
                href: "../shared/data/pager.json",
                options: {
                    dataType: "json"
                }
            }
        };

        function initPager(resourceSpecs) {

            var model = resourceSpecs.users.resourceText;
            var columnDefs = [
                {
                    key: "user-link",
                    valuebinding: "*.userDisplayName",
                    sortable: true
                },
                {
                    key: "user-email",
                    valuebinding: "*.userEmail",
                    sortable: true
                },
                {
                    key: "user-role",
                    valuebinding: "*.memberRole",
                    sortable: true
                },
                {
                    key: "user-comment",
                    valuebinding: "*.userComment",
                    sortable: false
                }
            ];

            example.pager = fluid.pagedTable(".example-pager-container", {
                dataModel: model,
                model: {
                    pageSize: 20
                },
                dataOffset: "membership_collection",
                columnDefs: columnDefs,
                annotateSortedColumn: true,
                components: {
                    bodyRenderer: {
                        type: "fluid.table.selfRender",
                        options: {
                            selectors: {
                                root: ".example-pager-table-data",
                                "user-link": ".example-user-link",
                                "user-comment": ".example-user-comment",
                                "user-role": ".example-user-role",
                                "user-email": ".example-user-email"
                            },
                            rendererOptions: {debugMode: false} // Change this to true to diagnose rendering issues
                        }
                    }
                },
                decorators: {
                    unsortableHeader: [
                        {
                            type: "attrs",
                            attributes: {
                                title: null
                            }
                        },
                        {
                            type: "addClass",
                            classes: "fl-pager-disabled"
                        }
                    ]
                }
            });
        }

        fluid.fetchResources(resources, initPager);

    };
})(jQuery, fluid);
