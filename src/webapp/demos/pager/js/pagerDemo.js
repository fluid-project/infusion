/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($, fluid) {

    /**
     * Main demo initialization
     */
    demo.initPager = function () {
        var resources = {
            users: {
                href: "../data/pager.json",
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
          
            demo.pager = fluid.pager(".demo-pager-container", {
                dataModel: model,
                model: {
                    pageSize: 10
                },
                dataOffset: "membership_collection",
                columnDefs: columnDefs,
                annotateColumnRange: "user-link",
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
