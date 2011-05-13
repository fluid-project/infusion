/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    /**********************
     * Sliding Panel *
	 * TODO: that.locate not working for toggleButton because button is outside of container. refactor!     
     *********************/	 
     
	fluid.defaults("fluid.slidingPanel", {
		gradeNames: ["fluid.viewComponent", "autoInit"], 	         
		selectors: {
			toggleButton: ".flc-slidingPanel-toggleButton"
		},
		strings: {
			showText: "+ Show Display Preferences",
			hideText: "- Hide"
		},  		
		finalInitFunction: "fluid.slidingPanel.finalInit"             
	});
	
	
	fluid.slidingPanel.finalInit = function (that) {
	
		that.togglePanel = function () {
			if (that.container.is(":hidden")) {                						
				that.container.slideDown();    
				//that.locate("toggleButton").text(that.options.strings.hideText);
				$('.flc-slidingPanel-toggleButton').text(that.options.strings.hideText);
			} else {
				that.container.slideUp();                           
				//that.locate("toggleButton").text(that.options.strings.showText);                
				$('.flc-slidingPanel-toggleButton').text(that.options.strings.showText);                
			}
		};	
	
	
		//event binder
		//that.locate("toggleButton").click(that.togglePanel);
		$('.flc-slidingPanel-toggleButton').click(that.togglePanel);	
			
		//Start Up: hide panel
		//that.locate("toggleButton").text(that.options.strings.showText); 
		$('.flc-slidingPanel-toggleButton').text(that.options.strings.showText); 
		that.container.hide();
	};    

})(jQuery, fluid_1_4);
