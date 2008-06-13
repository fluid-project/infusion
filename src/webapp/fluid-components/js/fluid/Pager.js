/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

(function ($, fluid) {
    
    // Currently puts in all the page links
    // Need to deal with only showing some page links - provide different strategies. 
    // Need to put in an AJAX anchor around the number so server can refresh the pane
    function addPageElements(previous, num) {
        var tagName = previous[0].tagName;
        for (var i = num; i > 0; i--) {
            var el = document.createElement(tagName);
            el.innerHTML = i;
            previous.after(el);
        }    
    }

    // Should clean the clone - get rid of ids etc. 
    // Should we add the bottom to the top's parent instead of the container? 
    function addPagerBottom(container, pagerTop) {
        var pagerBottom = pagerTop.clone();
        pagerBottom.removeAttr("id");
        container.append(pagerBottom);
    }
    
    fluid.Pager = function (componentContainerId, numOfPages, options) {
        this.numOfPages = numOfPages;
        // Mix in the user's configuration options.
        options = options || {};
        selectors = $.extend({}, this.defaults.selectors, options.selectors);

        // Bind to the DOM.
        this.container = fluid.utils.jById(componentContainerId);
        this.pagerTop = $(selectors.pagerTop, this.container);
        this.previous = $(selectors.previous, this.container);
        this.next = $(selectors.next, this.container);
        
        addPageElements(this.previous, this.numOfPages);
        addPagerBottom(this.container, this.pagerTop);       
    };
    
    fluid.Pager.prototype.defaults = {
        selectors: {
            pagerTop: ".pager-top",
            previous: ".previous",
            next: ".next"
        }
    };
    
    // Change styling and disable a particular page number
    // Set next and previous
    fluid.Pager.prototype.selectPage = function (pageNum) {
    };
        
}) (jQuery, fluid);
