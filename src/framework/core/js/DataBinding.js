/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

/** NOTE: The contents of this file are by default NOT PART OF THE PUBLIC FLUID API unless explicitly annotated before the function **/

/** MODEL ACCESSOR ENGINE **/

/** Standard strategies for resolving path segments **/

fluid.model.makeEnvironmentStrategy = function (environment) {
    return function (root, segment, index) {
        return index === 0 && environment[segment] ?
            environment[segment] : undefined;
    };
};

fluid.model.defaultCreatorStrategy = function (root, segment) {
    if (root[segment] === undefined) {
        root[segment] = {};
        return root[segment];
    }
};

fluid.model.defaultFetchStrategy = function (root, segment) {
    return root[segment];
};

fluid.model.funcResolverStrategy = function (root, segment) {
    if (root.resolvePathSegment) {
        return root.resolvePathSegment(segment);
    }
};

fluid.model.traverseWithStrategy = function (root, segs, initPos, config, uncess) {
    var strategies = config.strategies;
    var limit = segs.length - uncess;
    for (var i = initPos; i < limit; ++i) {
        if (!root) {
            return root;
        }
        var accepted;
        for (var j = 0; j < strategies.length; ++j) {
            accepted = strategies[j](root, segs[i], i + 1, segs);
            if (accepted !== undefined) {
                break; // May now short-circuit with stateless strategies
            }
        }
        if (accepted === fluid.NO_VALUE) {
            accepted = undefined;
        }
        root = accepted;
    }
    return root;
};

/* Returns both the value and the path of the value held at the supplied EL path */
fluid.model.getValueAndSegments = function (root, EL, config, initSegs) {
    return fluid.model.accessWithStrategy(root, EL, fluid.NO_VALUE, config, initSegs, true);
};

// Very lightweight remnant of trundler, only used in resolvers
fluid.model.makeTrundler = function (config) {
    return function (valueSeg, EL) {
        return fluid.model.getValueAndSegments(valueSeg.root, EL, config, valueSeg.segs);
    };
};

fluid.model.getWithStrategy = function (root, EL, config, initSegs) {
    return fluid.model.accessWithStrategy(root, EL, fluid.NO_VALUE, config, initSegs);
};

fluid.model.setWithStrategy = function (root, EL, newValue, config, initSegs) {
    fluid.model.accessWithStrategy(root, EL, newValue, config, initSegs);
};

fluid.model.accessWithStrategy = function (root, EL, newValue, config, initSegs, returnSegs) {
    // This function is written in this unfortunate style largely for efficiency reasons. In many cases
    // it should be capable of running with 0 allocations (EL is preparsed, initSegs is empty)
    if (!fluid.isPrimitive(EL) && !fluid.isArrayable(EL)) {
        var key = EL.type || "default";
        var resolver = config.resolvers[key];
        if (!resolver) {
            fluid.fail("Unable to find resolver of type " + key);
        }
        var trundler = fluid.model.makeTrundler(config); // very lightweight trundler for resolvers
        var valueSeg = {root: root, segs: initSegs};
        valueSeg = resolver(valueSeg, EL, trundler);
        if (EL.path && valueSeg) { // every resolver supports this piece of output resolution
            valueSeg = trundler(valueSeg, EL.path);
        }
        return returnSegs ? valueSeg : (valueSeg ? valueSeg.root : undefined);
    }
    else {
        return fluid.model.accessImpl(root, EL, newValue, config, initSegs, returnSegs, fluid.model.traverseWithStrategy);
    }
};

// Implementation notes: The EL path manipulation utilities here are equivalents of the simpler ones
// that are provided in Fluid.js and elsewhere - they apply escaping rules to parse characters .
// as \. and \ as \\ - allowing us to process member names containing periods. These versions are mostly
// in use within model machinery, whereas the cheaper versions based on String.split(".") are mostly used
// within the IoC machinery.
// Performance testing in early 2015 suggests that modern browsers now allow these to execute slightly faster
// than the equivalent machinery written using complex regexps - therefore they will continue to be maintained
// here. However, there is still a significant performance gap with respect to the performance of String.split(".")
// especially on Chrome, so we will continue to insist that component member names do not contain a "." character
// for the time being.
// See http://jsperf.com/parsing-escaped-el for some experiments

fluid.registerNamespace("fluid.pathUtil");

fluid.pathUtil.getPathSegmentImpl = function (accept, path, i) {
    var segment = null;
    if (accept) {
        segment = "";
    }
    var escaped = false;
    var limit = path.length;
    for (; i < limit; ++i) {
        var c = path.charAt(i);
        if (!escaped) {
            if (c === ".") {
                break;
            }
            else if (c === "\\") {
                escaped = true;
            }
            else if (segment !== null) {
                segment += c;
            }
        }
        else {
            escaped = false;
            if (segment !== null) {
                segment += c;
            }
        }
    }
    if (segment !== null) {
        accept[0] = segment;
    }
    return i;
};

var globalAccept = []; // TODO: reentrancy risk here. This holder is here to allow parseEL to make two returns without an allocation.

/* A version of fluid.model.parseEL that apples escaping rules - this allows path segments
 * to contain period characters . - characters "\" and "}" will also be escaped. WARNING -
 * this current implementation is EXTREMELY slow compared to fluid.model.parseEL and should
 * not be used in performance-sensitive applications */
// supported, PUBLIC API function
fluid.pathUtil.parseEL = function (path) {
    var togo = [];
    var index = 0;
    var limit = path.length;
    while (index < limit) {
        var firstdot = fluid.pathUtil.getPathSegmentImpl(globalAccept, path, index);
        togo.push(globalAccept[0]);
        index = firstdot + 1;
    }
    return togo;
};

// supported, PUBLIC API function
fluid.pathUtil.composeSegment = function (prefix, toappend) {
    toappend = toappend.toString();
    for (var i = 0; i < toappend.length; ++i) {
        var c = toappend.charAt(i);
        if (c === "." || c === "\\" || c === "}") {
            prefix += "\\";
        }
        prefix += c;
    }
    return prefix;
};

/* Escapes a single path segment by replacing any character ".", "\" or "}" with itself prepended by \ */
// supported, PUBLIC API function
fluid.pathUtil.escapeSegment = function (segment) {
    return fluid.pathUtil.composeSegment("", segment);
};

/*
 * Compose a prefix and suffix EL path, where the prefix is already escaped.
 * Prefix may be empty, but not null. The suffix will become escaped.
 */
// supported, PUBLIC API function
fluid.pathUtil.composePath = function (prefix, suffix) {
    if (prefix.length !== 0) {
        prefix += ".";
    }
    return fluid.pathUtil.composeSegment(prefix, suffix);
};

/*
 * Compose a set of path segments supplied as arguments into an escaped EL expression. Escaped version
 * of fluid.model.composeSegments
 */

// supported, PUBLIC API function
fluid.pathUtil.composeSegments = function () {
    var path = "";
    for (var i = 0; i < arguments.length; ++i) {
        path = fluid.pathUtil.composePath(path, arguments[i]);
    }
    return path;
};

/* Helpful utility for use in resolvers - matches a path which has already been parsed into segments */
fluid.pathUtil.matchSegments = function (toMatch, segs, start, end) {
    if (end - start !== toMatch.length) {
        return false;
    }
    for (var i = start; i < end; ++i) {
        if (segs[i] !== toMatch[i - start]) {
            return false;
        }
    }
    return true;
};

fluid.model.unescapedParser = {
    parse: fluid.model.parseEL,
    compose: fluid.model.composeSegments
};

// supported, PUBLIC API record
fluid.model.defaultGetConfig = {
    parser: fluid.model.unescapedParser,
    strategies: [fluid.model.funcResolverStrategy, fluid.model.defaultFetchStrategy]
};

// supported, PUBLIC API record
fluid.model.defaultSetConfig = {
    parser: fluid.model.unescapedParser,
    strategies: [fluid.model.funcResolverStrategy, fluid.model.defaultFetchStrategy, fluid.model.defaultCreatorStrategy]
};

fluid.model.escapedParser = {
    parse: fluid.pathUtil.parseEL,
    compose: fluid.pathUtil.composeSegments
};

// supported, PUBLIC API record
fluid.model.escapedGetConfig = {
    parser: fluid.model.escapedParser,
    strategies: [fluid.model.defaultFetchStrategy]
};

// supported, PUBLIC API record
fluid.model.escapedSetConfig = {
    parser: fluid.model.escapedParser,
    strategies: [fluid.model.defaultFetchStrategy, fluid.model.defaultCreatorStrategy]
};

/** CONNECTED COMPONENTS AND TOPOLOGICAL SORTING **/

// Following "tarjan" at https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm

/** Compute the strongly connected components of a graph, specified as a list of vertices and an accessor function.
 * Returns an array of arrays of strongly connected vertices, with each component in topologically sorted order.
 * @param {Vertex[]} vertices - An array of vertices of the graph to be processed. Each vertex object will be polluted
 * with three extra fields: `tarjanIndex`, `lowIndex` and `onStack`.
 * @param {Function} accessor - A function that returns a accepts a vertex and returns a list of vertices connected by edges
 * @return {Array.<Vertex[]>} - An array of arrays of vertices.
 */
fluid.stronglyConnected = function (vertices, accessor) {
    var that = {
        stack: [],
        accessor: accessor,
        components: [],
        index: 0
    };
    vertices.forEach(function (vertex) {
        delete vertex.lowIndex;
        delete vertex.tarjanIndex;
        delete vertex.onStack;
    });
    vertices.forEach(function (vertex) {
        if (vertex.tarjanIndex === undefined) {
            fluid.stronglyConnectedOne(vertex, that);
        }
    });
    return that.components;
};

// Perform one round of the Tarjan search algorithm using the state structure generated in fluid.stronglyConnected
fluid.stronglyConnectedOne = function (vertex, that) {
    vertex.tarjanIndex = that.index;
    vertex.lowIndex = that.index;
    ++that.index;
    that.stack.push(vertex);
    vertex.onStack = true;
    var outEdges = that.accessor(vertex);
    outEdges.forEach(function (outVertex) {
        if (outVertex.tarjanIndex === undefined) {
            // Successor has not yet been visited; recurse on it
            fluid.stronglyConnectedOne(outVertex, that);
            vertex.lowIndex = Math.min(vertex.lowIndex, outVertex.lowIndex);
        } else if (outVertex.onStack) {
            // Successor is on the stack and hence in the current component
            vertex.lowIndex = Math.min(vertex.lowIndex, outVertex.tarjanIndex);
        }
    });
    // If vertex is a root node, pop the stack back as far as it and generate a component
    if (vertex.lowIndex === vertex.tarjanIndex) {
        var component = [], outVertex;
        do {
            outVertex = that.stack.pop();
            outVertex.onStack = false;
            component.push(outVertex);
        } while (outVertex !== vertex);
        that.components.push(component);
    }
};

/** MODEL COMPONENT HIERARCHY AND RELAY SYSTEM **/

fluid.initRelayModel = function (that) {
    // This simply has the effect of returning the fluid.inEvaluationMarker marker if an access is somehow requested
    // early, which will then trigger the circular evaluation failure
    return that.model;
};

fluid.findInitModelTransaction = function (that) {
    var transRec = fluid.currentTreeTransaction();
    if (transRec && fluid.isComponent(that)) {
        return transRec.initModelTransaction[that.id];
    }
};

// Enlist this model component as part of the "initial transaction" wave - note that "special transaction" init
// is indexed by component id, not by applier, and has special record type (completeOnInit + initModel), in addition to transaction
fluid.enlistModelComponent = function (that) {
    var treeTransaction = fluid.currentTreeTransaction();
    var transId = treeTransaction.initModelTransactionId;
    var initModelTransaction = treeTransaction.initModelTransaction;
    var enlist = initModelTransaction[that.id];
    if (!enlist) {
        var shadow = fluid.shadowForComponent(that);
        enlist = {
            that: that,
            applier: fluid.getForComponent(that, "applier"),
            initModels: [],
            completeOnInit: !!shadow.initTransactionId,
            transaction: that.applier.initiate(null, "init", transId)
        };
        initModelTransaction[that.id] = enlist;
        var transRec = fluid.getModelTransactionRec(fluid.rootComponent, transId);
        transRec[that.applier.applierId] = {transaction: enlist.transaction};
        fluid.registerMaterialisationListener(that, that.applier);
    }
    return enlist;
};

fluid.clearTransactions = function () {
    var instantiator = fluid.globalInstantiator;
    fluid.clear(instantiator.modelTransactions);
};

fluid.failureEvent.addListener(fluid.clearTransactions, "clearTransactions", "before:fail");

// Utility to coordinate with our crude "oscillation prevention system" which limits each link to 2 updates (presumably
// in opposite directions). In the case of the initial transaction, we need to reset the count given that genuine
// changes are arising in the system with each new enlisted model. TODO: if we ever get users operating their own
// transactions, think of a way to incorporate this into that workflow
fluid.clearLinkCounts = function (transRec, relaysAlso) {
    // TODO: Separate this record out into different types of records (relays are already in their own area)
    fluid.each(transRec, function (value, key) {
        if (typeof(value) === "number") {
            transRec[key] = 0;
        } else if (relaysAlso && value.options && typeof(value.relayCount) === "number") {
            value.relayCount = 0;
        }
    });
};

