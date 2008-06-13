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
    // Need to bind the anchor to a change page handler
    // Should we take an optional link creator function? Or pull a template from the markup?
    function addPageElements(previous, num) {
        var tagName = previous[0].tagName;
        for (var i = num; i > 0; i--) {
            var el = document.createElement(tagName);
            var a = document.createElement("a");
            a.innerHTML = i;
            jQuery(el).append(a);
            previous.after(el);
        }
    }

    // Should clean the clone - get rid of ids, set a reasonable id etc. 
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
        this.styles = $.extend({}, this.defaults.styles, options.styles);
        this.pageChangedCallback = options.pageChangedCallback || this.defaults.pageChangedCallback; 

        // Bind to the DOM.
        this.container = fluid.utils.jById(componentContainerId);
        this.pagerTop = $(selectors.pagerTop, this.container);
        this.previous = $(selectors.previous, this.container);
        this.next = $(selectors.next, this.container);
        
        addPageElements(this.previous, this.numOfPages, "#");
        addPagerBottom(this.container, this.pagerTop);
        this.selectPage(1);     
    };
    
    fluid.Pager.prototype.defaults = {
        selectors: {
            pagerTop: ".pager-top",
            previous: ".previous",
            next: ".next"
        },

        styles: {
            currentPage: "current-page"
        },

        pageChangedCallback: function (pageNum) {
            // AJAX call here
        }
    };
    
    // Need to change styling and disable a particular page number
    // Need to set next and previous
    fluid.Pager.prototype.selectPage = function (pageNum) {
        this.pageChangedCallback(pageNum);
    };
        
}) (jQuery, fluid);
