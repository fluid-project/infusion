/*
Copyright 2009 University of California, Berkeley
Copyright 2010 OCAD University
Copyright 2011 Lucendo Development Ltd.

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
    /**
     * Used to simulate an application that would call Progress.    
     * @param {Integer} percent         the starting percentage when first called and then the current percentage when called recursively
     * @param {Integer} steps           the number of recursive steps to use for the simulated progress
     *                                  note: because of some randomness inserted into the simulation 
     *                                  for realism, the number of steps will actually be much less
     * @param {Function} stepFunction   the stepFunction update the progress component
     * @param {Function} finishFunction the finishFunction enables the submit button, hides the progress simulation and update the text                          
     */
    var simulateTime = function (percent, steps, stepFunction, finishFunction) {
        
        var invokeAfterRandomDelay = function (fn) {
            var delay = Math.floor(Math.random() * 1000 + 100);
            setTimeout(fn, delay);
        };
        
        var aSmallRandomNumber = function () {
            return Math.floor(Math.random() * 10);
        };

        var increment = (steps) ? (100 / steps) : 10;
        
        if (percent < 100) {
            // bump up the current percentage
            percent = Math.round(Math.min(percent + increment + aSmallRandomNumber(), 100));
 
            // update the progress component
            stepFunction(percent);

            // after a random delay, do it all over again
            invokeAfterRandomDelay(function () {
                simulateTime(percent, steps, stepFunction, finishFunction);
            });
        } else {
            finishFunction();
        }
        
    };
    
    var timeSimulator = function (percent, steps) {
        var that = {};
                
        that.start = function (stepFunction, finishFunction) {
            // simulate time
            simulateTime(percent, steps, stepFunction, finishFunction);            
        };

        return that;
    };

    var setAriaAttr = function (liveRegion, submitButton) {
        // set the aria live region attributes
        liveRegion.attr("aria-relevant", "additions text");
        liveRegion.attr("aria-atomic", "false");
        liveRegion.attr("role", "status");         
        
        // set default aria-controls to one of the container
        submitButton.attr("aria-controls", "demo-status-message");
    }; 
    
    demo.initShoppingDemo = function (percent, steps) {
        var submitButton = $(".progress-demo-submit button");
        var statusText = $(".demoSelector-progress-status-text");
        var restartDemo = $(".demoSelector-progress-restart");
        var liveRegion = $(".demoSelector-liveRegion");    
        
        var timer = timeSimulator(percent, steps);         
         
        // hide link to the demo page
        restartDemo.hide();           
         
        // initialize text on element with the class status-text
        statusText.text(demo.initShoppingDemo.strings.confirmStatus);
        
        // set the live region attributes
        setAriaAttr(liveRegion, submitButton);         
        
        var myProgressHide = function () {
             // change text on element with class status-text after  progress simulation is complete
            statusText.text(demo.initShoppingDemo.strings.orderSubmitted);   
            statusText.show();                    
            // re-enable the link to restart the demo
            restartDemo.show(); 
        };       
        
        // here's where we create the progress component
        var myProgress = fluid.progress("#demoSelector-progress-theComponent", {
            speed: 1000,         
            listeners: {
                afterProgressHidden: myProgressHide
            }              
        });
        
        var myFinishFunction = function () {
            myProgress.hide(1000);
        };              
        
        // progress component specific
        var stepFunction = function (percent) {
            // create a label for the progress
            var currentProgressLabel = fluid.stringTemplate(demo.initShoppingDemo.strings.percentCompleted, {
                percent: percent    
            });            
            // tell progress to update
            myProgress.update(percent, currentProgressLabel);
        };
        
        submitButton.click(function () {
            timer.start(stepFunction, myFinishFunction);
            submitButton.blur();
            
            // disable the button
            submitButton.removeClass("enabled");
            submitButton.addClass("disabled");
            submitButton.prop("disabled", true);             
            
            // add area role to the progress title
            statusText.text(demo.initShoppingDemo.strings.progressTitle).show();            
                  
        });   
    };
    
    // Strings which are used in the html to give user feedback
    demo.initShoppingDemo.strings = {
        confirmStatus: "Confirm and submit your order.",
        orderSubmitted: "Order Submitted. Demo finished.",
        percentCompleted: "%percent% Complete",
        progressTitle: "Checking inventory, please wait."       
    };

})(jQuery, fluid);