/** Compute relay dependency out arcs for a group of initialising components.
 * @param {Object} transacs - Hash of component id to local ChangeApplier transaction.
 * @param {Object} initModelTransaction - Hash of component id to enlisted component record.
 * @return {Object} - Hash of component id to list of enlisted component records which are connected by edges
 */
fluid.computeInitialOutArcs = function (transacs, initModelTransaction) {
    return fluid.transform(initModelTransaction, function (recel, id) {
        var oneOutArcs = {};
        var listeners = recel.that.applier.listeners.sortedListeners;
        fluid.each(listeners, function (listener) {
            if (listener.isRelay && !fluid.isExcludedChangeSource(transacs[id], listener.cond)) {
                var targetId = listener.targetId;
                if (targetId !== id) {
                    oneOutArcs[targetId] = true;
                }
            }
        });
        var oneOutArcList = Object.keys(oneOutArcs);
        var togo = oneOutArcList.map(function (id) {
            return initModelTransaction[id];
        });
        // No edge if the component is not enlisted - it will sort to the end via "completeOnInit"
        fluid.remove_if(togo, function (rec) {
            return rec === undefined;
        });
        return togo;
    });
};

fluid.sortCompleteLast = function (reca, recb) {
    return (reca.completeOnInit ? 1 : 0) - (recb.completeOnInit ? 1 : 0);
};

fluid.subscribeResourceModelUpdates = function (that, resourceMapEntry) {
    var treeTransaction = fluid.currentTreeTransaction();
    var resourceSpec = resourceMapEntry.resourceSpec;
    var resourceUpdateListener = function () {
        // We can't go for currentTreeTransaction() in this listener because we in the "dead space" between workflow
        // functions where it has not been restored by the waitIO listener. Isn't the stack a sod.
        var initTransaction = fluid.getImmediate(treeTransaction, ["initModelTransaction", that.id]);
        var trans = initTransaction ? initTransaction.transaction : that.applier.initiate();
        resourceMapEntry.listeners.forEach(function (oneListener) {
            var innerValue = fluid.getImmediate(resourceSpec, oneListener.resourceSegs);
            var segs = oneListener.segs;
            trans.change(segs, null, "DELETE");
            trans.change(segs, innerValue);
        });
        if (!initTransaction) {
            trans.commit();
        } else {
            var transRec = fluid.getModelTransactionRec(fluid.rootComponent, trans.id);
            fluid.clearLinkCounts(transRec, true);
            that.applier.preCommit.fire(trans, that);
        }
    };
    resourceSpec.onFetched.addListener(resourceUpdateListener);
    fluid.recordListener(resourceSpec.onFetched, resourceUpdateListener, fluid.shadowForComponent(that));
};

fluid.resolveResourceModelWorkflow = function (shadows, treeTransaction) {
    var initModelTransaction = treeTransaction.initModelTransaction;
    // TODO: Original comment from when this action was in operateInitialTransaction, now incomprehensible
    // Do this afterwards so that model listeners can be fired by concludeComponentInit
    shadows.forEach(function (shadow) {
        var that = shadow.that;
        fluid.registerMergedModelListeners(that, that.options.modelListeners);
        fluid.each(shadow.modelSourcedDynamicComponents, function (componentRecord, key) {
            fluid.constructLensedComponents(shadow, initModelTransaction[that.id], componentRecord.sourcesParsed, key);
        });
    });
};

// Condense the resource map so that it is indexed by resource id, so that all model paths affected by the same
// resource can be updated in a single transaction
fluid.condenseResourceMap = function (resourceMap) {
    var byId = {};
    resourceMap.forEach(function (resourceMapEntry) {
        var resourceSpec = resourceMapEntry.fetchOne.resourceSpec;
        var id = resourceSpec.transformEvent.eventId;
        var existing = byId[id];
        if (!existing) {
            existing = byId[id] = {
                resourceSpec: resourceSpec,
                listeners: []
            };
        }
        existing.listeners.push({
            resourceSegs: resourceMapEntry.fetchOne.segs,
            segs: resourceMapEntry.segs
        });
    });
    return byId;
};

/** Operate all coordinated transactions by bringing models to their respective initial values, and then commit them all
 * @param {Object} initModelTransaction - The record for the init transaction. This is a hash indexed by component id
 * to a model transaction record, as registered in `fluid.enlistModelComponent`. This has members `that`, `applier`, `completeOnInit`.
 * @param {String} transId - The id of the model transaction corresponding to the init model transaction
 */
fluid.operateInitialTransaction = function (initModelTransaction, transId) {
    var transacs = fluid.transform(initModelTransaction, function (recel) {
        /*
        var transac = recel.that.applier.initiate(null, "init", transId);
        // Note that here we (probably unnecessarily) trash any old transactions since all we are after is newHolder
        transRec[recel.that.applier.applierId] = {transaction: transac};
        // Also store it in the init transaction record so it can be easily globbed onto in applier.fireChangeRequest
        recel.transaction = transac;
        */
        return recel.transaction;
    });
    // Compute the graph of init transaction relays for FLUID-6234 - one day we will have to do better than this, since there
    // may be finer structure than per-component - it may be that each piece of model area participates in this relation
    // differently. But this will require even more ambitious work such as fragmenting all the initial model values along
    // these boundaries.
    var outArcs = fluid.computeInitialOutArcs(transacs, initModelTransaction);
    var arcAccessor = function (initTransactionRecord) {
        return outArcs[initTransactionRecord.that.id];
    };
    var recs = fluid.values(initModelTransaction);
    var components = fluid.stronglyConnected(recs, arcAccessor);
    var priorityIndex = 0;
    components.forEach(function (component) {
        component.forEach(function (recel) {
            recel.initPriority = recel.completeOnInit ? Infinity : priorityIndex++;
        });
    });

    recs.sort(function (reca, recb) {
        return reca.initPriority - recb.initPriority;
    });
    var transRec = fluid.getModelTransactionRec(fluid.rootComponent, transId);
    // Pass 1: Apply all raw new (initial) values to their respective models in the correct dependency order, before attempting to apply any
    // relay rules in case these end up mutually overwriting (especially likely with freshly constructed lensed components)
    recs.forEach(function applyInitialModelTransactionValues(recel) {
        var that = recel.that,
            applier = recel.that.applier,
            transac = transacs[that.id];
        if (recel.completeOnInit) {
            // Play the stabilised model value of previously complete components into the relay network
            fluid.notifyModelChanges(applier.listeners.sortedListeners, "ADD", transac.oldHolder, fluid.emptyHolder, null, transac, applier, that);
        } else {
            fluid.each(recel.initModels, function (oneInitModel) {
                if (oneInitModel !== undefined) {
                    transac.fireChangeRequest({type: "ADD", segs: [], value: oneInitModel});
                }
                fluid.clearLinkCounts(transRec, true);
            });
        }
    });
    // Pass 2: Apply all relay rules and fetch any extra values resolved from resources whose values were themselves model-dependent
    recs.forEach(function updateInitialModelTransactionRelays(recel) {
        var that = recel.that,
            applier = recel.that.applier,
            transac = transacs[that.id];
        applier.preCommit.fire(transac, that);
        if (!recel.completeOnInit) {
            var resourceMapById = fluid.condenseResourceMap(applier.resourceMap);
            fluid.each(resourceMapById, function (resourceMapEntry) {
                fluid.subscribeResourceModelUpdates(that, resourceMapEntry);
            });
            // Repeatedly flush arrived values through relays to ensure that the rest of the model is maximally contextualised
            applier.earlyModelResolved.fire(that.model);
            applier.preCommit.fire(transac, that);
            // Note that if there is a further operateInitialTransaction for this same init transaction, next time we should treat it as stabilised
            recel.completeOnInit = true;
            var shadow = fluid.shadowForComponent(that);
            if (shadow && !shadow.initTransactionId) { // Fix for FLUID-5869 - the component may have been destroyed during its own init transaction
            // read in fluid.enlistModelComponent in order to compute the completeOnInit flag
                shadow.initTransactionId = transId;
            }
        }
    });
};

fluid.parseModelReference = function (that, ref) {
    var parsed = fluid.parseContextReference(ref);
    parsed.segs = fluid.pathUtil.parseEL(parsed.path);
    return parsed;
};

/** Given a string which may represent a reference into a model, parses it into a structure holding the coordinates for resolving the reference. It specially
 * detects "references into model material" by looking for the first path segment in the path reference which holds the value "model". Some of its workflow is bypassed
 * in the special case of a reference representing an implicit model relay. In this case, ref will definitely be a String, and if it does not refer to model material, rather than
 * raising an error, the return structure will include a field <code>nonModel: true</code>
 * @param {Component} that - The component holding the reference
 * @param {String} name - A human-readable string representing the type of block holding the reference - e.g. "modelListeners"
 * @param {String|ModelReference} ref - The model reference to be parsed. This may have already been partially parsed at the original site - that is, a ModelReference is a
 * structure containing
 *     segs: {String[]} An array of model path segments to be dereferenced in the target component (will become `modelSegs` in the final return)
 *     context: {String} An IoC reference to the component holding the model
 * @param {Boolean} permitNonModel - <code>true</code> If `true`, references to non-model material are not a failure and will simply be resolved
 * (by the caller) onto their targets (as constants). Otherwise, this function will issue a failure on discovering a reference to non-model material.
 * @return {ParsedModelReference} - A structure holding:
 *    that {Component|Any} The component whose model is the target of the reference. This may end up being constructed as part of the act of resolving the reference.
 * in the case of a reference to "local record" material such as {arguments} or {source}, `that` may exceptionally be a non-component.
 *    applier {ChangeApplier|Undefined} The changeApplier for the component <code>that</code>. This may end up being constructed as part of the act of resolving the reference
 *    modelSegs {String[]|Undefined} An array of path segments into the model of the component if this is a model reference
 *    path {String} the value of <code>modelSegs</code> encoded as an EL path (remove client uses of this in time)
 *    nonModel {Boolean} Set if <code>implicitRelay</code> was true and the reference was not into a model (modelSegs/path will not be set in this case)
 *    segs {String[]} Holds the full array of path segments found by parsing the original reference - only useful in <code>nonModel</code> case
 */
fluid.parseValidModelReference = function (that, name, ref, permitNonModel) {
    var localRecord = fluid.shadowForComponent(that).localRecord;
    var reject = function () {
        var failArgs = ["Error in " + name + ": ", ref].concat(fluid.makeArray(arguments));
        fluid.fail.apply(null, failArgs);
    };
    var rejectNonModel = function (value) {
        reject(" must be a reference to a component with a ChangeApplier (descended from fluid.modelComponent), instead got ", value);
    };
    var parsed; // resolve ref into context and modelSegs
    if (typeof(ref) === "string") {
        if (fluid.isIoCReference(ref)) {
            parsed = fluid.parseModelReference(that, ref);
            var modelPoint = parsed.segs.indexOf("model");
            if (modelPoint === -1) {
                if (permitNonModel) {
                    parsed.nonModel = true;
                } else {
                    reject(" must be a reference into a component model via a path including the segment \"model\"");
                }
            } else {
                parsed.modelSegs = parsed.segs.slice(modelPoint + 1);
                parsed.contextSegs = parsed.segs.slice(0, modelPoint);
                delete parsed.path;
            }
        } else {
            parsed = {
                path: ref,
                modelSegs: that.applier.parseEL(ref)
            };
        }
    } else {
        if (!fluid.isArrayable(ref.segs)) {
            reject(" must contain an entry \"segs\" holding path segments referring a model path within a component");
        }
        parsed = {
            context: ref.context,
            modelSegs: fluid.expandImmediate(ref.segs, that, localRecord)
        };
        fluid.each(parsed.modelSegs, function (seg, index) {
            if (!fluid.isValue(seg)) {
                reject(" did not resolve path segment reference " + ref.segs[index] + " at index " + index);
            }
        });
    }
    var contextTarget, target; // resolve target component, which defaults to "that"
    if (parsed.context) {
        // cf. logic in fluid.makeStackFetcher
        if (localRecord && parsed.context in localRecord) {
            // It's a "source" reference for a lensed component
            if (parsed.context === "source" && localRecord.sourceModelReference) {
                target = localRecord.sourceModelReference.that;
                parsed.modelSegs = localRecord.sourceModelReference.modelSegs.concat(parsed.segs);
                parsed.nonModel = false;
            } else { // It's an ordinary reference to localRecord material - FLUID-5912 case
                target = localRecord[parsed.context];
            }
        } else {
            contextTarget = fluid.resolveContext(parsed.context, that);
            if (!contextTarget) {
                reject(" context must be a reference to an existing component");
            }
            target = parsed.contextSegs ? fluid.getForComponent(contextTarget, parsed.contextSegs) : contextTarget;
        }
    } else {
        target = that;
    }
    if (!parsed.nonModel) {
        if (!fluid.isComponent(target)) {
            rejectNonModel(target);
        }
        if (!target.applier) {
            fluid.getForComponent(target, ["applier"]);
        }
        if (!target.applier) {
            rejectNonModel(target);
        }
    }
    parsed.that = target; // Note this might not be a component (see FLUID-6729)
    parsed.applier = target && target.applier;
    if (!parsed.path && parsed.applier) { // ChangeToApplicable amongst others rely on this
        parsed.path = target && parsed.applier.composeSegments.apply(null, parsed.modelSegs);
    }
    return parsed;
};

fluid.registerNamespace("fluid.materialiserRegistry"); // Currently see FluidView-browser.js
// Naturally this will be put into component grades, along with workflows, once we get rid of our insufferably inefficient options system

