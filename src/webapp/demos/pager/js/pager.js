/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery,fluid*/

var demo = demo || {};

(function ($, fluid) {

    /**
     * Main demo initialization
     */
    demo.initPager = function () {
        var resources = {
            users: {
                href: "../js/pager.json"
            }
        };
        fluid.each(resources, function(resource) {
            resource.options = { dataType: "text"};
        });
        
        function initPager() {
          
            var model = {
                users: JSON.parse(resources.users.resourceText)
            };
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
                    sortable:false
                }
            ];
               
            var pagerBarOptions = {
                type: "fluid.pager.pagerBar",
                options: {
                    pageList: {
                        type: "fluid.pager.renderedPageList",
                        options: {
                            pageStrategy: fluid.pager.gappedPageStrategy(3, 1)
                        }
                    }            
                }
            };
          
            demo.pager = fluid.pager(".demo-pager-container", {
                dataModel: model,
                model: {
                    pageSize: 10
                },
                dataOffset: "users.membership_collection",
                columnDefs: columnDefs,
                annotateColumnRange: "user-link",
                pagerBar: pagerBarOptions,
                bodyRenderer: {
                    type: "fluid.pager.selfRender",
                    options: {
                        selectors: {
                            root: ".demo-pager-table-data"
                        },
                        renderOptions: {debugMode: false}
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
