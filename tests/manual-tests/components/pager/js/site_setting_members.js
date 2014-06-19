/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 Lucendo Development Ltd.
Copyright 2010-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var sakai = sakai || {};

(function () {
    "use strict";

    sakai.initFluidSiteSettingTable = function () {
        var resources = {
            users: {
                href: "../js/demo_site_membership.json"
            },
            site: {
                href: "../js/demo_site.json"
            }
        };
        fluid.each(resources, function (resource) {
            resource.options = { dataType: "text"};
        });

        function initPager() {

            var model = {
                site: JSON.parse(resources.site.resourceText),
                selecteds: [],
                users: JSON.parse(resources.users.resourceText)
            };
            var columnDefs = [
                {key: "selection",
                valuebinding: "selecteds.*.selected",
                sortable: true
                },
                {key: "user-link",
                valuebinding: "*.userDisplayName",
                components: {
                    target: "/dev/sn/profile.html?user=${*.userId}",
                    linktext: fluid.VALUE
                },
                sortable: true
                },
                {key: "user-email",
                valuebinding: "*.userEmail",
                components: {
                    linktext: fluid.VALUE,
                    target: "mailto:${VALUE}"
                },
                sortable: true
                },
                {key: "user-role",
                valuebinding: "*.memberRole",
                components: {
                    selection: fluid.VALUE,
                    optionlist: {valuebinding: "site.userRoles"}
                }
                // test FLUID-2247 - remove sortable from this column
                },
                {key: "user-status",
                valuebinding: "*.active",
                components: {
                    selection: fluid.VALUE,
                    optionlist: {value: ["Active", "Inactive"]}
                },
                sortable: true}
            ];

            fluid.pagedTable(".ss-members", {
                dataModel: model,
                // Test FLUID-2663
                model: {
                    pageIndex: 3
                },
                dataOffset: "users.membership_collection",
                columnDefs: columnDefs,
                //annotateColumnRange: "user-link",
                annotateSortedColumn: true,
                components: {
                    bodyRenderer: {
                        type: "fluid.table.selfRender",
                        options: {
                            selectors: {
                                root: ".site-setting-body",
                                selection: ".demo-selection",
                                "user-link": ".demo-user-link",
                                "user-email": ".demo-user-email",
                                "user-role": ".demo-user-role",
                                "user-status": ".demo-user-status"
                            },
                            renderOptions: {debugMode: false}
                        }
                    }
                },
                decorators: {
                    unsortableHeader: [{
                        type: "attrs",
                        attributes: {
                            title: null
                        }
                    },
                    {
                        type: "addClass",
                        classes: "fl-pager-disabled"
                    }]
                }
            });
        }

        fluid.fetchResources(resources, initPager);

    };
})();
