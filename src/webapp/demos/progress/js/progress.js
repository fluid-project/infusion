/*
Copyright 2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery,fluid*/

var demo = demo || {};

(function ($, fluid) {
    var myProgress;
    
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

    demo.initShoppingDemo = function (percent, steps) {
        var submitButton = $("#submit-section button");
        var statusText = $(".status-text");
        var restartDemo = $(".restart-demo");
        var liveRegion = $(".region");
        var statusArea = $(".status-area");
       
        var timer = timeSimulator(percent, steps);         
         
        // set initial aria roles and aria-controls to some of the containers
        statusArea.attr("role", "status");
        submitButton.attr("aria-controls", "status-message");
         
        // hide link to the demo page
        restartDemo.hide();        
         
        // initialize text on element with the class status-text
        // TODO: Language strings should be external to code.
        statusText.text("Confirm and submit your order.");
                
        // here's where we create the progress component
        var myProgress = fluid.progress("#progress-container", {
            speed: 1000
        });
        
        var setAriaLiveRegionAttr = function (liveRegion) {
            // set the aria live region attributes
            liveRegion.attr("aria-channel", "notify");
            liveRegion.attr("aria-relevant", "all");
            liveRegion.attr("aria-atomic", "false");
            liveRegion.attr("aria-live", "assertive");
            liveRegion.attr("role", "description");
        };      
        
        var myFinishFunction = function () {
            myProgress.container.fadeOut("slow", function () {
                // change text on element with class status-text after  progress simulation is complete   
                // TODO: More English strings in code
                statusText.text("Order Submitted. Demo finished.").show();            
                // set the live region attributes to the div element
                setAriaLiveRegionAttr(liveRegion);            
                // re-enable the link to restart the demo
                restartDemo.show();        
            });
        };        
        
        // progress component specific
        var stepFunction = function (percent) {
             // create a label for the progress
             // TODO: English string in code
            var currentProgressLabel = percent + "% Complete";            
            // tell progress to update
            myProgress.update(percent, currentProgressLabel);
        };
        
        submitButton.click(function () {
            timer.start(stepFunction, myFinishFunction);
            submitButton.blur();
            
            // disable the button
            submitButton.removeClass("enabled");
            submitButton.addClass("disabled");
            submitButton.attr("disabled", "disabled");  
                    
            statusText.hide();             
        });   
    };

})(jQuery, fluid);
