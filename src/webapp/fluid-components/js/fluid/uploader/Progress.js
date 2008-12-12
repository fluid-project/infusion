/*
Copyright 2007-2008 University of California, Berkeley
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var animateDisplay = function (elm, animation, defaultAnimation) {
        animation = (animation) ? animation : defaultAnimation;
        elm.animate(animation.params, animation.duration, animation.callback);
    };
    
    var animateProgress = function (elm, width, speed) {
        // de-queue any left over animations
        elm.queue("fx", []); 
        
        elm.animate({ 
            width: width,
            queue: false
        }, 
        speed);
    };
    
    var showProgress = function (that, animation) {
        if (animation === false) {
            that.displayElement.show();
        } else {
            animateDisplay(that.displayElement, animation, that.options.showAnimation);
        }
    };
    
    var hideProgress = function (that, delay, animation) {
        
        delay = (delay === null || isNaN(delay)) ? that.options.delay : delay;
        
        if (delay) {
            // use a setTimeout to delay the hide for n millies, note use of recursion
            var timeOut = setTimeout(function () {
                hideProgress(that, 0, animation);
            }, delay);
        } else {
            if (animation === false) {
                that.displayElement.hide();
            } else {
                animateDisplay(that.displayElement, animation, that.options.hideAnimation);
            }
        }   
    };
    
    var updateWidth = function (that, newWidth) {
        var currWidth = that.indicator.width();
        var direction = that.options.animate;
        if ((newWidth > currWidth) && (direction === "both" || direction === "forward")) {
            animateProgress(that.indicator, newWidth, that.options.speed);
        } else if ((newWidth < currWidth) && (direction === "both" || direction === "backward")) {
            animateProgress(that.indicator, newWidth, that.options.speed);
        } else {
            that.indicator.width(newWidth);
        }
    };
         
    var percentToPixels = function (that, percent) {
        // progress does not support percents over 100, also all numbers are rounded to integers
        return Math.round((Math.min(percent, 100) * that.progressBar.width()) / 100);
    };
        
    var initARIA = function (ariaElement) {
        ariaElement.ariaRole("progressbar");
        ariaElement.ariaState("valuemin", "0");
        ariaElement.ariaState("valuemax", "100");
        ariaElement.ariaState("live", "assertive");
        ariaElement.ariaState("busy", "false");
        ariaElement.ariaState("valuenow", "0");
        ariaElement.ariaState("valuetext", "");
    };
    
    var updateARIA = function (that, percent) {
        var busy = percent < 100 && percent > 0;
        that.ariaElement.ariaState("busy", busy);
        that.ariaElement.ariaState("valuenow", percent);    
        if (busy) {
            var busyString = fluid.stringTemplate(that.options.ariaBusyText, {percentComplete : percent});                  
            that.ariaElement.ariaState("valuetext", busyString);
        } else if (percent === 100) {
            that.ariaElement.ariaState("valuetext", that.options.ariaDoneText);
        }
    };
        
    var updateText = function (label, value) {
        label.html(value);
    };
    
    var repositionIndicator = function (that) {
        that.indicator.css("top", that.progressBar.position().top)
            .css("left", 0)
            .height(that.progressBar.height())
            .width(that.options.minWidth);
    };
    
    var updateProgress = function (that, percent, labelValue, animationForShow) {
        
        // show progress before updating, jQuery will handle the case if the object is already displayed
        showProgress(that, animationForShow);
            
        // do not update if the value of percent is falsey
        if (percent !== null) {
            var pixels = Math.max(percentToPixels(that, parseFloat(percent)), that.options.minWidth);   
            updateWidth(that, pixels);
        }
        updateText(that.label, labelValue);
        
        // update ARIA
        if (that.ariaElement) {
            updateARIA(that, percent);
        }
    };
        
    var setupProgress = function (that) {
        that.displayElement = that.locate("displayElement");

        // hide file progress in case it is showing
        if (that.options.initiallyHidden) {
            that.displayElement.hide();
        }

        that.progressBar = that.locate("progressBar");
        that.label = that.locate("label");
        that.indicator = that.locate("indicator");
        that.ariaElement = that.locate("ariaElement");
        
        that.indicator.width(that.options.minWidth);
                
        // initialize ARIA
        if (that.ariaElement) {
            initARIA(that.ariaElement);
        }   
    };
        
    /**
    * Instantiates a new Progress component.
    * 
    * @param {jQuery|Selector|Element} container the DOM element in which the Uploader lives
    * @param {Object} options configuration options for the component.
    */
    fluid.progress = function (container, options) {
        var that = fluid.initView("fluid.progress", container, options);
        setupProgress(that);
        
        /**
         * Shows the progress bar if is currently hidden.
         * 
         * @param {Object} animation a custom animation used when showing the progress bar
         */
        that.show = function (animation) {
            showProgress(that, animation);
        };
        
        /**
         * Hides the progress bar if it is visible.
         * 
         * @param {Number} delay the amount of time to wait before hiding
         * @param {Object} animation a custom animation used when hiding the progress bar
         */
        that.hide = function (delay, animation) {
            hideProgress(that, delay, animation);
        };
        
        /**
         * Updates the state of the progress bar.
         * This will automatically show the progress bar if it is currently hidden.
         * Percentage is specified as a decimal value, but will be automatically converted if needed.
         * 
         * 
         * @param {Number|String} percentage the current percentage, specified as a "float-ish" value 
         * @param {String} labelValue the value to set for the label; this can be an HTML string
         * @param {Object} animationForShow the animation to use when showing the progress bar if it is hidden
         */
        that.update = function (percentage, labelValue, animationForShow) {
            updateProgress(that, percentage, labelValue, animationForShow);
        };
        
        that.refresh = function (newProgressBarElm) {
            if (newProgressBarElm) {
                that.progressBar = newProgressBarElm;
            }
            
            repositionIndicator(that);
        };
                
        return that;  
    };
      
    fluid.defaults("fluid.progress", {  
        selectors: {
            displayElement: ".fl-progress", // required, the element that gets displayed when progress is displayed, could be the indicator or bar or some larger outer wrapper as in an overlay effect
            progressBar: ".fl-progress-bar", //required
            indicator: ".fl-progress-indicator", //required
            label: ".fl-progress-label", //optional
            ariaElement: ".fl-progress-bar" // usually required, except in cases where there are more than one progressor for the same data such as a total and a sub-total
        },
        
        // progress display and hide animations, use the jQuery animation primatives, set to false to use no animation
        // animations must be symetrical (if you hide with width, you'd better show with width) or you get odd effects
        // see jQuery docs about animations to customize
        showAnimation: {
            params: {
                opacity: "show"
            }, 
            duration: "slow", 
            callback: null
        }, // equivalent of $().fadeIn("slow")
        
        hideAnimation: {
            params: {
                opacity: "hide"
            }, 
            duration: "slow", 
            callback: null
        }, // equivalent of $().fadeOut("slow")

        minWidth: 5, // 0 length indicators can look broken if there is a long pause between updates
        delay: 0, // the amount to delay the fade out of the progress
        speed: 200, // default speed for animations, pretty fast
        animate: "forward", // suppport "forward", "backward", and "both", any other value is no animation either way
        initiallyHidden: true, // supports progress indicators which may always be present
        updatePosition: false,
        
        ariaBusyText: "Progress is %percentComplete percent complete",
        ariaDoneText: "Progress is complete."
    });
    
})(jQuery, fluid_0_6);
