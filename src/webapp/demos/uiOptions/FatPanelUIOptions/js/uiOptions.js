/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley

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


	/*
	 * Sliding Panel Component
	 */
	fluid.defaults("fluid.slidingPanel", {
		gradeNames: ["fluid.viewComponent", "autoInit"], 	         
		selectors: {
			toggleButton: "flc-slidingPanel-toggleButton"
		},
		strings: {
			showText: "+ Show Display Preferences",
			hideText: "- Hide"
		},
		events: {
			//open and close?
		},   		
		finalInitFunction: "fluid.slidingPanel.finalInit"             
	});
	
	
	fluid.slidingPanel.togglePanel = function () {
		alert ("yo");
		/*if (uiOptions.container.is(":hidden")) {                
			//panelTabs($("#fl-uiOptions-tabs")); //set up tabs
			var myTabs = fluid.tabs(uiOptions.container, {});
					
			uiOptions.container.slideDown();    
			that.locate("toggleButton").text("- Hide");
		} else {
			uiOptions.container.slideUp();                           
			uiOptions.cancel();
			that.locate("toggleButton").text("+ Show Display Preferences");                
		}*/
		return false;		
	};
	
	fluid.slidingPanel.finalInit = function (that) {
	
		//event binders
		that.locate("toggleButton").click( that.togglePanel );	
	
		//hide panel
		that.container.hide();
	};
	 
	 	 

	/* Our demo script */   
    demo.slidingUIOptions = function (container, button) {
        // First, initialize a UIEnhancer for the page
        var pageEnhancer = fluid.uiEnhancer(document, {
            tableOfContents: {
                options: {
                    templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
                }            
            }
        });
        
        // Next, start up UI Options
        var myUIOptions = fluid.uiOptions(container, {
			components: {
				preview: {
					type: "fluid.uiOptions.livePreview",
				}
			},			
			selectors: {
				previewFrame: ""
			},        
            resources: {
                template: {
                    url: "../../../../components/uiOptions/html/FatPanelUIOptions.html"
                }
            }
        });

        // Put it in the sliding panel.
        //slidingPanel(myUIOptions, button);
        fluid.slidingPanel($("#myUIOptions"), {});
    };
    
})(jQuery, fluid);
