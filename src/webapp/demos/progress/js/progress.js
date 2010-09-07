/*
Copyright 2009 University of California, Berkeley

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
     * @param {Object} aProgress  the Progress object to call
     * @param {Integer} percent   the starting percentage when first called and then the current percentage when called recursively
     * @param {Integer} steps     the number of recursive steps to use for the simulated progress
     *                            note: because of some randomness inserted into the simulation 
     *                            for realism, the number of steps will actually be much less
     */
    var anIllusionOfProgress = function (aProgress, percent, steps) {
        
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
            // create a label for the progress
            var currentProgressLabel = percent + "% Complete";
            // tell progress to update
            aProgress.update(percent, currentProgressLabel);
            // after a random delay, do it all over again
            invokeAfterRandomDelay(function () {
                anIllusionOfProgress(aProgress, percent, steps);
            });
        } else {
            myProgress.hide(2000);
        }
        
    };
    
    demo.initClickProgress = function () {
        myProgress = fluid.progress("#main", {
            speed: 1000
        });
        $("#showButton").click(function () {
            anIllusionOfProgress(myProgress, 0, 200);
            $("#showButton").blur();
        });   
    };

})(jQuery, fluid);
