/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

var demo = demo || {};

fluid.defaults("demo.pager", {
    gradeNames: ["fluid.resourceLoader", "fluid.viewComponent"],
    resources: {
        users: {
            url: "data/pager.json",
            dataType: "json"
        }
    },
    components: {
        // Configuration for the actual Paged Table component
        pagedTable: {
            type: "fluid.pagedTable",
            container: "{that}.container",
            createOnEvent: "onResourcesLoaded",
            options: {
                dataModel: "{demo.pager}.resources.users.parsed",
                model: {
                    pageSize: 20
                },
                dataOffset: "membership_collection",
                columnDefs: [
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
                ],
                annotateColumnRange: "user-link",
                components: {
                    bodyRenderer: {
                        type: "fluid.table.selfRender",
                        options: {
                            selectors: {
                                root: ".demo-pager-table-data",
                                "user-link": ".demo-user-link",
                                "user-comment": ".demo-user-comment",
                                "user-role": ".demo-user-role",
                                "user-email": ".demo-user-email"
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
            }
        }
    }
});