fluid.matchMaterialiserSpec = function (record, segs) {
    var trundle = record;
    var routedPath = null;
    for (var i = 0; i < segs.length; ++i) {
        var seg = segs[i];
        var wildcard = trundle["*"];
        if (wildcard) {
            routedPath = wildcard;
        }
        trundle = trundle[seg] || wildcard;
        if (!trundle) {
            break;
        } else if (trundle.materialiser) {
            return trundle;
        }
    }
    if (routedPath) {
        fluid.fail("Materialised DOM path ", segs, " did not match any registered materialiser - available paths are " + Object.keys(routedPath).join(", "));
    }
    return null;
};

/** Given a path into a component's model, look up a "materialiser" in the materialiser registry that will bind it onto
 * some environmental source or sink of state (these are initially just DOM-based, but in future will include things such
 * as resource-based models backed by DataSources etc.)
 * This is intended to be called during early component startup as we parse modelRelay, modelListener and changePath records
 * found in the component's configuration.
 * This method is idempotent - the same path may be materialised any number of times during startup with no further effect
 * after the first call.
 * @param {Component} that - The component holding the model path
 * @param {String[]} segs - Array of path segments into the component's model to be materialised
 */
fluid.materialiseModelPath = function (that, segs) {
    var shadow = fluid.shadowForComponent(that);
    var materialisedPath = ["materialisedPaths"].concat(segs);
    if (!fluid.getImmediate(shadow, materialisedPath)) {
        fluid.each(fluid.materialiserRegistry, function (gradeRecord, grade) {
            if (fluid.componentHasGrade(that, grade)) {
                var record = fluid.matchMaterialiserSpec(gradeRecord, segs);
                if (record && record.materialiser) {
                    fluid.model.setSimple(shadow, materialisedPath, {});
                    var args = fluid.makeArray(record.args);
                    // Copy segs since the materialiser will close over it and fluid.parseImplicitRelay will pop it
                    fluid.invokeGlobalFunction(record.materialiser, [that, fluid.makeArray(segs)].concat(args));
                }
            }
        });
    }
};

// Hard to imagine this becoming more of a bottleneck than the rest of the ChangeApplier but it is pretty
// inefficient.  There are many more materialisers than we expect to ever be used at one component -
// we should reorganise the registry so that it exposes a single giant listener to ""
fluid.materialiseAgainstValue = function (that, newValue, segs) {
    if (fluid.isPlainObject(newValue)) {
        fluid.each(newValue, function (inner, seg) {
            segs.push(seg);
            fluid.materialiseAgainstValue(that, inner, segs);
            segs.pop();
        });
    } else {
        fluid.materialiseModelPath(that, segs);
    }
};

/** Register a listener global to this changeApplier that reacts to all changes by attempting to materialise their
 * paths. This is a kind of "halfway house" strategy since it will trigger on every change, but it at least filters
 * by the component grade and the model root in the materialiser registry to avoid excess triggering. The listener
 * is non-transactional so that we can ensure to get the listener in before it triggers for real in notifyExternal -
 * an awkward kind of listener-registering listener. This is invoked very early in fluid.enlistModel.
 * @param {Component} that - The component for which the materialisation listener is to be registered
 * @param {ChangeApplier} applier - The applier for the component
 */
fluid.registerMaterialisationListener = function (that, applier) {
    fluid.each(fluid.materialiserRegistry, function (gradeRecord, grade) {
        if (fluid.componentHasGrade(that, grade)) {
            fluid.each(gradeRecord, function (rest, root) {
                applier.modelChanged.addListener({
                    transactional: false,
                    path: root
                }, function (newValue) {
                    var segs = [root];
                    fluid.materialiseAgainstValue(that, newValue, segs);
                });
            });
        }
    });
};

// Gets global record for a particular transaction id, allocating if necessary - looks up applier id to transaction,
// as well as looking up source id (linkId in below) to count/true
// Through poor implementation quality, not every access passes through this function - some look up instantiator.modelTransactions directly
// The supplied component is actually irrelevant for now, implementation merely looks up the instantiator's modelTransaction
fluid.getModelTransactionRec = function (that, transId) {
    if (!transId) {
        fluid.fail("Cannot get transaction record without transaction id");
    }
    var instantiator = fluid.isComponent(that) && !fluid.isDestroyed(that, true) ? fluid.globalInstantiator : null;
    if (!instantiator) {
        return null;
    }
    var transRec = instantiator.modelTransactions[transId];
    if (!transRec) {
        transRec = instantiator.modelTransactions[transId] = {
            relays: [], // sorted array of relay elements (also appear at top level index by transaction id)
            sources: {}, // hash of the global transaction sources (includes "init" but excludes "relay" and "local")
            externalChanges: {} // index by applierId to changePath to listener record
        };
    }
    return transRec;
};

fluid.recordChangeListener = function (component, applier, sourceListener, listenerId) {
    var shadow = fluid.shadowForComponent(component);
    fluid.recordListener(applier.modelChanged, sourceListener, shadow, listenerId);
};

/** Called when a relay listener registered using `fluid.registerDirectChangeRelay` enlists in a transaction. Opens a local
 * representative of this transaction on `targetApplier`, creates and stores a "transaction element" within the global transaction
 * record keyed by the target applier's id. The transaction element is also pushed onto the `relays` member of the global transaction record - they
 * will be sorted by priority here when changes are fired.
 * @param {TransactionRecord} transRec - The global record for the current ChangeApplier transaction as retrieved from `fluid.getModelTransactionRec`
 * @param {ChangeApplier} targetApplier - The ChangeApplier to which outgoing changes will be applied. A local representative of the transaction will be opened on this applier and returned.
 * @param {String} transId - The global id of this transaction
 * @param {Object} options - The `options` argument supplied to `fluid.registerDirectChangeRelay`. This will be stored in the returned transaction element
 * - note that only the member `update` is ever used in `fluid.model.updateRelays` - TODO: We should thin this out
 * @param {Object} npOptions - Namespace and priority options
 *    namespace {String} [optional] The namespace attached to this relay definition
 *    priority {String} [optional] The (unparsed) priority attached to this relay definition
 * @return {Object} A "transaction element" holding information relevant to this relay's enlistment in the current transaction. This includes fields:
 *     transaction {Transaction} The local representative of this transaction created on `targetApplier`
 *     relayCount {Integer} The number of times this relay has been activated in this transaction
 *     namespace {String} [optional] Namespace for this relay definition
 *     priority {Priority} The parsed priority definition for this relay
 */
fluid.registerRelayTransaction = function (transRec, targetApplier, transId, options, npOptions) {
    var newTrans = targetApplier.initiate("relay", null, transId); // non-top-level transaction will defeat postCommit
    var transEl = transRec[targetApplier.applierId] = {transaction: newTrans, relayCount: 0, namespace: npOptions.namespace, priority: npOptions.priority, options: options};
    transEl.priority = fluid.parsePriority(transEl.priority, transRec.relays.length, false, "model relay");
    transRec.relays.push(transEl);
    return transEl;
};

// Configure this parameter to tweak the number of relays the model will attempt per transaction before bailing out with an error
fluid.relayRecursionBailout = 100;

// Used with various arg combinations from different sources. For standard "implicit relay" or fully lensed relay,
// the first 4 args will be set, and "options" will be empty

// For a model-dependent relay, this will be used in two halves - firstly, all of the model
// sources will bind to the relay transform document itself. In this case the argument "targetApplier" within "options" will be set.
// In this case, the component known as "target" is really the source - it is a component reference discovered by parsing the
// relay document.

// Secondly, the relay itself will schedule an invalidation (as if receiving change to "*" of its source - which may in most
// cases actually be empty) and play through its transducer. "Source" component itself is never empty, since it is used for listener
// degistration on destruction (check this is correct for external model relay). However, "sourceSegs" may be empty in the case
// there is no "source" component registered for the link. This change is played in a "half-transactional" way - that is, we wait
// for all other changes in the system to settle before playing the relay document, in order to minimise the chances of multiple
// firing and corruption. This is done via the "preCommit" hook registered at top level in establishModelRelay. This listener
// is transactional but it does not require the transaction to conclude in order to fire - it may be reused as many times as
// required within the "overall" transaction whilst genuine (external) changes continue to arrive.

// TODO: Vast overcomplication and generation of closure garbage. SURELY we should be able to convert this into an externalised, arg-ist form
/** Registers a listener operating one leg of a model relay relation, connecting the source and target. Called once or twice from `fluid.connectModelRelay` -
 * see the comment there for the three cases involved. Note that in its case iii)B) the applier to bind to is not the one attached to `target` but is instead
 * held in `options.targetApplier`.
 * @param {Object} target - The target component at the end of the relay.
 * @param {String[]} targetSegs - String segments representing the path in the target where outgoing changes are to be fired
 * @param {Component|null} source - The source component from where changes will be listened to. May be null if the change source is a relay document. *actually not null*
 * @param {String[]} sourceSegs - String segments representing the path in the source component's model at which changes will be listened to
 * @param {String} linkId - The unique id of this relay arc. This will be used as a key within the active transaction record to look up dynamic information about
 *     activation of the link within that transaction (currently just an activation count)
 * @param {Function|null} transducer - A function which will be invoked when a change is to be relayed. This is one of the adapters constructed in "makeTransformPackage"
 *     and is set in all cases other than iii)B) (collecting changes to contextualised relay). Note that this will have a member `cond` as returned from
 *    `fluid.model.parseRelayCondition` encoding the condition whereby changes should be excluded from the transaction. The rule encoded by the condition
 *    will be applied by the function within `transducer`.
 * @param {Object} options -
 *    transactional {Boolean} `true` in case iii) - although this only represents `half-transactions`, `false` in others since these are resolved immediately with no granularity
 *    targetApplier {ChangeApplier} [optional] in case iii)B) holds the applier for the contextualised relay document which outgoing changes should be applied to
 *    sourceApplier {ChangeApplier} [optional] in case ii) holds the applier for the contextualised relay document on which we listen for outgoing changes
 * @param {Object} npOptions - Namespace and priority options
 *    namespace {String} [optional] The namespace attached to this relay definition
 *    priority {String} [optional] The (unparsed) priority attached to this relay definition
 */
fluid.registerDirectChangeRelay = function (target, targetSegs, source, sourceSegs, linkId, transducer, options, npOptions) {
    var targetApplier = options.targetApplier || target.applier; // first branch implies the target is a relay document
    var sourceApplier = options.sourceApplier || source.applier; // first branch implies the source is a relay document - listener will be transactional
    if (!options.targetApplier) {
        fluid.materialiseModelPath(target, targetSegs);
    }
    if (!options.sourceApplier) {
        fluid.materialiseModelPath(source, sourceSegs);
    }
    var applierId = targetApplier.applierId;
    targetSegs = fluid.makeArray(targetSegs);
    sourceSegs = fluid.makeArray(sourceSegs); // take copies since originals will be trashed
    var sourceListener = function (newValue, oldValue, path, changeRequest, trans, applier) {
        var transId = trans.id;
        var transRec = fluid.getModelTransactionRec(target, transId);
        if (applier && trans && !transRec[applier.applierId]) { // don't trash existing record which may contain "options" (FLUID-5397)
            transRec[applier.applierId] = {transaction: trans}; // enlist the outer user's original transaction
        }
        var transEl = transRec[applierId];
        transRec[linkId] = transRec[linkId] || 0;
        // Crude "oscillation prevention" system limits each link to maximum of 2 operations per cycle (presumably in opposite directions)
        var relay = true; // TODO: See FLUID-5303 - we currently disable this check entirely to solve FLUID-5293 - perhaps we might remove link counts entirely
        if (relay) {
            ++transRec[linkId];
            if (transRec[linkId] > fluid.relayRecursionBailout) {
                fluid.fail("Error in model relay specification at component ", target, " - operated more than " + fluid.relayRecursionBailout + " relays without model value settling - current model contents are ", trans.newHolder.model);
            }
            if (!transEl) {
                transEl = fluid.registerRelayTransaction(transRec, targetApplier, transId, options, npOptions);
            }
            if (transducer && !options.targetApplier) {
                // TODO: This censoring of newValue is just for safety but is still unusual and now abused. The transducer doesn't need the "newValue" since all the transform information
                // has been baked into the transform document itself. However, we now rely on this special signalling value to make sure we regenerate transforms in
                // the "forwardAdapter"
                fluid.pushActivity("relayTransducer", "computing modelRelay output for rule with target path \"%targetSegs\" and namespace \"%namespace\"",
                    {targetSegs: targetSegs, namespace: npOptions.namespace});
                transducer(transEl.transaction, options.sourceApplier ? undefined : newValue, source, sourceSegs, targetSegs, changeRequest);
                fluid.popActivity();
            } else {
                if (changeRequest && changeRequest.type === "DELETE") {
                    // Rebase the incoming DELETE with respect to this relay - whilst "newValue" is correct and we could honour this by
                    // asking fluid.notifyModelChanges to decompose this into a DELETE plus ADD, this is more efficient
                    var deleteSegs = targetSegs.concat(changeRequest.segs.slice(sourceSegs.length));
                    transEl.transaction.fireChangeRequest({type: "DELETE", segs: deleteSegs});
                } else if (newValue !== undefined) {
                    transEl.transaction.fireChangeRequest({type: "ADD", segs: targetSegs, value: newValue});
                }
            }
        }
    };
    var spec = sourceApplier.modelChanged.addListener({
        isRelay: true,
        cond: transducer && transducer.cond,
        targetId: target.id, // these two fields for debuggability
        targetApplierId: targetApplier.id,
        segs: sourceSegs,
        transactional: options.transactional
    }, sourceListener);
    if (fluid.passLogLevel(fluid.logLevel.TRACE)) {
        fluid.log(fluid.logLevel.TRACE, "Adding relay listener with listenerId " + spec.listenerId + " to source applier with id " +
            sourceApplier.applierId + " from target applier with id " + applierId + " for target component with id " + target.id);
    }
    // TODO: Actually, source is never null - the case ii) driver below passes it on - check the effect of this registration
    if (source) { // TODO - we actually may require to register on THREE sources in the case modelRelay is attached to a
        // component which is neither source nor target. Note there will be problems if source, say, is destroyed and recreated,
        // and holder is not - relay will in that case be lost. Need to integrate relay expressions with IoCSS.
        fluid.recordChangeListener(source, sourceApplier, sourceListener, spec.listenerId);
        if (target !== source) {
            fluid.recordChangeListener(target, sourceApplier, sourceListener, spec.listenerId);
        }
    }
};

