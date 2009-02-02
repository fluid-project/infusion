var sakai = sakai || {};


sakai.initFluidSiteSettingTable = function() {
    var resources = {
      users: {
        href: "js/demo_site_membership.json"
      },
      site: {
        href: "js/demo_site.json"
      }
    };
    
    function initPager() {
      
        var model = {
            site: JSON.parse(resources.site.resourceText),
            selecteds: [],
            users: JSON.parse(resources.users.resourceText)
        };
      
        function cellGenerator (row) {
          return 
          [{ID: "selection",
            valuebinding: "selecteds.*.selected"},
           {ID: "user-link",
            target: "/dev/sn/profile.html?user=" + row.userId,
            linktext: row.userDisplayName},
           {ID: "user-email",
            valuebinding: "*.userEmail"},
           {ID: "user-role",
            selection: {valuebinding: "*.userRole"},
            optionlist: {valuebinding: "site.userRoles"}
            },
           {ID: "user-status",
            selection: {valuebinding: "*.active"},
            optionlist: {value: ["Active", "Inactive"]}}
            ];
           
        }
  
    var pager = fluid.pager(".ss-members", {
        userModel: model,
        bodyRenderer: {
          type: "fluid.pager.selfRender",
          options: {
            root: ".site-setting-body",
            cells: cellGenerator,
            cellRoot: "users.membership"
          }
        }
    });
    }
    
    fluid.fetchResources(resources, initPager);
    
};

