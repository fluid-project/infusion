/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
  fluid.parseTemplate = function(template, baseURL, scanStart, cutpoints_in, opts) {
      opts = opts || {};
    
      if (!template) {
          fluid.fail("empty template supplied to fluid.parseTemplate");
      }
    
      var t;
      var parser;
      var tagstack;
      var lumpindex = 0;
      var nestingdepth = 0;
      var justended = false;
      
      var defstart = -1;
      var defend = -1;   
      
      var parseOptions = opts;
      
      var baseURL;
      
      var debugMode = false;
      
      var cutpoints = []; // list of selector, tree, id
      var simpleClassCutpoints = {};
      
      var cutstatus = [];
      
      XMLLump = function (lumpindex, nestingdepth) {
          return {
              //rsfID: "",
              //text: "",
              //downmap: {},
              //attributemap: {},
              //finallump: {},
              nestingdepth: nestingdepth,
              lumpindex: lumpindex,
              parent: t
          };
      };
      
      function isSimpleClassCutpoint(tree) {
          return tree.length === 1 && tree[0].predList.length === 1 && tree[0].predList[0].clazz;
      }
      
      function init(baseURLin, debugModeIn, cutpointsIn) {
          t.rootlump = XMLLump(0, -1);
          tagstack = [t.rootlump];
          lumpindex = 0;
          nestingdepth = 0;
          justended = false;
          defstart = -1;
          defend = -1;
          baseURL = baseURLin;
          debugMode = debugModeIn;
          if (cutpointsIn) {
              for (var i = 0; i < cutpointsIn.length; ++ i) {
                  var tree = fluid.parseSelector(cutpointsIn[i].selector);
                  var clazz = isSimpleClassCutpoint(tree);
                  if (clazz) {
                      simpleClassCutpoints[clazz] = cutpointsIn[i].id;
                  }
                  else {
                      cutstatus.push([]);
                      cutpoints.push($.extend({}, cutpointsIn[i], {tree: tree}));
                  }
              }
          }
      }
      
      function findTopContainer() {
          for (var i = tagstack.length - 1; i >= 0; --i ) {
              var lump = tagstack[i];
              if (lump.rsfID !== undefined) {
                  return lump;
              }
          }
          return t.rootlump;
      }
      
      function newLump() {
          var togo = XMLLump(lumpindex, nestingdepth);
          if (debugMode) {
              togo.line = parser.getLineNumber();
              togo.column = parser.getColumnNumber();
          }
          //togo.parent = t;
          t.lumps[lumpindex] = togo;
          ++lumpindex;
          return togo;
      }
      
      function addLump(mmap, ID, lump) {
          var list = mmap[ID];
          if (!list) {
              list = [];
              mmap[ID] = list;
          }
          list[list.length] = lump;
      }
        
      function checkContribute(ID, lump) {
          if (ID.indexOf("scr=contribute-") !== -1) {
              var scr = ID.substring("scr=contribute-".length);
              addLump(t.collectmap, scr, lump);
          }
      }
      
      function debugLump(lump) {
        // TODO expand this to agree with the Firebug "self-selector" idiom
          return "<" + lump.tagname + ">";
      }
      
      function hasCssClass(clazz, totest) {
          if (!totest) {
              return false;
          }
          // algorithm from JQuery
          return (" " + totest + " ").indexOf(" " + clazz + " ") !== -1;
      }
      
      function matchNode(term, headlump, headclazz) {
        if (term.predList) {
          for (var i = 0; i < term.predList.length; ++ i) {
            var pred = term.predList[i];
            if (pred.id && headlump.attributemap.id !== pred.id) {return false;}
            if (pred.clazz && !hasCssClass(pred.clazz, headclazz)) {return false;}
            if (pred.tag && headlump.tagname !== pred.tag) {return false;}
            }
          return true;
          }
        }
      
      function tagStartCut(headlump) {
        var togo = undefined;
        var headclazz = headlump.attributemap["class"];
        if (headclazz) {
            var split = headclazz.split(" ");
            for (var i = 0; i < split.length; ++ i) {
                var simpleCut = simpleClassCutpoints[split[i].trim()];
                if (simpleCut) {
                    return simpleCut;
                }
            }
        }
        for (var i = 0; i < cutpoints.length; ++ i) {
            var cut = cutpoints[i];
            var cutstat = cutstatus[i];
            var nextterm = cutstat.length; // the next term for this node
            if (nextterm < cut.tree.length) {
              var term = cut.tree[nextterm];
              if (nextterm > 0) {
                if (cut.tree[nextterm - 1].child && 
                  cutstat[nextterm - 1] !== headlump.nestingdepth - 1) {
                  continue; // it is a failure to match if not at correct nesting depth 
                  }
                }
              var isMatch = matchNode(term, headlump, headclazz);
              if (isMatch) {
                cutstat[cutstat.length] = headlump.nestingdepth;
                if (cutstat.length === cut.tree.length) {
                  if (togo !== undefined) {
                    fluid.fail("Cutpoint specification error - node " +
                      debugLump(headlump) +
                      " has already matched with rsf:id of " + togo);
                    }
                  if (cut.id === undefined || cut.id === null) {
                      fluid.fail("Error in cutpoints list - entry at position " + i + " does not have an id set");
                  }
                  togo = cut.id;
                  }
                }
              }
            }
        return togo;
        }
        
      function tagEndCut() {
        if (cutpoints) {
          for (var i = 0; i < cutpoints.length; ++ i) {
            var cutstat = cutstatus[i];
            if (cutstat.length > 0 && cutstat[cutstat.length - 1] === nestingdepth) {
              cutstat.length--;
              }
            }
          }
        }
      
      function processTagStart(isempty, text) {
        ++nestingdepth;
        if (justended) {
          justended = false;
          var backlump = newLump();
          backlump.nestingdepth--;
        }
        if (t.firstdocumentindex === -1) {
          t.firstdocumentindex = lumpindex;
        }
        var headlump = newLump();
        var stacktop = tagstack[tagstack.length - 1];
        headlump.uplump = stacktop;
        var tagname = parser.getName();
        headlump.tagname = tagname;
        // NB - attribute names and values are now NOT DECODED!!
        var attrs = headlump.attributemap = parser.m_attributes;
        var ID = attrs[fluid.ID_ATTRIBUTE];
        if (ID === undefined) {
          ID = tagStartCut(headlump);
          }
        for (var attrname in attrs) {
          var attrval = attrs[attrname];
          if (ID === undefined) {
            if (/href|src|codebase|action/.test(attrname)) {
              ID = "scr=rewrite-url";
              }
              // port of TPI effect of IDRelationRewriter
            else if (ID === undefined && /for|headers/.test(attrname)) {
              ID = "scr=null";
              }
            }
          }
    
        if (ID) {
          // TODO: ensure this logic is correct on RSF Server
          if (ID.charCodeAt(0) === 126) { // "~"
            ID = ID.substring(1);
            headlump.elide = true;
          }
          checkContribute(ID, headlump);
          headlump.rsfID = ID;
          var downreg = findTopContainer();
          if (!downreg.downmap) {
            downreg.downmap = {};
            }
          while(downreg) { // TODO: unusual fix for locating branches in parent contexts (applies to repetitive leaves)
              if (downreg.downmap) {
                  addLump(downreg.downmap, ID, headlump);
              }
              downreg = downreg.uplump;
          }
          addLump(t.globalmap, ID, headlump);
          var colpos = ID.indexOf(":");
          if (colpos !== -1) {
          var prefix = ID.substring(0, colpos);
          if (!stacktop.finallump) {
            stacktop.finallump = {};
            }
          stacktop.finallump[prefix] = headlump;
          }
        }
        
        // TODO: accelerate this by grabbing original template text (requires parser
        // adjustment) as well as dealing with empty tags
        headlump.text = "<" + tagname + fluid.dumpAttributes(attrs) + (isempty && !ID? "/>": ">");
        tagstack[tagstack.length] = headlump;
        if (isempty) {
          if (ID) {
            processTagEnd();
          }
          else {
            --nestingdepth;
            tagstack.length --;
          }
        }
      }
      
      function processTagEnd() {
        tagEndCut();
        var endlump = newLump();
        --nestingdepth;
        endlump.text = "</" + parser.getName() + ">";
        var oldtop = tagstack[tagstack.length - 1];
        oldtop.close_tag = t.lumps[lumpindex - 1];
        tagstack.length --;
        justended = true;
      }
      
      function processDefaultTag() {
        if (defstart !== -1) {
          if (t.firstdocumentindex === -1) {
            t.firstdocumentindex = lumpindex;
            }
          var text = parser.getContent().substr(defstart, defend - defstart);
          justended = false;
          var newlump = newLump();
          newlump.text = text; 
          defstart = -1;
        }
      }
   
   /** ACTUAL BODY of fluid.parseTemplate begins here **/
      
    t = fluid.XMLViewTemplate();
    
    init(baseURL, opts.debugMode, cutpoints_in);

    var idpos = template.indexOf(fluid.ID_ATTRIBUTE);
    if (scanStart) {
      var brackpos = template.indexOf('>', idpos);
      parser = new XMLP(template.substring(brackpos + 1));
    }
    else {
      parser = new XMLP(template); 
      }

    parseloop: while(true) {
      var iEvent = parser.next();
      switch(iEvent) {
        case XMLP._ELM_B:
          processDefaultTag();
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
          processTagStart(false, "");
          break;
        case XMLP._ELM_E:
          processDefaultTag();
          processTagEnd();
          break;
        case XMLP._ELM_EMP:
          processDefaultTag();
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());    
          processTagStart(true, "");
          break;
        case XMLP._PI:
        case XMLP._DTD:
          defstart = -1;
          continue; // not interested in reproducing these
        case XMLP._TEXT:
        case XMLP._ENTITY:
        case XMLP._CDATA:
        case XMLP._COMMENT:
          if (defstart === -1) {
            defstart = parser.m_cB;
            }
          defend = parser.m_cE;
          break;
        case XMLP._ERROR:
          fluid.setLogging(true);
          var message = "Error parsing template: " + parser.m_cAlt + 
          " at line " + parser.getLineNumber(); 
          fluid.log(message);
          fluid.log("Just read: " + parser.m_xml.substring(parser.m_iP - 30, parser.m_iP));
          fluid.log("Still to read: " + parser.m_xml.substring(parser.m_iP, parser.m_iP + 30));
          fluid.fail(message);
          break parseloop;
        case XMLP._NONE:
          break parseloop;
        }
      }
    processDefaultTag();
    var excess = tagstack.length - 1; 
    if (excess) {
        fluid.fail("Error parsing template - unclosed tag(s) of depth " + (excess) + 
           ": " + fluid.transform(tagstack.splice(1, excess), function(lump) {return debugLump(lump);}).join(", "));
    }
    return t;
    };
  
    fluid.debugLump = function(lump) {
        var togo = lump.text;
        togo += " at ";
        togo += "lump line " + lump.line + " column " + lump.column +" index " + lump.lumpindex;
        togo += lump.parent.href === null? "" : " in file " + lump.parent.href;
        return togo;
    };
  
  // Public definitions begin here
  
  fluid.ID_ATTRIBUTE = "rsf:id";
  
  fluid.getPrefix = function(id) {
   var colpos = id.indexOf(':');
   return colpos === -1? id : id.substring(0, colpos);
   };
  
  fluid.SplitID = function(id) {
    var that = {};
    var colpos = id.indexOf(':');
    if (colpos === -1) {
      that.prefix = id;
      }
    else {
      that.prefix = id.substring(0, colpos);
      that.suffix = id.substring(colpos + 1);
     }
     return that;
  };
  
  fluid.XMLViewTemplate = function() {
    return {
      globalmap: {},
      collectmap: {},
      lumps: [],
      firstdocumentindex: -1
    };
  };

 /** Utilities for fluid.fetchResources **/

  var composeCallbacks = function(internal, external) {
      return external? function() {
          try {
              external.apply(null, arguments);
          }
          catch (e) {
              fluid.log("Exception applying external fetchResources callback: " + e);
          }
          internal.apply(null, arguments); // call the internal callback without fail
      } : internal;
  };
  
  var composePolicy = function(target, source, key) {
      target[key] = composeCallbacks(target[key], source[key]);
  };
  
  fluid.defaults("fluid.fetchResources", {
      mergePolicy: {
          success: composePolicy,
          error: composePolicy,
          url: "reverse"
      }
  });
  
  function timeSuccessCallback(resourceSpec) {
      if (resourceSpec.timeSuccess && resourceSpec.options && resourceSpec.options.success) {
          var success = resourceSpec.options.success;
          resourceSpec.options.success = function() {
          var startTime = new Date();
          var ret = success.apply(null, arguments);
          fluid.log("External callback for URL " + resourceSpec.href + " completed - callback time: " + 
                  (new Date().getTime() - startTime.getTime()) + "ms");
          return ret;
          };
      }
  }
  
  var resourceCache = {};
  
  // TODO: Integrate punch-through from old Engage implementation
  function canonUrl(url) {
      return url;
  }
  
  /** Accepts a hash of structures with free keys, where each entry has either
   * href or nodeId set - on completion, callback will be called with the populated
   * structure with fetched resource text in the field "resourceText" for each
   * entry.
   */
  var fetchResourcesImpl = function(specStructure, callback) {
      var resourceCallback = function (thisSpec) {
          function completeRequest() {
              thisSpec.queued = false;
              thisSpec.completeTime = new Date();
              fluid.log("Request to URL " + thisSpec.href + " completed - total elapsed time: " + 
                  (thisSpec.completeTime.getTime() - thisSpec.initTime.getTime()) + "ms");
              fetchResourcesImpl(specStructure, callback);         
          }
          return {
              success: function(response) {
                  thisSpec.resourceText = response;
                  thisSpec.resourceKey = thisSpec.href;
                  if (thisSpec.forceCache) {
                       var canon = canonUrl(thisSpec.href);
                       var cached = resourceCache[canon];
                       if (cached.$$firer$$) {
                           resourceCache[canon] = response;      
                           cached.fire(response);
                       }
                  }
                  completeRequest();
              },
              error: function(response, textStatus, errorThrown) {
                  thisSpec.fetchError = {
                      status: response.status,
                      textStatus: response.textStatus,
                      errorThrown: errorThrown
                  };
                  completeRequest();
              }
              
          };
      };
      
      var complete = true;
      var allSync = true;
      var resourceSpecs = specStructure.specs;
      for (var key in resourceSpecs) {
          var resourceSpec = resourceSpecs[key];
          if (!resourceSpec.options || resourceSpec.options.async) {
              allSync = false;
          }
          if (resourceSpec.url && !resourceSpec.href) {
              resourceSpec.href = resourceSpec.url;
          }
          if (resourceSpec.href && !resourceSpec.completeTime) {
               if (!resourceSpec.queued) {
                   var thisCallback = resourceCallback(resourceSpec);
                   var options = {  
                       url:     resourceSpec.href,
                       success: thisCallback.success, 
                       error:   thisCallback.error};
                   timeSuccessCallback(resourceSpec);
                   fluid.merge(fluid.defaults("fluid.fetchResources").mergePolicy,
                                options, resourceSpec.options);
                   resourceSpec.queued = true;
                   resourceSpec.initTime = new Date();
                   fluid.log("Request with key " + key + " queued for " + resourceSpec.href);
                   var canon = canonUrl(resourceSpec.href);
                   if (resourceSpec.forceCache) {
                       var cached = resourceCache[canon];
                       if (!cached) {
                           fluid.log("First request for cached resource with url " + canon);
                           cached = fluid.event.getEventFirer();
                           cached.$$firer$$ = true;
                           resourceCache[canon] = cached;
                           options.cache = false; // TODO: Getting weird "not modified" issues on Firefox
                           $.ajax(options);
                       }
                       else {
                           if (!cached.$$firer$$) {
                               options.success(cached);
                           }
                           else {
                               fluid.log("Request for cached resource which is in flight: url " + canon);
                               cached.addListener(function(response) {
                                   options.success(cached);
                               });
                           }
                       }
                   }
                   else {
                       $.ajax(options);
                   }
               }
               if (resourceSpec.queued) {
                   complete = false;
               }
          }
          else if (resourceSpec.nodeId && !resourceSpec.resourceText) {
              var node = document.getElementById(resourceSpec.nodeId);
              // upgrade this to somehow detect whether node is "armoured" somehow
              // with comment or CDATA wrapping
              resourceSpec.resourceText = fluid.dom.getElementText(node);
              resourceSpec.resourceKey = resourceSpec.nodeId;
          }
      }
      if (complete && callback && !specStructure.callbackCalled) {
          specStructure.callbackCalled = true;
          if ($.browser.mozilla && !allSync) {
              // Defer this callback to avoid debugging problems on Firefox
              setTimeout(function() {
                  callback(resourceSpecs);
                  }, 1);
          }
          else {
              callback(resourceSpecs)
          }
      }
  };
  
    
  fluid.fetchResources = function(resourceSpecs, callback) {
      return fetchResourcesImpl({specs: resourceSpecs}, callback);
  }
  
    // TODO: find faster encoder
  fluid.XMLEncode = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    };
  
  fluid.dumpAttributes = function(attrcopy) {
    var togo = "";
    for (var attrname in attrcopy) {
      var attrvalue = attrcopy[attrname];
      if (attrvalue !== null && attrvalue !== undefined) {
          togo += " " + attrname + "=\"" + attrvalue + "\"";
          }
      }
    return togo;
    };
  
  fluid.aggregateMMap = function (target, source) {
    for (var key in source) {
      var targhas = target[key];
      if (!targhas) {
        target[key] = [];
      }
      target[key] = target[key].concat(source[key]);
    }
  };

  
  
  /** Returns a "template structure", with globalmap in the root, and a list
   * of entries {href, template, cutpoints} for each parsed template.
   */
  fluid.parseTemplates = function(resourceSpec, templateList, opts) {
    var togo = [];
    opts = opts || {};
    togo.globalmap = {};
    for (var i = 0; i < templateList.length; ++ i) {
      var resource = resourceSpec[templateList[i]];
      var lastslash = resource.href.lastIndexOf("/");
      var baseURL = lastslash === -1? "" : resource.href.substring(0, lastslash + 1);
        
        var template = fluid.parseTemplate(resource.resourceText, baseURL, 
          opts.scanStart && i === 0, resource.cutpoints, opts);
        if (i === 0) {
          fluid.aggregateMMap(togo.globalmap, template.globalmap);
        }
        template.href = resource.href;
        template.baseURL = baseURL;
        template.resourceKey = resource.resourceKey;

        togo[i] = template;
        fluid.aggregateMMap(togo.globalmap, template.rootlump.downmap);
      }
      return togo;
    };

  // ******* SELECTOR ENGINE *********  
    
  // selector regexps copied from JQuery
  var chars = "(?:[\\w\u0128-\uFFFF*_-]|\\\\.)";
  var quickChild = new RegExp("^>\\s*(" + chars + "+)");
  var quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)");
  var selSeg = new RegExp("^\s*([#.]?)(" + chars + "*)");

  var quickClass = new RegExp("([#.]?)(" + chars + "+)", "g");
  var childSeg = new RegExp("\\s*(>)?\\s*", "g");
  var whiteSpace = new RegExp("^\\w*$");

  fluid.parseSelector = function(selstring) {
    var togo = [];
    selstring = $.trim(selstring);
    //ws-(ss*)[ws/>]
    quickClass.lastIndex = 0;
    var lastIndex = 0;
    while (true) {
      var atNode = []; // a list of predicates at a particular node
      while (true) {
        var segMatch = quickClass.exec(selstring);
        if (!segMatch || segMatch.index !== lastIndex) {
          break;
          }
        var thisNode = {};
        var text = segMatch[2];
        if (segMatch[1] === "") {
          thisNode.tag = text;
        }
        else if (segMatch[1] === "#"){
          thisNode.id = text;
          }
        else if (segMatch[1] === ".") {
          thisNode.clazz = text;
          }
        atNode[atNode.length] = thisNode;
        lastIndex = quickClass.lastIndex;
        }
      childSeg.lastIndex = lastIndex;
      var fullAtNode = {predList: atNode};
      var childMatch = childSeg.exec(selstring);
      if (!childMatch || childMatch.index !== lastIndex) {
        var remainder = selstring.substring(lastIndex);
        fluid.fail("Error in selector string - can not match child selector expression at " + remainder);
        }
      if (childMatch[1] === ">") {
        fullAtNode.child = true;
        }
      togo[togo.length] = fullAtNode;
      // >= test here to compensate for IE bug http://blog.stevenlevithan.com/archives/exec-bugs
      if (childSeg.lastIndex >= selstring.length) {
        break;
        }
      lastIndex = childSeg.lastIndex;
      quickClass.lastIndex = childSeg.lastIndex; 
      }
    return togo;
    };
    
})(jQuery, fluid_1_2);