/** Connect a model relay relation between model material. This is called in three scenarios:
 * i) from `fluid.parseModelRelay` when parsing an uncontextualised model relay (one with a static transform document), to
 * directly connect the source and target of the relay
 * ii) from `fluid.parseModelRelay` when parsing a contextualised model relay (one whose transform document depends on other model
 * material), to connect updates emitted from the transform document's applier onto the relay ends (both source and target)
 * iii) from `fluid.parseImplicitRelay` when parsing model references found within contextualised model relay to bind changes emitted
 * from the target of the reference onto the transform document's applier. These may apply directly to another component's model (in its case
 * A) or apply to a relay document (in its case B)
 *
 * This function will make one or two calls to `fluid.registerDirectChangeRelay` in order to set up each leg of any required relay.
 * Note that in case iii)B) the component referred to as our argument `target` is actually the "source" of the changes (that is, the one encountered
 * while traversing the transform document), and our argument `source` is the component holding the transform, and so
 * the call to `fluid.registerDirectChangeRelay` will have `source` and `target` reversed (`fluid.registerDirectChangeRelay` will bind to the `targetApplier`
 * in the options rather than source's applier).
 * @param {Component} source - The component holding the material giving rise to the relay, or the one referred to by the `source` member
 *   of the configuration in case ii), if there is one
 * @param {Array|null} sourceSegs - An array of parsed string segments of the `source` relay reference in case i), or the offset into the transform
 *   document of the reference component in case iii), otherwise `null` (case ii))
 * @param {Component} target - The component holding the model relay `target` in cases i) and ii), or the component at the other end of
 *   the model reference in case iii) (in this case in fact a "source" for the changes.
 * @param {Array} targetSegs - An array of parsed string segments of the `target` reference in cases i) and ii), or of the model reference in
 *   case iii)
 * @param {Object} options - A structure describing the relay, allowing discrimination of the various cases above. This is derived from the return from
 * `fluid.makeTransformPackage` but will have some members filtered in different cases. This contains members:
 *    update {Function} A function to be called at the end of a "half-transaction" when all pending updates have been applied to the document's applier.
 *        This discriminates case iii)
 *    targetApplier {ChangeApplier} The ChangeApplier for the relay document, in case iii)B)
 *    forwardApplier (ChangeApplier} The ChangeApplier for the relay document, in cases ii) and iii)B) (only used in latter case)
 *    forwardAdapter {Adapter} A function accepting (transaction, newValue) to pass through the forward leg of the relay. Contains a member `cond` holding the parsed relay condition.
 *    backwardAdapter {Adapter} A function accepting (transaction, newValue) to pass through the backward leg of the relay. Contains a member `cond` holding the parsed relay condition.
 *    namespace {String} Namespace for any relay definition
 *    priority {String} Priority for any relay definition or synthetic "first" for iii)A)
 */
fluid.connectModelRelay = function (source, sourceSegs, target, targetSegs, options) {
    var linkId = fluid.allocateGuid();
    fluid.enlistModelComponent(target);
    fluid.enlistModelComponent(source); // role of "source" and "target" are swapped in case iii)B)
    var npOptions = fluid.filterKeys(options, ["namespace", "priority"]);

    if (options.update) { // it is a call for a relay document - ii) or iii)B)
        if (options.targetApplier) { // case iii)B)
            // We are in the middle of parsing a contextualised relay, and this call has arrived via its parseImplicitRelay.
            // register changes from the target model onto changes to the model relay document
            fluid.registerDirectChangeRelay(source, sourceSegs, target, targetSegs, linkId, null, {
                transactional: false,
                targetApplier: options.targetApplier,
                refCount: options.refCount,
                update: options.update
            }, npOptions);
        } else { // case ii), contextualised relay overall output
            // Rather than bind source-source, instead register the "half-transactional" listener which binds changes
            // from the relay document itself onto the target
            fluid.registerDirectChangeRelay(target, targetSegs, source, [], linkId + "-transform", options.forwardAdapter, {transactional: true, sourceApplier: options.forwardApplier}, npOptions);
        }
    } else { // case i) or iii)A): more efficient, old-fashioned branch where relay is uncontextualised
        fluid.registerDirectChangeRelay(target, targetSegs, source, sourceSegs, linkId, options.forwardAdapter, {transactional: false}, npOptions);
        fluid.registerDirectChangeRelay(source, sourceSegs, target, targetSegs, linkId, options.backwardAdapter, {transactional: false}, npOptions);
    }
};

fluid.parseSourceExclusionSpec = function (targetSpec, sourceSpec) {
    targetSpec.excludeSource = fluid.arrayToHash(fluid.makeArray(sourceSpec.excludeSource || (sourceSpec.includeSource ? "*" : undefined)));
    targetSpec.includeSource = fluid.arrayToHash(fluid.makeArray(sourceSpec.includeSource));
    return targetSpec;
};

/** Determines whether the supplied transaction should have changes not propagated into it as a result of being excluded by a
 * condition specification.
 * @param {Transaction} transaction - A local ChangeApplier transaction, with member `fullSources` holding all currently active sources
 * @param {ConditionSpec} spec - A parsed relay condition specification, as returned from `fluid.model.parseRelayCondition`.
 * @return {Boolean} `true` if changes should be excluded from the supplied transaction according to the supplied specification
 */
fluid.isExcludedChangeSource = function (transaction, spec) {
    // OLD COMMENT: mergeModelListeners initModelEvent fabricates a fake spec that bypasses processing
    // TODO: initModelEvent is gone, mergeModelListeners is now registerMergedModelListeners - is this still relevant?
    if (!spec || !spec.excludeSource) {
        return false;
    }
    var excluded = spec.excludeSource["*"];
    for (var source in transaction.fullSources) {
        if (spec.excludeSource[source]) {
            excluded = true;
        }
        if (spec.includeSource[source]) {
            excluded = false;
        }
    }
    return excluded;
};

fluid.model.guardedAdapter = function (transaction, cond, func, args) {
    if (!fluid.isExcludedChangeSource(transaction, cond) && func !== fluid.model.transform.uninvertibleTransform) {
        func.apply(null, args);
    }
};

// TODO: This rather crummy function is the only site with a hard use of "path" as String
fluid.transformToAdapter = function (transform, targetPath) {
    var basedTransform = {};
    // TODO: This should never work - it only does because we drive transformWithRules in a configuration which is escaping-blind and so faulty
    basedTransform[targetPath] = transform;
    return function (trans, newValue, source, sourceSegs, targetSegs, changeRequest) {
        if (changeRequest && changeRequest.type === "DELETE") {
            trans.fireChangeRequest({type: "DELETE", path: targetPath}); // avoid mouse droppings in target document for FLUID-5585
        }
        var oldTarget = fluid.getImmediate(trans.oldHolder.model, targetSegs);
        var oldSource = fluid.getImmediate(source.model, sourceSegs); // TODO: check whether this could ever diverge from trans oldHolder?
        // TODO: More efficient model that can only run invalidated portion of transform (need to access changeMap of source transaction)
        // TODO: Also avoid recreating all the transform machinery inside
        fluid.model.transformWithRules(newValue, basedTransform, {
            finalApplier: trans,
            oldTarget: oldTarget,
            oldSource: oldSource
        });
    };
};

// TODO: sourcePath and targetPath should really be converted to segs to avoid excess work in parseValidModelReference
fluid.makeTransformPackage = function (componentThat, transform, sourcePath, targetPath, forwardCond, backwardCond, namespace, priority) {
    var that = {
        forwardHolder: {model: transform},
        backwardHolder: {model: null}
    };
    that.generateAdapters = function (trans) {
        // can't commit "half-transaction" or events will fire - violate encapsulation in this way
        that.forwardAdapterImpl = fluid.transformToAdapter(trans ? trans.newHolder.model : that.forwardHolder.model, targetPath);
        if (sourcePath !== null) {
            var inverted = fluid.model.transform.invertConfiguration(transform);
            if (inverted !== fluid.model.transform.uninvertibleTransform) {
                that.backwardHolder.model = inverted;
                that.backwardAdapterImpl = fluid.transformToAdapter(that.backwardHolder.model, sourcePath);
            } else {
                that.backwardAdapterImpl = inverted;
            }
        }
    };
    that.forwardAdapter = function (transaction, newValue) { // create a stable function reference for this possibly changing adapter
        if (newValue === undefined) {
            that.generateAdapters(); // TODO: Quick fix for incorrect scheduling of invalidation/transducing
            // "it so happens" that fluid.registerDirectChangeRelay invokes us with empty newValue in the case of invalidation -> transduction
        }
        fluid.model.guardedAdapter(transaction, forwardCond, that.forwardAdapterImpl, arguments);
    };
    that.forwardAdapter.cond = forwardCond; // Used when parsing graph in init transaction
    // fired from fluid.model.updateRelays via invalidator event
    that.runTransform = function (trans) {
        trans.commit(); // this will reach the special "half-transactional listener" registered in fluid.connectModelRelay,
        // branch with options.targetApplier - by committing the transaction, we update the relay document in bulk and then cause
        // it to execute (via "transducer")
        trans.reset();
    };
    that.forwardApplier = fluid.makeHolderChangeApplier(that.forwardHolder);
    that.forwardApplier.isRelayApplier = true; // special annotation so these can be discovered in the transaction record
    // This event is fired from fluid.model.updateRelays with the component's own transaction as the argument (2nd argument, overall transRec unused)
    that.invalidator = fluid.makeEventFirer({name: "Invalidator for model relay with applier " + that.forwardApplier.applierId});
    if (sourcePath !== null) {
        // TODO: backwardApplier is unused
        that.backwardApplier = fluid.makeHolderChangeApplier(that.backwardHolder);
        that.backwardAdapter = function (transaction) {
            fluid.model.guardedAdapter(transaction, backwardCond, that.backwardAdapterImpl, arguments);
        };
        that.backwardAdapter.cond = backwardCond;
    }
    that.update = that.invalidator.fire; // necessary so that both routes to fluid.connectModelRelay from here hit the first branch
    var implicitOptions = {
        targetApplier: that.forwardApplier, // this special field identifies us to fluid.connectModelRelay
        update: that.update,
        namespace: namespace,
        priority: priority,
        refCount: 0
    };
    that.forwardHolder.model = fluid.parseImplicitRelay(componentThat, transform, [], implicitOptions);
    that.refCount = implicitOptions.refCount;
    that.namespace = namespace;
    that.priority = priority;
    that.generateAdapters();
    that.invalidator.addListener(that.generateAdapters);
    that.invalidator.addListener(that.runTransform);
    return that;
};

fluid.singleTransformToFull = function (singleTransform) {
    var expanded = typeof(singleTransform) === "string" ? {
        type: singleTransform
    } : singleTransform;
    // TODO 11/20: This is nuts, why do we have to specify inputPath here?
    var withPath = $.extend(true, {inputPath: ""}, expanded);
    return {
    // TODO: Also nuts - why can't the thing accept "transform" as a top-level key?
        "": {
            transform: withPath
        }
    };
};

fluid.funcToSingleTransform = function (that, mrrec) {
    if (mrrec.func) {
        if ((mrrec.args !== undefined) + (mrrec.source !== undefined) + (mrrec.value !== undefined) !== 1) {
            fluid.fail("Error in model relay definition: short-form relay must specify just one out of (args, source, value)");
        }
        return {
            type: "fluid.transforms.free",
            func: mrrec.func,
            args: mrrec.args ? mrrec.args : [fluid.isIoCReference(mrrec.source) ? mrrec.source : "{that}.model." + mrrec.source]
        };
    } else {
        return null;
    }
};

// Convert old-style "relay conditions" to source includes/excludes as used in model listeners
fluid.model.relayConditions = {
    initOnly: {includeSource: "init"},
    liveOnly: {excludeSource: "init"},
    never:    {includeSource: []},
    always:   {}
};

