/*
Copyright 2007-2008 University of Cambridge
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/

/*global fluid*/
var fluid = fluid || {};

(function (jQuery, fluid) {
    fluid.keys = {
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        META: 19,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        i: 73,
        j: 74,
        k: 75,
        m: 77
    };
    
    /**
     * These roles are used to add ARIA roles to orderable items. This list can be extended as needed,
     * but the values of the container and item roles must match ARIA-specified roles.
     */  
    fluid.roles = {
        GRID: { container: "grid", item: "gridcell" },
        LIST: { container: "list", item: "listitem" },
        REGIONS: { container: "main", item: "article" }
    };
    
    fluid.orientation = {
        HORIZONTAL: "horiz",
        VERTICAL: "vert"
    };
    
    /**
     * This is the position, relative to a given drop target, that a dragged item should be dropped.
     */
    fluid.position = {
        BEFORE: 0, 
        AFTER: 1,
        INSIDE: 2,
        USE_LAST_KNOWN: 3,  // given configuration meaningless, use last known drop target
        DISALLOWED: -1      // cannot drop in given configuration
    };
    
    /**
     * For incrementing/decrementing a count or index.
     */
    fluid.direction = {
        NEXT: 1,
        PREVIOUS: -1
    };
    
    fluid.defaultKeysets = [{
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.UP,
        down : fluid.keys.DOWN,
        right : fluid.keys.RIGHT,
        left : fluid.keys.LEFT
    },
    {
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.i,
        down : fluid.keys.m,
        right : fluid.keys.k,
        left : fluid.keys.j
    }];
    
    fluid.wrap = function (obj) {
        return ((!obj || obj.jquery) ? obj : jQuery(obj)); 
    };
    
    fluid.unwrap = function (obj) {
        return obj.jquery ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @return a single-element jQuery of container
     */
    fluid.container = function (container) {
        if (typeof container === "string" || 
          container.nodeType && (container.nodeType === 1  || container.nodeType === 9)) {
            container = jQuery(container);
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            throw {
                name: "NotOne",
                message: "A single container element was not found."
            };
        }
        
        return container;
    };
    
    /**
     * Retreives and stores a component's default settings centrally.
     * 
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     * 
     */
    var defaultsStore = {};
    fluid.defaults = function (componentName, defaultsObject) {
        if (arguments.length > 1) {
            defaultsStore[componentName] = defaultsObject;   
            return defaultsObject;
        }
        
        return defaultsStore[componentName];
    };
    
    fluid.fail = function(message) {
      fluid.utils.setLogging(true);
      fluid.utils.debug(message);
      message.fail(true);
    }
    
    fluid.createDomBinder = function (container, selectors) {
      return function(name, localContainer) {
        var selector = selectors[name];
        var thisContainer = localContainer? localContainer: container;
        if (!selector) {
          return thisContainer;
        }
        if (typeof(selector) === "function") {
          return jQuery(selector.call(null, fluid.unwrap(thisContainer)));
        }
        var togo = jQuery(selector, thisContainer);
        if (togo.length === 0 || togo.get(0) === document) {
          fluid.fail("Selector " + name + " with value " + selectors[name] +
            " did not find any elements with container " + container);
        }
        return togo;
      };
    }
    
    fluid.initialiseThat = function(componentName, container, userOptions) {
      var that = {};
      var defaults = fluid.defaults(componentName); 
      that.options = fluid.utils.merge(defaults.mergePolicy, {}, defaults, userOptions);
      if (container) {
        that.container = fluid.container(container);
      }
      that.select = fluid.createDomBinder(that.container, that.options.selectors);
      return that;
    };
    
    var fluid_guid = 1;
    
    // A hash of (jQuery data id) elements to "true" indicating whether the corresponding
    // DOM element is the source of an event for the current cycle.
    var fluid_sourceElements = {};
    
    fluid.event = {};
    
    fluid.event.getEventFirer = function () {
      var log = fluid.utils.debug;
      var listeners = {};
      return {
        addListener: function (listener, namespace, exclusions) {
          if (!namespace) {
            if (!listener.$$guid) { listener.$$guid = fluid_guid++; }
            namespace = listener.$$guid;
            }

          var excludeids = [];
          if (exclusions) {
            for (var i in exclusions) {
              excludeids.push(jQuery.data(exclusions[i]));
              }
            }
          listeners[namespace] = {listener: listener, exclusions: excludeids};
          },
          
        removeListener: function (listener) {
          if (typeof(listener) === 'string') {
            delete listeners[listener];
          }
          else if (typeof(listener) === 'object' && listener.$$guid){
            delete listeners[listener.$$guid];
          }
        },
        
        fireEvent: function() {
          for (var i in listeners) {
            var lisrec = listeners[i];
            var excluded = false;
            for (var j in lisrec.exclusions) {
              var exclusion = lisrec.exclusions[j];
              log("Checking exclusion for " + exclusion);
              if (fluid_sourceElements[exclusion]) {
                log("Excluded");
                excluded = true; break;
                }
              }
          if (!excluded) {
            try {
              log("Firing to listener " + i + " with arguments " + arguments);
              lisrec.listener.apply(null, arguments);
              }
            catch (e) {
              log("FireEvent received exception " + e.message + " e " +e + " firing to listener " + i);
               throw (e);       
              }
            }
          }
        }
      };
    };
    
    fluid.model = {};
    
   
    /** Copy a source "model" onto a target **/
    fluid.model.copyModel = function copyModel(target, source) {
      fluid.utils.contund(target);
      jQuery.extend(true, target, source);
    };
    
    fluid.model.parseEL = function(EL) {
      return EL.split('.');
      };
  
    /** This function implements the RSF "DARApplier" **/
    fluid.model.setBeanValue = function(root, EL, newValue) {
      var segs = fluid.model.parseEL(EL);
      for (var i = 0; i < segs.length - 1; ++ i) {
        if (!root[segs[i]]) {
          root[segs[i]] = {};
          }
        root = root[segs[i]];
        }
      root[segs[segs.length - 1]] = newValue;
      };
      
    fluid.model.getBeanValue = function(root, EL) {
      var segs = fluid.model.parseEL(EL);
      for (var i = 0; i < segs.length; ++ i) {
        root = root[segs[i]];
        if (!root) return root;
        }
      return root;
      };
      
    /*
     * Utilities object for providing various general convenience functions
     */
    fluid.utils = {};
    
    /** Returns the absolute position of a supplied DOM node in pixels.
     * Implementation taken from quirksmode http://www.quirksmode.org/js/findpos.html
     */
    fluid.utils.computeAbsolutePosition = function (element) {
        var curleft = 0; var curtop = 0;
        if (element.offsetParent) {
            do {
                curleft += element.offsetLeft;
                curtop += element.offsetTop;
                } while (element = element.offsetParent);
            return [curleft, curtop];
        }
    };
    
    /**
     * Useful for drag-and-drop during a drag:  is the mouse over the "before" half
     * of the droppable?  In the case of a vertically oriented set of orderables,
     * "before" means "above".  For a horizontally oriented set, "before" means
     * "left of".
     */
    fluid.utils.mousePosition = function (droppableEl, orientation, x, y) {        
        var mid;
        var isBefore;
        if (orientation === fluid.orientation.VERTICAL) {
            mid = jQuery (droppableEl).offset().top + (droppableEl.offsetHeight / 2);
            isBefore = y < mid;
        } else {
            mid = jQuery (droppableEl).offset().left + (droppableEl.offsetWidth / 2);
            isBefore = x < mid;
        }
        
        return (isBefore ? fluid.position.BEFORE : fluid.position.AFTER);
    };  
    
    // Custom query method seeks all tags descended from a given root with a 
    // particular tag name, whose id matches a regex. The Dojo query parser
    // is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
    // it might do anyway, and this will be plenty fast.
    fluid.utils.seekNodesById = function (rootnode, tagname, idmatch) {
        var inputs = rootnode.getElementsByTagName(tagname);
        var togo = [];
        for (var i = 0; i < inputs.length; i += 1) {
            var input = inputs[i];
            var id = input.id;
            if (id && id.match(idmatch)) {
                togo.push(input);
            }
        }
        return togo;
    };
          
    fluid.utils.escapeSelector = function (id) {
        return id.replace(/\:/g, "\\:");
    };
      
    fluid.utils.findForm = function (element) {
        while (element) {
            if (element.nodeName.toLowerCase() === "form") {
                return element;
            }
            element = element.parentNode;
        }
    };
    
    /** Destroy an object to an empty condition**/
    fluid.utils.contund = function(target) {
      if (target instanceof Array) {
        target.length = 0;
      }
      else {
        for (var i in target) {
          delete target[i];
        }
      }
    };
    
    function mergeImpl(policy, basePath, target, source) {
      var thisPolicy = policy? policy[basePath] : policy;
      if (typeof(thisPolicy) === "function") {
          thisPolicy.apply(null, target, source);
          return target;
        }
      if (thisPolicy === "contund") {
         fluid.utils.contund(target);
         }
      
      for (var name in source) {
        var path = (basePath? basePath + ".": "") + name;
        var thisTarget = target[name];
        var thisSource = source[name];

        if (thisSource !== undefined) {
          if (thisSource !== null && typeof(thisSource) === 'object') {
            if (!thisTarget) {
              target[name] = thisTarget = thisSource instanceof Array? [] : {};
            }
            mergeImpl(policy, path, thisTarget, thisSource);
          }
          else {
            target[name] = thisSource;
          }
        }
      }
      return target;    
    }
    
    fluid.utils.merge = function(policy, target) {
      var path = "";
      
      for (var i = 2; i < arguments.length; ++ i) {
        var source = arguments[i];
        mergeImpl(policy, path, target, source);
      }
      if (policy) {
        for (var key in policy) {
          var elrh = policy[key];
          if (typeof(elrh) === 'string' && elrh !== "contund") {
            var oldValue = fluid.model.getBeanValue(target, key);
            if (oldValue === null || oldValue === undefined) {
              var value = fluid.model.getBeanValue(target, elrh);
              fluid.model.setBeanValue(target, key, value);
            }
          }
        }
      }
      return target;     
    };
    
    /**
     * Returns a jQuery object given the id of a DOM node
     */
    fluid.utils.jById = function (id) {
        var el = jQuery("[id=" + id + "]");
        if (el[0] && el[0].id === id) {
            return el;        
        }       
        
        return null;
    };

    var fluid_logging = false;

    fluid.utils.debug = function (str) {
      if (fluid_logging) {
        if (typeof(console) != "undefined") {
          if (console.debug) {
            console.debug(str);
          } else {
            console.log(str);
          }
        }
        else if (typeof(YAHOO) != "undefined") {
          YAHOO.log(message);
          }
        else if (typeof(opera) != "undefined") {
        opera.postError(message);
        }
      }
    };
    
     /** method to allow user to enable logging (off by default) */
    fluid.utils.setLogging = function(enabled) {
      if (typeof enabled === "boolean") {
        fluid_logging = enabled;
        } else {
        fluid_logging = false;
        }
      };
    

    fluid.utils.derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
    };

    // simple function for return kbytes and megabytes from a number of bytes
    // probably should do something fancy that shows MBs if the number is huge
    fluid.utils.filesizeStr = function (bytes) {
        /*
        if (bytes < 1024){
            return bytes + " bytes";
        } else
        */
        if (typeof bytes === "number") {
            if (bytes === 0) {
                return "0.0 KB";
            } else if (bytes > 0) {
                if (bytes < 1048576) {
                    return (Math.ceil(bytes / 1024 * 10) / 10).toFixed(1) + ' KB';
                }
                else {
                    return (Math.ceil(bytes / 1048576 * 10) / 10).toFixed(1) + ' MB';
                }
            }
        }
        return '';
    };
    
    /**
     * Simple string template system. 
     * Takes a template string containing tokens in the form of "%value".
     * Returns a new string with the tokens replaced by the specified values.
     * Keys and values can be of any data type that can be coerced into a string. Arrays will work here as well.
     * 
     * @param {String}    template    a string (can be HTML) that contains tokens embedded into it
     * @param {object}    values        a collection of token keys and values
     */
    fluid.utils.stringTemplate = function (template, values) {
        var newString = template;
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var searchStr = "%" + key;
                newString = newString.replace(searchStr, values[key]);
            }
        }
        return newString;
    };

    /**
     * Finds the ancestor of the element that passes the test
     * @param {Element} element DOM element
     * @param {Function} test A function which takes an element as a parameter and return true or false for some test
     */
    fluid.utils.findAncestor = function (element, test) {
        return test(element) ? element : jQuery.grep(jQuery(element).parents(), test)[0];
    };
    
})(jQuery, fluid);
