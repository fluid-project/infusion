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

    
    function updateStyles(pageListThat, newModel, oldModel) {
        if (oldModel.pageIndex !== undefined) {
            var oldLink = pageListThat.pageLinks.eq(oldModel.pageIndex);
            oldLink.removeClass(pageListThat.options.styles.pageIndex);
        }
        var pageLink = pageListThat.pageLinks.eq(newModel.pageIndex);
        pageLink.addClass(pageListThat.options.styles.pageIndex); 


    };
    
    function bindLinkClick(link, events, eventArg) {
       link.unbind("click.fluid.pager");
       link.bind("click.fluid.pager", function() {events.initiatePageChange.fire(eventArg)});
    }
    
    fluid.pager = function() {
        fluid.pagerImpl.apply(null, arguments);
    }
    
    fluid.pager.directPageList = function (container, events, options) {
        var that = fluid.initView("fluid.pager.directPageList", container, options);
        that.pageLinks = that.locate("pageLinks");
        for (var i = 0; i < that.pageLinks.length; ++ i) {
            var pageLink = that.pageLinks.eq(i);
            bindLinkClick(pageLink, events, {pageIndex: i});
        }
        events.onModelChange.addListener(
            function (newModel, oldModel) {
                updateStyles(that, newModel, oldModel);
            }
        );
        that.defaultModel = {
            pageIndex: 0,
            pageSize: 1,
            totalRange: that.pageLinks.length
        };
        return that;
    };
    
    fluid.pager.everyPageStrategy = function (pageCount) {
        var togo = [];
        for (var i = 0; i < pageCount; ++ i) {
            togo[i] = i;
        }
        return togo;
    };
    
    
    fluid.pager.renderedPageList = function(container, events, pagerBarOptions, options) {
        var options = $.extend(true, pagerBarOptions, options);
        var that = fluid.initView("fluid.pager.renderedPageList", container, options);
        var renderOptions = {
            cutpoints: [ {
              id: "page-link:",
              selector: pagerBarOptions.selectors.pageLinks
            }]};
        
        if (options.linkBody) {
            renderOptions.cutpoints[renderOptions.cutpoints.length] = {
                id: "payload-component",
                selector: options.linkBody
            };
          }
        function pageToComponent(page) {
            return {
              ID: "page-link:",
              value: page + 1,
              decorators: {
                jQuery: ["click", function() {events.initiatePageChange.fire({pageIndex: page})}]
              } 
            }
        }
        var root = that.locate("root");
        var template = fluid.selfRender(root, {}, renderOptions);
        events.onModelChange.addListener(
            function (newModel, oldModel) {
                if (!oldModel || newModel.pageCount != oldModel.pageCount) {
                    var pages = that.options.pageStrategy(newModel.pageCount);
                    var pageTree = fluid.transform(pages, pageToComponent);
                    fluid.reRender(template, root, pageTree, renderOptions);
                    // TODO: improve renderer so that it can locate these inline
                    that.pageLinks = that.locate("pageLinks");
                }
               updateStyles(that, newModel, oldModel);
            }
        );
        return that;
    };
    
    fluid.defaults("fluid.pager.renderedPageList",
        {
          selectors: {
            root: ".pager-links"
          },
          linkBody: "a",
          pageStrategy: fluid.pager.everyPageStrategy
        }
        );
    
    var updatePreviousNext = function (that, options, newModel) {
        if (newModel.pageIndex === 0) {
            that.previous.addClass(options.styles.disabled);
        } else {
            that.previous.removeClass(options.styles.disabled);
        }
        
        if (newModel.pageIndex == newModel.pageCount - 1) {
            that.next.addClass(options.styles.disabled);
        } else {
            that.next.removeClass(options.styles.disabled);
        }
    };
    
    fluid.pager.previousNext = function (container, events, options) {
        var that = fluid.initView("fluid.pager.previousNext", container, options);
        that.previous = that.locate("previous");
        bindLinkClick(that.previous, events, {relativePage: -1});
        that.next = that.locate("next");
        bindLinkClick(that.next, events, {relativePage: +1});
        events.onModelChange.addListener(
            function (newModel, oldModel, overallThat) {
                updatePreviousNext(that, options, newModel);
            }
        );
        return that;
    };

    fluid.pager.pagerBar = function (events, container, options) {
        var that = fluid.initView("fluid.pager.pagerBar", container, options);
        that.pageList = fluid.initSubcomponent(that, "pageList", [container, events, that.options, fluid.COMPONENT_OPTIONS]);
        that.previousNext = fluid.initSubcomponent(that, "previousNext", [container, events, that.options, fluid.COMPONENT_OPTIONS]);
        
        return that;
    };
    
    fluid.pager.directModelFilter = function (model, pagerModel) {
        var togo = [];
        var limit = computePageLimit(pagerModel);
        for (var i = pagerModel.pageIndex * pagerModel.pageSize; i < limit; ++ i) {
            togo[togo.length] = {index: i, row: model[i]};
        }
        return togo;
    };
   
    /** A body renderer implementation which uses the Fluid renderer to render a table section **/
   
    fluid.pager.selfRender = function (overallThat, options) {
        var root = $(options.root);
        var template = fluid.selfRender(root, {}, options.renderOptions);
        return {
            returnedOptions: {
                listeners: {
                    onModelChange: function (newModel, oldModel) {
                        var filtered = overallThat.options.modelFilter(overallThat.options.dataModel, newModel);
                        if (options.cells === "explode") {
                            var tree = fluid.transform(filtered, 
                                function(filteredRow) {
                                    return fluid.explode(filteredRow.row, filteredRow.index);
                                }
                                );
                            var fullTree = {};
                            fullTree[options.row] = tree;
                            fluid.reRender(template, root, fullTree, options.renderOptions);
                        }
                    }
                }
            }
        }
    };
    
    fluid.defaults("fluid.pager.pagerBar", {
            
       previousNext: "fluid.pager.previousNext",
      
       pageList: "fluid.pager.directPageList",
        
       pageSizeSelect: "fluid.pager.pageSizeSelect",
       
       selectors: {
           pageLinks: ".page-link",
           previous: ".previous",
           next: ".next"
       },
       
       styles: {
           pageIndex: "current-page",
           disabled: "disabled"
       }
    });

    // 10 -> 1, 11 -> 2
    function computePageCount(model) {
        model.pageCount = Math.floor((model.totalRange - 1)/ model.pageSize) + 1;      
    }
    
    function computePageLimit(model) {
        return Math.min(model.totalRange, (model.pageIndex + 1)*model.pageSize);
    }

    fluid.pager.summary = function (dom, options) {
        var node = dom.locate("summary");
        return {
            returnedOptions: {
                listeners: {
                    onModelChange: function (newModel, oldModel) {
                        var text = fluid.stringTemplate(options.message, {
                          first: newModel.pageIndex * newModel.pageSize + 1,
                          last: computePageLimit(newModel),
                          total: newModel.totalRange});
                        if (node.length > 0) {
                            node.text(text);
                        }
                    }
                }
            }
        };
    }

    /*******************
     * Pager Component *
     *******************/
    
    fluid.pagerImpl = function (container, options) {
        var that = fluid.initView("fluid.pager", container, options);
        
        that.events.initiatePageChange.addListener(
            function(arg) {
               var newModel = fluid.copy(that.model);
               if (arg.relativePage !== undefined) {
                   newModel.pageIndex = that.model.pageIndex + arg.relativePage;
               }
               else {
                   newModel.pageIndex = arg.pageIndex;
               }
               if (newModel.pageIndex === undefined || newModel.pageIndex < 0) {
                   newModel.pageIndex = 0;
               }
               computePageCount(newModel);
               if (newModel.pageIndex >= newModel.pageCount) {
                   newModel.pageIndex = newModel.pageCount - 1;
               }
               that.events.onModelChange.fire(newModel, that.model, that);
               fluid.model.copyModel(that.model, newModel);
            }
        );

        // Setup the top and bottom pager bars.
        that.pagerBar = fluid.initSubcomponent(that, "pagerBar", [that.events, that.locate("pagerBar"), fluid.COMPONENT_OPTIONS]);
        that.pagerBarSecondary = fluid.initSubcomponent(that, "pagerBar", [that.events, that.locate("pagerBarSecondary"), fluid.COMPONENT_OPTIONS]);
 
        that.bodyRenderer = fluid.initSubcomponent(that, "bodyRenderer", [that, fluid.COMPONENT_OPTIONS]);
        
        that.summary = fluid.initSubcomponent(that, "summary", [that.dom, fluid.COMPONENT_OPTIONS]);
 
        that.model = fluid.copy(that.options.model);
        if (that.options.dataModel) {
            that.model.totalRange = that.options.dataModel.length;
        }
        if (that.model.totalRange === undefined) {
           that.model = that.pagerBar.pageList.defaultModel;
        }

        that.events.initiatePageChange.fire({pageIndex: 0});

        return that;        
    };
    
    fluid.defaults("fluid.pager", {
        pagerBar: {type: "fluid.pager.pagerBar", options: null},
        
        summary: {type: "fluid.pager.summary", options: {
            message: "%first-%last of %total items"
        }}, 
        
        modelFilter: fluid.pager.directModelFilter,
        
        bodyRenderer: "fluid.emptySubcomponent",
        
        model: {
            pageIndex: undefined,
            pageSize: 10,
            totalRange: undefined
        },
        
        selectors: {
            pagerBar: ".pager-top",
            pagerBarSecondary: ".pager-bottom",
            summary: ".pager-summary"
        },
        
        events: {
            initiatePageChange: null,
            onModelChange: null
        }
    });
})(jQuery, fluid_0_6);
