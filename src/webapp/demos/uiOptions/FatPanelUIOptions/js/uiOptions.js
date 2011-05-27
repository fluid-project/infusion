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

	/* Our demo script */   
    demo.slidingUIOptions = function (panel, uioptions) {
		// Supply the template URL of "text and display" panel on the user preferences interface
		fluid.demands("fluid.uiOptions.textControls", ["fluid.uiOptions"], {
			options: {
				resources: {
					template: {
						url: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html"
					}
				}
			}
		});

		// Supply the template URL of "layout and navigation" panel on the user preferences interface
		fluid.demands("fluid.uiOptions.layoutControls", ["fluid.uiOptions"], {
			options: {
				resources: {
					template: {
						url: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html"
					}
				}
			}
		});

		// Supply the template URL of "layout and navigation" panel on the user preferences interface
		fluid.demands("fluid.uiOptions.linksControls", ["fluid.uiOptions"], {
			options: {
				resources: {
					template: {
						url: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
					}
				}
			}
		});    
		// Supply the table of contents' template URL
		fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer"], {
			options: {
				templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
			}
		});

		fluid.uiEnhancer();
        
        // Next, start up UI Options
        var myUIOptions = fluid.uiOptions(uioptions, {
			components: {
				preview: {
					type: "fluid.uiOptions.livePreview"
				}
			},			      
            resources: {
                template: {
                    url: "../../../../components/uiOptions/html/FatPanelUIOptions.html"
                }
            }
        });

        // Put it in the sliding panel.
        //slidingPanel(myUIOptions, button);
        fluid.slidingPanel(panel, {
        	selectors: {
        		panel: uioptions
        	}
        });
        
    };
    
})(jQuery, fluid);
