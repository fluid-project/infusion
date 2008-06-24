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
   
    var styleSelectedLink = function (link, oldLink, currentPageStyle) {
        link.addClass(currentPageStyle); 
        if (oldLink) {
            oldLink.removeClass(currentPageStyle);
        }
    };

    var selectLink = function (link, oldLink, currentPageStyle, pageWillChange) {
        if (pageWillChange) {
            pageWillChange(link[0]);
        }
        styleSelectedLink(link, oldLink, currentPageStyle);        
    };
   
    /**   Pager Link Display creator   **/
   
    fluid.pagerLinkDisplay = function (pageLinks, previous, next, currentPageStyle, pageWillChange) {
        
        return {
            pageLinks: pageLinks,
            previous: previous,
            next: next,
            selectPage: function (pageNum, oldPageNum) {
                var pageLink = $(pageLinks[pageNum - 1]);
                var oldLink = $(pageLinks[oldPageNum - 1]);
                selectLink(pageLink, oldLink, currentPageStyle, pageWillChange);
            },
            pageIsSelected: function (pageNum, oldPageNum) {
                var pageLink = $(pageLinks[pageNum - 1]);
                var oldLink = oldPageNum ? $(pageLinks[oldPageNum - 1]) : undefined;
                styleSelectedLink(pageLink, oldLink, currentPageStyle);
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
            selectPage: function (pageNum, oldPageNum) {
                linkDisplay.selectPage(pageNum, oldPageNum);
            },
            pageIsSelected: function (pageNum, oldPageNum) {
                linkDisplay.pageIsSelected(pageNum, oldPageNum);
            },
            pageNumOfLink: function (link) {
                var test = function (elementOfArray, indexInArray) {
                    return pageLinks.index(elementOfArray) > -1;
                };
                link = fluid.utils.findAncestor(link, test);
                return pageLinks.index(link) + 1;
            }
        };
    };

    /* 
     * Start of the Pager
     */
    
    /**   Private stateless functions   **/
    var bindSelectHandler = function (pager) {
        var selectHandler = function (evt) {
            // is next? call next
            
            // is previous? call previous
            
            var newPageNum = pager.topBar.pageNumOfLink(evt.target) || pager.bottomBar.pageNumOfLink(evt.target);
            if (newPageNum < 1) {
                return true;
            }
            
            pager.selectPage(newPageNum);
            return false;
        };

        pager.container.click(selectHandler);
    };

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

        this.pageNum = 1;
        this.topBar.pageIsSelected(this.pageNum);
        this.bottomBar.pageIsSelected(this.pageNum);
        
        bindSelectHandler(this);
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
    
    fluid.Pager.prototype.selectPage = function (pageNum) {
        if (pageNum === this.pageNum) {
            return;
        }
        this.topBar.selectPage(pageNum, this.pageNum);
        this.bottomBar.pageIsSelected(pageNum, this.pageNum);
        this.pageNum = pageNum;
    };
    
    fluid.Pager.prototype.next = function () {
        this.selectPage(this.pageNum + 1);
    };
   
    fluid.Pager.prototype.previous = function () {
        this.selectPage(this.pageNum - 1);
    };
    
})(jQuery, fluid);
