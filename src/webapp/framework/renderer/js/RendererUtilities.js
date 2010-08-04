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

    if (!fluid.renderer) {
        fluid.fail("fluidRenderer.js is a necessary dependency of RendererUtilities");
        }
  
    fluid.registerNamespace("fluid.renderer.selection");
    
    // TODO: rescued from kettleCouchDB.js - clean up in time
    fluid.expect = function (name, members, target) {
        fluid.transform($.makeArray(members), function(key) {
            if (!target[key]) {
                fluid.fail(name + " missing required parameter " + key);
            }
        });
    };
    
    /** Returns an array of size count, filled with increasing integers, 
     *  starting at 0 or at the index specified by first. 
     */
    
    fluid.iota = function (count, first) {
        first = first || 0;
        var togo = [];
        for (var i = 0; i < count; ++ i) {
            togo[togo.length] = first++;
        }
        return togo;
    };
    
    fluid.renderer.selection.inputs = function(options, container, key, config) {
        fluid.expect("Selection to inputs expander", ["selectID", "inputID", "labelID", "rowID"], options);
        var selection = config.expander(options.tree);
        var rows = fluid.transform(selection.optionlist.value, function(option, index) {
            var togo = {};
            var element =  {parentRelativeID: "..::" + options.selectID, choiceindex: index};
            togo[options.inputID] = element;
            togo[options.labelID] = fluid.copy(element); 
            return togo;
         });
        var togo = {}; // TODO: JICO needs to support "quoted literal key initialisers" :P
        togo[options.selectID] = selection;
        togo[options.rowID] = {children: rows};
        togo = config.expander(togo);
        return togo;
    };
    
    fluid.renderer.repeat = function(options, container, key, config) {
        fluid.expect("Repetition expander", ["controlledBy", "tree"], options);
        var path = fluid.extractContextualPath(options.controlledBy, {ELstyle: "ALL"}, fluid.threadLocal());
        var list = fluid.model.getBeanValue(config.model, path);
        
        var togo = {};
        if (!list || list.length === 0) {
            return options.ifEmpty? config.expander(options.ifEmpty) : togo;
        }
        fluid.setLogging(true);
        fluid.log("fluid.repeat controlledBy " + options.controlledBy);
        fluid.log("Argument tree: " + JSON.stringify(options.tree));
        var expanded = fluid.transform(list, function(element, i) {
            var EL = fluid.model.composePath(path, i); 
            var envAdd = {};
            if (options.pathAs) {
                envAdd[options.pathAs] = EL;
            }
            if (options.valueAs) {
                envAdd[options.valueAs] = fluid.model.getBeanValue(config.model, EL);
            }
            var expandrow = fluid.withEnvironment(envAdd, function() {return config.expander(options.tree)});
            return fluid.isArrayable(expandrow)? {children: expandrow} : expandrow;
        });
        fluid.log("Expanded to " + JSON.stringify(expanded));
        var repeatID = options.repeatID;
        if (repeatID.indexOf(":") === -1) {
            repeatID = repeatID + ":";
            }
        fluid.each(expanded, function(entry) {entry.ID = repeatID});
        return expanded;
    };
  
    var removeSelectors = function (selectors, selectorsToIgnore) {
        if (selectorsToIgnore) {
            $.each(selectorsToIgnore, function (index, selectorToIgnore) {
                delete selectors[selectorToIgnore];
            });
        }
        return selectors;
    };

    var markRepeated = function (selector, repeatingSelectors) {
        if (repeatingSelectors) {
            $.each(repeatingSelectors, function (index, repeatingSelector) {
                if (selector === repeatingSelector) {
                    selector = selector + ":";
                }
            });
        }
        return selector;
    };

    fluid.renderer.selectorsToCutpoints = function (selectors, options) {
        var togo = [];
        options = options || {};
        selectors = fluid.copy(selectors); // Make a copy before potentially destructively changing someone's selectors.
    
        if (options.selectorsToIgnore) {
            selectors = removeSelectors(selectors, options.selectorsToIgnore);
        }
    
        for (var selector in selectors) {
            togo.push({
                id: markRepeated(selector, options.repeatingSelectors),
                selector: selectors[selector]
            });
        }
    
        return togo;
    };
  
      /** A special "shallow copy" operation suitable for nondestructively
     * merging trees of components. jQuery.extend in shallow mode will 
     * neglect null valued properties.
     */
    fluid.renderer.mergeComponents = function (target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    };

    /** Create a "protoComponent expander" with the supplied set of options.
     * The returned value will be a function which accepts a "protoComponent tree"
     * as argument, and returns a "fully expanded" tree suitable for supplying
     * directly to the renderer.
     * A "protoComponent tree" is similar to the "dehydrated form" accepted by
     * the historical renderer - only
     * i) The input format is unambiguous - this expander will NOT accept hydrated
     * components in the {ID: "myId, myfield: "myvalue"} form - but ONLY in
     * the dehydrated {myID: {myfield: myvalue}} form.
     * ii) This expander has considerably greater power to expand condensed trees.
     * In particular, an "EL style" option can be supplied which will expand bare
     * strings found as values in the tree into UIBound components by a configurable
     * strategy. Supported values for "ELstyle" are a) "ALL" - every string will be
     * interpreted as an EL reference and assigned to the "valuebinding" member of
     * the UIBound, or b) any single character, which if it appears as the first
     * character of the string, will mark it out as an EL reference - otherwise it
     * will be considered a literal value, or c) the value "${}" which will be
     * recognised bracketing any other EL expression.
     * 
     * This expander will be upgraded in the future to support even more powerful
     * forms of expansion, including model-directed expansion such as selection and
     * repetition.
     */

    fluid.renderer.makeProtoExpander = function (expandOptions) {
        var options = $.extend({}, expandOptions); // shallow copy of options
        var IDescape = options.IDescape || "\\";
        
        function fetchEL(string) {
            var env = fluid.threadLocal();
            return fluid.extractContextualPath(string, options, env);
        }
        
        function expandBound(value, concrete) {
            if (value.messagekey !== undefined) {
                return {
                    componentType: "UIMessage",
                    messagekey: value.messagekey,
                    args: expandLight(value.args)
                };
            }
            var proto;
            if (!fluid.isPrimitive(value) && !fluid.isArrayable(value)) {
                proto = value;
                if (proto.decorators) {
                   proto.decorators = expandLight(proto.decorators);
                }
            }
            else {
                proto = {};
                var EL = typeof(value) === "string"? fetchEL(value) : null;
                if (EL) {
                    proto.valuebinding = EL;
                }
                else {
                    proto.value = value;
                }
            }
            if (options.model && proto.valuebinding && proto.value === undefined) {
                proto.value = fluid.model.getBeanValue(options.model, proto.valuebinding);
                }
            if (concrete) {
                proto.componentType = "UIBound";
            }
            return proto;
        }
        
        options.filter = function (obj, recurse) {
            if (fluid.isArrayable(obj)) {
                return fluid.transform(obj, function(value) {return recurse(value);});
            }
            var togo = {};
            for (var key in obj) {
                var value = obj[key];
                if (key === "expander" && value.type === "fluid.renderer.noexpand") {
                    $.extend(togo, value.tree);
                }
                else {
                    togo[key] = recurse(value);
                }
            };
            return togo;
        };
        
        var expandLight = function(source) {
            return fluid.resolveEnvironment(source, options.model, options); 
        };
        
        var expandEntry = function(entry) {
            var comp = [];
            expandCond(entry, comp);
            return {children: comp};
        }
        
        var expandExternal = function(entry) {
            var singleTarget;
            var target = [];
            var pusher = function(comp) {
                singleTarget = comp;
            }
            expandLeafOrCond(entry, target, pusher);
            return singleTarget || target;
        }
        
        var expandConfig = {
            model: options.model,
            expander: expandExternal
        };
        
        var expandLeaf = function(leaf, componentType) {
            var togo = {componentType: componentType};
            var map = fluid.renderer.boundMap[componentType] || {};
            for (var key in leaf) {
                if (/decorators|args/.test(key)) {
                    togo[key] = expandLight(leaf[key]);
                    continue;
                }
                else if (map[key]) {
                    togo[key] = expandBound(leaf[key]);
                }
                else togo[key] = leaf[key];
            }
            return togo;
        };
        
        // A child entry may be a cond, a leaf, or another "thing with children".
        // Unlike the case with a cond's contents, these must be homogeneous - at least
        // they may either be ALL leaves, or else ALL cond/childed etc. 
        // In all of these cases, the key will be THE PARENT'S KEY
        var expandChildren = function (entry, pusher) {
            var children = entry.children;
            for (var i = 0; i < children.length; ++ i) {
                // each child in this list will lead to a WHOLE FORKED set of children.
                var target = [];
                var comp = { children: target};
                var child = children[i];
                var childPusher = function(comp) {
                    target[target.length] = comp;
                }
                expandLeafOrCond(child, target, childPusher);
                pusher(comp); 
            }
        };
        
        function detectBareBound(entry) {
            return fluid.each(entry, function (value, key) {
                return key !== "decorators";
            }) === false;
        }
        
        // We have reached something which is either a leaf or Cond - either inside
        // a Cond or as an entry in children.
        var expandLeafOrCond = function (entry, target, pusher) {
            var componentType = fluid.renderer.inferComponentType(entry);
            if (!componentType && detectBareBound(entry)) {
                componentType = "UIBound";
            }
            if (componentType) {
                pusher(componentType === "UIBound"? expandBound(entry, true): expandLeaf(entry, componentType));
            }
            else {
              // we couldn't recognise it as a leaf, so it must be a cond
              // this may be illegal if we are already in a cond.
                if (!target) {
                    fluid.fail("Illegal cond->cond transition");
                }
                expandCond(entry, target);
            }
        }
        
        // cond entry may be a leaf, "thing with children" or a "direct bound".
        // a Cond can ONLY occur as a direct member of "children". Each "cond" entry may
        // give rise to one or many elements with the SAME key - if "expandSingle" discovers
        // "thing with children" they will all share the same key found in proto. 
        var expandCond = function (proto, target) {
            for (var key in proto) {
                var entry = proto[key];
                if (key.charAt(0) === IDescape) {
                    key = key.substring(1);
                }
                if (key === "expander") {
                    var expander = entry;
                    var expanded = fluid.invokeGlobalFunction(expander.type, [expander, proto, key, expandConfig]);
                    fluid.each(expanded, function(el) {target[target.length] = el});
                }
                else if (entry) {
                    var condPusher = function (comp) {
                        comp.ID = key;
                        target[target.length] = comp; 
                        }
                    var comp;
                    if (entry.children) {
                        if (key.indexOf(":") === -1) {
                            key = key + ":";
                        }
                        expandChildren(entry, condPusher);
                    }
                    else if (fluid.renderer.isBoundPrimitive(entry)) {
                        condPusher(expandBound(entry, true));
                        }
                    else {
                        expandLeafOrCond(entry, null, condPusher);
                    }
                }
            }
                
        };
        
        return expandEntry;
    };
    
})(jQuery, fluid_1_2);
    