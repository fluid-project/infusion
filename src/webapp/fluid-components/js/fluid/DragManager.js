/*
Copyright 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {

  function updateDepth(opId, element) {
      var elDirty = jQuery.data(element, "fluid-dom-dirtiness");
      var depth;
      if (!elDirty || elDirty < opId) {
        depth = fluid.utils.computeDomDepth(element);
        jQuery.data(element, "fluid-dom-depth", depth);
        jQuery.data(element, "fluid-dom-dirtiness", opId);
      }
      if (!depth) {
        depth = jQuery.data(element, "fluid-dom-depth");
      }
      return depth;
    } 
  

  fluid.dragManager = function() {

    // An incrementing integer representing a unique identifier for any current
    // drag operation. This will eventually become a global proxy for a 
    // "DOM modification counter".
    var dragId = 0;
    // A map of jQuery data ids to the set of active drop targets - that is,
    // those ones for which we have received an "over" but not an out.
    var lightMap = {};
    
    var that = {};
  
    that.computeTopTarget = function() {
        var maxDepth = 0;
        var maxEl;
        for (var i in lightMap) {
          var light = lightMap[i];
          if (light.depth > maxDepth) {
            maxDepth = light.depth;
            maxEl = light.element;
          }
        }
        return maxEl;
      };
        
    that.startDrag = function() {
        ++ dragId;
    };
    
    that.recordOver = function(element) {
        var depth = updateDepth(dragId, element);
        lightMap[jQuery.data(element)] = {element: element, depth: depth};
      };
      
    that.recordOut = function(element) {
        delete lightMap[jQuery.data(element)];
    };
    
    that.clear = function() {
      lightMap = {};
    };
    
    return that;
  };
  
}) (jQuery, fluid);