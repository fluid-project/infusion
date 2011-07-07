/*
Copyright 2011 OCAD University

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
(function ($) {
    // Supply the templates
    fluid.staticEnvironment.uiOptionsDemo = fluid.typeTag("fluid.uiOptionsDemo");
    fluid.demands("fluid.uiOptionsTemplateLoader", "fluid.uiOptionsDemo", {
        options: {
            prefix: "../../../../components/uiOptions/html/"
        }
    });
    
    fluid.demands("fluid.renderIframe", ["fluid.uiOptionsDemo"], {
        options: {
            markupProps: {
                src: "../../../../components/uiOptions/html/FatPanelUIOptionsFrame.html"
            }
        }
    });

    // Supply the table of contents' template URL
    fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer"], {
        options: {
            templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
        }
    });

    demo.init = function () {
        fluid.fatPanelUIOptions(".flc-uiOptions-fatPanel");   
    };
})(jQuery);