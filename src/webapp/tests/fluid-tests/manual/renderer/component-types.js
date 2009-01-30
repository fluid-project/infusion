/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global demo*/
var demo = demo || {};

(function ($, fluid) {

    var myOriginalTree = {
        "toc-list:": [{
            "toc_item:": [{
                ID: "toc_anchor",
                linktext: "Amphibians",
                target: "#Amphibians"
            }, {
                ID: "toc_anchor",
                linktext: "Mammals",
                target: "#Mammals"
            }],
            "h2s:": [{
                "h3s:": [{
                     "h3:": [{
                        ID: "toc_anchor",
                        linktext: "CATTS",
                        target: "#Amphibians"
                    }]   
                }]
            }]
         },
         {
            "toc_item:": [{
                ID: "toc_anchor",
                linktext: "Amphibians2",
                target: "#Amphibians2"
            }, {
                ID: "toc_anchor",
                linktext: "Mammals2",
                target: "#Mammals2"
            }],
            "h2s:": [{
                     "h2:": [{
                        ID: "toc_anchor",
                        linktext: "CATTS2",
                        target: "#Amphibians"
                    }]   
            }]
         }]
       };
       
    demo.renderComponents = function () {
        var parsedTemplate = fluid.selfRender($("[id=toc]"), myOriginalTree);
    };    
})(jQuery, fluid);
