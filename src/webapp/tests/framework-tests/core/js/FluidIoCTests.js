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
})(jQuery);