fluid.model.expandRelayCondition = function (condition) {
    var exclusionRec;
    if (condition === "initOnly") {
        fluid.log(fluid.logLevel.WARN, "The relay condition \"initOnly\" is deprecated: Please use the form 'includeSource: \"init\"' instead");
    } else if (condition === "liveOnly") {
        fluid.log(fluid.logLevel.WARN, "The relay condition \"liveOnly\" is deprecated: Please use the form 'excludeSource: \"init\"' instead");
    }
    if (!condition) {
        exclusionRec = {};
    } else if (typeof(condition) === "string") {
        exclusionRec = fluid.model.relayConditions[condition];
        if (!exclusionRec) {
            fluid.fail("Unrecognised model relay condition string \"" + condition + "\": the supported values are \"never\" or a record with members \"includeSource\" and/or \"excludeSource\"");
        }
    } else {
        exclusionRec = condition;
    }
    return exclusionRec;
};

/** Parse a relay condition specification, e.g. of the form `{includeSource: "init"}` or `never` into a hash representation
 * suitable for rapid querying.
 * @param {String|Object} conditions - A relay condition specification, appearing in the section `forward` or `backward` of a
 * relay definition
 * @return {RelayCondition} The parsed condition, holding members `includeSource` and `excludeSource` each with a hash to `true`
 * of referenced sources
 */
fluid.model.parseRelayConditions = function (conditions) {
    var expanded = conditions.map(fluid.model.expandRelayCondition);
    var mergeArgs = [true, {}].concat(expanded);
    var merged = fluid.extend.apply(null, mergeArgs);
    return fluid.parseSourceExclusionSpec({}, merged);
};

/** Parse a single model relay record as appearing nested within the `modelRelay` block in a model component's
 * options. By various calls to `fluid.connectModelRelay` this will set up the structure operating the live
 * relay during the component's lifetime.
 * @param {Component} that - The component holding the record, currently instantiating
 * @param {Object} mrrec - The model relay record. This must contain either a member `singleTransform` or `transform` and may also contain
 * members `namespace`, `path`, `priority`, `forward` and `backward`
 * @param {String} key -
 */
fluid.parseModelRelay = function (that, mrrec, key) {
    fluid.pushActivity("parseModelRelay", "parsing modelRelay definition with key \"%key\" and body \"%body\" attached to component \"%that\"",
        {key: key, body: mrrec, that: that});
    if (typeof(mrrec.target) !== "string" && !(fluid.isPlainObject(mrrec.target, true) && mrrec.target.segs)) {
        fluid.fail("Error parsing model relay definition: model reference must be specified for \"target\"");
    }
    var parsedSource = mrrec.source !== undefined ? fluid.parseValidModelReference(that, "modelRelay record member \"source\"", mrrec.source, true) :
        mrrec.value !== undefined ? {nonModel: true} : {path: null, modelSegs: null};
    // TODO: We seem to have lost validation that the relay definition must contain "target" - currently bare exception
    var parsedTarget = fluid.parseValidModelReference(that, "modelRelay record member \"target\"", mrrec.target);
    var namespace = mrrec.namespace || key;

    var singleTransform = typeof(mrrec.singleTransform) === "string" ? {
        type: mrrec.singleTransform
    } : mrrec.singleTransform;

    var shortSingleTransform = fluid.funcToSingleTransform(that, mrrec);

    var transform = mrrec.transform || fluid.singleTransformToFull(
        singleTransform || shortSingleTransform || {
            type: "fluid.transforms.identity"
        });
    var upDefaults = singleTransform ? fluid.defaults(singleTransform.type) : null;
    var relayOptions = upDefaults && upDefaults.relayOptions || {};

    var forwardCond = fluid.model.parseRelayConditions([relayOptions.forward, mrrec.forward]),
        backwardCond = fluid.model.parseRelayConditions([relayOptions.backward, mrrec.backward]);

    var transformPackage = fluid.makeTransformPackage(that, transform, parsedSource.path, parsedTarget.path, forwardCond, backwardCond, namespace, mrrec.priority);

    if (parsedSource.nonModel) { // Reuse this part of implicit workflow to subscribe to models - then replicate the initModel logic in the fluid.establishModelRelay driver
        var initValue = fluid.parseImplicitRelay(that, fluid.firstDefined(mrrec.source, mrrec.value), parsedTarget.modelSegs),
            transformed;
        if (transform[""].transform.type !== "fluid.transforms.identity") {
            var localTransform = fluid.copy(transform);
            localTransform[""].transform.args = [initValue]; // our synthesized transform will set inputPath, another may source from args
            transformed = fluid.model.transformWithRules(initValue, localTransform);
        } else {
            transformed = initValue;
        }
        var enlist = fluid.enlistModelComponent(parsedTarget.that);
        var initModel = {};
        fluid.model.setSimple(initModel, parsedTarget.modelSegs, transformed);
        enlist.initModels.push(initModel);
    } else {
        if (transformPackage.refCount === 0) { // There were no implicit relay elements found in the relay document - it can be relayed directly
            // Case i): Bind changes emitted from the relay ends to each other, synchronously
            fluid.connectModelRelay(parsedSource.that || that, parsedSource.modelSegs, parsedTarget.that, parsedTarget.modelSegs,
            // Primarily, here, we want to get rid of "update" which is what signals to connectModelRelay that this is a invalidatable relay
                fluid.filterKeys(transformPackage, ["forwardAdapter", "backwardAdapter", "namespace", "priority"]));
        } else {
            if (parsedSource.modelSegs && !shortSingleTransform) {
                fluid.fail("Error in model relay definition: If a relay transform has a model dependency, you can not specify a \"source\" entry - please instead enter this as \"input\" in the transform specification. Definition was ", mrrec, " for component ", that);
            }
            // Case ii): Binds changes emitted from the relay document itself onto the relay ends (using the "half-transactional system")
            fluid.connectModelRelay(that, null, parsedTarget.that, parsedTarget.modelSegs, transformPackage);
        }
    }
    fluid.popActivity();
};

/** Traverses a model document written within a component's options, parsing any IoC references looking for
 * i) references to general material, which will be fetched and interpolated now, and ii) "implicit relay" references to the
 * model areas of other components, which will be used to set up live synchronisation between the area in this component where
 * they appear and their target, as well as setting up initial synchronisation to compute the initial contents.
 * This is called in two situations: A) parsing the `model` configuration option for a model component, and B) parsing the
 * `transform` member (perhaps derived from `singleTransform`) of a `modelRelay` block for a model component. It calls itself
 * recursively as it progresses through the model document material with updated `segs`
 * @param {fluid.modelComponent} that - The component holding the model document
 * @param {Any} modelRec - The model document specification to be parsed
 * @param {String[]} segs - The array of string path segments from the root of the entire model document to the point of current parsing
 * @param {Object} options - Configuration options (mutable) governing this parse. This is primarily used to hand as the 5th argument to
 * `fluid.connectModelRelay` for any model references found, and contains members
 *    refCount {Integer} An count incremented for every call to `fluid.connectModelRelay` setting up a synchronizing relay for every
 * reference to model material encountered
 *    priority {String} The unparsed priority member attached to this record, or `first` for a parse of `model` (case A)
 *    namespace {String} [optional] A namespace attached to this transform, if we are parsing a transform
 *    targetApplier {ChangeApplier} [optional] The ChangeApplier for this transform document, if it is a transform, empty otherwise
 *    update {Function} [optional] A function to be called on conclusion of a "half-transaction" where all currently pending updates have been applied
 * to this transform document. This function will update/regenerate the relay transform functions used to relay changes between the transform
 * ends based on the updated document.
 * @return {Any} - The resulting model value.
 */
fluid.parseImplicitRelay = function (that, modelRec, segs, options) {
    var value;
    if (fluid.isIoCReference(modelRec)) {
        var parsed = fluid.parseValidModelReference(that, "model reference from model (implicit relay)", modelRec, true);
        if (parsed.nonModel) {
            value = fluid.isComponent(parsed.that) ?
                fluid.possiblyProxyComponent(fluid.getForComponent(parsed.that, parsed.segs)) // Resolve FLUID-6601 for component references supplied to free transforms
                : fluid.getImmediate(parsed.that, parsed.segs);
            if (value instanceof fluid.fetchResources.FetchOne) {
                that.applier.resourceMap.push({segs: fluid.makeArray(segs), fetchOne: value});
                // We don't support compositing of resource references since we couldn't apply this if their value changes
                return undefined;
            }
        } else {
            ++options.refCount; // This count is used from within fluid.makeTransformPackage
            fluid.connectModelRelay(that, segs, parsed.that, parsed.modelSegs, options);
        }
    } else if (fluid.isPrimitive(modelRec) || !fluid.isPlainObject(modelRec)) {
        value = modelRec;
    } else if (modelRec.expander && fluid.isPlainObject(modelRec.expander)) {
        value = fluid.expandOptions(modelRec, that);
    } else { // It is a plain Object or Array container
        value = fluid.freshContainer(modelRec);
        fluid.each(modelRec, function (innerValue, key) {
            segs.push(key);
            var innerTrans = fluid.parseImplicitRelay(that, innerValue, segs, options);
            if (innerTrans !== undefined) {
                value[key] = innerTrans;
            }
            segs.pop();
        });
    }
    return value;
};


// Conclude the transaction by firing to all external listeners in priority order
fluid.model.notifyExternal = function (transRec) {
    var allChanges = transRec ? fluid.values(transRec.externalChanges) : [];
    fluid.sortByPriority(allChanges);
    for (var i = 0; i < allChanges.length; ++i) {
        var change = allChanges[i];
        var targetApplier = change.args[5]; // NOTE: This argument gets here via fluid.model.storeExternalChange from fluid.notifyModelChanges
        if (!targetApplier.destroyed) { // 3rd point of guarding for FLUID-5592
            change.listener.apply(null, change.args);
        }
    }
    fluid.clearLinkCounts(transRec, true); // "options" structures for relayCount are aliased
};

fluid.model.commitRelays = function (instantiator, transactionId) {
    var transRec = instantiator.modelTransactions[transactionId];
    fluid.each(transRec, function (transEl) {
    // This commits all transactions, not just those for relay documents, because this is the main site where "newHolder" values for all transactions across the tree get updated
        if (transEl.transaction) { // some entries are links
            transEl.transaction.commit("relay");
            transEl.transaction.reset();
        }
    });
};

// Listens to all invalidation to relays, and reruns/applies them if they have been invalidated
fluid.model.updateRelays = function (instantiator, transactionId) {
    var transRec = instantiator.modelTransactions[transactionId];
    var updates = 0;
    fluid.sortByPriority(transRec.relays);
    fluid.each(transRec.relays, function (transEl) {
        // TODO: We have a bit of a problem here in that we only process updatable relays by priority - plain relays get to act non-transactionally
        // FLUID-5303: We really need to remove this relay count entirely - there could really be as many updates as there are upstream relay rules.
        // Primarily this is here as a tripwire to remind us that this system is wholly faulty
        var maxRelay = transEl.options.refCount ? transEl.options.refCount * 4 : 4;
        if (transEl.transaction.changeRecord.changes > 0 && transEl.relayCount < maxRelay && transEl.options.update) {
            transEl.relayCount++;
            fluid.clearLinkCounts(transRec);
            transEl.options.update(transEl.transaction, transRec);
            ++updates;
        }
    });
    return updates;
};


fluid.concludeModelTransaction = function (transaction) {
    var instantiator = fluid.globalInstantiator;
    fluid.model.notifyExternal(instantiator.modelTransactions[transaction.id]);
    delete instantiator.modelTransactions[transaction.id];
};

/** The main entry point for enlisting a model component in the initial transaction. Positioned as a "fake member"
 * which evalutes to null. Calls `fluid.enlistModelComponent` to register record in treeTransaction.initModelTransaction
 * @param {fluid.modelComponent} that - The `fluid.modelComponent` which is about to initialise
 * @param {fluid.mergingArray} optionsModel - Reference into `{that}.options.model`
 * @param {Object} optionsML - Reference into `{that}.options.modelListeners`
 * @param {Object} optionsMR - Reference into `{that}.options.modelRelay`
 * @param {fluid.changeApplier} applier - Reference into `{that}.applier`
 * @return {null} A dummy `null` value which will initialise the `{that}.modelRelay` member
 */
fluid.establishModelRelay = function (that, optionsModel, optionsML, optionsMR, applier) {
    var shadow = fluid.shadowForComponent(that);
    if (!shadow.modelRelayEstablished) {
        shadow.modelRelayEstablished = true;
    } else {
        fluid.fail("FLUID-5887 failure: Model relay initialised twice on component", that);
    }

    var enlist = fluid.enlistModelComponent(that);

    // Note: this particular instance of "refCount" is disused. We only use the count made within fluid.makeTransformPackge
    var initModels = (optionsModel || []).map(function (modelRec) {
        return fluid.parseImplicitRelay(that, modelRec, [], {refCount: 0, priority: "first"});
    });
    Array.prototype.push.apply(enlist.initModels, initModels);

    fluid.each(optionsMR, function (mrrec, key) {
        if (key === "") {
            for (var i = 0; i < mrrec.length; ++i) {
                fluid.parseModelRelay(that, mrrec[i], key);
            }
        } else {
            var lightMerge = fluid.extend.apply(null, [true, {}].concat(mrrec));
            fluid.parseModelRelay(that, lightMerge, key);
        }
    });

    var instantiator = fluid.getInstantiator(that);

    function updateRelays(transaction) {
        while (fluid.model.updateRelays(instantiator, transaction.id) > 0) {} // eslint-disable-line no-empty
    }

    function commitRelays(transaction) {
        fluid.model.commitRelays(instantiator, transaction.id);
    }

    applier.preCommit.addListener(updateRelays);
    applier.preCommit.addListener(commitRelays);
    applier.postCommit.addListener(fluid.concludeModelTransaction);
    // Conclude any tree transaction that is in progress - i.e. close out the construction of any lensed components that were brought into existence by this model transaction
    applier.postCommit.addListener(fluid.concludeAnyTreeTransaction);

    return null;
};

