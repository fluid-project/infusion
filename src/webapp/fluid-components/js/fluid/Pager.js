/*
Copyright 2008 University of Toronto

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

    /******************
     * Pager Bar View *
     ******************/
    
    var updateStyles = function (that, pageNum, oldPageNum) {
        var pageLink, oldLink;
        
        pageLink = that.pageLinks.eq(pageNum - 1);
        pageLink.addClass(that.options.styles.currentPage); 

        if (oldPageNum) {
            oldLink = that.pageLinks.eq(oldPageNum - 1);
            oldLink.removeClass(that.options.styles.currentPage);
        }
    };

    var updatePreviousNext = function (that, pageNum) {
        if (pageNum < 2) {
            that.previous.addClass(that.options.styles.disabled);
        } else {
            that.previous.removeClass(that.options.styles.disabled);
        }
        
        if (pageNum >= that.pageLinks.length) {
            that.next.addClass(that.options.styles.disabled);
        } else {
            that.next.removeClass(that.options.styles.disabled);
        }
    };
   
    var selectPage = function (that, pageNum, oldPageNum) {
        var pageLink = that.pageLinks.eq(pageNum - 1);
        updateStyles(that, pageNum, oldPageNum);
        updatePreviousNext(that, pageNum); 
    };
    
    var bindModelEvents = function (that) {
        that.returnedOptions = {
            listeners: {
                onPageChange: that.selectPage
            }  
        };
    };
   
    var setupPageBar = function (that, events) {
        that.events = events;
        bindModelEvents(that);
        
        that.pageLinks = that.locate("pageLinks");
        that.previous = that.locate("previous");
        that.next = that.locate("next");
    };

    fluid.pagerBar = function (container, events, options) {
        var that = fluid.initView("fluid.pagerBar", container, options);
        
        // Private methods.
        var isPageLink = function (element) {
            return that.pageLinks.index(element) > -1;
        };
        var isNext = function (element) {
            return (element === that.next[0]);
        };
        var isPrevious = function (element) {
            return (element === that.previous[0]);
        };

        // Public methods.
        that.selectPage = function (pageNum, oldPageNum) {
            selectPage(that, pageNum, oldPageNum);
        };
        
        that.pageNumOfLink = function (link) {
            link = fluid.findAncestor(link, isPageLink);
            return that.pageLinks.index(link) + 1;
        };
        
        that.isNext = function (link) {
            return !!fluid.findAncestor(link, isNext);
        };
        
        that.isPrevious = function (link) {
            return !!fluid.findAncestor(link, isPrevious);
        };
        
        setupPageBar(that, events);
        return that;
    };
    
    fluid.defaults("fluid.pagerBar", {
       selectors: {
           pageLinks: ".page-link",
           previous: ".previous",
           next: ".next"
       },
       
       styles: {
           currentPage: "current-page",
           disabled: "disabled"
       }
    });

    /*******************
     * Pager Component *
     *******************/
    
    var bindDOMEvents = function (that) {
        var selectHandler = function (evt) {
            // This code should be refactored into pagerBar.
            if (that.topBar.isNext(evt.target) || that.bottomBar.isNext(evt.target)) {
                that.next();
                return false;
            }
            if (that.topBar.isPrevious(evt.target) || that.bottomBar.isPrevious(evt.target)) {
                that.previous();
                return false;
            }
            var newPageNum = that.topBar.pageNumOfLink(evt.target) || that.bottomBar.pageNumOfLink(evt.target);
            if (newPageNum < 1) {
                return true;
            }

            that.selectPage(newPageNum);
            return false;
        };

        that.container.click(selectHandler);
    };

    var setupPager = function (that) {
        // Setup the top and bottom pager bars.
        that.topBar = fluid.initSubcomponent(that, "pagerBar", [that.locate("pagerTop"), fluid.COMPONENT_OPTIONS]);
        that.bottomBar = fluid.initSubcomponent(that, "pagerBar", [that.locate("pagerBottom"), fluid.COMPONENT_OPTIONS]);
 
        bindDOMEvents(that);
        that.selectPage(1);
    };
    
    fluid.pager = function (container, options) {
        var that = fluid.initView("fluid.pager", container, options);
        that.model = {
           currentPage: undefined  
        };
        
        that.selectPage = function (pageNum) {
            if (pageNum === that.model.currentPage) {
                return;
            }
            
            that.events.onPageChange.fire(pageNum, that.model.currentPage);
            that.model.currentPage = pageNum;
        };
        
        that.next = function () {
            // this test needs to be refactored - we know too much about the implementation I think
            if (that.model.currentPage < that.topBar.pageLinks.length) {
                that.selectPage(that.model.currentPage + 1);
            }
        };
       
        that.previous = function () {
            if (that.model.currentPage > 1) {
                that.selectPage(that.model.currentPage - 1);
            }
        };
    
        setupPager(that);
        return that;        
    };
    
    fluid.defaults("fluid.pager", {
        pagerBar: "fluid.pagerBar",
        
        selectors: {
            pagerTop: ".pager-top",
            pagerBottom: ".pager-bottom"
        },
        
        events: {
            onPageSelect: null,
            onPageChange: null
        }
    });
})(jQuery, fluid_0_6);
