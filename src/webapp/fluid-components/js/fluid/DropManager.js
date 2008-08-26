/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 University of Cambridge

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

    fluid.dropManager = fluid.dropManager || {};

    var cacheGeometry = function(element, cache) {
      // These measurements taken from ui.droppable.js
      cache.visible = cache.element.is(":visible"); 
      if(!m[i].visible) return;
      var offset = cache.element.offset();
      var width = cache.element.outerWidth();
      var height = cache.element.outerHeight();
      cache.rect = offset;
      cache.rect.right = offset.left + width;
      cache.rect.bottom = offset.top + height;
      return cache;
    };
    
    fluid.dropManager.NO_CHANGE = "no change";
    
    fluid.dropManager = function () {
        var cache = {};
        var that = {};
        
        var lastClosest;
        
        that.updateGeometry = function(geometricInfo) {
            cache = {};
            for (var i = 0; i < geometricInfo.length; ++ i) {
            var thisInfo = geometricInfo[i];
            var expanse = thisInfo.expanseType;
            for (var j = 0; j < thisInfo.elements.length; ++ j) {
               var element = jQuery(thisInfo.elements[j]);
               var cacheelem = cacheGeometry(element, {});
               cacheelem.id = element.data();
               cache[cacheelem.id] = cacheelem;
               }
            }   
        };
        
        that.beginDrag = function() {
            lastClosest = null;
        };
        
        that.mouseMove = function(x, y) {
            var closestTarget = that.closestTarget(x, y, lastClosest);
            if (closetTarget !== fluid.dropManager.NO_CHANGE) {
               lastClosest = closestTarget;
               dropChangerFirer.fireEvent(closestTarget);
            }
        };
        
        that.dropChangeFirer = fluid.getEventFirer();
        
        that.closestTarget = function (x, y, lastClosest) {
            var mindistance = MAX_VALUE;
            var minelem;
            for (var i in cache) {
                var cacheelem = cache[i];
                var distance = fluid.geom.minPointRectangle(x, y, cacheelem.rect);
                if (distance < mindistance) {
                    mindistance = distance;
                    minelem = cacheelem;
                }
                if (distance === 0) {
                    break;
                }
            }
            var position = fluid.position.INSIDE;
            if (cacheelem.expanse === fluid.orientation.HORIZONTAL) {
                position = x < (cacheelem.rect.left + cacheelem.rect.right) / 2?
                    fluid.position.BEFORE : fluid.position.AFTER;
            }
            else if (cacheelem.expanse === fluid.orientation.VERTICAL) {
                position = y < (cacheelem.rect.top + cacheelem.rect.bottom) / 2?
                    fluid.position.BEFORE : fluid.position.AFTER;
            }
            if (lastClosest && lastClosest.position === position &&
                lastClosest.element.data() === minelem.element.data()) {
                return fluid.dropManager.NO_CHANGE;
            }
            return {
              position: position,
              element: minelem.element
            };
        };
        
        return that;
    };


    fluid.geom = fluid.geom || {};
    
    fluid.geom.minPointRectangle = function (x, y, rectangle) {
        var dx = x < rectangle.left? (rectangle.left - x) : 
                  (x > rectangle.right? (x - rectangle.right) : 0);
        var dy = y < rectangle.top? (rectangle.top - y) : 
                  (y > rectangle.bottom? (y - rectangle.bottom) : 0);
        return dx * dx + dy * dy;
    };
    
    
  
}) (jQuery, fluid);