fluid.destroyLensedComponentSource = function (that, isBoolean) {
    var shadow = fluid.shadowForComponent(that);
    var sourceModelReference = shadow.localRecord.sourceModelReference;
    if (sourceModelReference && !fluid.isDestroyed(sourceModelReference.that, true)) {
        sourceModelReference.that.applier.change(sourceModelReference.modelSegs, false, isBoolean ? "ADD" : "DELETE");
    }
};

fluid.constructLensedComponents = function (shadow, initTransRec, sourcesParsed, dynamicComponentKey) {
    var lightMerge = shadow.lightMergeDynamicComponents[dynamicComponentKey];
    var sources = fluid.getImmediate(shadow.that.model, sourcesParsed.modelSegs);
    var shadowRecord = shadow.modelSourcedDynamicComponents[dynamicComponentKey];
    var localRecordContributor = shadowRecord.localRecordContributor =
        function (localRecord, source, sourceKey) {
            localRecord.sourceModelReference = {
                that: sourcesParsed.that,
                modelSegs: sourcesParsed.modelSegs.concat(shadowRecord.isBoolean ? [] : [sourceKey])
            };
        };
    fluid.lightMergeRecords.pushRecord(lightMerge, {
        options: {
            listeners: {
                afterDestroy: {
                    funcName: "fluid.destroyLensedComponentSource",
                    args: ["{that}", shadowRecord.isBoolean]
                }
            }
        }
    });
    fluid.registerSourcedDynamicComponentsTriage(shadow.potentia, shadow.that, sources, lightMerge, dynamicComponentKey,
        shadowRecord.isBoolean, localRecordContributor);
};

// No longer a top-level workflow function, but tagged from the end of fluid.enlistModelWorkflow
fluid.operateInitialTransactionWorkflow = function (shadows, treeTransaction) {
    fluid.tryCatch(function () { // For FLUID-6195 ensure that exceptions during init relay don't leave the framework unusable
        var initModelTransaction = treeTransaction.initModelTransaction;
        var transId = treeTransaction.initModelTransactionId;
        fluid.operateInitialTransaction(initModelTransaction, transId);
    }, function (e) {
        treeTransaction.initModelTransaction = {};
        treeTransaction.initModelTransactionId = null;
        fluid.clearTransactions();
        throw e;
    }, fluid.identity);
};

fluid.enlistModelWorkflow = function (shadows, treeTransaction) {
    var transId = treeTransaction.initModelTransactionId;
    if (!transId) {
        transId = fluid.allocateGuid();
        treeTransaction.initModelTransactionId = transId;
    }
    shadows.forEach(function (shadow) {
        fluid.getForComponent(shadow.that, "modelRelay"); // invoke fluid.establishModelRelay and enlist each component
    });
    fluid.operateInitialTransactionWorkflow(shadows, treeTransaction);
};

fluid.notifyInitModelWorkflow = function (shadow, treeTransaction) {
    // Note that this really has many of the characteristics of a global workflow function, but all the book-keeping
    // is done on our side, and notification needs to occur with respect to the skeleton's incident namespaces, so
    // we use the first call in the transaction as a proxy for all
    if (!shadow.modelComplete) {
        var initModelTransaction = treeTransaction.initModelTransaction;
        var transRec = fluid.getModelTransactionRec(fluid.rootComponent, shadow.initTransactionId);
        var trans = fluid.values(initModelTransaction)[0].transaction;
        treeTransaction.initModelTransaction = {};
        treeTransaction.initModelTransactionId = null;
        trans.commit(); // committing one representative transaction will commit them all
        // NB: Don't call concludeTransaction since "init" is not a standard record - this occurs in commitRelays for the corresponding genuine record as usual
        fluid.each(initModelTransaction, function (oneRec) {
            var that = oneRec.that,
                applier = that.applier;
            trans = transRec[applier.applierId].transaction;
            var listeners = applier.transListeners.sortedListeners;
            var initShadow = fluid.shadowForComponent(that);
            initShadow.modelComplete = true;
            var shadowTrans = initShadow.initTransactionId;
            if (shadowTrans === shadow.initTransactionId) {
                fluid.notifyModelChanges(listeners, "ADD", trans.oldHolder, fluid.emptyHolder, null, trans, applier, that);
            } else {
                // TODO: See if we can generate a case where this branch is necessary
                // fluid.notifyModelChanges(listeners, "ADD", trans.newHolder, trans.oldHolder, null, trans, applier, that);
            }
        });
        fluid.concludeModelTransaction(trans);
    }
};

// supported, PUBLIC API grade
fluid.defaults("fluid.modelComponent", {
    gradeNames: ["fluid.component"],
    workflows: {
        global: {
            enlistModel: {
                funcName: "fluid.enlistModelWorkflow"
            },
            resolveResourceModel: {
                funcName: "fluid.resolveResourceModelWorkflow",
                priority: "after:enlistModel",
                waitIO: true
            }
        },
        local: {
            notifyInitModelWorkflow: {
                funcName: "fluid.notifyInitModelWorkflow",
                priority: "before:concludeComponentInit"
            }
        }
    },
    members: {
        model: {
            expander: {
                funcName: "fluid.initRelayModel",
                args: ["{that}", "{that}.modelRelay"],
                noproxy: true
            }
        },
        applier: {
            expander: {
                funcName: "fluid.makeHolderChangeApplier",
                args: ["{that}", "{that}.options.changeApplierOptions"],
                noproxy: true
            }
        },
        modelRelay: {
            expander: {
                funcName: "fluid.establishModelRelay",
                args: ["{that}", "{that}.options.model", "{that}.options.modelListeners", "{that}.options.modelRelay", "{that}.applier"],
                noproxy: true
            }
        }
    },
    mergePolicy: {
        model: {
            noexpand: true,
            func: fluid.arrayConcatPolicy // TODO: bug here in case a model consists of an array
        },
        modelListeners: fluid.makeMergeListenersPolicy(fluid.arrayConcatPolicy),
        modelRelay: fluid.makeMergeListenersPolicy(fluid.arrayConcatPolicy, true)
    }
});

fluid.modelChangedToChange = function (args) {
    return {
        value: args[0],
        oldValue: args[1],
        path: args[2],
        transaction: args[4]
    };
};

// Two calls: fluid.resolveModelListener and fluid.transforms.free
fluid.event.invokeListener = function (listener, args, localRecord, mergeRecord) {
    if (typeof(listener) === "string") {
        listener = fluid.event.resolveListener(listener); // just resolves globals
    }
    // TODO: It is likely that args for special records will get double-expanded
    return listener.apply(null, args, localRecord, mergeRecord); // can be "false apply" that requires extra context for expansion
};

fluid.resolveModelListener = function (that, record) {
    var togo = function () {
        if (fluid.isDestroyed(that, true)) { // first guarding point to resolve FLUID-5592
            return;
        }
        var change = fluid.modelChangedToChange(arguments);
        var args = arguments;
        var localRecord = {change: change, "arguments": args};
        var mergeRecord = {source: Object.keys(change.transaction.sources)}; // cascade for FLUID-5490
        if (record.args) {
            args = fluid.expandImmediate(record.args, that, localRecord);
        }
        fluid.event.invokeListener(record.listener, fluid.makeArray(args), localRecord, mergeRecord);
    };
    fluid.event.impersonateListener(record.listener, togo);
    return togo;
};

fluid.registerModelListeners = function (that, record, paths, namespace) {
    var func = fluid.resolveModelListener(that, record);
    fluid.each(record.byTarget, function (parsedArray) {
        var parsed = parsedArray[0]; // that, applier are common across all these elements
        var spec = {
            listener: func, // for initModelEvent
            listenerId: fluid.allocateGuid(), // external declarative listeners may often share listener handle, identify here
            segsArray: fluid.getMembers(parsedArray, "modelSegs"),
            includeSource: record.includeSource,
            excludeSource: record.excludeSource,
            priority: fluid.expandOptions(record.priority, that),
            transactional: true
        };
        // update "spec" so that we parse priority information just once
        spec = parsed.applier.modelChanged.addListener(spec, func, namespace, record.softNamespace);
        spec.segsArray.forEach(function (segs) {
            fluid.materialiseModelPath(that, segs);
        });

        fluid.recordChangeListener(that, parsed.applier, func, spec.listenerId);
    });
};

fluid.registerMergedModelListeners = function (that, listeners) {
    fluid.each(listeners, function (value, key) {
        if (typeof(value) === "string") {
            value = {
                funcName: value
            };
        }
        // Bypass fluid.event.dispatchListener by means of "standard = false" and enter our custom workflow including expanding "change":
        var records = fluid.event.resolveListenerRecord(value, that, "modelListeners", null, false).records;
        fluid.each(records, function (record) {
            // Aggregate model listeners into groups referring to the same component target.
            // We do this so that a single entry will appear in its modelListeners so that they may
            // be notified just once per transaction, and also displaced by namespace
            record.byTarget = {};
            var paths = fluid.makeArray(record.path === undefined ? key : record.path);
            fluid.each(paths, function (path) {
                var parsed = fluid.parseValidModelReference(that, "modelListeners entry", path);
                fluid.pushArray(record.byTarget, parsed.that.id, parsed);
            });
            var namespace = (record.namespace && !record.softNamespace ? record.namespace : null) || (record.path !== undefined ? key : null);
            fluid.registerModelListeners(that, record, paths, namespace);
        });
    });
};


/** CHANGE APPLIER **/

// supported, PUBLIC API function
/** Opens a transaction against the supplied applier, deletes the value at the supplied path, applies the supplied value in its place
 * and commits the transaction. This is a useful method since the semantics of a ChangeApplier "ADD" message are accumulative - the
 * supplied value is ordinarily merged into any existing value. By using this method, a client can wholly update a value held
 * at a particular path, apparently atomically from the point of view of any model listeners.
 * @param {fluid.ChangeApplier} applier - The ChangeApplier to operate the update
 * @param {String|String[]} path - The path at which the new value is to be applied
 * @param {Any} newValue - The new value to be stored at the path
 * @return {Any} The updated contents of the entire model managed by the supplied applier
 */
fluid.replaceModelValue = function (applier, path, newValue) {
    var transaction = applier.initiate();
    transaction.fireChangeRequest({path: path, type: "DELETE"});
    transaction.fireChangeRequest({path: path, value: newValue});
    transaction.commit();
    return applier.holder.model;
};

/* Dispatches a list of changes to the supplied applier */
// TODO: Good candidate for removal
fluid.fireChanges = function (applier, changes) {
    for (var i = 0; i < changes.length; ++i) {
        applier.fireChangeRequest(changes[i]);
    }
};

/*
 * Utilities supporting fluid.model.applyHolderChangeRequest
 */

/** Given a changeMap structure and an array of paths into it, returns the change type found along that path,
 * or `null` if the path is unchanged
 * @param {ChangeMap} changeMap - A "ChangeMap" structure isomorphic to the model, holding "ADD" or "DELETE" at the highest
 * path where such a change has been received
 * @param {String[]} segs - Array of path segments into the structure
 * @return {("ADD"|"DELETE"|null)} Returns "ADD" or "DELETE" if such a change is found along the supplied path, otherwise `null`.
 */
fluid.model.isChangedPath = function (changeMap, segs) {
    for (var i = 0; i <= segs.length; ++i) {
        if (typeof(changeMap) === "string") {
            return changeMap;
        }
        if (i < segs.length && changeMap) {
            changeMap = changeMap[segs[i]];
        }
    }
    return null;
};

/** Updates both the "changeMap" and "deltaMap" to map the type of a ChangeRequest received at a particular path
 * @param {Object} options - An options structure with members `changeMap` and `deltaMap` which will both be updated
 * in order to take account of the incoming ChangeRequest type and path
 * @param {String[]} segs - An array of path segments at which a change has been received
 * @param {("ADD"|"DELETE")} value - A string holding the ChangeRequest type
 */
fluid.model.setChangedPath = function (options, segs, value) {
    var notePath = function (record) {
        var root = options;
        segs.unshift(record);
        // We can't use any of the standard drivers here since we i) need to create entries along as we go, like set, but
        // ii) not attempt to set any properties on a primitive value if we find it
        for (var i = 0; i < segs.length - 1; ++i) {
            var seg = segs[i];
            if (root[seg] === undefined) {
                root[seg] = {};
            }
            root = root[seg];
        }
        if (fluid.isPlainObject(root)) {
            root[fluid.peek(segs)] = value;
        }
        segs.shift();
    };
    if (fluid.model.isChangedPath(options.changeMap, segs) !== value) {
        ++options.changes;
        notePath("changeMap");
    }
    if (fluid.model.isChangedPath(options.deltaMap, segs) !== value) {
        ++options.deltas;
        notePath("deltaMap");
    }
};

fluid.model.fetchChangeChildren = function (target, i, segs, source, options) {
    fluid.each(source, function (value, key) {
        segs[i] = key;
        fluid.model.applyChangeStrategy(target, key, i, segs, value, options);
        segs.length = i;
    });
};

