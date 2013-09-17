/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    
    fluid.registerNamespace("fluid.pager");
    
    /******************
     * Pager Bar View *
     ******************/
    // TODO: Convert one day to the "visibility model" system (FLUID-4928)
    fluid.pager.updateStyles = function (pageListThat, newModel, oldModel) {
        if (oldModel.pageIndex !== undefined) {
            var oldLink = pageListThat.pageLinks.eq(oldModel.pageIndex);
            oldLink.removeClass(pageListThat.options.styles.currentPage);
        }
        var pageLink = pageListThat.pageLinks.eq(newModel.pageIndex);
        pageLink.addClass(pageListThat.options.styles.currentPage); 
    };
    
    fluid.pager.bindLinkClick = function (link, initiatePageChange, eventArg) {
        link.unbind("click.fluid.pager");
        link.bind("click.fluid.pager", function () {
            initiatePageChange.fire(eventArg);
        });
    };
    
    // 10 -> 1, 11 -> 2
    fluid.pager.computePageCount = function (model) {
        return Math.max(1, Math.floor((model.totalRange - 1) / model.pageSize) + 1);
    };
    
    fluid.pager.computePageLimit = function (model) {
        return Math.min(model.totalRange, (model.pageIndex + 1) * model.pageSize);
    };
    
    fluid.pager.bindLinkClicks = function (pageLinks, initiatePageChange) {
        fluid.each(pageLinks, function (pageLink, i) {
            fluid.pager.bindLinkClick($(pageLink), initiatePageChange, {pageIndex: i});
        });
    };
    
    // Abstract grade representing all pageLists
    fluid.defaults("fluid.pager.pageList", {
        gradeNames: ["fluid.viewComponent"]
    });
    
    fluid.defaults("fluid.pager.directPageList", {
        gradeNames: ["fluid.pager.pageList", "autoInit"],
        listeners: {
            onCreate: {
                funcName: "fluid.pager.bindLinkClicks",
                args: ["{that}.pageLinks", "{pager}.events.initiatePageChange"]
            },
            "{pager}.events.onModelChange": {
                funcName: "fluid.pager.updateStyles",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // newModel, oldModel
            }
        },
        members: {
            pageLinks: "{that}.dom.pageLinks",
            defaultModel: {
                totalRange: "{that}.pageLinks.length"
            }
        }
    });
    
    fluid.pager.everyPageStrategy = fluid.iota;
    
    fluid.pager.gappedPageStrategy = function (locality, midLocality) {
        if (!locality) {
            locality = 3;
        }
        if (!midLocality) {
            midLocality = locality;
        }
        return function (count, first, mid) {
            var togo = [];
            var j = 0;
            var lastSkip = false;
            for (var i = 0; i < count; ++i) {
                if (i < locality || (count - i - 1) < locality || (i >= mid - midLocality && i <= mid + midLocality)) {
                    togo[j++] = i;
                    lastSkip = false;
                } else if (!lastSkip) {
                    togo[j++] = -1;
                    lastSkip = true;
                }
            }
            return togo;
        };
    };
    
    /**
     * An impl of a page strategy that will always display same number of page links (including skip place holders). 
     * @param   endLinkCount    int     The # of elements first and last trunks of elements
     * @param   midLinkCount    int     The # of elements from beside the selected #
     * @author  Eric Dalquist
     */
    fluid.pager.consistentGappedPageStrategy = function (endLinkCount, midLinkCount) {
        if (!endLinkCount) {
            endLinkCount = 1;
        }
        if (!midLinkCount) {
            midLinkCount = endLinkCount;
        }
        var endWidth = endLinkCount + 2 + midLinkCount;

        return function (count, first, mid) {
            var pages = [];
            var anchoredLeft = mid < endWidth;
            var anchoredRight = mid >= count - endWidth;
            var anchoredEndWidth = endWidth + midLinkCount;
            var midStart = mid - midLinkCount;
            var midEnd = mid + midLinkCount;
            var lastSkip = false;
            
            for (var page = 0; page < count; page++) {
                if (page < endLinkCount || // start pages
                        count - page <= endLinkCount || // end pages
                        (anchoredLeft && page < anchoredEndWidth) || // pages if no skipped pages between start and mid
                        (anchoredRight && page >= count - anchoredEndWidth) || // pages if no skipped pages between mid and end
                        (page >= midStart && page <= midEnd) // pages around the mid
                        ) {
                    pages.push(page);
                    lastSkip = false;
                } else if (!lastSkip) {
                    pages.push(-1);
                    lastSkip = true;
                }
            }
            return pages;
        };
    };
    
    fluid.registerNamespace("fluid.pager.renderedPageList");
    
    fluid.pager.renderedPageList.assembleComponent = function (page, isCurrent, initiatePageChange, currentPageStyle, currentPageIndexMsg) {
        var obj = {
            ID: "page-link:link",
            localID: page + 1,
            value: page + 1,
            pageIndex: page,
            decorators: [
                {
                    type: "jQuery",
                    func: "click", 
                    args: function (event) {
                        initiatePageChange.fire({pageIndex: page});
                        event.preventDefault();
                    }
                }
            ]
        };
        
        if (isCurrent) {
            obj.current = true;
            obj.decorators = obj.decorators.concat([
                {
                    type: "addClass",
                    classes: currentPageStyle
                },
                {
                    type: "jQuery",
                    func: "attr", 
                    args: ["aria-label", currentPageIndexMsg] 
                }
            ]);
        }
        
        return obj;
    };
    
    fluid.pager.renderedPageList.onModelChange = function (that, newModel, oldModel) {
       function pageToComponent(current) {
            return function (page) {
                return page === -1 ? {
                    ID: "page-link:skip"
                } : that.assembleComponent(page, page === current);
            };
        }
      
        var pages = that.options.pageStrategy(newModel.pageCount, 0, newModel.pageIndex);
        var pageTree = fluid.transform(pages, pageToComponent(newModel.pageIndex));
        if (pageTree.length > 1) {
            pageTree[pageTree.length - 1].value = pageTree[pageTree.length - 1].value + that.options.strings.last;
        }
        that.events.onRenderPageLinks.fire(pageTree, newModel);
        that.pageTree = pageTree;
        that.refreshView();
    };
    
    fluid.pager.renderedPageList.renderLinkBody = function (linkBody, rendererOptions) {
        if (linkBody) {
            rendererOptions.cutpoints.push({
                id: "payload-component",
                selector: linkBody
            });
        }  
    };
    
    fluid.defaults("fluid.pager.renderedPageList", {
        gradeNames: ["fluid.rendererComponent", "fluid.pager.pageList", "autoInit"],
        rendererOptions: {
            cutpoints: [ 
                {
                    id: "page-link:link",
                    selector: "{that}.options.selectors.pageLinks"
                },
                {
                    id: "page-link:skip",
                    selector: "{that}.options.selectors.pageLinkSkip"
                }
            ]
        },
        rendererFnOptions: {
            noexpand: true,
            templateSource: {node: "{that}.dom.root"},
            renderTarget: "{that}.dom.root",
        },
        events: {
            onRenderPageLinks: "{pager}.events.onRenderPageLinks"
        },
        listeners: {
            onCreate: {
                funcName: "fluid.pager.renderedPageList.renderLinkBody", 
                args: ["{that}.options.linkBody", "{that}.options.rendererOptions"]  
            },
            "{pager}.events.onModelChange": {
                funcName: "fluid.pager.renderedPageList.onModelChange",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        invokers: {
            produceTree: {
                funcName: "fluid.identity",
                args: "{that}.pageTree",
                dynamic: true,  
            },
            assembleComponent: {
                funcName: "fluid.pager.renderedPageList.assembleComponent", 
                args: ["{arguments}.0", "{arguments}.1", 
                   "{pager}.events.initiatePageChange", "{pagerBar}.options.styles.currentPage", "{pagerBar}.options.strings.currentPageIndexMsg"]
            }
        },
        
        selectors: {
            root: ".flc-pager-links",
            pageLinks: "{pagerBar}.options.selectors.pageLinks",
            pageLinkSkip: "{pagerBar}.options.selectors.pageLinkSkip"
        },
        strings: "{pager}.options.strings",
        linkBody: "a",
        pageStrategy: fluid.pager.everyPageStrategy
    });
    
    
    fluid.defaults("fluid.pager.previousNext", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        members: {
            previous: "{that}.dom.previous",
            next: "{that}.dom.next"
        },
        selectors: {
            previous: ".flc-pager-previous",
            next: ".flc-pager-next"
        },
        listeners: {
            onCreate: [{
                funcName: "fluid.pager.bindLinkClick", 
                args: ["{that}.previous", "{pager}.events.initiatePageChange", {relativePage: -1}]
            }, {
                funcName: "fluid.pager.bindLinkClick", 
                args: ["{that}.next", "{pager}.events.initiatePageChange", {relativePage: +1}]
            }
            ],
            "{pager}.events.onModelChange": {
                funcName: "fluid.pager.previousNext.update",
                args: ["{that}", "{that}.options.styles.disabled", "{arguments}.0"] // newModel
            }
        }
    });
    
    fluid.pager.previousNext.update = function (that, disabledStyle, newModel) {
        that.previous.toggleClass(disabledStyle, newModel.pageIndex === 0);
        that.next.toggleClass(disabledStyle, newModel.pageIndex === newModel.pageCount - 1);
    };
    
    fluid.defaults("fluid.pager.pagerBar", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            pageList: {
                type: "fluid.pager.pageList",
                container: "{pagerBar}.container",
                options: {
                    selectors: {
                        pageLinks: "{pagerBar}.options.selectors.pageLinks"
                    },
                    styles: "{pagerBar}.options.styles"
                }
            },
            previousNext: {
                type: "fluid.pager.previousNext",
                container: "{pagerBar}.container",
                options: {
                    selectors: {
                        previous: "{pagerBar}.options.selectors.previous",
                        next: "{pagerBar}.options.selectors.next"
                    },
                    styles: "{pagerBar}.options.styles"
                }
            }
        },
        events: {
            initiatePageChange: null,
            onModelChange: null  
        },
        
        selectors: {
            pageLinks: ".flc-pager-pageLink",
            pageLinkSkip: ".flc-pager-pageLink-skip",
            previous: ".flc-pager-previous",
            next: ".flc-pager-next"
        },
        
        styles: {
            currentPage: "fl-pager-currentPage",
            disabled: "fl-pager-disabled"
        },
        
        strings: {
            currentPageIndexMsg: "Current page"
        }
    });
    
    // TODO: Remove this and replace with FLUID-4258 scheme
    fluid.pager.preInit = function (that) {
        // Explicit namespace to evade FLUID-5077
        that.applier.postGuards.addListener({path: "pageSize", transactional: true}, 
                fluid.pager.pageCountGuard, "pageSizeGuard");
        that.applier.postGuards.addListener({path: "totalRange", transactional: true}, 
                fluid.pager.pageCountGuard, "totalRangeGuard");
                
        that.applier.guards.addListener({path: "pageIndex", transactional: true}, 
                fluid.pager.pageIndexGuard);
        
        that.applier.modelChanged.addListener({path: "*"},
            function (newModel, oldModel, changes) {
                that.events.onModelChange.fire(newModel, oldModel);
        });
    };
    
    // guards pageIndex, pageSize - transactional
    fluid.pager.pageCountGuard = function (newModel, changeRequest, iApplier) {
        var newPageCount = fluid.pager.computePageCount(newModel);
        iApplier.requestChange("pageCount", newPageCount);
        // TODO: this unnatural action is required to ensure shortened pageCount properly invalidates pageIndex - failure in transactional ChangeApplier design
        iApplier.fireChangeRequest({
            type: "ADD",
            path: "pageIndex",
            value: newModel.pageIndex,
            forceChange: true
        });
    };
    
    // guards pageIndex - may produce culled change - nontransactional?
    fluid.pager.pageIndexGuard = function (newModel, changeRequest) {
        var newPageIndex = changeRequest.value;
        if (changeRequest.value >= newModel.pageCount) {
            changeRequest.value = newModel.pageCount - 1;
        }
        if (changeRequest.value < 0) {
            changeRequest.value = 0;
        }
    };
    
    fluid.pager.summaryAria = function (element) {
        element.attr({
            "aria-relevant": "all",
            "aria-atomic": "false",
            "aria-live": "assertive",
            "role": "status"
        });
    };
    
    
    fluid.defaults("fluid.pager.summary", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: {
               funcName: "fluid.pager.summaryAria",
               args: "{that}.container"
            },
            onModelChange: {
                funcName: "fluid.pager.summary.onModelChange",
                args: ["{that}.container", "{that}.options.strings.message", "{arguments}.0", "{arguments}.1"] 
            }
        },
        events: {
            onModelChange: null
        }
    });

    fluid.pager.summary.onModelChange = function (node, message, newModel, oldModel) {
        var text = fluid.stringTemplate(message, {
            first: newModel.pageIndex * newModel.pageSize + 1,
            last: fluid.pager.computePageLimit(newModel),
            total: newModel.totalRange,
            currentPage: newModel.pageIndex + 1
        });
        node.text(text);
    };
       
    fluid.defaults("fluid.pager.directPageSize", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: {
                "this": "{that}.container",
                method: "change",
                args: {
                    expander: {
                        funcName: "fluid.pager.directPageSize.onChange",
                        args: ["{pager}.events.initiatePageSizeChange", "{that}.container"]
                    }
                }
            },
            "{pager}.events.onModelChange": {
                funcName: "fluid.pager.directPageSize.onModelChange",
                args: ["{that}.container", "{arguments}.0", "{arguments}.1"] // newModel, oldModel
            }
        }
    });
    
    fluid.pager.directPageSize.onChange = function (initiatePageSizeChange, node) {
        return function () {
            initiatePageSizeChange.fire(node.val() || 1);
        }
    };
    
    fluid.pager.directPageSize.onModelChange = function (node, newModel, oldModel) {
        // TODO: better done with source tracking or change culling
        if (node.val() !== newModel.pageSize) {
            node.val(newModel.pageSize);
        }
    };

    fluid.pager.initiatePageChangeListener = function (that, arg) {
        var newPageIndex = arg.pageIndex;
        if (arg.relativePage !== undefined) {
            newPageIndex = that.model.pageIndex + arg.relativePage;
        }
        that.applier.requestChange("pageIndex", newPageIndex);
    };
    
    fluid.pager.initiatePageSizeChangeListener = function (that, arg) {
        that.applier.requestChange("pageSize", arg);
    };

    /*******************
     * Pager Component *
     *******************/

    fluid.defaults("fluid.pager", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            initiatePageChange: null,
            initiatePageSizeChange: null,
            onModelChange: null,
            onRenderPageLinks: null,
            afterRender: null
        },
        distributeOptions: {
            source: "{that}.options.pageList",
            removeSource: true,
            target: "{that fluid.pager.pageList}"
        },
        pageList: {
            type: "fluid.pager.renderedPageList",
            options: {
                pageStrategy: fluid.pager.gappedPageStrategy(3, 1)
            }
        },
        listeners: {
            onCreate: [ {
                namespace: "containerRole",
                "this": "{that}.container",
                method: "attr",
                args: ["role", "application"]  
            }, {
                func: "{that}.applier.initModelEvent",
                namespace: "initModel"
                }
            ],
            initiatePageChange: {
                funcName: "fluid.pager.initiatePageChangeListener",
                args: ["{that}", "{arguments}.0"]   
            },
            initiatePageSizeChange: {
                funcName: "fluid.pager.initiatePageSizeChangeListener",
                args: ["{that}", "{arguments}.0"]   
            }
        },
        invokers: {
            acquireDefaultRange: {
                funcName: "fluid.identity",
                args: "{that}.pagerBar.pageList.defaultModel.totalRange"
            }
        },
        dynamicComponents: {
            summary: {
                sources: "{that}.dom.summary",
                type: "fluid.pager.summary",
                container: "{source}",
                options: {
                    strings: {
                        message: "Viewing page %currentPage. Showing records %first - %last of %total items.",
                    },
                    events: {
                        onModelChange: "{pager}.events.onModelChange"
                    }
                }
            },
            pageSize: {
                sources: "{that}.dom.pageSize",
                type: "fluid.pager.directPageSize",
                container: "{source}"
            },
            pagerBar: {
                sources: "{that}.dom.pagerBar",
                type: "fluid.pager.pagerBar",
                container: "{source}",
                options: {
                    strings: "{pager}.options.strings",
                    events: {
                        initiatePageChange: "{pager}.events.initiatePageChange",
                        onModelChange: "{pager}.events.onModelChange"
                    }
                }
            }
        },

        model: {
            pageIndex: 0,
            pageSize: 1,
            totalRange: {
                expander: {
                    func: "{that}.acquireDefaultRange"
                }
            }
        },
        changeApplierOptions: {
            cullUnchanged: true
        },
               
        selectors: {
            pagerBar: ".flc-pager-top, .flc-pager-bottom",
            summary: ".flc-pager-summary",
            pageSize: ".flc-pager-page-size",
        },
        
        strings: {
            last: " (last)"
        },
        
        markup: {
            rangeAnnotation: "<b> %first </b><br/>&mdash;<br/><b> %last </b>"
        }
    });
    
})(jQuery, fluid_1_5);
