/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_7*/

fluid_0_7 = fluid_0_7 || {};

(function ($, fluid) {
  
  function debugPosition(component) {
     return "as child of " + (component.parent.fullID? "component with full ID " + component.parent.fullID : "root");
  }
  
  function computeFullID(component) {
    var togo = "";
    var move = component;
    if (component.children === undefined) { // not a container
      // unusual case on the client-side, since a repetitive leaf may have localID blasted onto it.
      togo = component.ID + (component.localID !== undefined? component.localID : "");
      move = component.parent;
      }
    while (move.parent) {
      var parent = move.parent;
      if (move.fullID !== undefined) {
        togo = move.fullID + togo;
        return togo;
        }
      if (move.noID === undefined) {
        var ID = move.ID;
        if (ID === undefined) {
          fluid.fail("Error in component tree - component found with no ID "
            + debugPosition(parent) + ": please check structure");
        }
        var colpos = ID.indexOf(":");        
        var prefix = colpos === -1? ID : ID.substring(0, colpos);
        togo = prefix + ":" + (move.localID === undefined ? "" : move.localID) + ":" + togo;
      }
      move = parent;
    }
    return togo;
  }
  
  function isBoundPrimitive(value) {
      return fluid.isPrimitive(value) || value instanceof Array 
             && (value.length === 0 || typeof(value[0]) === "string") 
  }
  
  function processChild(value, key) {
    if (isBoundPrimitive(value)) {
      return {componentType: "UIBound", value: value, ID: key};
      }
    else {
      var unzip = unzipComponent(value);
      if (unzip.ID) {
        return {ID: key, componentType: "UIContainer", children: [unzip]};
      }
      else {
        unzip.ID = key;
        return unzip;
        } 
      }    
    }
  
  function fixChildren(children) {
    if (!(children instanceof Array)) {
      var togo = [];
      for (var key in children) {
        var value = children[key];
        if (value instanceof Array) {
          for (var i = 0; i < value.length; ++ i) {
            var processed = processChild(value[i], key);
//            if (processed.componentType === "UIContainer" &&
//              processed.localID === undefined) {
//              processed.localID = i;
//            }
            togo[togo.length] = processed;
            }
          }
        else {
          togo[togo.length] = processChild(value, key);
        } 
      }
      return togo;
    }
    else return children;
  }
  
  function fixupValue(uibound, model) {
      if (model && uibound.value === undefined && uibound.valuebinding !== undefined) {
          uibound.value = fluid.model.getBeanValue(model, uibound.valuebinding);
      }
  }
  
  function upgradeBound(holder, property, model) {
      if (holder[property] !== undefined) {
          if (isBoundPrimitive(holder[property])) {
              holder[property] = {value: holder[property]};
          }
      }
      else {
          holder[property] = {value: null}
      }
      fixupValue(holder[property], model);
  }
  
  var duckMap = {children: "UIContainer", 
        value: "UIBound", valuebinding: "UIBound", messagekey: "UIMessage", 
        markup: "UIVerbatim", selection: "UISelect", target: "UILink",
        choiceindex: "UISelectChoice", functionname: "UIInitBlock"};
  
  function unzipComponent(component, model) {
    if (component) {
      for (var key in duckMap) {
        if (component[key] !== undefined) {
          component.componentType = duckMap[key];
          break;
        }
      }
    }
    if (!component || component.componentType === undefined) {
        var decorators = component.decorators;
        if (decorators) delete component.decorators;
        component = {componentType: "UIContainer", children: component};
        component.decorators = decorators;
    }
    if (component.componentType === "UIContainer") {
        component.children = fixChildren(component.children);
    }
    else if (component.componentType === "UISelect") {
        upgradeBound(component, "selection", model);
        upgradeBound(component, "optionlist", model);
        upgradeBound(component, "optionnames", model);
    }
    return component;
  }
  
  // When a component
  function assignSubmittingName(component) {
      if (component.submittingname === undefined && component.willinput !== false) {
          component.submittingname = component.fullID;
      }
      return component.submittingname;
  }
  
  function fixupTree(tree, model) {
    if (tree.componentType === undefined) {
      tree = unzipComponent(tree, model);
      }
    if (tree.componentType !== "UIContainer" && !tree.parent) {
      tree = {children: [tree]};
    }
    
    if (tree.children) {
       tree.childmap = {};
      for (var i = 0; i < tree.children.length; ++ i) {
        var child = tree.children[i];
        if (child.componentType === undefined) {
          child = unzipComponent(child, model);
          tree.children[i] = child;
          }
        child.parent = tree;
        if (child.ID === undefined) {
           fluid.fail("Error in component tree: component found with no ID " + debugPosition(child));
        }
        tree.childmap[child.ID] = child;
        var colpos = child.ID.indexOf(":"); 
        if (colpos === -1) {
        //  tree.childmap[child.ID] = child; // moved out of branch to allow
        // "relative id expressions" to be easily parsed
        }
        else {
          var prefix = child.ID.substring(0, colpos);
          var childlist = tree.childmap[prefix]; 
          if (!childlist) {
            childlist = [];
            tree.childmap[prefix] = childlist;
          }
          if (child.localID === undefined && childlist.length != 0) {
              child.localID = childlist.length;
          }
          childlist[childlist.length] = child;
        }
        child.fullID = computeFullID(child);

        var componentType = child.componentType;
        if (componentType == "UISelect") {
          child.selection.fullID = child.fullID + "-selection";
        }
        else if (componentType == "UIInitBlock") {
          var call = child.functionname + '(';
          for (var j = 0; j < child.arguments.length; ++ j) {
            if (child.arguments[j] instanceof fluid.ComponentReference) {
              // TODO: support more forms of id reference
              child.arguments[j] = child.parent.fullID + child.arguments[j].reference;
            }
            call += '"' + child.arguments[j] + '"'; 
            if (j < child.arguments.length - 1) {
              call += ", ";
            }
          }
          child.markup = call + ")\n";
          child.componentType = "UIVerbatim";
          }
        else if (componentType == "UIBound") {
            fixupValue(child, model);
            }
        fixupTree(child, model);
        }
      }
    return tree;
    }
  // private renderer state variables, stored in this outer closure location to reduce argument
  // parsing. Renderer is non-reentrant.
  var globalmap = {};
  var branchmap = {};
  var rewritemap = {}; // map of rewritekey (for original id in template) to full ID 
  var seenset = {};
  var collected = {};
  var out = "";
  var debugMode = false;
  var directFossils = {}; // map of submittingname to {EL, submittingname, oldvalue}
  var renderOptions = {};
  var decoratorQueue = [];
  
  var renderedbindings = {}; // map of fullID to true for UISelects which have already had bindings written
  
  function getRewriteKey(template, parent, id) {
    return template.resourceKey + parent.fullID + id;
  }
  // returns: lump
  function resolveInScope(searchID, defprefix, scope, child) {
    var deflump;
    var scopelook = scope? scope[searchID] : null;
    if (scopelook) {
      for (var i = 0; i < scopelook.length; ++ i) {
        var scopelump = scopelook[i];
        if (!deflump && scopelump.rsfID == defprefix) {
          deflump = scopelump;
        }
        if (scopelump.rsfID == searchID) {
          return scopelump;
        }
      }
    }
    return deflump;
  }
  // returns: lump
  function resolveCall(sourcescope, child) {
    var searchID = child.jointID? child.jointID : child.ID;
    var split = fluid.SplitID(searchID);
    var defprefix = split.prefix + ':';
    var match = resolveInScope(searchID, defprefix, sourcescope.downmap, child);
    if (match) return match;
    if (child.children) {
      match = resolveInScope(searchID, defprefix, globalmap, child);
      if (match) return match;
    }
    return null;
  }
  
  function noteCollected(template) {
    if (!seenset[template.href]) {
      fluid.aggregateMMap(collected, template.collectmap);
      seenset[template.href] = true;
    }
  }
  
  function resolveRecurse(basecontainer, parentlump) {
    for (var i = 0; i < basecontainer.children.length; ++ i) {
      var branch = basecontainer.children[i];
      if (branch.children) { // it is a branch TODO
        var resolved = resolveCall(parentlump, branch);
        if (resolved) {
          branchmap[branch.fullID] = resolved;
          var id = resolved.attributemap.id;
          if (id !== undefined) {
            rewritemap[getRewriteKey(parentlump.parent, basecontainer, id)] = branchfullID;
          }
          // on server-side this is done separately
          noteCollected(resolved.parent);
          resolveRecurse(branch, resolved);
        }
      }
    }
    // collect any rewritten ids for the purpose of later rewriting
    if (parentlump.downmap) {
      for (var id in parentlump.downmap) {
        if (id.indexOf(":") === -1) {
          var lumps = parentlump.downmap[id];
          for (var i = 0; i < lumps.length; ++ i) {
            var lump = lumps[i];
            var lumpid = lump.attributemap["id"];
            if (lumpid !== undefined && lump.rsfID !== undefined) {
              var resolved = fetchComponent(basecontainer, lump.rsfID);
              if (resolved !== null) {
                rewritemap[getRewriteKey(parentlump.parent, basecontainer,
                    lumpid)] = resolved.fullID;
              }
            }
          }
        }
      }
    }
      
  }
  
  function resolveBranches(globalmapp, basecontainer, parentlump) {
      branchmap = {};
      rewritemap = {};
      seenset = {};
      collected = {};
      globalmap = globalmapp;
      branchmap[basecontainer.fullID] = parentlump;
      resolveRecurse(basecontainer, parentlump);
  }
  
  function dumpBranchHead(branch, targetlump) {
      var attrcopy = {};
      $.extend(true, attrcopy, targetlump.attributemap);
      adjustForID(attrcopy, branch);
      outDecorators(branch, attrcopy);
      out += "<" + targetlump.tagname + " ";
      out += fluid.dumpAttributes(attrcopy);
      out += ">";
  }
  
  function dumpTillLump(lumps, start, limit) {
      for (; start < limit; ++ start) {
          var text = lumps[start].text;
          if (text) { // guard against "undefined" lumps from "justended"
              out += lumps[start].text;
          }
      }
  }

  function dumpScan(lumps, renderindex, basedepth, closeparent, insideleaf) {
    var start = renderindex;
    while (true) {
      if (renderindex === lumps.length)
        break;
      var lump = lumps[renderindex];
      if (lump.nestingdepth < basedepth)
        break;
      if (lump.rsfID !== undefined) {
        if (!insideleaf) break;
        if (insideleaf && lump.nestingdepth > basedepth + (closeparent?0:1) ) {
          fluid.log("Error in component tree - leaf component found to contain further components - at " +
              lump.toString());
        }
        else break;
      }
      // target.print(lump.text);
      ++renderindex;
    }
    // ASSUMPTIONS: close tags are ONE LUMP
    if (!closeparent && (renderindex == lumps.length || !lumps[renderindex].rsfID))
      --renderindex;
    
    dumpTillLump(lumps, start, renderindex);
    //target.write(buffer, start, limit - start);
    return renderindex;
  }
  // In RSF Client, this is a "flyweight" "global" object that is reused for every tag, 
  // to avoid generating garbage. In RSF Server, it is an argument to the following rendering
  // methods of type "TagRenderContext".
  
  var trc = {};
  
  /*** TRC METHODS ***/
  
  function closeTag() {
    if (!trc.iselide) {
      out += "</" + trc.uselump.tagname + ">";
    }
  }

  function renderUnchanged() {
    // TODO needs work since we don't keep attributes in text
    dumpTillLump(trc.uselump.parent.lumps, trc.uselump.lumpindex + 1,
        trc.close.lumpindex + (trc.iselide ? 0 : 1));
  }
  
  function replaceAttributes() {
    if (!trc.iselide) {
      out += fluid.dumpAttributes(trc.attrcopy);
    }
    dumpTemplateBody();
  }

  function replaceAttributesOpen() {
    if (trc.iselide) {
      replaceAttributes();
    }
    else {
      out += fluid.dumpAttributes(trc.attrcopy);
      out += trc.endopen.lumpindex === trc.close.lumpindex ? "/>" : ">";

      trc.nextpos = trc.endopen.lumpindex;
    }
  }

  function dumpTemplateBody() {
    if (trc.endopen.lumpindex === trc.close.lumpindex) {
      if (!trc.iselide) {
        out += "/>";
      }
    }
    else {
      if (!trc.iselide) {
        out += ">";
      }
      dumpTillLump(trc.uselump.parent.lumps, trc.endopen.lumpindex,
          trc.close.lumpindex + (trc.iselide ? 0 : 1));
    }
  }

  function rewriteLeaf(value) {
      if (isValue(value))
          replaceBody(value);
      else
          replaceAttributes();
  }

  function rewriteLeafOpen(value) {
      if (trc.iselide) {
          rewriteLeaf(trc.value);
      }
      else {
          if (isValue(value)) 
              replaceBody(value);
          else
              replaceAttributesOpen();
      }
  }
  
  function replaceBody(value) {
      out += fluid.dumpAttributes(trc.attrcopy);
      if (!trc.iselide) {
          out += ">";
      }
      out += fluid.XMLEncode(value.toString());
      closeTag();
  }
  
  /*** END TRC METHODS**/
  
  function isValue(value) {
      return value !== null && value !== undefined && !isPlaceholder(value);
  }
  
  function isPlaceholder(value) {
      // TODO: equivalent of server-side "placeholder" system
      return false;
  }
  
  function rewriteURL(template, URL) {
      // TODO: rebasing of "relative URLs" discovered/issued from subcomponent templates
      return URL;
  }
  
  function dumpHiddenField(/** UIParameter **/ todump) {
      out += "<input type=\"hidden\" ";
      var isvirtual = todump.virtual;
      var outattrs = {};
      outattrs[isvirtual? "id" : "name"] = todump.name;
      outattrs.value = todump.value;
      out += fluid.dumpAttributes(outattrs);
      out += " />\n";
  }
  
  function applyAutoBind(torender, finalID) {
      var tagname = trc.uselump.tagname;
      if (renderOptions.autoBind && (tagname === "input" || tagname === "select") 
            && !renderedbindings[finalID]) {
          outDecoratorsImpl(torender, [{
            jQuery: ["change", function() {
              fluid.applyChange(fluid.byId(finalID));}]
          }], trc.attrcopy, finalID)
      }    
  }
  
  function dumpBoundFields(/** UIBound**/ torender, parent) {
      if (torender) {
          var holder = parent? parent : torender;
          if (directFossils && holder.submittingname && holder.valuebinding) {
            // TODO: this will store multiple times for each member of a UISelect
              directFossils[holder.submittingname] = {
                name: holder.submittingname,
                EL: holder.valuebinding,
                oldvalue: holder.value};
            // But this has to happen multiple times
              applyAutoBind(torender, torender.fullID);
          }
          if (torender.fossilizedbinding) {
              dumpHiddenField(torender.fossilizedbinding);
          }
          if (torender.fossilizedshaper) {
              dumpHiddenField(torender.fossilizedshaper);
          }
      }
  }
  
  function dumpSelectionBindings(uiselect) {
      if (!renderedbindings[uiselect.selection.fullID]) {
          renderedbindings[uiselect.selection.fullID] = true; // set this true early so that selection does not autobind twice
          dumpBoundFields(uiselect.selection);
          dumpBoundFields(uiselect.optionlist);
          dumpBoundFields(uiselect.optionnames);
      }
  }
  
  fluid.NULL_STRING = "\u25a9null\u25a9";
  
  var LINK_ATTRIBUTES = {
      a: "href", link: "href", img: "src", frame: "src", script: "src", style: "src", input: "src", embed: "src",
      form: "action",
      applet: "codebase", object: "codebase"
  };

  
  function isSelectedValue(torender, value) {
      var selection = torender.selection;
      return typeof(selection.value) !== "string" && typeof(selection.value.length) === "number" ? 
            $.inArray(value, selection.value, value) !== -1 :
               selection.value === value;
  }
  
  function getRelativeComponent(component, relativeID) {
      component = component.parent;
      if (relativeID.indexOf("..::") === 0) {
          relativeID = relativeID.substring(4);
          component = component.parent;
      }
      return component.childmap[relativeID];
  }
  
  function explodeDecorators(decorators) {
      var togo = [];
      for (var key in decorators) {
          if (key === "$") key = "jQuery";
          var value = decorators[key];
          var decorator = {
            type: key
          };
          if (key === "jQuery") {
              decorator.func = value[0];
              decorator.args = value.slice(1);
          }
          else if (key === "addClass") {
              decorator.classes = value;
          }
          else if (key === "attrs") {
              decorator.attributes = value;
          }
      togo[togo.length] = decorator;
      }
      return togo;
  }
  
  function outDecoratorsImpl(torender, decorators, attrcopy, finalID) {
      for (var i = 0; i < decorators.length; ++ i) {
          var decorator = decorators[i];
          var type = decorator.type;
          if (!type) {
              var decorators = explodeDecorators(decorator);
              outDecoratorsImpl(torender, decorators, attrcopy, finalID);
          }
          if (type === "jQuery" || type === "event") {
              var id = adjustForID(attrcopy, torender, true, finalID);
              var outdec = $.extend(true, {id: id}, decorator);
              decoratorQueue[decoratorQueue.length] = outdec;
          }
          // honour these remaining types immediately
          else if (type === "attrs") {
              $.extend(true, attrcopy, decorator.attributes);
          }
          else if (type === "addClass") {
              var fakeNode = {
                nodeType: 1,
                className: attrcopy["class"] || ""
              }
              $(fakeNode).addClass(decorator.classes);
              attrcopy["class"] = fakeNode.className;
          }
      }
  }
  
  function outDecorators(torender, attrcopy) {
      if (!torender.decorators) return;
      if (torender.decorators.length === undefined) {
          torender.decorators = explodeDecorators(torender.decorators);
      }
      outDecoratorsImpl(torender, torender.decorators, attrcopy);
  }
    
    
  function renderComponent(torender) {
    var attrcopy = trc.attrcopy;
    var lumps = trc.uselump.parent.lumps;
    var lumpindex = trc.uselump.lumpindex;
    
    var componentType = torender.componentType;
    var tagname = trc.uselump.tagname;
    
    outDecorators(torender, attrcopy);
    
    if (componentType === "UIMessage") {
        // degrade UIMessage to UIBound by resolving the message
        componentType = "UIBound";
        if (!renderOptions.messageLocator) {
           torender.value = "[No messageLocator is configured in options - please consult documentation on options.messageSource]";
        }
        else {
           torender.value = renderOptions.messageLocator(torender.messagekey, torender.args);
        }
    }
    
    if (componentType === "UIBound" || componentType === "UISelectChoice") {
        var parent;
        if (torender.choiceindex !== undefined) {
            if (torender.parentFullID) {
                parent = getAbsoluteComponent(view, torender.parentFullID);
            }
            else if (torender.parentRelativeID !== undefined){
                parent = getRelativeComponent(torender, torender.parentRelativeID);
            }
            else {
                fluid.fail("Error in component tree - UISelectChoice with id " + torender.fullID 
                + " does not have either parentFullID or parentRelativeID set");
            }
            assignSubmittingName(parent.selection);
            dumpSelectionBindings(parent);
        }

        var submittingname = parent? parent.selection.submittingname : torender.submittingname;
        if (tagname === "input" || tagname === "textarea") {
            if (!parent) {
                submittingname = assignSubmittingName(torender);
            }
            if (submittingname !== undefined) {
                attrcopy.name = submittingname;
                }
            }
        // this needs to happen early on the client, since it may cause the allocation of the
        // id in the case of a "deferred decorator". However, for server-side bindings, this 
        // will be an inappropriate time, unless we shift the timing of emitting the opening tag.
        dumpBoundFields(torender, parent? parent.selection : null);
  
        if (typeof(torender.value) === 'boolean' || attrcopy.type === "radio" 
               || attrcopy.type === "checkbox") {
            var underlyingValue;
            var directValue = torender.value;
            
            if (torender.choiceindex !== undefined) {
                if (!parent.optionlist.value) {
                    fluid.fail("Error in component tree - selection control with full ID " + parent.fullID + " has no values");
                }
                underlyingValue = parent.optionlist.value[torender.choiceindex];
                directValue = isSelectedValue(parent, underlyingValue);
            }
            if (isValue(directValue)) {
                if (directValue) {
                    attrcopy.checked = "checked";
                    }
                else {
                    delete attrcopy.checked;
                    }
                }
            attrcopy.value = underlyingValue? underlyingValue: "true";
            rewriteLeaf(null);
        }
        else if (torender.value instanceof Array) {
            // Cannot be rendered directly, must be fake
            renderUnchanged();
        }
        else { // String value
          var value = parent? 
              parent[tagname === "textarea" || tagname === "input" ? "optionlist" : "optionnames"].value[torender.choiceindex] : 
                torender.value;
          if (tagname === "textarea") {
            if (isPlaceholder(value) && torender.willinput) {
              // FORCE a blank value for input components if nothing from
              // model, if input was intended.
              value = "";
            }
            rewriteLeaf(value);
          }
          else if (tagname === "input") {
            if (torender.willinput || isValue(value)) {
              attrcopy.value = value;
              }
            rewriteLeaf(null);
            }
          else {
            delete attrcopy.name;
            rewriteLeafOpen(value);
            }
          }
        }
    else if (componentType === "UISelect") {
      // need to do this first to see whether we need to write out an ID or not
      applyAutoBind(torender, torender.selection.fullID);
      if (attrcopy.id) {
        // TODO: This is an irregularity, should probably remove for 0.8
        attrcopy.id = torender.selection.fullID;
        }
      var ishtmlselect = tagname === "select";
      var ismultiple = false;

      if (torender.selection.value instanceof Array) {
        ismultiple = true;
        if (ishtmlselect) {
          attrcopy.multiple = "multiple";
          }
        }
      
      assignSubmittingName(torender.selection);
      if (ishtmlselect) {
        // The HTML submitted value from a <select> actually corresponds
        // with the selection member, not the top-level component.
        if (torender.selection.willinput !== false) {
          attrcopy.name = torender.selection.submittingname;
        }
      }
      out += fluid.dumpAttributes(attrcopy);
      if (ishtmlselect) {
        out += ">";
        var values = torender.optionlist.value;
        var names = torender.optionnames === null || torender.optionnames === undefined ? values: torender.optionnames.value;
        for (var i = 0; i < names.length; ++i) {
          out += "<option value=\"";
          var value = values[i];
          if (value === null)
            value = fluid.NULL_STRING;
          out += fluid.XMLEncode(value);
          if (isSelectedValue(torender, value)) {
            out += "\" selected=\"selected";
            }
          out += "\">";
          out += fluid.XMLEncode(names[i]);
          out += "</option>\n";
        }
        closeTag();
      }
      else {
        dumpTemplateBody();
      }
      dumpSelectionBindings(torender);
    }
    else if (componentType === "UILink") {
      var attrname = LINK_ATTRIBUTES[tagname];
      if (attrname) {
        var target= torender.target;
        if (!isValue(target)) {
          target = attrcopy[attname];
          }
        else {
          target = rewriteURL(trc.uselump.parent, target);
          }
        attrcopy[attrname] = target;
      }
      var value = torender.linktext;
      if (!isValue(value)) {
        replaceAttributesOpen();
      }
      else {
        rewriteLeaf(value);
      }
    }
    
    else if (torender.markup !== undefined) { // detect UIVerbatim
      var rendered = torender.markup;
      if (rendered == null) {
        // TODO, doesn't quite work due to attr folding cf Java code
          out += fluid.dumpAttributes(attrcopy);
          out +=">";
          renderUnchanged(); 
      }
      else {
        if (!trc.iselide) {
          out += fluid.dumpAttributes(attrcopy);
          out += ">";
        }
        out += rendered;
        closeTag();
        }    
      }
      else {
        
      }
    }
  
  function adjustForID(attrcopy, component, late, forceID) {
    if (!late) {
        delete attrcopy["rsf:id"];
    }
    if (forceID !== undefined) {
        attrcopy.id = forceID;
    }
    else {
        if (attrcopy.id || late) {
            attrcopy.id = component.fullID;
            }
    }
    var count = 1;
    var baseid = attrcopy.id;
    while (renderOptions.document.getElementById(attrcopy.id)) {
        attrcopy.id = baseid + "-" + (count++); 
    }
    return attrcopy.id;
    }
  
  function rewriteIDRelation(context) {
    var attrname;
    var attrval = trc.attrcopy["for"];
    if (attrval !== undefined) {
       attrname = "for";
    }
    else {
      attrval = trc.attrcopy["headers"];
      if (attrval !== undefined) {
        attrname = "headers";
      }
    }
    if (!attrname) return;
    var tagname = trc.uselump.tagname;
    if (attrname === "for" && tagname !== "label") return;
    if (attrname === "headers" && tagname !== "td" && tagname !== "th") return;
    var rewritten = rewritemap[getRewriteKey(trc.uselump.parent, context, attrval)];
    if (rewritten !== undefined) {
      trc.attrcopy[attrname] = rewritten;
    }
  }
  
  function renderComponentSystem(context, torendero, lump) {
    var lumpindex = lump.lumpindex;
    var lumps = lump.parent.lumps;
    var nextpos = -1;
    var outerendopen = lumps[lumpindex + 1];
    var outerclose = lump.close_tag;

    nextpos = outerclose.lumpindex + 1;

    var payloadlist = lump.downmap? lump.downmap["payload-component"] : null;
    var payload = payloadlist? payloadlist[0] : null;
    
    var iselide = lump.rsfID.charCodeAt(0) === 126 // "~"
    
    var endopen = outerendopen;
    var close = outerclose;
    var uselump = lump;
    var attrcopy = {};
    $.extend(true, attrcopy, (payload === null? lump : payload).attributemap);
    
    trc.attrcopy = attrcopy;
    trc.uselump = uselump;
    trc.endopen = endopen;
    trc.close = close;
    trc.nextpos = nextpos;
    trc.iselide = iselide;
    
    rewriteIDRelation(context);
    
    if (torendero == null) {
      // no support for SCR yet
    }
    else {
      // else there IS a component and we are going to render it. First make
      // sure we render any preamble.

      if (payload) {
        trc.endopen = lumps[payload.lumpindex + 1];
        trc.close = payload.close_tag;
        trc.uselump = payload;
        dumpTillLump(lumps, lumpindex, payload.lumpindex);
        lumpindex = payload.lumpindex;
      }

      adjustForID(attrcopy, torendero);
      //decoratormanager.decorate(torendero.decorators, uselump.getTag(), attrcopy);

      
      // ALWAYS dump the tag name, this can never be rewritten. (probably?!)
      if (!iselide) {
        out += "<" +trc.uselump.tagname;
       }

      renderComponent(torendero);
      // if there is a payload, dump the postamble.
      if (payload != null) {
        // the default case is initialised to tag close
        if (trc.nextpos === nextpos) {
          dumpTillLump(lumps, trc.close.lumpindex + 1, outerclose.lumpindex + 1);
        }
      }
      nextpos = trc.nextpos;
      }
  return nextpos;
  }
  
  function renderContainer(child, targetlump) {
      var t2 = targetlump.parent;
      var firstchild = t2.lumps[targetlump.lumpindex + 1];
      if (child.children !== undefined) {
          dumpBranchHead(child, targetlump);
      }
      else {
          renderComponentSystem(child.parent, child, targetlump);
      }
      renderRecurse(child, targetlump, firstchild);
  }
  
  function fetchComponent(basecontainer, id, lump) {
      if (id.indexOf("msg=") === 0) {
          var key = id.substring(4);
          return {componentType: "UIMessage", messagekey: key};
          // TODO messages
      }
      while (basecontainer) {
          var togo = basecontainer.childmap[id];
          if (togo)
              return togo;
          basecontainer = basecontainer.parent;
      }
      return null;
  }

  function fetchComponents(basecontainer, id) {
      var togo;
      while (basecontainer) {
          togo = basecontainer.childmap[id];
          if (togo)
              break;
          basecontainer = basecontainer.parent;
      }
      return togo;
  }

  function findChild(sourcescope, child) {
      var split = fluid.SplitID(child.ID);
      var headlumps = sourcescope.downmap[child.ID];
      if (headlumps == null) {
          headlumps = sourcescope.downmap[split.prefix + ":"];
      }
      return headlumps == null ? null : headlumps[0];
  }
  
  function renderRecurse(basecontainer, parentlump, baselump) {
    var renderindex = baselump.lumpindex;
    var basedepth = parentlump.nestingdepth;
    var t1 = parentlump.parent;
    while (true) {
      renderindex = dumpScan(t1.lumps, renderindex, basedepth, true, false);
      if (renderindex === t1.lumps.length) { 
        break;
      }
      var lump = t1.lumps[renderindex];  
      if (lump.nestingdepth < basedepth) {
        break;
      } 
      var id = lump.rsfID;
      if (id.charCodeAt(0) === 126) { // "~"
        id = id.substring(1);
      }
      
      //var ismessagefor = id.indexOf("message-for:") === 0;
      
      if (id.indexOf(':') !== -1) {
        var prefix = fluid.getPrefix(id);
        var children = fetchComponents(basecontainer, prefix);
        
        var finallump = lump.uplump.finallump[prefix];
        var closefinal = finallump.close_tag;
        
        if (children) {
          for (var i = 0; i < children.length; ++ i) {
            var child = children[i];
            if (child.children) { // it is a branch TODO
              var targetlump = branchmap[child.fullID];
              if (targetlump) {
                renderContainer(child, targetlump);
              }
              else if (debugMode){
                out += "Unable to look up branch for component with id " + child.fullID;
              }
            }
            else { // repetitive leaf
              var targetlump = findChild(parentlump, child);
              var renderend = renderComponentSystem(basecontainer, child, targetlump);
              var wasopentag = renderend < t1.lumps.lengtn && t1.lumps[renderend].nestingdepth >= targetlump.nestingdepth;
              var newbase = child.children? child : basecontainer;
              if (wasopentag) {
                renderRecurse(newbase, targetlump, t1.lumps[renderend]);
                renderend = targetlump.close_tag.lumpindex + 1;
              }
              if (i !== children.length - 1) {
                // TODO - fix this bug in RSF Server!
                if (renderend < closefinal.lumpindex) {
                  dumpScan(t1.lumps, renderend, targetlump.nestingdepth - 1, false, false);
                }
              }
              else {
                dumpScan(t1.lumps, renderend, targetlump.nestingdepth, true, false);
              }
            }
          }
        }
        
        renderindex = closefinal.lumpindex + 1;
      }
      else {
        var component;
        if (id) {
          component = fetchComponent(basecontainer, id, lump);
        }
        if (component && component.children !== undefined) {
          renderContainer(component);
          renderindex = lump.close_tag.lumpindex + 1;
        }
        else {
          renderindex = renderComponentSystem(basecontainer, component, lump);
        }
      }
      if (renderindex === t1.lumps.length) {
        break;
      }
    }
  }
  
  function renderCollect(collump) {
      dumpTillLump(collump.parent.lumps, collump.lumpindex, collump.close_tag.lumpindex + 1);
  }
  
  function renderCollects() {
      for (var key in collected) {
          var collist = collected[key];
          for (var i = 0; i < collist.length; ++ i) {
              renderCollect(collist[i]);
          }
      }
  }
  
  function processDecoratorQueue() {
      for (var i = 0; i < decoratorQueue.length; ++ i) {
          var decorator = decoratorQueue[i];
          var node = fluid.byId(decorator.id);
          if (!node) {
            fluid.fail("Error during rendering - component with id " + id 
             + " which has a queued decorator was not found in the output markup");
          }
          if (decorator.type === "jQuery") {
              var jnode = $(node);
              jnode[decorator.func].apply(jnode, decorator.args);
          }
          else if (decorator.type === "event") {
            node[decorator.event] = decorator.handler; 
          }
      }
  }

  fluid.ComponentReference = function(reference) {
      this.reference = reference;
  };
    
  // Explodes a raw "hash" into a list of UIOutput/UIBound entries
  fluid.explode = function(hash, basepath) {
      var togo = [];
      for (var key in hash) {
          var binding = basepath === undefined? key : basepath + "." + key;
          togo[togo.length] = {ID: key, value: hash[key], valuebinding: binding};
      }
      return togo;
    };
  
  fluid.findForm = function (node) {
    return fluid.findAncestor(node, 
        function(element) {return element.nodeName.toLowerCase() === "form"});
  }
  
  fluid.resolveMessageSource = function (messageSource) {
      if (messageSource.type = "data") {
          if (messageSource.url === undefined) {
              return fluid.messageLocator(messageSource.messages);
          }
          else {
            // TODO: fetch via AJAX, and convert format if necessary
          }
      }
  }
  
  /** A generalisation of jQuery.val to correctly handle the case of acquiring and
   * setting the value of clustered radio button/checkbox sets, potentially, given
   * a node corresponding to just one element.
   */
  fluid.value = function (nodeIn, newValue) {
      var node = fluid.unwrap(nodeIn);
      var multiple = false;
      if (node.nodeType === undefined && node.length > 1) {
          node = node[0];
          multiple = true;
      }
      var jNode = $(node);
      if ("input" !== node.nodeName.toLowerCase()
         || ! /radio|checkbox/.test(node.type)) return $(node).val(newValue);
      var name = node.name;
      if (name === undefined) {
          fluid.fail("Cannot acquire value from node " + fluid.dumpEl(node) + " which does not have name attribute set");
      }
      var elements;
      if (multiple) {
          elements = nodeIn;
      }
      else {
          var elements = document.getElementsByName(name);
          var scope = fluid.findForm(node);
          elements = jQuery.grep(elements, 
            function(element) {
              if (element.name !== name) return false;
              return !scope || fluid.dom.isContainer(scope, element);
            });
      }
      if (newValue !== undefined) {
          if (typeof(newValue) === "boolean") {
              newValue === newValue? "true" : "false";
          }
        // jQuery gets this partially right, but when dealing with radio button array will
        // set all of their values to "newValue" rather than setting the checked property
        // of the corresponding control. 
          jQuery.each(elements, function() {
             this.checked = (newValue instanceof Array? 
               jQuery.inArray(this.value, newValue) !== -1 : newValue === this.value);
          });
      }
      else { // this part jQuery will not do - extracting value from <input> array
          var checked = jQuery.map(elements, function(element) {
              return element.checked? element.value : null;
          });
          return node.type === "radio"? checked[0] : checked;
          }
     }
  
  /** "Automatically" apply to whatever part of the data model is
   * relevant, the changed value received at the given DOM node*/
  fluid.applyChange = function(node, newValue) {
      node = fluid.unwrap(node);
      if (newValue === undefined) {
          newValue = fluid.value(node);
      }
      if (node.nodeType === undefined && node.length > 0) node = node[0]; // assume here that they share name and parent
      var root = fluid.findData(node, fluid.BINDING_ROOT_KEY);
      if (!root) {
          fluid.fail("Bound data could not be discovered in any node above " + fluid.dumpEl(node));
      }
      var name = node.name;
      var fossil = root.fossils[name];
      if (!fossil) {
          fluid.fail("No fossil discovered for name " + name + " in fossil record above " + fluid.dumpEl(node));
      }
      if (typeof(fossil.oldvalue) === "boolean") { // deal with the case of an "isolated checkbox"
          newValue = newValue? true: false;
      }
      var EL = root.fossils[name].EL;
      fluid.model.setBeanValue(root.data, EL, newValue);    
      };
    
  fluid.makeBranches = function() {
      var firstBranch;
      var thisBranch;
      for (var i = 0; i < arguments.length; ++ i) {
          var thisarg = arguments[i];
          var nextBranch;
          if (typeof(thisarg) === "string") {
              nextBranch = {ID: thisarg}; 
              }
          else if (thisarg instanceof Array) {
              nextBranch = {ID: thisarg[0], jointID: thisarg[1]};
              }
          else {
              $.extend(true, thisBranch, thisarg);
              nextBranch = thisBranch;
              } 
          if (thisBranch && nextBranch !== thisBranch) {
              if (!thisBranch.children) {
                  thisBranch.children = [];
              }
              thisBranch.children[thisBranch.children.length] = nextBranch;
          }
          thisBranch = nextBranch;
          if (!firstBranch) {
             firstBranch = nextBranch;
          }
      }
    
    return firstBranch;
  };
    
  fluid.renderTemplates = function(templates, tree, options, fossilsIn) {
      options = options || {};
      tree = tree || {};
      debugMode = options.debugMode;
      if (!options.messageLocator && options.messageSource) {
          options.messageLocator = fluid.resolveMessageSource(options.messageSource);
      }
      options.document = options.document || document;
      directFossils = fossilsIn;
      decoratorQueue = [];
  
      tree = fixupTree(tree, options.model);
      var template = templates[0];
      resolveBranches(templates.globalmap, tree, template.rootlump);
      out = "";
      renderedbindings = {};
      renderOptions = options;
      renderCollects();
      renderRecurse(tree, template.rootlump, template.lumps[template.firstdocumentindex]);
      return out;
      };
  
  fluid.BINDING_ROOT_KEY = "fluid-binding-root";
  
  /** Recursively find any data stored under a given name from a node upwards
   * in its DOM hierarchy **/
   
  fluid.findData = function(elem, name) {
      while (elem) {
          var data = $.data(elem, name);
          if (data) return data;
          elem = elem.parentNode;
          }
      }

  fluid.bindFossils = function(node, data, fossils) {
      $.data(node, fluid.BINDING_ROOT_KEY, {data: data, fossils: fossils});
      }

  /** A driver to render and bind an already parsed set of templates onto
   * a node. See documentation for fluid.selfRender.
   * @param templates A parsed template set, as returned from fluid.selfRender or 
   * fluid.parseTemplates.
   */

  fluid.reRender = function(templates, node, tree, options) {
      options = options || {};
      node = fluid.unwrap(node);
      var fossils = {};
      var rendered = fluid.renderTemplates(templates, tree, options, fossils);
      if (options.renderRaw) {
          rendered = fluid.XMLEncode(rendered);
          rendered = rendered.replace(/\n/g, "<br/>");
          }
      if (options.model) {
          fluid.bindFossils(node, options.model, fossils);
          }
      $(node).html(rendered);
      processDecoratorQueue();
      return templates;
  }

  /** A simple driver for single node self-templating. Treats the markup for a
   * node as a template, parses it into a template structure, renders it using
   * the supplied component tree and options, then replaces the markup in the 
   * node with the rendered markup, and finally performs any required data
   * binding. The parsed template is returned for use with a further call to
   * reRender.
   * @param node The node both holding the template, and whose markup is to be
   * replaced with the rendered result.
   * @param tree The component tree to be rendered.
   * @param options An options structure to configure the rendering and binding process.
   * @return A templates structure, suitable for a further call to fluid.reRender or
   * fluid.renderTemplates.
   */  
  fluid.selfRender = function(node, tree, options) {
      options = options || {};
      node = fluid.unwrap(node);
      var resourceSpec = {base: {resourceText: node.innerHTML, 
                          href: ".", resourceKey: ".", cutpoints: options.cutpoints}
                          };
      var templates = fluid.parseTemplates(resourceSpec, ["base"], options);
      return fluid.reRender(templates, node, tree, options);
    }
  
})(jQuery, fluid_0_7);