// Called with two primitives which are compared for equality. This takes account of "floating point slop" to avoid
// continuing to propagate inverted values as changes
// TODO: replace with a pluggable implementation
fluid.model.isSameValue = function (a, b) {
    if (typeof(a) !== "number" || typeof(b) !== "number") {
        return a === b;
    } else {
        // Don't use isNaN because of https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/isNaN#Confusing_special-case_behavior
        if (a === b || a !== a && b !== b) { // Either the same concrete number or both NaN
            return true;
        } else {
            var relError = Math.abs((a - b) / b);
            return relError < 1e-12; // 64-bit floats have approx 16 digits accuracy, this should deal with most reasonable transforms
        }
    }
};

fluid.model.applyChangeStrategy = function (target, name, i, segs, source, options) {
    var targetSlot = target[name];
    var sourceCode = fluid.typeCode(source);
    var targetCode = fluid.typeCode(targetSlot);
    var changedValue = fluid.NO_VALUE;
    if (sourceCode === "primitive") {
        if (!fluid.model.isSameValue(targetSlot, source)) {
            changedValue = source;
            ++options.unchanged;
        }
    } else if (targetCode !== sourceCode || sourceCode === "array" && source.length !== targetSlot.length) {
        // RH is not primitive - array or object and mismatching or any array rewrite
        changedValue = fluid.freshContainer(source);
    }
    if (changedValue !== fluid.NO_VALUE) {
        target[name] = changedValue;
        if (options.changeMap) {
            fluid.model.setChangedPath(options, segs, options.inverse ? "DELETE" : "ADD");
        }
    }
    if (sourceCode !== "primitive") {
        fluid.model.fetchChangeChildren(target[name], i + 1, segs, source, options);
    }
};

fluid.model.stepTargetAccess = function (target, type, segs, startpos, endpos, options) {
    for (var i = startpos; i < endpos; ++i) {
        if (!target) {
            continue;
        }
        var oldTrunk = target[segs[i]];
        target = fluid.model.traverseWithStrategy(target, segs, i, options[type === "ADD" ? "resolverSetConfig" : "resolverGetConfig"],
            segs.length - i - 1);
        if (oldTrunk !== target && options.changeMap) {
            fluid.model.setChangedPath(options, segs.slice(0, i + 1), "ADD");
        }
    }
    return {root: target, last: segs[endpos]};
};

fluid.model.defaultAccessorConfig = function (options) {
    options = options || {};
    options.resolverSetConfig = options.resolverSetConfig || fluid.model.escapedSetConfig;
    options.resolverGetConfig = options.resolverGetConfig || fluid.model.escapedGetConfig;
    return options;
};

/** Central point where a ChangeRequest is applied to a model. This keeps records of which parts of the model has been
 * invalidated both on a fine scale ("deltaMap", used for individual changes for the operation of every relay) and
 * a coarse scale ("changeMap", used to track the overall state of the model across the whole transaction.
 * @param {Any} holder - The object holding the model at member `model` - may be a Fluid component or a temporary structure
 * created during a transaction
 * @param {ChangeRequest} request - The ChangeRequest to be applied
 * @param {Object} options - Options governing the changeApplication process. This may include members:
 *     {ChangeMap} [changeMap, deltaMap] - Optional ChangeMap structures mapping updates to the model (see `fluid.model.setChangedPath`)
 *     {Integer} changes, delta - Counts (pretty notional, the only real use made at present is to check whether they are 0) of updates made to the model
 *     {Boolean} inverse - Whether the change is being applied or unapplied to the model (only used by the `fluid.model.diff` driver)
 * @return {ChangeMap} The updated `deltaMap` if one was supplied in options
 */
fluid.model.applyHolderChangeRequest = function (holder, request, options) {
    options = fluid.model.defaultAccessorConfig(options);
    options.deltaMap = options.changeMap ? {} : null;
    options.deltas = 0;
    var length = request.segs.length;
    var pen, atRoot = length === 0;
    if (atRoot) {
        pen = {root: holder, last: "model"};
    } else {
        if (!holder.model && request.type !== "DELETE") {
            holder.model = {};
            fluid.model.setChangedPath(options, [], options.inverse ? "DELETE" : "ADD");
        }
        pen = fluid.model.stepTargetAccess(holder.model, request.type, request.segs, 0, length - 1, options);
    }
    if (request.type === "ADD") {
        var value = request.value;
        var segs = fluid.makeArray(request.segs);
        fluid.model.applyChangeStrategy(pen.root, pen.last, length - 1, segs, value, options, atRoot);
    } else if (request.type === "DELETE") {
        if (pen.root && pen.root[pen.last] !== undefined) {
            delete pen.root[pen.last];
            if (options.changeMap) {
                fluid.model.setChangedPath(options, request.segs, "DELETE");
            }
        }
    } else {
        fluid.fail("Unrecognised change type of " + request.type);
    }
    return options.deltas ? options.deltaMap : null;
};

/**
 * A map and summary of the change content between objects.
 *
 * @typedef {Object} ModelDiff
 * @property {Object|String} changeMap - An isomorphic map of the object structures to values "ADD" or "DELETE"
 * indicating that values have been added/removed at that location. Note that in the case the object structure
 * differs at the root, `changeMap` will hold the plain String value "ADD" or "DELETE"
 * @property {Integer} changes - Counts the number of changes between the objects - The two objects are identical if
 * `changes === 0`.
 * @property {Integer} unchanged - Counts the number of leaf (primitive) values at which the two objects are
 * identical. Note that the current implementation will double-count, this summary should be considered indicative
 * rather than precise.
 */

// TODO: This algorithm is quite inefficient in that both models will be copied once each
// supported, PUBLIC API function
/**
 * Compare two models for equality using a deep algorithm. It is assumed that both models are JSON-equivalent and do
 * not contain circular links.
 *
 * @param {Any} modela - The first model to be compared
 * @param {Any} modelb - The second model to be compared
 * @param {ModelDiff} options - (optional) If supplied, will receive a map and summary of the change content between
 * the objects.
 *
 * @return {Boolean} - `true` if the models are identical
 */
fluid.model.diff = function (modela, modelb, options) {
    options = options || {changes: 0, unchanged: 0, changeMap: {}}; // current algorithm can't avoid the expense of changeMap
    var typea = fluid.typeCode(modela);
    var typeb = fluid.typeCode(modelb);
    var togo;
    if (typea === "primitive" && typeb === "primitive") {
        togo = fluid.model.isSameValue(modela, modelb);
    } else if (typea === "primitive" ^ typeb === "primitive") {
        togo = false;
    } else {
        // Apply both forward and reverse changes - if no changes either way, models are identical
        // "ADD" reported in the reverse direction must be accounted as a "DELETE"
        var holderb = {
            model: fluid.copy(modelb)
        };
        options.inverse = true;
        fluid.model.applyHolderChangeRequest(holderb, {value: modela, segs: [], type: "ADD"}, options);
        var holdera = {
            model: fluid.copy(modela)
        };
        options.inverse = false;
        fluid.model.applyHolderChangeRequest(holdera, {value: modelb, segs: [], type: "ADD"}, options);

        togo = options.changes === 0;
    }
    if (togo === false && options.changes === 0) { // catch all primitive cases
        options.changes = 1;
        options.changeMap = modelb === undefined ? "DELETE" : "ADD";
    } else if (togo === true && options.unchanged === 0) {
        options.unchanged = 1;
    }
    return togo;
};

fluid.outputWildcardMatches = function (matches, outSegs, root) {
    fluid.each(root, function (value, key) {
        matches.push(outSegs.concat(key));
    });
};

// Here we only support for now very simple expressions which have at most one
// wildcard which must appear in the final segment
fluid.matchChanges = function (changeMap, specSegs, newHolder, oldHolder) {
    var newRoot = newHolder.model;
    var oldRoot = oldHolder.model;
    var map = changeMap;
    var outSegs = ["model"];
    var wildcard = false;
    var togo = [];
    for (var i = 0; i < specSegs.length; ++i) {
        var seg = specSegs[i];
        if (seg === "*") {
            if (i === specSegs.length - 1) {
                wildcard = true;
            } else {
                fluid.fail("Wildcard specification in modelChanged listener is only supported for the final path segment: " + specSegs.join("."));
            }
        } else {
            outSegs.push(seg);
            map = fluid.isPrimitive(map) ? map : map[seg];
            newRoot = newRoot ? newRoot[seg] : undefined;
            oldRoot = oldRoot ? oldRoot[seg] : undefined;
        }
    }
    if (map) {
        if (wildcard) {
            if (typeof(map) === "string") {
                var allKeys = fluid.extend({}, oldRoot, newRoot);
                fluid.outputWildcardMatches(togo, outSegs, allKeys);
            } else {
                fluid.outputWildcardMatches(togo, outSegs, map);
            }
        } else {
            togo.push(outSegs);
        }
    }
    return togo;
};

fluid.storeExternalChange = function (transRec, applier, invalidPath, spec, args) {
    var pathString = applier.composeSegments.apply(null, invalidPath);
    var keySegs = [applier.holder.id, spec.listenerId, (spec.wildcard ? pathString : "")];
    var keyString = keySegs.join("|");
    // TODO: We think we probably have a bug in that notifications destined for end of transaction are actually continuously emitted during the transaction
    // No, we don't, becuase "changeMap" is only computed during commit, during the transaction we only compute "deltaMap"
    // These are unbottled in fluid.establishModelRelay's concludeTransaction
    transRec.externalChanges[keyString] = {listener: spec.listener, namespace: spec.namespace, priority: spec.priority, args: args};
};

fluid.notifyModelChanges = function (listeners, changeMap, newHolder, oldHolder, changeRequest, transaction, applier, that) {
    if (!listeners) {
        return;
    }
    var transRec = fluid.getModelTransactionRec(that, transaction.id);
    for (var i = 0; i < listeners.length; ++i) {
        var spec = listeners[i];
        var multiplePaths = spec.segsArray.length > 1; // does this spec listen on multiple paths? If so, don't rebase arguments and just report once per transaction
        for (var j = 0; j < spec.segsArray.length; ++j) {
            var invalidPaths = fluid.matchChanges(changeMap, spec.segsArray[j], newHolder, oldHolder);
            // We only have multiple invalidPaths here if there is a wildcard
            for (var k = 0; k < invalidPaths.length; ++k) {
                if (applier.destroyed) { // 2nd guarding point for FLUID-5592
                    return;
                }
                var invalidPath = invalidPaths[k];
                spec.listener = fluid.event.resolveListener(spec.listener);
                var args = [
                    multiplePaths ? newHolder.model : fluid.model.getSimple(newHolder, invalidPath),
                    multiplePaths ? oldHolder.model : fluid.model.getSimple(oldHolder, invalidPath),
                    multiplePaths ? [] : invalidPath.slice(1), changeRequest, transaction, applier
                ];
                // FLUID-5489: Do not notify of null changes which were reported as a result of invalidating a higher path
                // TODO: We can improve greatly on efficiency by i) reporting a special code from fluid.matchChanges which signals the difference between invalidating a higher and lower path,
                // ii) improving fluid.model.diff to create fewer intermediate structures and no copies
                // TODO: The relay invalidation system is broken and must always be notified (branch 1) - since our old/new value detection is based on the wrong (global) timepoints in the transaction here,
                // rather than the "last received model" by the holder of the transform document
                if (!spec.isRelay) {
                    var isNull = fluid.model.diff(args[0], args[1]);
                    if (isNull) {
                        continue;
                    }
                    var sourceExcluded = fluid.isExcludedChangeSource(transaction, spec);
                    if (sourceExcluded) {
                        continue;
                    }
                }
                // Note that the only reason there may not be a transRec is that we still (barely) support the standalone use of makeHolderChangeApplier
                if (transRec && !spec.isRelay && spec.transactional) { // bottle up genuine external changes so we can sort and dedupe them later
                    fluid.storeExternalChange(transRec, applier, invalidPath, spec, args);
                } else {
                    spec.listener.apply(null, args);
                }
            }
        }
    }
};

fluid.bindELMethods = function (applier) {
    applier.parseEL = function (EL) {
        return fluid.model.pathToSegments(EL, applier.options.resolverSetConfig);
    };
    applier.composeSegments = function () {
        return applier.options.resolverSetConfig.parser.compose.apply(null, arguments);
    };
};

// A standard "empty model" for the purposes of comparing initial state during the primordial transaction
fluid.emptyHolder = fluid.freezeRecursive({ model: undefined });

fluid.preFireChangeRequest = function (applier, changeRequest) {
    if (!changeRequest.type) {
        changeRequest.type = "ADD";
    }
    changeRequest.segs = changeRequest.segs || applier.parseEL(changeRequest.path);
};

// Automatically adapts change onto fireChangeRequest
fluid.bindRequestChange = function (that) {
    that.change = function (path, value, type, source) {
        var changeRequest = {
            path: path,
            value: value,
            type: type,
            source: source
        };
        that.fireChangeRequest(changeRequest);
    };
};

fluid.mergeChangeSources = function (target, globalSources) {
    if (fluid.isPlainObject(globalSources, true)) { // TODO: No test for this branch!
        fluid.extend(target, globalSources);
    } else {
        fluid.each(fluid.makeArray(globalSources), function (globalSource) {
            target[globalSource] = true;
        });
    }
};

