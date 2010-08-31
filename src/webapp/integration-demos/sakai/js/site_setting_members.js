/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var sakai = sakai || {};


sakai.initFluidSiteSettingTable = function() {
    var resources = {
      users: {
        href: "../js/demo_site_membership.json"
      },
      site: {
        href: "../js/demo_site.json"
      }
    };
    
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
                linktext: fluid.VALUE},
            sortable:true
            },
           {key: "user-email",
            valuebinding: "*.userEmail",
            components: {
                linktext: fluid.VALUE,
                target: "mailto:${VALUE}"
                }
            // test FLUID-2247 - remove sortable from this column 
            },
           {key: "user-role",
            valuebinding: "*.memberRole",
            components: {
                selection: fluid.VALUE, 
                optionlist: {valuebinding: "site.userRoles"}
               },
            sortable: true
           },
           {key: "user-status",
            valuebinding: "*.active",
            components: {
                selection: fluid.VALUE,
                optionlist: {value: ["Active", "Inactive"]}
            },
            sortable: true}
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
  
    var pager = fluid.pager(".ss-members", {
        dataModel: model,
        // Test FLUID-2663
        model: {
            pageIndex: 3
        },
        dataOffset: "users.membership_collection",
        columnDefs: columnDefs,
        annotateColumnRange: "user-link",
        pagerBar: pagerBarOptions,

        bodyRenderer: {
          type: "fluid.pager.selfRender",
          options: {
              selectors: {
                root: ".site-setting-body"
            },
            renderOptions: {debugMode: false}
          }
        },
        decorators: {
            unsortableHeader: [
            {type: "attrs",
             attributes: {
                 title: null
                 }
            },
            {type: "addClass",
            classes: "fl-pager-disabled"
            }
            ]
        }
    });
    }
    
    fluid.fetchResources(resources, initPager);
    
};

