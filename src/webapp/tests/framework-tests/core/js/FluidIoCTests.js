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


fluid.testUtils = fluid.testUtils || {};

fluid.demands("fluid.testUtils.testComponent2", "fluid.testUtils.testComponent", 
    ["{testComponent}.container", 
     {"default1": "{testComponent}.options.default1"}
    ]);
   
fluid.demands("fluid.reorderer.gridReorderer", "fluid.reorderer",
    ["{that}.container",
    {"orientation": "{gridReorderer.orientation}"}]);

fluid.defaults("fluid.testUtils.testComponent", {
    default1: "testComponent value",
    components: {
        test2: {
            type: "fluid.testUtils.testComponent2",
            options: {
                value: "Original default value"
            }
        }
    }
});


// Somehow we sort of have to write this. Perhaps "component grading" will make it
// possible to guess instantiation signatures
fluid.demands("fluid.testUtils.modelComponent", "fluid.testUtils.dependentModel",
  [fluid.COMPONENT_OPTIONS]);

fluid.defaults("fluid.testUtils.modelComponent", {
    mergePolicy: {
        model: "preserve"
    }
});


fluid.defaults("fluid.testUtils.dependentModel", {
    mergePolicy: {
        model: "preserve"
    },
    components: {
        modelComponent: {
            type: "fluid.testUtils.modelComponent",
            options: {
                model: "{dependentModel}.options.model"
            }
        }
    }
});

fluid.makeComponents({
    "fluid.testUtils.testComponent":   "fluid.standardComponent",
    "fluid.testUtils.testComponent2":  "fluid.standardComponent",
    "fluid.testUtils.testOrder":       "fluid.standardComponent", 
    "fluid.testUtils.subComponent":    "fluid.standardComponent",
    "fluid.testUtils.invokerComponent":"fluid.littleComponent",
    "fluid.testUtils.modelComponent":  "fluid.littleComponent",
    "fluid.testUtils.dependentModel":  "fluid.littleComponent"
    });

fluid.defaults("fluid.testUtils.testComponent2", {
    components: {
        sub1: {
          type: "fluid.testUtils.subComponent",
        },
        sub2: {
          type: "fluid.testUtils.subComponent",
          options: {
              value: "Subcomponent 2 default"
          }
        }
    }});
    
fluid.defaults("fluid.testUtils.invokerComponent", {
    template: "Every {0} has {1} {2}(s)",
    invokers: {
        render: {
            funcName: "fluid.formatMessage",
            args:["{invokerComponent}.options.template", "@0"] 
        }
    },
    events: {
        testEvent: null
    }
});
    
fluid.demands("sub1", "fluid.testUtils.testComponent2",
["{testComponent2}.container", {"crossDefault": "{testComponent2}.sub2.options.value"}]
);

fluid.demands("sub2", "fluid.testUtils.testComponent2",
["{testComponent2}.container", fluid.COMPONENT_OPTIONS]);



(function ($) {
    
    var fluidIoCTests = new jqUnit.TestCase("Fluid IoC Tests");
    
    fluid.logEnabled = true;

    fluidIoCTests.test("construct", function() {
        expect(2);
        var that = fluid.testUtils.testComponent("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "testComponent value", that.test2.options.default1);
    });

    fluidIoCTests.test("crossConstruct", function() {
        expect(2);
        var that = fluid.testUtils.testComponent2("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "Subcomponent 2 default", that.sub1.options.crossDefault);
    });
    
    fluidIoCTests.test("invokers", function() {
        expect(2);
        var that = fluid.testUtils.invokerComponent();
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Rendered", "Every CATT has 4 Leg(s)", 
            that.render(["CATT", "4", "Leg"]));
    });
    
    fluidIoCTests.test("Aliasing expander test", function() {
        expect(3);
        var model = {};
        var that = fluid.testUtils.dependentModel({model: model});
        jqUnit.assertValue("Constructed", that);
        model.pollute = 3;
        jqUnit.assertEquals("Transit 1", 3, that.options.model.pollute);
        jqUnit.assertEquals("Transit 1", 3, that.modelComponent.options.model.pollute);
    });
    
    
    // Test data for some tests
    var config = {
        viewURLTemplate: "http://titan.atrc.utoronto.ca:5984/%dbName/%view",        
        views: {
            exhibitions: "_design/exhibitions/_view/browse"
        }
    };
    
    fluidIoCTests.test("Environmental Tests", function() {
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
    
    fluidIoCTests.test("Deferred expander Tests", function() {
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