// Notes on compound/composite transactions:
// Ever since the now long-standing model relay system was implemented for FLUID-5024 round about 2014, it has been
// recognised that model transactions need to be "composite" across the entire component tree. That is, all the parts
// of models touched by a network of relays across the tree need to be committed apparently (from the point of view of
// ModelListeners) atomically. This poses an odd design risk for the apparently programmatic ChangeApplier API which
// appears to promise to allow the user to commit an "individual" transaction using var trans = that.initiate();
// followed by trans.commit().
// This implies that hidden behind "trans.commit" needs to be the entire machinery to commit the transaction across the
// tree - and since this itself is compound, the coordination for the sub-steps of this operation including the
// so-called and malignantly named "half-transactional system" that governs relays.
// What is meant by "half-transactional"? What it means is that the data structures (newHolder + oldHolder) used to
// track updates through a transaction are somewhat abused as relay documents themselves are models and need to be
// updated apparently atomically, and BEFORE they are called upon to operate. Updates to model relay documents themselves
// need to be atomic since a partially updated relay document will be corrupt and do something malignant to the surrounding
// models. As a result, transactions have a special method "reset" which is used to mark such "pauses" partway through the
// overall transaction, resetting the transaction to its original state but not closing it out completely in the expectation
// that further updates may pass through as updates continue to slosh around the tree.
// This all occurs in the preCommit/postCommit hooks added to each individual transaction's events. We do not attempt
// to update any relay documents or indeed anything other than "newHolder" in each isolated transaction until a
// commit is actually requested via trans.commit(). Then all hell breaks loose - The workflow is as follows:
// i) preCommit for the transaction operates
//    a) updateRelays operates across the entire tree, expecting that all changes have been maximally relayed into relay
//       documents - it operates them, thus relaying any updates across their sources/targets to each other
//    b) commitRelays operates across the entire tree - committing every relay document, but also taking the time to commit
//       every ordinary transaction participant too (giving rise to the perplexing comment that stood in
//       fluid.model.commitRelays for 6 years)
//           The result of b) would ordinarily re-initiate this ENTIRE process across the tree again were it not for the
//           special argument "relay" provided which then aborts the elements of the sub-workflow when it is detected.
//           This is a nutty system which should be refactored to move all of the machinery onto a first-class cross-tree
//           "transaction" object which at present is just a dumb data structure held in instantiator.modelTransactions.
// ii) commit for the transaction operates - but note that because of i) b) we actually expect this to be a no-op since
//     it has already committed!
// iii) postCommit hooks then
//    a) notifyExternal notifies modelListeners around the skeleton in priority order
//    b) concludeAnyTreeTransaction concludes any component tree transaction that arose through lensed construction and
//       destruction of components

// Prototype for ChangeApplier so it is recognisable as "exotic" by cloning algorithms
fluid.ChangeApplier = function () {};

/** Main construction point for ChangeApplier. Named "holder" since it attaches to its target model at one higher level of
 * containment, in order to allow operating on models which consist entirely of primitive values or "undefined" - this containing
 * object is named its "holder", whose member "model" holds the model. The "holder" is ordinarily a component but the implementation
 * (just barely) supports the use of isolated ChangeAppliers and models (this technique is still used in the Model Transformation system
 * to construct the applier governing its output document)
 * @param {Component|Object} holder - The "holder" for the model to be managed by the ChangeApplier. This may be a Component or else (exceptionally) a plain object expecting a model in a member named "model"
 * @param {Object} options - (optional) Options governing the ChangeApplier. Primarily resolverSetConfig and resolverGetConfig which should not need to be configured.
 * @return {fluid.ChangeApplier} - The constructed ChangeApplier.
 */
fluid.makeHolderChangeApplier = function (holder, options) {
    options = fluid.model.defaultAccessorConfig(options);
    var applierId = fluid.allocateGuid();
    var that = new fluid.ChangeApplier();
    var name = fluid.isComponent(holder) ? "ChangeApplier for component " + fluid.dumpThat(holder) : "ChangeApplier with id " + applierId;
    $.extend(that, {
        applierId: applierId,
        holder: holder,
        listeners: fluid.makeEventFirer({name: "Internal change listeners for " + name}),
        transListeners: fluid.makeEventFirer({name: "External change listeners for " + name}),
        options: options,
        modelChanged: {},
        resourceMap: [], // list of records containing {segs: segs, fetchOne: fluid.fetchResources.FetchOne}
        earlyModelResolved: fluid.makeEventFirer({name: "earlyModelResolved event for " + name}),
        preCommit: fluid.makeEventFirer({name: "preCommit event for " + name}),
        postCommit: fluid.makeEventFirer({name: "postCommit event for " + name})
    });
    that.destroy = function () {
        that.preCommit.destroy();
        that.postCommit.destroy();
        that.destroyed = true;
    };
    that.modelChanged.addListener = function (spec, listener, namespace, softNamespace) {
        if (typeof(spec) === "string") {
            spec = {
                path: spec
            };
        } else {
            spec = fluid.copy(spec);
        }
        spec.listenerId = spec.listenerId || fluid.allocateGuid(); // FLUID-5151: don't use identifyListener since event.addListener will use this as a namespace
        spec.namespace = namespace;
        spec.softNamespace = softNamespace;
        if (typeof(listener) === "string") { // The reason for "globalName" is so that listener names can be resolved on first use and not on registration
            listener = {globalName: listener};
        }
        spec.listener = listener;
        if (spec.transactional !== false) {
            spec.transactional = true;
        }
        if (!spec.segsArray) { // It's a manual registration
            if (spec.path !== undefined) {
                spec.segs = spec.segs || that.parseEL(spec.path);
            }
            spec.segsArray = [spec.segs];
        }
        if (!spec.isRelay) {
            // This acts for listeners registered externally. For relays, the exclusion spec is stored in "cond"
            fluid.parseSourceExclusionSpec(spec, spec);
            spec.wildcard = fluid.accumulate(fluid.transform(spec.segsArray, function (segs) {
                return fluid.contains(segs, "*");
            }), fluid.add, 0);
            if (spec.wildcard && spec.segsArray.length > 1) {
                fluid.fail("Error in model listener specification ", spec, " - you may not supply a wildcard pattern as one of a set of multiple paths to be matched");
            }
        }
        var firer = that[spec.transactional ? "transListeners" : "listeners"];
        firer.addListener(spec);
        return spec; // return is used in registerModelListeners
    };
    that.modelChanged.removeListener = function (listener) {
        that.listeners.removeListener(listener);
        that.transListeners.removeListener(listener);
    };
    that.fireChangeRequest = function (changeRequest) {
        var initTransaction = fluid.findInitModelTransaction(holder);
        if (initTransaction) {
            initTransaction.transaction.fireChangeRequest(changeRequest);
        } else {
            var ation = that.initiate("local", changeRequest.source);
            ation.fireChangeRequest(changeRequest);
            ation.commit();
        }
    };

    /**
     * Initiate a fresh transaction on this applier, perhaps coordinated with other transactions sharing the same id across the component tree
     * Arguments all optional
     * @param {String} localSource - "local", "relay" or null Local source identifiers only good for transaction's representative on this applier
     * @param {String|Array|Object} globalSources - Global source identifiers common across this transaction, expressed as a single string, an array of strings, or an object with a "toString" method.
     * @param {String} transactionId - Global transaction id to enlist with.
     * @return {Object} - The component initiating the change.
     */
    that.initiate = function (localSource, globalSources, transactionId) {
        localSource = globalSources === "init" ? null : (localSource || "local"); // supported values for localSource are "local" and "relay" - globalSource of "init" defeats defaulting of localSource to "local"
        // defeatPost is supplied for all non-top-level transactions as well as init transactions, which commit separately in notifyInitModelWorkflow
        var defeatPost = localSource === "relay" || globalSources === "init";
        var trans = {
            instanceId: fluid.allocateGuid(), // for debugging only - the representative of this transction on this applier
            id: transactionId || fluid.allocateGuid(), // The global transaction id across all appliers - allocate here if this is the starting point
            changeRecord: {
                resolverSetConfig: options.resolverSetConfig, // here to act as "options" in applyHolderChangeRequest
                resolverGetConfig: options.resolverGetConfig
            },
            /** Method for internal use only - we "reset" a transaction after we have committed changes to relay documents and are ready for
             * a fresh round of propagation.
             */
            reset: function () {
                trans.oldHolder = holder;
                trans.newHolder = { model: fluid.copy(holder.model) };
                trans.changeRecord.changes = 0;
                trans.changeRecord.unchanged = 0; // just for type consistency - we don't use these values in the ChangeApplier
                trans.changeRecord.changeMap = {};
            },
            /** Commit this transaction. The argument `code` is for internal use only, and takes the value "relay" when
             * we are committing changes to relay documents across the transaction, partway through a full transaction or at its overall conclusion.
             * @param {String} [code] - Optional, internal use argument indicating the purpose of the commit. Can take the value "relay".
             */
            commit: function (code) {
                if (code !== "relay") {
                    that.preCommit.fire(trans, that, code);
                }
                if (trans.changeRecord.changes > 0) {
                    var oldHolder = {model: holder.model};
                    holder.model = trans.newHolder.model;
                    fluid.notifyModelChanges(that.transListeners.sortedListeners, trans.changeRecord.changeMap, holder, oldHolder, null, trans, that, holder);
                }
                if (!defeatPost && code !== "relay") {
                    that.postCommit.fire(trans, that, code);
                }
            },
            fireChangeRequest: function (changeRequest) {
                fluid.preFireChangeRequest(that, changeRequest);
                changeRequest.transactionId = trans.id;
                var deltaMap = fluid.model.applyHolderChangeRequest(trans.newHolder, changeRequest, trans.changeRecord);
                fluid.notifyModelChanges(that.listeners.sortedListeners, deltaMap, trans.newHolder, holder, changeRequest, trans, that, holder);
            },
            hasChangeSource: function (source) {
                return trans.fullSources[source];
            }
        };
        var transRec = fluid.getModelTransactionRec(holder, trans.id);
        if (transRec) {
            fluid.mergeChangeSources(transRec.sources, globalSources);
            trans.sources = transRec.sources;
            trans.fullSources = Object.create(transRec.sources);
            if (localSource) {
                trans.fullSources[localSource] = true;
            }
        }
        trans.reset();
        fluid.bindRequestChange(trans);
        return trans;
    };

    fluid.bindRequestChange(that);
    fluid.bindELMethods(that);
    return that;
};

/**
 * Calculates the changes between the model values 'value' and 'oldValue' and returns an array of change records.
 * The optional argument 'changePathPrefix' is prepended to the change path of each record (this is useful for
 * generating change records to be applied at a non-root path in a model). The returned array of
 * change records may be used with fluid.fireChanges().
 *
 * @param {Any} value - Model value to compare.
 * @param {Any} oldValue - Model value to compare.
 * @param {String|Array} [changePathPrefix] - [optional] Path prefix to prepend to change record paths, expressed as a string or an array of string segments.
 * @return {Array} - An array of change record objects.
 */
fluid.modelPairToChanges = function (value, oldValue, changePathPrefix) {
    changePathPrefix = changePathPrefix || "";

    // Calculate the diff between value and oldValue
    var diffOptions = {changes: 0, unchanged: 0, changeMap: {}};
    fluid.model.diff(oldValue, value, diffOptions);

    var changes = [];

    // Recursively process the diff to generate an array of change
    // records, stored in 'changes'
    fluid.modelPairToChangesImpl(value,
        fluid.pathUtil.parseEL(changePathPrefix),
        diffOptions.changeMap, [], changes);

    return changes;
};

/**
 * This function implements recursive processing for fluid.modelPairToChanges(). It builds an array of change
 * records, accumulated in the 'changes' argument, by walking the 'changeMap' structure and 'value' model value.
 * As we walk down the model, our path from the root of the model is recorded in
 * the 'changeSegs' argument.
 *
 * @param {Any} value - Model value
 * @param {String[]} changePathPrefixSegs - Path prefix to prepend to change record paths, expressed as an array of string segments.
 * @param {String|Object} changeMap - The changeMap structure from fluid.model.diff().
 * @param {String[]} changeSegs - Our path relative to the model value root, expressed as an array of string segments.
 * @param {Object[]} changes - The accumulated change record objects.
 */
fluid.modelPairToChangesImpl = function (value, changePathPrefixSegs, changeMap, changeSegs, changes) {
    if (changeMap === "ADD") {
        // The whole model value is new
        changes.push({
            path: changePathPrefixSegs,
            value: value,
            type: "ADD"
        });
    } else if (changeMap === "DELETE") {
        // The whole model value has been deleted
        changes.push({
            path: changePathPrefixSegs,
            value: null,
            type: "DELETE"
        });
    } else if (fluid.isPlainObject(changeMap, true)) {
        // Something within the model value has changed
        fluid.each(changeMap, function (change, seg) {
            var currentChangeSegs = changeSegs.concat([seg]);
            if (change === "ADD") {
                changes.push({
                    path: changePathPrefixSegs.concat(currentChangeSegs),
                    value: fluid.get(value, currentChangeSegs),
                    type: "ADD"
                });
            } else if (change === "DELETE") {
                changes.push({
                    path: changePathPrefixSegs.concat(currentChangeSegs),
                    value: null,
                    type: "DELETE"
                });
            } else if (fluid.isPlainObject(change, true)) {
                // Recurse down the tree of changes
                fluid.modelPairToChangesImpl(value, changePathPrefixSegs,
                    change, currentChangeSegs, changes);
            }
        });
    }
};
