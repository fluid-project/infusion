/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    
    var FluidIoCTests = new jqUnit.TestCase("Fluid JS Tests");
    
    // Test data for some tests
    var config = {
        viewURLTemplate: "http://titan.atrc.utoronto.ca:5984/%dbName/%view",        
        views: {
            exhibitions: "_design/exhibitions/_view/browse"
        }
    };
    
    FluidIoCTests.test("Environmental Tests", function() {
        var urlBuilder = {
            type: "fluid.stringTemplate",
            template: "{config}.viewURLTemplate", 
            mapper: {
                dbName: "${{params}.db}_exhibitions",
                view: "{config}.views.exhibitions" 
            }
        };
      
        fluid.withEnvironment({params: {db: "mccord"}, config: config},
           function() {
               var resolved = fluid.resolveEnvironment(urlBuilder);
               var required = {
                   type: "fluid.stringTemplate",
                   template: "http://titan.atrc.utoronto.ca:5984/%dbName/%view", 
                   mapper: {
                       dbName: "mccord_exhibitions",
                       view: "_design/exhibitions/_view/browse" 
                       }
                    };
               jqUnit.assertDeepEq("Resolved Environment", required, resolved);  
           });
    });
    
    var buildUrl = function (recordType) { 
        return "../data/" + recordType + ".json";
    };
    
    
    var makeArrayExpander = function (recordType) {
     return fluid.expander.makeFetchExpander({
         url: buildUrl(recordType), 
         disposer: function (model) {
             return {
                 items: model,
                 selectionIndex: -1
             }
         },
         options: {
             async: false
         },
         fetchKey: recordType});
    };
    
    FluidIoCTests.test("Deferred expander Tests", function() {
        var pageBuilder = {
            uispec: {
                objects: "These Objects",
                proceduresIntake: "Are Intake"
            }
        };
      
        
        var dependencies = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        makeArrayExpander("objects"),
                        "{pageBuilder}.uispec.objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [".intake-records-group",
                        makeArrayExpander("intake"),
                        "{pageBuilder}.uispec.proceduresIntake",
                        "stringOptions"]
                }
            };
            
        var resourceSpecs = {};
        
        var expanded;
        
        fluid.withEnvironment({
            resourceSpecCollector: resourceSpecs,
            pageBuilder: pageBuilder},
                function() {expanded = fluid.expander.expandLight(dependencies)}
        );
        
        var func = function() {}; // dummy function to compare equality
        
        var requiredSpecs = {
            objects: {
                href: "../data/objects.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            },
            intake: {
                href: "../data/intake.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            }
        };
        
        jqUnit.assertDeepEq("Accumulated resourceSpecs", requiredSpecs, resourceSpecs);
        
        var expectedRes = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        {items: [1, 2, 3],
                         selectionIndex: -1},
                        "These Objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [".intake-records-group",
                        {items: [4, 5, 6],
                         selectionIndex: -1},
                        "Are Intake",
                        "stringOptions"]
                }
            };
        
        fluid.fetchResources(resourceSpecs, function () {
            jqUnit.assertDeepEq("Resolved model", expectedRes, expanded);
        });
    });
})(jQuery);