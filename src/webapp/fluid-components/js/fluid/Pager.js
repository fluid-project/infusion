/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/

/*global fluid*/
fluid = fluid || {};

(function ($, fluid) {
    
    /*
     * Start Pager Link Display 
     */
    
    /**   Private stateless functions   **/
   
    var styleSelectedLink = function (link, currentPageStyle) {
        link.addClass(currentPageStyle);        
    };

    var selectLink = function (link, currentPageStyle, pageWillChange) {
        if (pageWillChange) {
            pageWillChange(link[0]);
        }
        styleSelectedLink(link, currentPageStyle);        
    };
    
    var bindLinkHandlers = function (link, currentPageStyle, pageWillChange) {
        link.click(function (evt) {
            if (!link.hasClass(currentPageStyle)) {
                selectLink(link, currentPageStyle, pageWillChange);
            }
            return false;
        });
        
        // Needs to bind hover
    };
   
    /**   Pager Link Display creator   **/
   
    fluid.pagerLinkDisplay = function (pageLinks, previous, next, currentPageStyle, pageWillChange) {
        // Bind handlers
        bindLinkHandlers(previous, currentPageStyle, pageWillChange);
        bindLinkHandlers(next, currentPageStyle, pageWillChange);
        pageLinks.each(function () {
            bindLinkHandlers($(this), currentPageStyle, pageWillChange);
        });
        
        return {
            pageLinks: pageLinks,
            previous: previous,
            next: next,
            selectPage: function (pageNum) {
                var pageLink = $(pageLinks[pageNum-1]);
                selectLink(pageLink, currentPageStyle, pageWillChange);
            },
            pageIsSelected: function (pageNum) {
                var pageLink = $(pageLinks[pageNum-1]);
                styleSelectedLink(pageLink, currentPageStyle);
            }

        };
    };
   
    /*
     * Start of Pager Bar
     */

    /**   Pager Bar creator   **/

    fluid.pagerBar = function (bar, selectors, currentPageStyle, pageWillChange) {        
        var pageLinks = $(selectors.pageLinks, bar);
        var previous = $(selectors.previous, bar);
        var next = $(selectors.next, bar);
        
        var linkDisplay = fluid.pagerLinkDisplay(pageLinks, previous, next, currentPageStyle, pageWillChange);
        
        return {
            bar: bar,
            linkDisplay: linkDisplay,
            selectPage: function (pageNum) {
                linkDisplay.selectPage(pageNum);
            },
            pageIsSelected: function (pageNum) {
                linkDisplay.pageIsSelected(pageNum);
            }

        };
    };

    /* 
     * Start of the Pager
     */
    
    /**   Constructor  **/ 
               
    fluid.Pager = function (componentContainerId, options) {
        // Mix in the user's configuration options.
        options = options || {};
        var selectors = $.extend({}, this.defaults.selectors, options.selectors);
        this.styles = $.extend({}, this.defaults.styles, options.styles);
        this.pageWillChange = options.pageWillChange || this.defaults.pageWillChange; 

        // Bind to the DOM.
        this.container = fluid.utils.jById(componentContainerId);
        
        // Create pager bars
        var top = $(selectors.pagerTop, this.container);
        this.topBar = fluid.pagerBar(top, selectors, this.styles.currentPage, this.pageWillChange);
        var bottom = $(selectors.pagerBottom, this.container);
        this.bottomBar = fluid.pagerBar(bottom, selectors, this.styles.currentPage, this.pageWillChange);

        this.topBar.pageIsSelected(1);
        this.bottomBar.pageIsSelected(1);
        
    };
 
     /**   Public stuff   **/   
     
    fluid.Pager.prototype.defaults = {
        selectors: {
            pagerTop: ".pager-top",
            pagerBottom: ".pager-bottom",
            pageLinks: ".page-link",
            previous: ".previous",
            next: ".next"
        },

        styles: {
            currentPage: "current-page"
        },
        
        pageWillChange: function (link) {
            // AJAX call here
        }
    };
    
    // Need to change styling and disable a particular page number
    // Need to set next and previous
    fluid.Pager.prototype.selectPage = function (pageNum) {
    };
   // next
   
   // previous     
})(jQuery, fluid);
