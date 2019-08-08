/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /** NOTE: The contents of this file are by default NOT PART OF THE PUBLIC FLUID API unless explicitly annotated before the function **/

    /* The Fluid "IoC System proper" - resolution of references and
     * completely automated instantiation of declaratively defined
     * component trees */

    fluid.visitComponentChildren = function (that, visitor, options, segs) {
        segs = segs || [];
        var shadow = fluid.shadowForComponent(that);
        for (var name in shadow.childComponents) {
            var component = shadow.childComponents[name];
            if (options.visited && options.visited[component.id]) {
                continue;
            }
            segs.push(name);
            if (options.visited) { // recall that this is here because we may run into a component that has been cross-injected which might otherwise cause cyclicity
                options.visited[component.id] = true;
            }
            if (visitor(component, name, segs, segs.length - 1)) {
                return true;
            }
            if (!options.flat) {
                fluid.visitComponentChildren(component, visitor, options, segs);
            }
            segs.pop();
        }
    };

    fluid.getContextHash = function (instantiator, that) {
        var shadow = instantiator.idToShadow[that.id];
        return shadow && shadow.contextHash;
    };

    fluid.componentHasGrade = function (that, gradeName) {
        var contextHash = fluid.getContextHash(fluid.globalInstantiator, that);
        return !!(contextHash && contextHash[gradeName]);
    };

    // A variant of fluid.visitComponentChildren that supplies the signature expected for fluid.matchIoCSelector
    // this is: thatStack, contextHashes, memberNames, i - note, the supplied arrays are NOT writeable and shared through the iteration
    fluid.visitComponentsForMatching = function (that, options, visitor) {
        var instantiator = fluid.getInstantiator(that);
        options = $.extend({
            visited: {},
            instantiator: instantiator
        }, options);
        var thatStack = [that];
        var contextHashes = [fluid.getContextHash(instantiator, that)];
        var visitorWrapper = function (component, name, segs) {
            thatStack.length = 1;
            contextHashes.length = 1;
            for (var i = 0; i < segs.length; ++i) {
                var child = thatStack[i][segs[i]];
                thatStack[i + 1] = child;
                contextHashes[i + 1] = fluid.getContextHash(instantiator, child) || {};
            }
            return visitor(component, thatStack, contextHashes, segs, segs.length);
        };
        fluid.visitComponentChildren(that, visitorWrapper, options, []);
    };

    fluid.getMemberNames = function (instantiator, thatStack) {
        if (thatStack.length === 0) { // Odd edge case for FLUID-6126 from fluid.computeDistributionPriority
            return [];
        } else {
            var path = instantiator.idToPath(thatStack[thatStack.length - 1].id);
            var segs = instantiator.parseEL(path);
                // TODO: we should now have no longer shortness in the stack
            segs.unshift.apply(segs, fluid.generate(thatStack.length - segs.length, ""));
            return segs;
        }
    };

    // thatStack contains an increasing list of MORE SPECIFIC thats.
    // this visits all components starting from the current location (end of stack)
    // in visibility order UP the tree.
    fluid.visitComponentsForVisibility = function (instantiator, thatStack, visitor, options) {
        options = options || {
            visited: {},
            flat: true,
            instantiator: instantiator
        };
        var memberNames = fluid.getMemberNames(instantiator, thatStack);
        for (var i = thatStack.length - 1; i >= 0; --i) {
            var that = thatStack[i];

            // explicitly visit the direct parent first
            options.visited[that.id] = true;
            if (visitor(that, memberNames[i], memberNames, i)) {
                return;
            }

            if (fluid.visitComponentChildren(that, visitor, options, memberNames)) {
                return;
            }
            memberNames.pop();
        }
    };

    fluid.mountStrategy = function (prefix, root, toMount) {
        var offset = prefix.length;
        return function (target, name, i, segs) {
            if (i <= prefix.length) { // Avoid OOB to not trigger deoptimisation!
                return;
            }
            for (var j = 0; j < prefix.length; ++j) {
                if (segs[j] !== prefix[j]) {
                    return;
                }
            }
            return toMount(target, name, i - prefix.length, segs.slice(offset));
        };
    };

    fluid.invokerFromRecord = function (invokerec, name, that) {
        fluid.pushActivity("makeInvoker", "beginning instantiation of invoker with name %name and record %record as child of %that",
            {name: name, record: invokerec, that: that});
        var invoker = invokerec ? fluid.makeInvoker(that, invokerec, name) : undefined;
        fluid.popActivity();
        return invoker;
    };

    fluid.memberFromRecord = function (memberrecs, name, that) {
        var togo;
        for (var i = 0; i < memberrecs.length; ++i) { // memberrecs is the special "fluid.mergingArray" type which is not Arrayable
            var expanded = fluid.expandImmediate(memberrecs[i], that);
            if (!fluid.isPlainObject(togo)) { // poor man's "merge" algorithm to hack FLUID-5668 for now
                togo = expanded;
            } else {
                togo = $.extend(true, togo, expanded);
            }
        }
        return togo;
    };

    fluid.resourceFromRecord = function (resourceRec, name, that) {
        var resourceFetcher = fluid.getForComponent(that, "resourceFetcher");
        var resourceSpec = resourceFetcher.resourceSpecs[name];
        var oneFetcher = new fluid.fetchResources.FetchOne(resourceSpec, resourceFetcher);
        var promise = oneFetcher.resourceSpec.promise;
        if (!promise.disposition) {
            var transRec = fluid.currentTreeTransaction();
            transRec.pendingIO.push(promise);
        } // No error handling here since the error handler added in workflows will abort the whole transaction
        return oneFetcher;
    };

    /** Produce a "strategy" object which mechanises the work of converting a block of options material into a
     * a live piece of component machinery to be mounted onto the component - e.g. an invoker, event, member or resource
     * @param {Component} that - The component currently instantiating
     * @param {Object} options - The component's currently evaluating options structure
     * @param {Strategy} optionsStrategy - A "strategy" function which can drive further evaluation of the options structure
     * @param {String} recordPath - A single path segment into the options structure which indexes the options records to be consumed
     * @param {Function} recordMaker - A function converting an evaluated block of options into the material to be mounted,
     * e.g. `fluid.invokerFromRecord`. Signature to this function is (Object options, String key, Component that).
     * @param {String} prefix - Any prefix to be added to the path into options in order to generate the path into the final mounted material
     * @param {Object} [exceptions] - Hack for FLUID-5668. Some exceptions to not undergo "flood" initialisation during `initter` since they
     * self-initialise by some customised scheme
     * @return {RecordStrategy} - A structure with two function members -
     *    {Strategy} strategy: A upstream function strategy by which evaluation of the mounted material can itself be driven
     *    {Function} initter: A function which can be used to trigger final "flood" initialisation of all material which has not so far been
     *    referenced.
     */
    fluid.recordStrategy = function (that, options, optionsStrategy, recordPath, recordMaker, prefix, exceptions) {
        prefix = prefix || [];
        return {
            strategy: function (target, name, i) {
                if (i !== 1) { // Strange hack added for forgotten reason
                    return;
                }
                var record = fluid.driveStrategy(options, [recordPath, name], optionsStrategy);
                if (record === undefined) {
                    return;
                }
                fluid.set(target, [name], fluid.inEvaluationMarker);
                var member = recordMaker(record, name, that);
                fluid.set(target, [name], member);
                return member;
            },
            initter: function () {
                var records = fluid.driveStrategy(options, recordPath, optionsStrategy) || {};
                for (var name in records) {
                    if (!exceptions || !exceptions[name]) {
                        fluid.getForComponent(that, prefix.concat([name]));
                    }
                }
            }
        };
    };

    fluid.makeDistributionRecord = function (contextThat, sourceRecord, sourcePath, targetSegs, exclusions, sourceType) {
        sourceType = sourceType || "distribution";
        fluid.pushActivity("makeDistributionRecord", "Making distribution record from source record %sourceRecord path %sourcePath to target path %targetSegs", {sourceRecord: sourceRecord, sourcePath: sourcePath, targetSegs: targetSegs});

        var source = fluid.copy(fluid.get(sourceRecord, sourcePath));
        fluid.each(exclusions, function (exclusion) {
            fluid.model.applyChangeRequest(source, {segs: exclusion, type: "DELETE"});
        });

        var record = {options: {}};
        fluid.model.applyChangeRequest(record, {segs: targetSegs, type: "ADD", value: source});
        fluid.checkComponentRecord(record, fluid.componentRecordExpected);
        fluid.popActivity();
        return $.extend(record, {contextThat: contextThat, recordType: sourceType});
    };

    // Part of the early "distributeOptions" workflow. Given the description of the blocks to be distributed, assembles "canned" records
    // suitable to be either registered into the shadow record for later or directly pushed to an existing component, as well as honouring
    // any "removeSource" annotations by removing these options from the source block.
    fluid.filterBlocks = function (contextThat, sourceBlocks, sourceSegs, targetSegs, exclusions, removeSource) {
        var togo = [];
        fluid.each(sourceBlocks, function (block) {
            var source = fluid.get(block.source, sourceSegs);
            if (source !== undefined) {
                togo.push(fluid.makeDistributionRecord(contextThat, block.source, sourceSegs, targetSegs, exclusions, "distribution"));
                var rescued = $.extend({}, source);
                if (removeSource) {
                    fluid.model.applyChangeRequest(block.source, {segs: sourceSegs, type: "DELETE"});
                }
                fluid.each(exclusions, function (exclusion) {
                    var orig = fluid.get(rescued, exclusion);
                    fluid.set(block.source, sourceSegs.concat(exclusion), orig);
                });
            }
        });
        return togo;
    };

    // Use this peculiar signature since the actual component and shadow itself may not exist yet. Perhaps clean up with FLUID-4925
    fluid.noteCollectedDistribution = function (parentShadow, memberName, distribution) {
        fluid.model.setSimple(parentShadow, ["collectedDistributions", memberName, distribution.id], true);
    };

    fluid.isCollectedDistribution = function (parentShadow, memberName, distribution) {
        return fluid.model.getSimple(parentShadow, ["collectedDistributions", memberName, distribution.id]);
    };

    fluid.clearCollectedDistributions = function (parentShadow, memberName) {
        fluid.model.applyChangeRequest(parentShadow, {segs: ["collectedDistributions", memberName], type: "DELETE"});
    };

    fluid.collectDistributions = function (distributedBlocks, parentShadow, distribution, thatStack, contextHashes, memberNames, i) {
        var lastMember = memberNames[memberNames.length - 1];
        if (!fluid.isCollectedDistribution(parentShadow, lastMember, distribution) &&
                fluid.matchIoCSelector(distribution.selector, thatStack, contextHashes, memberNames, i)) {
            distributedBlocks.push.apply(distributedBlocks, distribution.blocks);
            fluid.noteCollectedDistribution(parentShadow, lastMember, distribution);
        }
    };

    // Slightly silly function to clean up the "appliedDistributions" records. In general we need to be much more aggressive both
    // about clearing instantiation garbage (e.g. onCreate and most of the shadow)
    // as well as caching frequently-used records such as the "thatStack" which
    // would mean this function could be written in a sensible way
    fluid.registerCollectedClearer = function (shadow, parentShadow, memberName) {
        if (!shadow.collectedClearer && parentShadow) {
            shadow.collectedClearer = function () {
                fluid.clearCollectedDistributions(parentShadow, memberName);
            };
        }
    };

    fluid.receiveDistributions = function (parentThat, gradeNames, memberName, that) {
        var instantiator = fluid.getInstantiator(parentThat || that);
        var thatStack = instantiator.getThatStack(parentThat || that); // most specific is at end
        thatStack.unshift(fluid.rootComponent);
        var memberNames = fluid.getMemberNames(instantiator, thatStack);
        var shadows = fluid.transform(thatStack, function (thisThat) {
            return instantiator.idToShadow[thisThat.id];
        });
        var parentShadow = shadows[shadows.length - (parentThat ? 1 : 2)];
        var contextHashes = fluid.getMembers(shadows, "contextHash");
        if (parentThat) { // if called before construction of component from initComponentShell
            memberNames.push(memberName);
            contextHashes.push(fluid.gradeNamesToHash(gradeNames));
            thatStack.push(that);
        } else {
            fluid.registerCollectedClearer(shadows[shadows.length - 1], parentShadow, memberNames[memberNames.length - 1]);
        }
        var distributedBlocks = [];
        for (var i = 0; i < thatStack.length - 1; ++i) {
            fluid.each(shadows[i].distributions, function (distribution) { // eslint-disable-line no-loop-func
                fluid.collectDistributions(distributedBlocks, parentShadow, distribution, thatStack, contextHashes, memberNames, i);
            });
        }
        return distributedBlocks;
    };

    fluid.computeTreeDistance = function (path1, path2) {
        var i = 0;
        while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
            ++i;
        }
        return path1.length + path2.length - 2*i; // eslint-disable-line space-infix-ops
    };

    // Called from applyDistributions (immediate application route) as well as mergeRecordsToList (pre-instantiation route) AS WELL AS assembleCreatorArguments (pre-pre-instantiation route)
    fluid.computeDistributionPriority = function (targetThat, distributedBlock) {
        if (!distributedBlock.priority) {
            var instantiator = fluid.getInstantiator(targetThat);
            var targetStack = instantiator.getThatStack(targetThat);
            var targetPath = fluid.getMemberNames(instantiator, targetStack);
            var sourceStack = instantiator.getThatStack(distributedBlock.contextThat);
            var sourcePath = fluid.getMemberNames(instantiator, sourceStack);
            var distance = fluid.computeTreeDistance(targetPath, sourcePath);
            distributedBlock.priority = fluid.mergeRecordTypes.distribution - distance;
        }
        return distributedBlock;
    };

    // convert "preBlocks" as produced from fluid.filterBlocks into "real blocks" suitable to be used by the expansion machinery.
    fluid.applyDistributions = function (that, preBlocks, targetShadow) {
        var distributedBlocks = fluid.transform(preBlocks, function (preBlock) {
            return fluid.generateExpandBlock(preBlock, that, targetShadow.mergePolicy);
        }, function (distributedBlock) {
            return fluid.computeDistributionPriority(that, distributedBlock);
        });
        var mergeOptions = targetShadow.mergeOptions;
        mergeOptions.mergeBlocks.push.apply(mergeOptions.mergeBlocks, distributedBlocks);
        mergeOptions.updateBlocks();
        return distributedBlocks;
    };

    // TODO: This implementation is obviously poor and has numerous flaws - in particular it does no backtracking as well as matching backwards through the selector
    /** Match a parsed IoC selector against a selection of data structures representing a component's tree context.
     * @param {ParsedSelector} selector - A parsed selector structure as returned from `fluid.parseSelector`.
     * @param {Component[]} thatStack - An array of components ascending up the tree from the component being matched,
     * which will be held in the last position.
     * @param {Object[]} contextHashes - An array of context hashes as cached in the component's shadows - a hash to
     * `true`/"memberName" depending on the reason the context matches
     * @param {String[]} [memberNames] - An array of member names of components in their parents. This is only used in the distributeOptions route.
     * @param {Number} i - One plus the index of the IoCSS head component within `thatStack` - all components before this
     * index will be ignored for matching. Will have value `1` in the queryIoCSelector route.
     * @return {Boolean} `true` if the selector matches the leaf component at the end of `thatStack`
     */
    fluid.matchIoCSelector = function (selector, thatStack, contextHashes, memberNames, i) {
        var thatpos = thatStack.length - 1;
        var selpos = selector.length - 1;
        while (true) {
            var isChild = selector[selpos].child;
            var mustMatchHere = thatpos === thatStack.length - 1 || isChild;

            var that = thatStack[thatpos];
            var selel = selector[selpos];
            var match = true;
            for (var j = 0; j < selel.predList.length; ++j) {
                var pred = selel.predList[j];
                var context = pred.context;
                if (context && context !== "*" && !(contextHashes[thatpos][context] || memberNames[thatpos] === context)) {
                    match = false;
                    break;
                }
                if (pred.id && that.id !== pred.id) {
                    match = false;
                    break;
                }
            }
            if (selpos === 0 && thatpos > i && mustMatchHere && isChild) {
                match = false; // child selector must exhaust stack completely - FLUID-5029
            }
            if (match) {
                if (selpos === 0) {
                    return true;
                }
                --thatpos;
                --selpos;
            }
            else {
                if (mustMatchHere) {
                    return false;
                }
                else {
                    --thatpos;
                }
            }
            if (thatpos < i) {
                return false;
            }
        }
    };

    /** Query for all components matching a selector in a particular tree
     * @param {Component} root - The root component at which to start the search
     * @param {String} selector - An IoCSS selector, in form of a string. Note that since selectors supplied to this function implicitly
     * match downwards, they need not contain the "head context" followed by whitespace required in the distributeOptions form. E.g.
     * simply <code>"fluid.viewComponent"</code> will match all viewComponents below the root.
     * @param {Boolean} flat - [Optional] <code>true</code> if the search should just be performed at top level of the component tree
     * Note that with <code>flat=true</code> this search will scan every component in the tree and may well be very slow.
     * @return {Component[]} The list of all components matching the selector
     */
    // supported, PUBLIC API function
    fluid.queryIoCSelector = function (root, selector, flat) {
        var parsed = fluid.parseSelector(selector, fluid.IoCSSMatcher);
        var togo = [];

        fluid.visitComponentsForMatching(root, {flat: flat}, function (that, thatStack, contextHashes) {
            if (fluid.matchIoCSelector(parsed, thatStack, contextHashes, [], 1)) {
                togo.push(that);
            }
        });
        return togo;
    };

    fluid.isIoCSSSelector = function (context) {
        return context.indexOf(" ") !== -1; // simple-minded check for an IoCSS reference
    };

    fluid.pushDistributions = function (targetHead, selector, target, blocks) {
        var targetShadow = fluid.shadowForComponent(targetHead);
        var id = fluid.allocateGuid();
        var distribution = {
            id: id, // This id is used in clearDistributions
            target: target, // Here for improved debuggability - info is duplicated in "selector"
            selector: selector,
            blocks: blocks
        };
        Object.freeze(distribution);
        Object.freeze(distribution.blocks);
        fluid.pushArray(targetShadow, "distributions", distribution);
        return id;
    };

    fluid.clearDistribution = function (targetHeadId, id) {
        var targetHeadShadow = fluid.globalInstantiator.idToShadow[targetHeadId];
        // By FLUID-6193, the head component may already have been destroyed, in which case the distributions are gone,
        // and we have leaked only its id. In theory we may want to re-establish the distribution if the head is
        // re-created, but that is a far wider issue.
        if (targetHeadShadow) {
            fluid.remove_if(targetHeadShadow.distributions, function (distribution) {
                return distribution.id === id;
            });
        }
    };

    fluid.clearDistributions = function (shadow) {
        fluid.each(shadow.outDistributions, function (outDist) {
            fluid.clearDistribution(outDist.targetHeadId, outDist.distributionId);
        });
    };

    // Modifies a parsed selector to extract and remove its head context which will be matched upwards
    fluid.extractSelectorHead = function (parsedSelector) {
        var predList = parsedSelector[0].predList;
        var context = predList[0].context;
        predList.length = 0;
        return context;
    };

    fluid.parseExpectedOptionsPath = function (path, role) {
        var segs = fluid.model.parseEL(path);
        if (segs[0] !== "options") {
            fluid.fail("Error in options distribution path ", path, " - only " + role + " paths beginning with \"options\" are supported");
        }
        return segs.slice(1);
    };

    fluid.replicateProperty = function (source, property, targets) {
        if (source[property] !== undefined) {
            fluid.each(targets, function (target) {
                target[property] = source[property];
            });
        }
    };

    fluid.undistributableOptions = ["gradeNames", "distributeOptions", "argumentMap", "mergePolicy"]; // automatically added to "exclusions" of every distribution

    fluid.distributeOptionsOne = function (that, record, targetRef, selector, context) {
        fluid.pushActivity("distributeOptions", "parsing distributeOptions block %record %that ", {that: that, record: record});
        var targetHead = fluid.resolveContext(context, that);
        if (!targetHead) {
            fluid.fail("Error in options distribution record ", record, " - could not resolve context {" + context + "} to a head component");
        }
        var thatShadow = fluid.shadowForComponent(that);
        var targetSegs = fluid.model.parseEL(targetRef.path);
        var preBlocks;
        if (record.record !== undefined) {
            preBlocks = [(fluid.makeDistributionRecord(that, record.record, [], targetSegs, []))];
        }
        else {
            var source = fluid.parseContextReference(record.source);
            if (source.context !== "that") {
                fluid.fail("Error in options distribution record ", record, " only a source context of {that} is supported");
            }
            var sourceSegs = fluid.parseExpectedOptionsPath(source.path, "source");
            var fullExclusions = fluid.makeArray(record.exclusions).concat(sourceSegs.length === 0 ? fluid.undistributableOptions : []);

            var exclusions = fluid.transform(fullExclusions, function (exclusion) {
                return fluid.model.parseEL(exclusion);
            });

            preBlocks = fluid.filterBlocks(that, thatShadow.mergeOptions.mergeBlocks, sourceSegs, targetSegs, exclusions, record.removeSource);
            thatShadow.mergeOptions.updateBlocks(); // perhaps unnecessary
        }
        fluid.replicateProperty(record, "priority", preBlocks);
        fluid.replicateProperty(record, "namespace", preBlocks);
        // TODO: inline material has to be expanded in its original context!

        if (selector) {
            var distributionId = fluid.pushDistributions(targetHead, selector, record.target, preBlocks);
            thatShadow.outDistributions = thatShadow.outDistributions || [];
            thatShadow.outDistributions.push({
                targetHeadId: targetHead.id,
                distributionId: distributionId
            });
        }
        else { // The component exists now, we must rebalance it
            var targetShadow = fluid.shadowForComponent(targetHead);
            fluid.applyDistributions(that, preBlocks, targetShadow);
        }
        fluid.popActivity();
    };

    /* Evaluate the `distributeOptions` block in the options of a component, and mount the distribution in the appropriate
     * shadow for components yet to be constructed, or else apply it immediately to the merge blocks of any target
     * which is currently in evaluation.
     * This occurs early during the evaluation phase of the source component, during `fluid.computeComponentAccessor`
     */
    fluid.distributeOptions = function (that, optionsStrategy) {
        var records = fluid.driveStrategy(that.options, "distributeOptions", optionsStrategy);
        fluid.each(records, function distributeOptionsOne(record) {
            if (typeof(record.target) !== "string") {
                fluid.fail("Error in options distribution record ", record, " a member named \"target\" must be supplied holding an IoC reference");
            }
            if (typeof(record.source) === "string" ^ record.record === undefined) {
                fluid.fail("Error in options distribution record ", record, ": must supply either a member \"source\" holding an IoC reference or a member \"record\" holding a literal record");
            }
            var targetRef = fluid.parseContextReference(record.target);
            var selector, context;
            if (fluid.isIoCSSSelector(targetRef.context)) {
                selector = fluid.parseSelector(targetRef.context, fluid.IoCSSMatcher);
                context = fluid.extractSelectorHead(selector);
            }
            else {
                context = targetRef.context;
            }
            if (context === "/" || context === "that") {
                fluid.distributeOptionsOne(that, record, targetRef, selector, context);
            } else {
                var transRec = fluid.currentTreeTransaction();
                transRec.deferredDistributions.push({that: that, record: record, targetRef: targetRef, selector: selector, context: context});
            }
        });
    };

    fluid.gradeNamesToHash = function (gradeNames) {
        var contextHash = {};
        fluid.each(gradeNames, function (gradeName) {
            contextHash[gradeName] = true;
            contextHash[fluid.computeNickName(gradeName)] = true;
        });
        return contextHash;
    };

    fluid.cacheShadowGrades = function (that, shadow) {
        var contextHash = fluid.gradeNamesToHash(that.options && that.options.gradeNames || [that.typeName]);
        if (!contextHash[shadow.memberName]) {
            contextHash[shadow.memberName] = "memberName"; // This is filtered out again in recordComponent - TODO: Ensure that ALL resolution uses the scope chain eventually
        }
        shadow.contextHash = contextHash;
        fluid.each(contextHash, function (troo, context) {
            shadow.ownScope[context] = that;
            if (shadow.parentShadow && shadow.parentShadow.that.type !== "fluid.rootComponent") {
                shadow.parentShadow.childrenScope[context] = that;
            }
        });
    };

    // First sequence point where the mergeOptions strategy is delivered from Fluid.js - here we take care
    // of both receiving and transmitting options distributions
    fluid.deliverOptionsStrategy = function (that, target, mergeOptions) {
        var shadow = fluid.shadowForComponent(that, shadow);
        fluid.cacheShadowGrades(that, shadow);
        shadow.mergeOptions = mergeOptions;
    };

    /** Dynamic grade closure algorithm - the following 4 functions share access to a small record structure "rec" which is
     * constructed at the start of fluid.computeDynamicGrades
     */

    fluid.collectDistributedGrades = function (rec) {
        // Receive distributions first since these may cause arrival of more contextAwareness blocks.
        var distributedBlocks = fluid.receiveDistributions(null, null, null, rec.that);
        if (distributedBlocks.length > 0) {
            var readyBlocks = fluid.applyDistributions(rec.that, distributedBlocks, rec.shadow);
            var gradeNamesList = fluid.transform(fluid.getMembers(readyBlocks, ["source", "gradeNames"]), fluid.makeArray);
            fluid.accumulateDynamicGrades(rec, fluid.flatten(gradeNamesList));
        }
    };

    // Apply a batch of freshly acquired plain dynamic grades to the target component and recompute its options
    fluid.applyDynamicGrades = function (rec) {
        rec.oldGradeNames = fluid.makeArray(rec.gradeNames);
        // Note that this crude algorithm doesn't allow us to determine which grades are "new" and which not // TODO: can no longer interpret comment
        var newDefaults = fluid.copy(fluid.getMergedDefaults(rec.that.typeName, rec.gradeNames));
        rec.gradeNames.length = 0; // acquire derivatives of dynamic grades (FLUID-5054)
        rec.gradeNames.push.apply(rec.gradeNames, newDefaults.gradeNames);

        fluid.each(rec.gradeNames, function (gradeName) {
            if (!fluid.isIoCReference(gradeName)) {
                rec.seenGrades[gradeName] = true;
            }
        });

        var shadow = rec.shadow;
        fluid.cacheShadowGrades(rec.that, shadow);
        // This cheap strategy patches FLUID-5091 for now - some more sophisticated activity will take place
        // at this site when we have a full fix for FLUID-5028
        shadow.mergeOptions.destroyValue(["mergePolicy"]);
        // TODO: Why do we do this given as we decided we are not responsive to it?
        shadow.mergeOptions.destroyValue(["components"]);
        shadow.mergeOptions.destroyValue(["invokers"]);

        rec.defaultsBlock.source = newDefaults;
        shadow.mergeOptions.updateBlocks();
        shadow.mergeOptions.computeMergePolicy(); // TODO: we should really only do this if its content changed - this implies moving all options evaluation over to some (cheap) variety of the ChangeApplier

        fluid.accumulateDynamicGrades(rec, newDefaults.gradeNames);
    };

    // Filter some newly discovered grades into their plain and dynamic queues
    fluid.accumulateDynamicGrades = function (rec, newGradeNames) {
        fluid.each(newGradeNames, function (gradeName) {
            if (!rec.seenGrades[gradeName]) {
                if (fluid.isIoCReference(gradeName)) {
                    rec.rawDynamic.push(gradeName);
                    rec.seenGrades[gradeName] = true;
                } else if (!fluid.contains(rec.oldGradeNames, gradeName)) {
                    rec.plainDynamic.push(gradeName);
                }
            }
        });
    };

    fluid.computeDynamicGrades = function (that, shadow, strategy) {
        delete that.options.gradeNames; // Recompute gradeNames for FLUID-5012 and others
        var gradeNames = fluid.driveStrategy(that.options, "gradeNames", strategy); // Just acquire the reference and force eval of mergeBlocks "target", contents are wrong
        gradeNames.length = 0;
        // TODO: In complex distribution cases, a component might end up with multiple default blocks
        var defaultsBlock = fluid.findMergeBlocks(shadow.mergeOptions.mergeBlocks, "defaults")[0];

        var rec = {
            that: that,
            shadow: shadow,
            defaultsBlock: defaultsBlock,
            gradeNames: gradeNames, // remember that this array is globally shared
            seenGrades: {},
            plainDynamic: [],
            rawDynamic: []
        };
        fluid.each(shadow.mergeOptions.mergeBlocks, function (block) { // acquire parents of earlier blocks before applying later ones
            gradeNames.push.apply(gradeNames, fluid.makeArray(block.target && block.target.gradeNames));
            fluid.applyDynamicGrades(rec);
        });
        fluid.collectDistributedGrades(rec);
        while (true) {
            while (rec.plainDynamic.length > 0) {
                gradeNames.push.apply(gradeNames, rec.plainDynamic);
                rec.plainDynamic.length = 0;
                fluid.applyDynamicGrades(rec);
                fluid.collectDistributedGrades(rec);
            }
            if (rec.rawDynamic.length > 0) {
                var expanded = fluid.expandImmediate(rec.rawDynamic.shift(), that, shadow.localDynamic);
                if (typeof(expanded) === "function") {
                    expanded = expanded();
                }
                if (expanded) {
                    rec.plainDynamic = rec.plainDynamic.concat(expanded);
                }
            } else {
                break;
            }
        }

        if (shadow.collectedClearer) {
            shadow.collectedClearer();
            delete shadow.collectedClearer;
        }
    };

    /* Second sequence point for mergeComponentOptions from Fluid.js - here we construct all further
     * strategies required on the IoC side and mount them into the shadow's getConfig for universal use
     * We also evaluate and broadcast any options distributions from the options' `distributeOptions`
     */

    fluid.computeComponentAccessor = function (that, localRecord) {
        var instantiator = fluid.globalInstantiator;
        var shadow = fluid.shadowForComponent(that);
        shadow.localDynamic = localRecord; // for signalling to dynamic grades from dynamic components
        // TODO: Presumably we can now simply resolve this from within the shadow potentia itself
        var options = that.options;
        var strategy = shadow.mergeOptions.strategy;
        var optionsStrategy = fluid.mountStrategy(["options"], options, strategy);

        shadow.invokerStrategy = fluid.recordStrategy(that, options, strategy, "invokers", fluid.invokerFromRecord);

        shadow.eventStrategyBlock = fluid.recordStrategy(that, options, strategy, "events", fluid.eventFromRecord, ["events"]);
        var eventStrategy = fluid.mountStrategy(["events"], that, shadow.eventStrategyBlock.strategy);

        shadow.memberStrategy = fluid.recordStrategy(that, options, strategy, "members", fluid.memberFromRecord, null, {model: true, modelRelay: true});
        // TODO: this is all hugely inefficient since we query every scheme for every path, whereas
        // we should know perfectly well what kind of scheme there will be for a path, especially once we have resolved
        // FLUID-5761, FLUID-5244
        shadow.getConfig = {strategies: [fluid.model.funcResolverStrategy, fluid.concreteStrategy,
            optionsStrategy, shadow.invokerStrategy.strategy, shadow.memberStrategy.strategy, eventStrategy]};

        fluid.computeDynamicGrades(that, shadow, strategy, shadow.mergeOptions.mergeBlocks);
        if (shadow.contextHash["fluid.resourceLoader"]) {
            shadow.resourceStrategyBlock = fluid.recordStrategy(that, options, strategy, "resources", fluid.resourceFromRecord, ["resources"]);
            var resourceStrategy = fluid.mountStrategy(["resources"], that, shadow.resourceStrategyBlock.strategy);
            shadow.getConfig.strategies.push(resourceStrategy);
            that.resources = {};
        }

        fluid.distributeOptions(that, strategy);
        if (shadow.contextHash["fluid.resolveRoot"]) {
            var memberName;
            if (shadow.contextHash["fluid.resolveRootSingle"]) {
                var singleRootType = fluid.getForComponent(that, ["options", "singleRootType"]);
                if (!singleRootType) {
                    fluid.fail("Cannot register object with grades " + Object.keys(shadow.contextHash).join(", ") + " as fluid.resolveRootSingle since it has not defined option singleRootType");
                }
                memberName = fluid.typeNameToMemberName(singleRootType);
            } else {
                memberName = fluid.computeGlobalMemberName(that.typeName, that.id);
            }
            var parent = fluid.resolveRootComponent;
            if (parent[memberName]) {
                instantiator.clearComponent(parent, memberName);
            }
            instantiator.recordKnownComponent(parent, that, memberName, false);
        }

        return shadow.getConfig;
    };

    // About the SHADOW:
    // This holds a record of IoC information for each instantiated component.
    // It is allocated at: instantiator's "recordComponent"
    // It is destroyed at: instantiator's "clearConcreteComponent"
    // Contents:
    //     path {String} Principal allocated path (point of construction) in tree
    //     that {Component} The component itself
    //     contextHash {String to Boolean} Map of context names which this component matches
    //     mergePolicy, mergeOptions: Machinery for last phase of options merging
    //     invokerStrategy, eventStrategyBlock, memberStrategy, getConfig: Junk required to operate the accessor
    //     listeners: Listeners registered during this component's construction, to be cleared during clearListeners
    //     distributions, collectedClearer: Managing options distributions
    //     outDistributions: A list of distributions registered from this component, signalling from distributeOptions to clearDistributions
    //     ownScope: A hash of names to components which are in scope from this component - populated in cacheShadowGrades
    //     childrenScope: A hash of names to components which are in scope because they are children of this component (BELOW own ownScope in resolution order)
    //     potentia: The original potentia record as supplied to registerPotentia
    //     childComponents: Hash of key names to subcomponents
    //     lightMergeComponents, lightMergeDynamicComponents: signalling between fluid.processComponentShell and fluid.concludeComponentObservation
    //     modelSourcedDynamicComponents: signalling between fluid.processComponentShell and fluid.initModel

    fluid.shadowForComponent = function (component) {
        var instantiator = fluid.getInstantiator(component);
        return instantiator && component ? instantiator.idToShadow[component.id] : null;
    };

    // Access the member at a particular path in a component, forcing it to be constructed gingerly if necessary
    // supported, PUBLIC API function
    fluid.getForComponent = function (component, path) {
        var segs = fluid.model.pathToSegments(path, getConfig);
        if (segs.length === 0) {
            return component;
        }
        var shadow = fluid.shadowForComponent(component);
        var getConfig = shadow ? shadow.getConfig : undefined;
        var next = fluid.get(component, segs[0], getConfig);
        // Remove this appalling travesty when we eliminate fluid.get, merging, etc. in the FLUID-6143 rewrite
        if (fluid.isComponent(next)) {
            return fluid.getForComponent(next, segs.slice(1));
        } else {
            return fluid.get(component, path, getConfig);
        }
    };

    // The EL segment resolver strategy for resolving concrete members
    fluid.concreteStrategy = function (component, thisSeg, index, segs) {
        var atval = component[thisSeg];
        if (atval === fluid.inEvaluationMarker && index === segs.length) {
            fluid.fail("Error in component configuration - a circular reference was found during evaluation of path segment \"" + thisSeg +
                "\": for more details, see the activity records following this message in the console, or issue fluid.setLogging(fluid.logLevel.TRACE) when running your application");
        }
        if (index > 1) {
            return atval;
        }
        if (atval === undefined && component.hasOwnProperty(thisSeg)) { // avoid recomputing properties that have been explicitly evaluated to undefined
            return fluid.NO_VALUE;
        }
        return atval;
    };

    // Listed in dependence order
    fluid.frameworkGrades = ["fluid.component", "fluid.modelComponent", "fluid.viewComponent", "fluid.rendererComponent"];

    fluid.filterBuiltinGrades = function (gradeNames) {
        return fluid.remove_if(fluid.makeArray(gradeNames), function (gradeName) {
            return fluid.frameworkGrades.indexOf(gradeName) !== -1;
        });
    };

    fluid.dumpGradeNames = function (that) {
        return that.options && that.options.gradeNames ?
            " gradeNames: " + JSON.stringify(fluid.filterBuiltinGrades(that.options.gradeNames)) : "";
    };

    fluid.dumpThat = function (that) {
        return "{ typeName: \"" + that.typeName + "\"" + fluid.dumpGradeNames(that) + " id: " + that.id + "}";
    };

    fluid.dumpThatStack = function (thatStack, instantiator) {
        var togo = fluid.transform(thatStack, function (that) {
            var path = instantiator.idToPath(that.id);
            return fluid.dumpThat(that) + (path ? (" - path: " + path) : "");
        });
        return togo.join("\n");
    };

    fluid.dumpComponentPath = function (that) {
        var path = fluid.pathForComponent(that);
        return path ? fluid.pathUtil.composeSegments.apply(null, path) : "** no path registered for component **";
    };

    fluid.dumpComponentAndPath = function (that) {
        return "component " + fluid.dumpThat(that) + " at path " + fluid.dumpComponentPath(that);
    };

    fluid.resolveContext = function (context, that, fast) {
        if (context === "that") {
            return that;
        } else if (context === "/") {
            return fluid.rootComponent;
        }
        // TODO: Check performance impact of this type check introduced for FLUID-5903 in a very sensitive corner
        if (typeof(context) === "object") {
            var innerContext = fluid.resolveContext(context.context, that, fast);
            if (!fluid.isComponent(innerContext)) {
                fluid.triggerMismatchedPathError(context.context, that);
            }
            var rawValue = fluid.getForComponent(innerContext, context.path);
            // TODO: Terrible, slow dispatch for this route
            var expanded = fluid.expandOptions(rawValue, that);
            if (!fluid.isComponent(expanded)) {
                fluid.fail("Unable to resolve recursive context expression " + fluid.renderContextReference(context) + ": the directly resolved value of " + rawValue +
                     " did not resolve to a component in the scope of component ", that, ": got ", expanded);
            }
            return expanded;
        } else {
            var foundComponent;
            var instantiator = fluid.globalInstantiator; // fluid.getInstantiator(that); // this hash lookup takes over 1us!
            if (fast) {
                var shadow = instantiator.idToShadow[that.id];
                return shadow.ownScope[context];
            } else {
                var thatStack = instantiator.getFullStack(that);
                fluid.visitComponentsForVisibility(instantiator, thatStack, function (component, memberName) {
                    var shadow = fluid.shadowForComponent(component);
                    var scopeValue = shadow.contextHash[context];
                    // Replace "memberName" member of contextHash from original site with memberName from injection site -
                    // need to mirror "fast" action of recordComponent in composing childrenScope
                    if (scopeValue && scopeValue !== "memberName" || context === memberName) {
                        foundComponent = component;
                        return true; // YOUR VISIT IS AT AN END!!
                    }
                });
                return foundComponent;
            }
        }
    };

    fluid.triggerMismatchedPathError = function (parsed, parentThat) {
        var ref = fluid.renderContextReference(parsed);
        fluid.fail("Failed to resolve reference " + ref + " - could not match context with name " +
            parsed.context + " from " + fluid.dumpComponentAndPath(parentThat));
    };

    fluid.makeStackFetcher = function (parentThat, localRecord, fast) {
        var fetcher = function (parsed) {
            if (parentThat && parentThat.lifecycleStatus === "destroyed") {
                fluid.fail("Cannot resolve reference " + fluid.renderContextReference(parsed) + " from component " + fluid.dumpThat(parentThat) + " which has been destroyed");
            }
            var context = parsed.context;
            if (localRecord && context in localRecord) {
                return fluid.get(localRecord[context], parsed.path);
            }
            var foundComponent = fluid.resolveContext(context, parentThat, fast);
            if (!foundComponent && parsed.path !== "") {
                fluid.triggerMismatchedPathError(parsed, parentThat);
            }
            return fluid.getForComponent(foundComponent, parsed.path);
        };
        return fetcher;
    };

    // TODO: Hoist all calls to this to a single expander per shadow
    fluid.makeStackResolverOptions = function (parentThat, localRecord, fast) {
        return $.extend(fluid.copy(fluid.rawDefaults("fluid.makeExpandOptions")), {
            localRecord: localRecord || {},
            fetcher: fluid.makeStackFetcher(parentThat, localRecord, fast),
            contextThat: parentThat,
            exceptions: {members: {model: true, modelRelay: true}}
        });
    };

    fluid.clearListeners = function (shadow) {
        // TODO: bug here - "afterDestroy" listeners will be unregistered already unless they come from this component
        fluid.each(shadow.listeners, function (rec) {
            rec.event.removeListener(rec.listenerId || rec.listener);
        });
        delete shadow.listeners;
    };

    fluid.recordListener = function (event, listener, shadow, listenerId) {
        if (event.ownerId !== shadow.that.id) { // don't bother recording listeners registered from this component itself
            fluid.pushArray(shadow, "listeners", {event: event, listener: listener, listenerId: listenerId});
        }
    };

    fluid.constructScopeObjects = function (instantiator, parent, child, childShadow) {
        var parentShadow = parent ? instantiator.idToShadow[parent.id] : null;
        childShadow.childrenScope = parentShadow ? Object.create(parentShadow.ownScope) : {};
        childShadow.ownScope = Object.create(childShadow.childrenScope);
        childShadow.parentShadow = parentShadow;
        childShadow.childComponents = {};
        fluid.cacheShadowGrades(child, childShadow);
    };

    fluid.clearChildrenScope = function (instantiator, parentShadow, child, childShadow) {
        fluid.each(childShadow.contextHash, function (troo, context) {
            if (parentShadow.childrenScope[context] === child) {
                delete parentShadow.childrenScope[context]; // TODO: ambiguous resolution
            }
        });
    };

    // unsupported, NON-API function
    fluid.doDestroy = function (that, name, parent) {
        fluid.fireEvent(that, "onDestroy", [that, name || "", parent]);
        that.lifecycleStatus = "destroyed";
        for (var key in that.events) {
            if (key !== "afterDestroy" && typeof(that.events[key].destroy) === "function") {
                that.events[key].destroy();
            }
        }
        if (that.applier) { // TODO: Break this out into the grade's destroyer
            that.applier.destroy();
        }
    };

    // potentia II records look a lot like change records -
    // action: "create"/"destroy"
    // record: { type: "componentType", etc.}
    // applied: true

    // unsupported, non-API function - however, this structure is of considerable interest to those debugging
    // into IoC issues. The structures idToShadow and pathToComponent contain a complete map of the component tree
    // forming the surrounding scope
    fluid.instantiator = function () {
        var that = fluid.typeTag("instantiator");
        $.extend(that, {
            lifecycleStatus: "constructed",
            pathToComponent: {},
            idToShadow: {},
            modelTransactions: {}, // a map of transaction id to map of component id to records of components enlisted in a current model initialisation transaction
            treeTransactions: {}, // a map of transaction id to TreeTransaction - see fluid.beginTreeTransaction for initial values
            // any tree instantiation in progress. This is primarily read in order to enlist in bindDeferredComponent.
            currentTreeTransactionId: null,
            composePath: fluid.model.composePath, // For speed, we declare that no component's name may contain a period
            composeSegments: fluid.model.composeSegments,
            parseEL: fluid.model.parseEL,
            events: {
                onComponentAttach: fluid.makeEventFirer({name: "instantiator's onComponentAttach event"}),
                onComponentClear: fluid.makeEventFirer({name: "instantiator's onComponentClear event"})
            }
        });
        // Convenience method for external methods to accept path or segs
        that.parseToSegments = function (path) {
            return fluid.model.parseToSegments(path, that.parseEL, true);
        };
        // TODO: this API can shortly be removed
        that.idToPath = function (id) {
            var shadow = that.idToShadow[id];
            return shadow ? shadow.path : "";
        };
        // Note - the returned stack is assumed writeable and does not include the root
        that.getThatStack = function (component) {
            var shadow = that.idToShadow[component.id];
            if (shadow) {
                var path = shadow.path;
                var parsed = that.parseEL(path);
                var root = that.pathToComponent[""], togo = [];
                for (var i = 0; i < parsed.length; ++i) {
                    root = root[parsed[i]];
                    togo.push(root);
                }
                return togo;
            }
            else { return [];}
        };
        that.getFullStack = function (component) {
            var thatStack = component ? that.getThatStack(component) : [];
            thatStack.unshift(fluid.resolveRootComponent);
            return thatStack;
        };
        function recordComponent(parent, component, path, name, created) {
            var shadow;
            if (created) {
                shadow = that.idToShadow[component.id] = {};
                shadow.that = component;
                shadow.path = path;
                shadow.memberName = name;
                fluid.constructScopeObjects(that, parent, component, shadow);
            } else {
                shadow = that.idToShadow[component.id];
                shadow.injectedPaths = shadow.injectedPaths || {}; // a hash since we will modify whilst iterating
                shadow.injectedPaths[path] = true;
                var parentShadow = that.idToShadow[parent.id]; // structural parent shadow - e.g. resolveRootComponent
                var keys = fluid.keys(shadow.contextHash);
                fluid.remove_if(keys, function (key) {
                    return shadow.contextHash && shadow.contextHash[key] === "memberName";
                });
                keys.push(name); // add local name - FLUID-5696 and FLUID-5820
                fluid.each(keys, function (context) {
                    if (!parentShadow.childrenScope[context]) {
                        parentShadow.childrenScope[context] = component;
                    }
                });
            }
            if (that.pathToComponent[path]) {
                fluid.fail("Error during instantiation - path " + path + " which has just created component " + fluid.dumpThat(component) +
                    " has already been used for component " + fluid.dumpThat(that.pathToComponent[path]) + " - this is a circular instantiation or other oversight." +
                    " Please clear the component using instantiator.clearComponent() before reusing the path.");
            }
            that.pathToComponent[path] = component;
        }
        that.recordRoot = function (component) {
            recordComponent(null, component, "", "", true);
        };
        that.recordKnownComponent = function (parent, component, name, created) {
            parent[name] = component;
            if (fluid.isComponent(component) || component.type === "instantiator") {
                var parentShadow = that.idToShadow[parent.id];
                parentShadow.childComponents[name] = component;
                var path = that.composePath(parentShadow.path, name);
                recordComponent(parent, component, path, name, created);
                that.events.onComponentAttach.fire(component, path, that, created);
            } else {
                fluid.fail("Cannot record non-component with value ", component, " at path \"" + name + "\" of parent ", parent);
            }
        };

        that.clearConcreteComponent = function (destroyRec) {
            var shadow = destroyRec.childShadow;
            // Clear injected instance of this component from all other paths - historically we didn't bother
            // to do this since injecting into a shorter scope is an error - but now we have resolveRoot area
            fluid.each(shadow.injectedPaths, function (troo, injectedPath) {
                var parentPath = fluid.model.getToTailPath(injectedPath);
                var otherParent = that.pathToComponent[parentPath];
                that.clearComponent(otherParent, fluid.model.getTailPath(injectedPath), destroyRec.child);
            });
            fluid.clearDistributions(shadow);
            fluid.clearListeners(shadow);
            fluid.fireEvent(destroyRec.child, "afterDestroy", [destroyRec.child, destroyRec.name, destroyRec.component]);
            delete that.idToShadow[destroyRec.child.id];
        };

        that.clearComponent = function (component, name, child, options, nested, path) {
            // options are visitor options for recursive driving
            var shadow = that.idToShadow[component.id];
            // use flat recursion since we want to use our own recursion rather than rely on "visited" records
            options = options || {flat: true, instantiator: that, destroyRecs: []};
            child = child || component[name];
            path = path || shadow.path;
            if (path === undefined) {
                fluid.fail("Cannot clear component " + name + " from component ", component,
                    " which was not created by this instantiator");
            }

            var childPath = that.composePath(path, name);
            var childShadow = that.idToShadow[child.id];
            if (!childShadow) { // Explicit FLUID-5812 check - this can be eliminated once we move visitComponentChildren to instantiator's records
                return;
            }
            var created = childShadow.path === childPath;
            that.events.onComponentClear.fire(child, childPath, component, created);

            // only recurse on components which were created in place - if the id record disagrees with the
            // recurse path, it must have been injected
            if (created) {
                fluid.visitComponentChildren(child, function (gchild, gchildname, segs, i) {
                    var parentPath = that.composeSegments.apply(null, segs.slice(0, i));
                    that.clearComponent(child, gchildname, null, options, true, parentPath);
                }, options, that.parseEL(childPath));
                fluid.doDestroy(child, name, component); // call "onDestroy", null out events and invokers, setting lifecycleStatus to "destroyed"
                options.destroyRecs.push({child: child, childShadow: childShadow, name: name, component: component, shadow: shadow});
            } else {
                fluid.remove_if(childShadow.injectedPaths, function (troo, path) {
                    return path === childPath;
                });
            }
            fluid.clearChildrenScope(that, shadow, child, childShadow);
            // Note that "pathToComponent" will not be available during afterDestroy. This is so that we can synchronously recreate the component
            // in an afterDestroy listener (FLUID-5931). We don't clear up the shadow itself until after afterDestroy.
            delete that.pathToComponent[childPath];
            delete shadow.childComponents[name];
            if (!nested) {
                delete component[name]; // there may be no entry - if creation is not concluded
                // Do actual destruction for the whole tree here, including "afterDestroy" and deleting shadows
                fluid.each(options.destroyRecs, that.clearConcreteComponent);
            }
        };
        return that;
    };

    // The global instantiator, holding all components instantiated in this context (instance of Infusion)
    fluid.globalInstantiator = fluid.instantiator();

    // Look up the globally registered instantiator for a particular component - we now only really support a
    // single, global instantiator, but this method is left as a notation point in case this ever reverts
    // Returns null if argument is a noncomponent or has no shadow
    fluid.getInstantiator = function (component) {
        var instantiator = fluid.globalInstantiator;
        return component && instantiator.idToShadow[component.id] ? instantiator : null;
    };

    // The grade supplied to components which will be resolvable from all parts of the component tree
    fluid.defaults("fluid.resolveRoot");
    // In addition to being resolvable at the root, "resolveRootSingle" component will have just a single instance available. Fresh
    // instances will displace older ones.
    fluid.defaults("fluid.resolveRootSingle", {
        gradeNames: "fluid.resolveRoot"
    });

    fluid.constructRootComponents = function (instantiator) {
        // Instantiate the primordial components at the root of each context tree
        fluid.rootComponent = instantiator.rootComponent = fluid.typeTag("fluid.rootComponent");
        instantiator.recordRoot(fluid.rootComponent);

        // The component which for convenience holds injected instances of all components with fluid.resolveRoot grade
        fluid.resolveRootComponent = instantiator.resolveRootComponent = fluid.typeTag("fluid.resolveRootComponent");
        instantiator.recordKnownComponent(fluid.rootComponent, fluid.resolveRootComponent, "resolveRootComponent", true);

        // obliterate resolveRoot's scope objects and replace by the real root scope - which is unused by its own children
        var rootShadow = instantiator.idToShadow[fluid.rootComponent.id];
        rootShadow.contextHash = {}; // Fix for FLUID-6128
        var resolveRootShadow = instantiator.idToShadow[fluid.resolveRootComponent.id];
        resolveRootShadow.ownScope = rootShadow.ownScope;
        resolveRootShadow.childrenScope = rootShadow.childrenScope;

        instantiator.recordKnownComponent(fluid.resolveRootComponent, instantiator, "instantiator", true); // needs to have a shadow so it can be injected
        resolveRootShadow.childrenScope.instantiator = instantiator; // needs to be mounted since it never passes through cacheShadowGrades
    };

    fluid.constructRootComponents(fluid.globalInstantiator); // currently a singleton - in future, alternative instantiators might come back

    /** Expand a set of component options either immediately, or with deferred effect.
     *  The current policy is to expand immediately function arguments within fluid.assembleCreatorArguments which are not the main options of a
     *  component. The component's own options take <code>{defer: true}</code> as part of
     *  <code>outerExpandOptions</code> which produces an "expandOptions" structure holding the "strategy" and "initter" pattern
     *  common to ginger participants.
     *  This is pretty well-attested as a public API but only the first two arguments are stable. However, `fluid.expand` should be
     *  used by preference for standard immediate expansion.
     */

// TODO: Can we move outerExpandOptions to 2nd place? only user of 3 and 4 is fluid.makeExpandBlock
// TODO: Actually we want localRecord in 2nd place since outerExpandOptions is now almost disused
    fluid.expandOptions = function (args, that, mergePolicy, localRecord, outerExpandOptions) {
        if (!args) {
            return args;
        }
        fluid.pushActivity("expandOptions", "expanding options %args for component %that ", {that: that, args: args});
        var expandOptions = fluid.makeStackResolverOptions(that, localRecord);
        expandOptions.mergePolicy = mergePolicy;
        expandOptions.defer = outerExpandOptions && outerExpandOptions.defer;
        var expanded = expandOptions.defer ?
            fluid.makeExpandOptions(args, expandOptions) : fluid.expand(args, expandOptions);
        fluid.popActivity();
        return expanded;
    };

    fluid.computeMergeListPriority = function (toMerge) {
        toMerge.forEach(function (record) {
            var recordType = record.recordType;
            if (recordType !== "distribution") {
                record.priority = fluid.mergeRecordTypes[recordType] + (record.priorityDelta || 0);
                if (!fluid.isInteger(record.priority)) {
                    fluid.fail("Merge record with unrecognised type " + recordType + ": ", record);
                }
            }
        });
    };

    // TODO: overall efficiency could huge be improved by resorting to the hated PROTOTYPALISM as an optimisation
    // for this mergePolicy which occurs in every component. Although it is a deep structure, the root keys are all we need
    var addPolicyBuiltins = function (policy) {
        fluid.each(["gradeNames", "mergePolicy", "argumentMap", "components", "dynamicComponents", "events", "listeners", "modelListeners", "modelRelay", "distributeOptions", "transformOptions"], function (key) {
            fluid.set(policy, [key, "*", "noexpand"], true);
        });
        return policy;
    };

    // used from Fluid.js
    fluid.generateExpandBlock = function (record, that, mergePolicy, localRecord) {
        var expanded = fluid.expandOptions(record.options || {}, record.contextThat || that, mergePolicy, localRecord, {defer: true});
        expanded.priority = record.priority;
        expanded.namespace = record.namespace;
        expanded.recordType = record.recordType;
        return expanded;
    };

    fluid.fabricateDestroyMethod = function (that) {
        return function () {
            var shadow = fluid.shadowForComponent(that);
            fluid.destroy(shadow.path);
        };
    };

    // Maps a type name to the member name to be used for it at a particular path level where it is intended to be unique
    // Note that "." is still not supported within a member name
    // supported, PUBLIC API function
    fluid.typeNameToMemberName = function (typeName) {
        return typeName.replace(/\./g, "_");
    };

    /** Begin the process of expanding component options. Generates the core ``mergeBlocks'' array which drives the expansion process. Has
     * various other side-effects, such as hoisting the "container" option, adding framework builtins to the supplied mergePolicy, and computing
     * the priorities of the merge blocks, as a result of generally poor factoring in this area and work in progress.
     * @param mergePolicy {CompiledMergePolicy} A "compiled" mergePolicy object as output from `fluid.compileMergePolicy`
     * @param potentia {Potentia} The `create` potentia responsible for this component construction
     * @param lightMerge {LightMerge} The lightly merged options for the component
     * @param that {Component} The component in progress
     * @return {MergeBlock[]} An array of `MergeBlock` structures ready to mount in the `shadow.mergeOptions` structure.
     */
    // This is the initial entry point from the non-IoC side reporting the first presence of a new component - called from fluid.mergeComponentOptions
    fluid.expandComponentOptions = function (mergePolicy, potentia, lightMerge, that) {
        var toMerge = lightMerge.toMerge;
        var container = fluid.lightMergeValue(toMerge, "container");
        // hoist out "container" to be an option - eliminate this after FLUID-5750
        if (container) {
            toMerge.push({
                recordType: "distribution",
                priority: fluid.mergeRecordTypes.distribution,
                options: {
                    container: container
                },
                contextThat: potentia.parentThat
            });
        }

        that.destroy = fluid.fabricateDestroyMethod(that);

        addPolicyBuiltins(mergePolicy);
        var shadow = fluid.shadowForComponent(that);
        shadow.mergePolicy = mergePolicy;

        fluid.computeMergeListPriority(toMerge);

        var togo = fluid.transform(toMerge, function (value) {
            // There is the wacky possibility that generating these blocks might cause some immediate expansion in case the root is a bare reference
            // See "expansion order test" - we should probably prohibit this, or else try to do some "light merge" of gradeNames
            return fluid.generateExpandBlock(value, that, mergePolicy, potentia.localRecord);
        });

        fluid.popActivity();
        return togo;
    };


    fluid.computeDynamicComponentKey = function (recordKey, sourceKey) {
        return recordKey + (sourceKey === 0 ? "" : "-" + sourceKey); // TODO: configurable name strategies
    };

    fluid.bindDeferredComponent = function (that, componentName, lightMerge, dynamicComponent) {
        var eventName = lightMerge.createOnEvent;
        var event = fluid.isIoCReference(eventName) ? fluid.expandOptions(eventName, that) : that.events[eventName];
        if (!event || !event.addListener) {
            fluid.fail("Error instantiating createOnEvent component with name " + componentName + " of parent ", that, " since event specification " +
                eventName + " could not be expanded to an event - got ", event);
        }
        var instantiator = fluid.globalInstantiator;
        var shadow = fluid.shadowForComponent(that);
        if (dynamicComponent) {
            fluid.set(shadow, ["dynamicComponentCount", componentName], 0);
        }
        var constructListener = function () {
            var transactionId = instantiator.currentTreeTransactionId || fluid.beginTreeTransaction().transactionId;
            var key = dynamicComponent ?
                fluid.computeDynamicComponentKey(componentName, shadow.dynamicComponentCount[componentName]++) : componentName;
            var localRecord = {
                "arguments": fluid.makeArray(arguments)
            };
            fluid.pushActivity("initDeferred", "instantiating deferred component %componentName of parent %that due to event %eventName",
             {componentName: componentName, that: that, eventName: eventName});
            var freshLightMerge = fluid.copy(lightMerge);
            delete freshLightMerge.createOnEvent;
            fluid.registerConcreteSubPotentia(freshLightMerge, key, 0, that, localRecord, transactionId);
            fluid.popActivity();
        };
        event.addListener(constructListener);
        fluid.recordListener(event, constructListener, shadow);
        var concludeListener = function () {
            var transactionId = instantiator.currentTreeTransactionId;
            if (transactionId) {
                var transRec = instantiator.treeTransactions[transactionId];
                transRec.promise.then(null, function (e) {
                    throw e;
                });
                fluid.commitPotentiae(transactionId);
            }
        };
        event.addListener(concludeListener, "fluid-componentConstruction", "last:transaction");
        fluid.recordListener(event, concludeListener, shadow);
    };

    fluid.markSubtree = function (instantiator, that, path, state) {
        that.lifecycleStatus = state;
        fluid.visitComponentChildren(that, function (child, name) {
            var childPath = instantiator.composePath(path, name);
            var childShadow = instantiator.idToShadow[child.id];
            var created = childShadow && childShadow.path === childPath;
            if (created) {
                fluid.markSubtree(instantiator, child, childPath, state);
            }
        }, {flat: true});
    };

    fluid.assessTreeConstruction = function (that, shadow) {
        var instantiator = fluid.globalInstantiator;
        var thatStack = instantiator.getThatStack(that);
        var unstableUp = fluid.find_if(thatStack, function (that) {
            return that.lifecycleStatus === "constructing";
        });
        if (unstableUp) {
            that.lifecycleStatus = "constructed";
        } else {
            fluid.markSubtree(instantiator, that, shadow.path, "treeConstructed");
        }
    };

    /** Conclude the component's "observation" process by fully evaluating all options, members and invokers that have
     * not already been evaluated, and read the `components` and `dynamicComponents` area to schedule the construction
     * of any deferred subcomponents.
     * @param {Shadow} shadow - The shadow for the component for which observation should be concluded
     */
    fluid.concludeComponentObservation = function (shadow) {
        var that = shadow.that;
        var mergeOptions = shadow.mergeOptions;
        fluid.pushActivity("concludeComponentObservation", "constructing component of type %componentName at path %path",
            {componentName: that.typeName, path: shadow.path});

        for (var i = 0; i < mergeOptions.mergeBlocks.length; ++i) {
            mergeOptions.mergeBlocks[i].initter();
        }
        mergeOptions.initter();
        delete that.options.mergePolicy; // silly "optimisation" - make this immutable instead

        shadow.memberStrategy.initter();
        shadow.invokerStrategy.initter();

        fluid.each(shadow.lightMergeComponents, function (lightMerge, key) {
            if (lightMerge.createOnEvent) {
                fluid.bindDeferredComponent(that, key, lightMerge);
            }
        });

        fluid.each(shadow.lightMergeDynamicComponents, function (lightMerge, key) {
            if (lightMerge.createOnEvent) {
                fluid.bindDeferredComponent(that, key, lightMerge, true);
            }
        });
        fluid.popActivity();
    };

    fluid.concludeComponentInit = function (shadow) {
        var that = shadow.that;
        if (fluid.isDestroyed(that)) {
            return; // Further fix for FLUID-5869 - if we managed to destroy ourselves through some bizarre model self-reaction, bail out here
        }
        that.lifecycleStatus = "constructed";
        fluid.assessTreeConstruction(that, shadow);

        that.events.onCreate.fire(that);
        fluid.popActivity();

        return that;
    };

    /** Amalgamates any further creations with any existing potentia at a path
    * @param {PotentiaList} potentiaList - A `PotentiaList` structure as constructed by `fluid.blankPotentiaList` holding the potentiae in
    *     progress for a particular tree transaction
    * @param {String} path - Path at which the potentia will be registered
    * @param {Potentia} topush - A "create" potentia
    * @return {Potentia|Undefined} `topush` if this was the first potentia registered for this path
    */
    fluid.pushCreatePotentia = function (potentiaList, path, topush) {
        var existing = potentiaList.pathToPotentia[path];
        // TODO: Crude approximation to allowing nested transactions
        if (existing && !existing.applied) {
            fluid.lightMergeRecords.pushRecords(existing, topush.records || topush.lightMerge.toMerge);
        } else {
            potentiaList.pathToPotentia[path] = topush;
            if (topush.records) {
                topush.lightMerge = fluid.lightMergeRecords(topush.records);
                delete topush.records;
            }
            return topush;
        }
    };

    fluid.blankPotentiaList = function () {
        return {
            destroys: [],
            creates: [],
            activeCount: 0,
            pathToPotentia: {} // map of component paths to list of option records for create potentia
        };
    };

    fluid.isInjectedComponentRecord = function (record) {
        return typeof(record) === "string" || record.expander;
    };

    fluid.lightMergeValue = function (records, member) {
        var value;
        records.forEach(function (record) {
            var recValue = record[member];
            value = recValue === undefined ? value : recValue;
        });
        return value;
    };

    /** @typedef {Object} LightMerge
     *    @property {Boolean} isInjected - whether these designate an injected component
     *    @property {String} type - the component's type if it is concrete
     *    @property {String} createOnEvent - the component's "createOnEvent" if any record set it
     *    @property {OptionsRecords[]} toMerge - Array of component options to be merged
     */

    /** Perform a "light merge" of a set of options records in order to immediately discover the type name if they designate a
     * concrete component or whether they designate an injected component.
     * @param {OptionsRecords[]} records - Array of component options records as held in {Potentia}.records
     * @return {LightMerge} A structure holding the lightly merged options records
     */
    fluid.lightMergeRecords = function (records) {
        var togo = {
            toMerge: [],
            isInjected: false
        };
        fluid.lightMergeRecords.pushRecords(togo, records);
        return togo;
    };

    fluid.lightMergeRecords.pushRecord = function (lightMerge, record) {
        if (fluid.isInjectedComponentRecord(record)) {
            lightMerge.toMerge = [{injected: record}];
            lightMerge.isInjected = true;
        } else {
            lightMerge.type = record.type || lightMerge.type;
            lightMerge.createOnEvent = record.createOnEvent || lightMerge.createOnEvent;
            lightMerge.sources = record.sources || lightMerge.sources;
            if (lightMerge.isInjected) {
                lightMerge.toMerge = [record];
            } else {
                lightMerge.toMerge.push(record);
            }
            lightMerge.isInjected = false;
        }
    };

    fluid.lightMergeRecords.pushRecords = function (lightMerge, records) {
        records.forEach(function (record) {
            fluid.lightMergeRecords.pushRecord(lightMerge, record);
        });
    };

    fluid.instantiateEvents = function (shadow) {
        var that = shadow.that;
        shadow.eventStrategyBlock.initter();
        var listeners = fluid.getForComponent(that, ["options", "listeners"]);
        fluid.mergeListeners(that, that.events, listeners);

        var errors = fluid.validateListenersImplemented(that);
        if (errors.length > 0) {
            fluid.fail(fluid.transform(errors, function (error) {
                return ["Error constructing component ", that, " - the listener for event " + error.name + " with namespace " + error.namespace + (
                    (error.componentSource ? " which was defined in grade " + error.componentSource : "") + " needs to be overridden with a concrete implementation")];
            })).join("\n");
        }
    };

    /**
     * Creates the shell of a component, evaluating enough of its structure to determine its grade content but
     * without creating events or (hopefully) any side-effects
     *
     * @param {Potentia} potentia - Creation potentia for the component
     * @param {LightMerge} lightMerge - A set of lightly merged component options as returned from `fluid.lightMergeRecords`
     * @return {Component|Null} A component shell which has begun the process of construction, or `null` if the component
     * has been configured away by resolving to the type "fluid.emptySubcomponent"
     */
    fluid.initComponentShell = function (potentia, lightMerge) {
        // Recall that this code used to be in fluid.assembleCreatorArguments
        var instantiator = fluid.globalInstantiator,
            upDefaults = fluid.defaults(lightMerge.type),
            parentThat = potentia.parentThat,
            memberName = potentia.memberName,
            fakeThat = {};
        var distributions = fluid.receiveDistributions(parentThat, upDefaults && upDefaults.gradeNames, memberName, fakeThat);
        fluid.each(distributions, function (distribution) { // TODO: The duplicated route for this is in fluid.mergeComponentOptions
            fluid.computeDistributionPriority(parentThat, distribution);
            if (fluid.isPrimitive(distribution.priority)) { // TODO: These should be immutable and parsed just once on registration - but we can't because of crazy target-dependent distance system
                distribution.priority = fluid.parsePriority(distribution.priority, 0, false, "options distribution");
            }
        });
        fluid.sortByPriority(distributions);
        fluid.lightMergeRecords.pushRecords(lightMerge, distributions);
        // Update our type and initial guess at defaults based on distributions to type
        upDefaults = fluid.defaults(lightMerge.type);

        // TODO: Once we stabilise, experiment with not copying this already immutable record
        // TODO: This fails, for example, when driving "mergePolicy" in FLUID-4129 test. It seems that the default behaviour
        // of fluid.expand is to contemptibly alias to the source
        var defaultCopy = fluid.copy(upDefaults);
        lightMerge.toMerge.unshift({
            options: defaultCopy,
            recordType: "defaults"
        });

        var that = lightMerge.type === "fluid.emptySubcomponent" ? null : fluid.typeTag(lightMerge.type, potentia.componentId);
        if (that) {
            that.lifecycleStatus = "constructing";
            instantiator.recordKnownComponent(parentThat, that, memberName, true);
            // mergeComponentOptions computes distributeOptions which is essential for evaluating the meaning of shells everywhere
            var mergeOptions = fluid.mergeComponentOptions(that, potentia, lightMerge);
            mergeOptions.exceptions = {members: {model: true, modelRelay: true}}; // don't evaluate these in "early flooding" - they must be fetched explicitly
            that.events = {};
        }
        return that;
    };

    fluid.registerConcreteSubPotentia = function (lightMerge, key, componentDepth, parentShell, localRecord, transactionId) {
        // "componentDepth" is currently unused but will be incorporated in mergeBlocks sort for refined versions of FLUID-5614
        componentDepth = componentDepth || 0;
        var newSegs = fluid.pathForComponent(parentShell).concat([key]);
        var existing = parentShell[key];
        if (existing) {
            fluid.registerPotentia({
                segs: newSegs,
                type: "destroy"
            }, transactionId);
        }
        lightMerge.toMerge = fluid.transform(lightMerge.toMerge, function (toMerge) {
            var record = $.extend({
                componentDepth: componentDepth + 1,
                sourceComponentId: parentShell.id,
                recordType: "subcomponentRecord"
            }, toMerge);
            return record;
        });
        lightMerge.type = fluid.expandImmediate(lightMerge.type, parentShell, localRecord);
        var subPotentia = {
            type: "create",
            segs: newSegs,
            lightMerge: lightMerge,
            //records: [record],
            // This is awkward - what if we accumulate multiple records with different localRecords?
            // Can't do much about this without "local mergePolicies" and provenance
            localRecord: localRecord
        };
        fluid.registerPotentia(subPotentia, transactionId);
    };

    // These are stashed in the shadow in between the use of fluid.processComponentShell and fluid.concludeComponentObservation
    fluid.lightMergeComponentRecord = function (shadow, shadowKey, key, mergingArray) {
        var lightMerge = fluid.lightMergeRecords(mergingArray);
        fluid.set(shadow, [shadowKey, key], lightMerge);
        return lightMerge;
    };

    fluid.componentRecordExpected = fluid.arrayToHash(["type", "options", "container", "createOnEvent"]);
    fluid.dynamicComponentRecordExpected = $.extend({}, fluid.componentRecordExpected, fluid.arrayToHash(["sources"]));

    fluid.checkComponentRecord = function (localRecord, expected) {
        if (!fluid.isInjectedComponentRecord(localRecord)) {
            fluid.each(localRecord, function (value, key) {
                if (!expected[key]) {
                    fluid.fail("Probable error in subcomponent record ", localRecord, " - key \"" + key +
                        "\" found, where the only legal options are " +
                        fluid.keys(expected).join(", "));
                }
            });
        }
    };

    fluid.checkSubcomponentRecords = function (subcomponentRecords, expected) {
        subcomponentRecords.forEach(function (oneRecord) {
            fluid.checkComponentRecord(oneRecord, expected);
        });
    };

    // The midpoint of fluid.operateCreatePotentia. We have just created the shell, and will now investigate any subcomponents
    // and push any immediate ones discovered into potentia records at deeper paths.
    fluid.processComponentShell = function (potentia, shell, transRec) {
        var instantiator = fluid.globalInstantiator;
        var shadow = instantiator.idToShadow[shell.id];
        shadow.potentia = potentia;

        var mergeOptions = shadow.mergeOptions;

        var components = fluid.driveStrategy(shell.options, "components", mergeOptions.strategy);

        fluid.each(components, function (subcomponentRecords, key) {
            fluid.checkSubcomponentRecords(subcomponentRecords, fluid.componentRecordExpected);
            var lightMerge = fluid.lightMergeComponentRecord(shadow, "lightMergeComponents", key, subcomponentRecords);
            if (!lightMerge.createOnEvent) {
                fluid.registerConcreteSubPotentia(lightMerge, key, potentia.componentDepth, shell, potentia.localRecord);
            }
        });
        var dynamicComponents = fluid.driveStrategy(shell.options, "dynamicComponents", mergeOptions.strategy);
        fluid.each(dynamicComponents, function (subcomponentRecords, key) {
            fluid.checkSubcomponentRecords(subcomponentRecords, fluid.dynamicComponentRecordExpected);
            var lightMerge = fluid.lightMergeComponentRecord(shadow, "lightMergeDynamicComponents", key, subcomponentRecords);
            if (!lightMerge.sources && !lightMerge.createOnEvent) {
                fluid.fail("Cannot process dynamicComponents records ", subcomponentRecords, " without a \"sources\" or \"createOnEvent\" entry");
            }
            if (lightMerge.sources) {
                var sourcesParsed = fluid.parseValidModelReference(shell, "dynamicComponents source", lightMerge.sources, true);
                if (sourcesParsed.nonModel) {
                    var sources = fluid.getForComponent(sourcesParsed.that, sourcesParsed.segs);
                    fluid.each(sources, function (source, sourceKey) {
                        var localRecord = $.extend({}, potentia.localRecord, {"source": source, "sourcePath": sourceKey});
                        var dynamicKey = fluid.computeDynamicComponentKey(key, sourceKey);
                        var freshLightMerge = fluid.copy(lightMerge);
                        fluid.registerConcreteSubPotentia(freshLightMerge, dynamicKey, potentia.componentDepth, shell, localRecord);
                    });
                } else {
                    fluid.set(shadow, ["modelSourcedDynamicComponents", key], {
                        sourcesParsed: sourcesParsed
                    });
                }
            }
        });
        if (transRec.deferredDistributions.length) { // Resolve FLUID-6193 in potentia world by enqueueing deferred distributions
            transRec.pendingPotentiae.creates.push({
                type: "distributeOptions",
                distributions: transRec.deferredDistributions
            });
            ++transRec.pendingPotentiae.activeCount;
            transRec.deferredDistributions = [];
        }
    };

    /** Cache some frequently used quantities in a potentia with a path (as opposed to a pure distribution potentia)
     * - segs, memberName and parentThat.
     */

    fluid.preparePathedPotentia = function (potentia, instantiator) {
        var segs = potentia.segs || instantiator.parseToSegments(potentia.path);
        potentia.segs = segs;
        potentia.memberName = segs[segs.length - 1];
        potentia.parentThat = fluid.getImmediate(fluid.rootComponent, segs.slice(0, -1));
    };

    // Fetch the component referred to if a createPotentia is determined to hold an injected component reference.
    // This is more complex than it needs to be because of the potential for references to concrete components which
    // are further along in the potentia list. This used to be handled by the old-fashioned one-step
    // "ginger component reference" system and needs to be harmonised some day, perhaps via "light promises".
    fluid.fetchInjectedComponentReference = function (transRec, potentiaList, injected, parentThat) {
        var instantiator = fluid.globalInstantiator;
        if (injected.expander) {
            return fluid.expandImmediate(injected, parentThat);
        } else {
            var parsed = fluid.parseContextReference(injected);
            var head = fluid.resolveContext(parsed.context, parentThat);
            if (!head) {
                if (parsed.path !== "") {
                    fluid.fail("Error in injected component reference ", injected, " - could not resolve context {" + parsed.context + "} to a head component");
                } else {
                    return head;
                }
            } else {
                var parentPath = instantiator.idToShadow[head.id].path;
                var fullPath = fluid.composePath(parentPath, parsed.path);
                var current = instantiator.pathToComponent[fullPath];
                if (current) {
                    return current;
                } else { // possible forward reference
                    var upcoming = potentiaList.pathToPotentia[fullPath];
                    if (upcoming) {
                        if (upcoming.applied) {
                            fluid.fail("Circular reference found when resolving injected component reference ", injected, " - the target of the reference is still in construction");
                        } else {
                            return fluid.operateOneCreatePotentia(transRec, upcoming);
                        }
                    }
                }
            }
        }
    };

    // Begin the action of creating a component - register its shell and mergeOptions at the correct site, and evaluate
    // and scan options for its child components, recursively registering them
    // Returns shadow of created shell, if any
    fluid.operateCreatePotentia = function (transRec, potentiaList, potentia) {
        var instantiator = fluid.globalInstantiator;
        fluid.preparePathedPotentia(potentia, instantiator);
        // TODO: currently this overall workflow is synchronous and so we have no risk. In future, asynchronous
        // transactions imply that the same path may receive a component from two different transactions - therefore
        // we will need to pass the transaction along to these methods and allocate the components themselves within
        // the transRec and only commit them if they are conflict-free (a la Kulkarni)
        var memberName = potentia.memberName,
            parentThat = potentia.parentThat,
            shell;

        fluid.pushActivity("operateCreatePotentia", "operating create potentia for path \"%path\" with records %records",
            {path: potentia.path, records: potentia.records});

        var lightMerge = potentia.lightMerge;
        if (lightMerge.isInjected) {
            parentThat[memberName] = fluid.inEvaluationMarker; // support FLUID-5694
            var instance = fluid.fetchInjectedComponentReference(transRec, potentiaList, lightMerge.toMerge[0].injected, parentThat);
            if (instance) {
                instantiator.recordKnownComponent(parentThat, instance, memberName, false);
            } else {
                delete parentThat[memberName];
            }
        } else if (lightMerge.type) {
            shell = fluid.initComponentShell(potentia, lightMerge);
            if (shell) {
                fluid.processComponentShell(potentia, shell, transRec);
            }
        } else {
            fluid.fail("Unrecognised material in place of subcomponent " + memberName + " - could not recognise the records ",
                potentia.records, " as designating either an injected or concrete component");
        }

        fluid.pushPotentia(transRec.restoreRecords, instantiator, {
            type: "destroy",
            segs: potentia.segs
        });
        fluid.popActivity();
        if (shell) {
            return instantiator.idToShadow[shell.id];
        }
    };

    fluid.operateDestroyPotentia = function (transRec, potentia, instantiator) {
        instantiator = instantiator || fluid.globalInstantiator;
        fluid.preparePathedPotentia(potentia, instantiator);
        var that = fluid.getImmediate(fluid.rootComponent, potentia.segs);
        if (that) {
            // var shadow = fluid.shadowForComponent(that);
            instantiator.clearComponent(potentia.parentThat, potentia.memberName, that);
            // We would like to store the record that if this transaction is cancelled, the potentia which constructed
            // this component should be used to recreate it.
            // However, this is pretty esoteric currently since we don't have WHITEHEADIAN OBSERVATION, and we are not
            // exception-safe in the case that this re-creation itself throws, so this is commented out for now
            // fluid.pushPotentia(transRec.restoreRecords, instantiator, shadow.potentia);
        }
    };

    // Returns a structure with two priority-sorted arrays collecting all workflow functions which are operated by any components
    // within this transaction
    fluid.evaluateWorkflows = function (shadows) {
        var workflows = {};
        fluid.each(shadows, function (shadow) {
            var componentWorkflows = fluid.getForComponent(shadow.that, ["options", "workflows"]);
            $.extend(true, workflows, componentWorkflows);
        });
        return {
            global: fluid.parsePriorityRecords(workflows.global, "Global workflows"),
            local: fluid.parsePriorityRecords(workflows.local, "Local workflows")
        };
    };

    fluid.waitPendingIOTask = function (transRec) {
        var instantiator = fluid.globalInstantiator;
        var suspendCurrentTransaction = function () {
            instantiator.currentTreeTransactionId = null;
        };
        var resumeCurrentTransaction = function () {
            instantiator.currentTreeTransactionId = transRec.transactionId;
        };
        var bracketIO = function (sequence) {
            return [suspendCurrentTransaction].concat(sequence).concat([resumeCurrentTransaction]);
        };
        return function () {
            return transRec.pendingIO.length ? fluid.promise.sequence(bracketIO(transRec.pendingIO)) : null;
        };
    };

    fluid.localWorkflowToTask = function (func, shadows) {
        return function () {
            shadows.forEach(func);
        };
    };

    fluid.concludePotentiaePhase = function (transRec, sequencer) {
        var shadows = transRec.outputShadows;
        var togo = shadows[0]; // We need to track the first created shadow to support constructing free components
        transRec.workflows = fluid.evaluateWorkflows(shadows);
        if (transRec.breakAt !== "shells") {
            shadows.forEach(fluid.instantiateEvents);
            var sequence = sequencer.sources;
            transRec.workflows.global.forEach(function (workflow) {
                if (workflow.waitIO) {
                    sequence.push(fluid.waitPendingIOTask(transRec));
                }
                sequence.push(function () {
                    fluid.invokeGlobalFunction(workflow.funcName, [shadows, transRec]);
                });
            });
//             sequence.push(fluid.waitPendingIOTask(transRec));

            var revShadows = fluid.makeArray(shadows).reverse();
            if (transRec.breakAt === "observation") {
                sequence.push(fluid.localWorkflowToTask(fluid.concludeComponentObservation, revShadows));
            } else {
                transRec.workflows.local.forEach(function (workflow) {
                    if (workflow.waitIO) {
                        sequence.push(fluid.waitPendingIOTask(transRec));
                    }
                    var workflowFunc = fluid.getGlobalValue(workflow.funcName);
                    sequence.push(fluid.localWorkflowToTask(workflowFunc, revShadows));
                });
            }
        }
        return togo;
    };

    // Tightly bound to commitPotentiaePhase - broken out as a function so that we can call it from
    // fluid.fetchInjectedComponentReference for out-of-order construction.
    fluid.operateOneCreatePotentia = function (transRec, potentia) {
        potentia.applied = true;
        --transRec.pendingPotentiae.activeCount;
        var shadow = fluid.operateCreatePotentia(transRec, transRec.pendingPotentiae, potentia);
        if (shadow) {
            transRec.outputShadows.push(shadow);
        }
        return shadow && shadow.that;
    };

    /* Operate one phase of a tree transaction, consisting of a list of component destructions and a list of
     * component creations.
     */

    fluid.commitPotentiaePhase = function (transRec, sequencer) {
        var pendingPotentiae = transRec.pendingPotentiae;
        pendingPotentiae.destroys.forEach(function (potentia) {
            if (!potentia.applied) {
                fluid.operateDestroyPotentia(transRec, potentia);
                potentia.applied = true;
                --pendingPotentiae.activeCount;
            }
        });
        transRec.outputShadows = [];
        for (var i = 0; i < pendingPotentiae.creates.length; ++i) {
            var potentia = pendingPotentiae.creates[i]; // not "forEach" since further elements will accumulate during construction
            if (!potentia.applied) {
                if (potentia.type === "create") {
                    fluid.operateOneCreatePotentia(transRec, potentia);
                } else if (potentia.type === "distributeOptions") {
                    potentia.distributions.forEach(function (distro) {
                        fluid.distributeOptionsOne(distro.that, distro.record, distro.targetRef, distro.selector, distro.context);
                    });
                    potentia.applied = true;
                    --pendingPotentiae.activeCount;
                } else {
                    fluid.fail("Unrecognised potentia type " + potentia.type);
                }
            }
        }
        return fluid.concludePotentiaePhase(transRec, sequencer);
    };

    fluid.isPopulatedPotentiaList = function (potentiaList) {
        return potentiaList.activeCount > 0;
    };

    /** Commit all potentiae that have been enqueued through calls to fluid.registerPotentia for the supplied transaction,
     * as well as any further potentiae which become enqueued through construction of these, potentially in multiple phases
     * @param {String} transactionId - The id of the tree transaction to be committed - this must already have been started
     * with `fluid.beginTreeTransaction`.
     * @return {Shadow|Undefined} The shadow record for the first component to be constructed during the transaction, if any.
     */
    fluid.commitPotentiae = function (transactionId) {
        var instantiator = fluid.globalInstantiator;
        var transRec = instantiator.treeTransactions[transactionId];
        var togo;
        var rootSequencer = transRec.rootSequencer;
        var sequencer = fluid.promise.makeSequencer([], {}, fluid.promise.makeSequenceStrategy());
        rootSequencer.sources.push(sequencer.promise);
        if (!rootSequencer.sequenceStarted) {
            fluid.promise.resumeSequence(rootSequencer);
        }
        fluid.tryCatch(function commitPotentiae() {
            while (fluid.isPopulatedPotentiaList(transRec.pendingPotentiae)) {
                var firstShadow = fluid.commitPotentiaePhase(transRec, sequencer);
                togo = togo || firstShadow;
            }
            if (!sequencer.sequenceStarted) {
                fluid.promise.resumeSequence(sequencer);
            }
        }, function (e) {
            if (!transRec.promise.disposition) {
                transRec.promise.reject(e);
            }
        });
        // instantiator.currentTreeTransactionId = null;
        return togo;
    };

    /** Push the supplied potentia onto a potentia list structure (as dispensed from `fluid.blankPotentiaList()`).
     * @param {PotentiaList} potentiaList - The transaction record for the current tree transaction
     * @param {Instantiator} instantiator - The instantiator operating the transaction
     * @param {Potentia} potentia - A potentia to be registered
     */
    fluid.pushPotentia = function (potentiaList, instantiator, potentia) {
        var segs = potentia.segs = potentia.segs || instantiator.parseToSegments(potentia.path);
        var path = potentia.path = instantiator.composeSegments.apply(null, segs);

        if (potentia.type === "destroy") {
            potentiaList.destroys.push(potentia);
            potentiaList.activeCount++;
        } else {
            var newPotentia = potentia;
            if (potentia.type === "create") {
                newPotentia = fluid.pushCreatePotentia(potentiaList, path, potentia);
            }
            if (newPotentia) {
                potentiaList.creates.push(potentia);
                potentiaList.activeCount++;
            };
        }
    };

    /** BEGIN NEXUS/POTENTIA METHODS - THESE ARE PUBLIC API **/

    /**
     * Given a component reference, returns the path of that component within its component tree.
     *
     * @param {Component} component - A reference to a component.
     * @param {Instantiator} [instantiator] - (optional) An instantiator to use for the lookup.
     * @return {String[]} An array of {String} path segments of the component within its tree, or `null` if the reference does not hold a live component.
     */

    fluid.pathForComponent = function (component, instantiator) {
        instantiator = instantiator || fluid.getInstantiator(component) || fluid.globalInstantiator;
        var shadow = instantiator.idToShadow[component.id];
        if (!shadow) {
            return null;
        }
        return instantiator.parseEL(shadow.path);
    };

    /**
     * Returns the current tree transaction which a constructing component is enlisted in. This may be undefined
     * if the transaction has concluded.
     * @return {TreeTransaction|Undefined} The tree transaction.
     */
    fluid.currentTreeTransaction = function () {
        var instantiator = fluid.globalInstantiator;
        return instantiator.treeTransactions[instantiator.currentTreeTransactionId];
    };

    /** Begin a fresh transaction against the global component tree. Any further calls to `fluid.registerPotentia`,
     * `fluid.construct` or `fluid.destroy` may be contextualised by this transaction, and then committed as a single
     * unit via `fluid.commitPotentiae` or cancelled via `fluid.cancelTreeTransaction`.
     * @param {Object} [transactionOptions] - [optional] A set of options configuring this tree transaction. This may include fields
     *     {String} breakAt - one of the values:
     *         `shells`: signifying that this transaction should pause as soon as all component shells are constructed (see FLUID-4925)
     *         `observation`: signifying that this transaction should pause once the observation process of all components is concluded - that is,
     *               that all component options, members and invokers are evaluated.
     * @return {TreeTransaction} The freshly allocated tree transaction.
     */
    fluid.beginTreeTransaction = function (transactionOptions) {
        var instantiator = fluid.globalInstantiator;
        if (instantiator.currentTreeTransactionId) {
            fluid.fail("Attempt to start new tree transaction when transaction " + instantiator.currentTreeTransactionId + " is already active");
        }
        var transactionId = instantiator.currentTreeTransactionId = fluid.allocateGuid();
        var transRec = $.extend({
            transactionId: transactionId,
            rootSequencer: fluid.promise.makeSequencer([], {}, fluid.promise.makeSequenceStrategy()),
            pendingPotentiae: fluid.blankPotentiaList(), // array of potentia which remain to be handled
            restoreRecords: fluid.blankPotentiaList(), // accumulate a list of records to be executed in case the transaction is backed out
            deferredDistributions: [], // distributeOptions may decide to defer application of a distribution for FLUID-6193,
            cancelled: false,
            cancellationError: null,
            initModelTransaction: {},
            pendingIO: [] // list of outstanding promises from workflow in progress
        }, transactionOptions);
        transRec.promise = transRec.rootSequencer.promise;

        var onConclude = function () {
            if (transRec.rootSequencer.promise.disposition) {
                instantiator.currentTreeTransactionId = null;
                delete instantiator.treeTransactions[transactionId];
            }
        };

        var onException = function (err) {
            if (!transRec.cancelled) {
                delete transRec.sequencer;
                fluid.cancelTreeTransaction(transactionId, instantiator, err);
                onConclude();
            }
        };
        transRec.promise.then(onConclude, onException);

        instantiator.treeTransactions[transactionId] = transRec;
        return transRec;
    };

    /** Signature as for `fluid.construct`. Registers the intention of constructing or destroying a component at a particular path. The action will
     * occur once the transaction is committed.
     * @param {Potentia} potentia - A record designating the kind of change to occur. Fields:
     *    type: {String} Either "create" or "destroy".
     *    path: {String|Array of String} Path where the component is to be constructed or destroyed, represented as a string or array of segments
     *    componentDepth: {Number} The depth of nesting of this record from the originally created component - defaults to 0
     *    records: {Array of Object} A component's construction record, as they would currently appear in a component's "options.components.x" record
     * @param {String} [transactionId] [optional] A transaction id in which to enlist this registration. If this is omitted, the current transaction
     *     will be used, if there is one - otherwise, a fresh transaction will be allocated using `fluid.beginTreeTransaction`.
     * @return {TreeTransaction} - The transaction that the supplied potentia record was enrolled into
     */
    fluid.registerPotentia = function (potentia, transactionId) {
        var instantiator = fluid.globalInstantiator;
        transactionId = transactionId || instantiator.currentTreeTransactionId;
        if (!transactionId) {
            transactionId = fluid.beginTreeTransaction().transactionId;
        }
        var transRec = instantiator.treeTransactions[transactionId];
        fluid.pushPotentia(transRec.pendingPotentiae, instantiator, potentia);

        return transRec;
    };


    /** Cancel the transaction with the supplied transaction id. This cancellation will undo any actions journalled in
     * the transaction's `restoreRecords` by a further call to `fluid.commitPotentiae`.
     * @param {String} transactionId - The id of the transaction to be cancelled
     * @param {Instantiator} instantiator - The current instantiator
     */
    fluid.cancelTreeTransaction = function (transactionId, instantiator) {
        var transRec = instantiator.treeTransactions[transactionId];
        if (transRec) {
            try {
                transRec.pendingPotentiae = transRec.restoreRecords;
                transRec.restoreRecords = fluid.blankPotentiaList();
                transRec.cancelled = true;
                transRec.initModelTransaction = {};
                fluid.commitPotentiae(transactionId, true);
            } catch (e) {
                fluid.log(fluid.logLevel.FAIL, "Fatal error cancelling transaction " + transactionId + ": destroying all affected paths");
                transRec.restoreRecords.forEach(function (potentia) {
                    instantiator.clearComponent(potentia.parentThat, potentia.memberName, potentia.parentThat[potentia.memberName]);
                });
                throw e;
            }
        }
    };

    /** Constructs a subcomponent as a child of an existing component, via a call to `fluid.construct`. Note that if
     * a component already exists with the member name `memberName`, it will first be destroyed.
     * @param {Component} parent - Component for which a child subcomponent is to be constructed
     * @param {String} memberName - The member name of the resulting component in its parent
     * @param {Object} options - The top-level options supplied to the component, as for `fluid.construct`
     * @return {Component} The constructed component
     */
    fluid.constructChild = function (parent, memberName, options) {
        var parentPath = fluid.pathForComponent(parent);
        var path = parentPath.concat([memberName]);
        return fluid.construct(path, options);
    };

    /** Construct a component with the supplied options at the specified path in the component tree. The parent path of the location must already be a component. If
     * a component is already present at the specified path, it will first be destroyed.
     * @param {String|String[]} path - Path where the new component is to be constructed, represented as a string or array of string segments
     * @param {Object} componentOptions - Top-level options supplied to the component - must at the very least include a field <code>type</code> holding the component's type
     * @param {Object} [constructOptions] - [optional] A record of options guiding the construction of this component
     *     transactionId {String} [optional] A transaction which this construction action should be enlisted in. If this is supplied, the transaction will not
     *         be committed after the component's construction - instead, this must be done explicitly by the user by a later call to `fluid.commitPotentiae`.
     *     localRecord {Object} A hash of context keys to context values which should be in scope for resolution of IoC references within this construction
     *         be committed, and the user must do so themselves via `fluid.commitPotentiae`
     *     returnTransaction {Boolean} [optional] If `true`, the return value will be the transaction record rather than any constructing component. This is most
     *         useful to detect the point of failure of an asynchronously constructed component by attaching to `transRec.promise`.
     * @return {Component|TreeTransaction|Undefined} The constructed component, if its construction has begun, or the transaction record, if `returnTransaction` was requested.
     */
    fluid.construct = function (path, componentOptions, constructOptions) {
        constructOptions = constructOptions || {};
        var transRec = fluid.registerPotentia({
            path: path,
            type: "destroy"
        }, constructOptions.transactionId);
        var record = {
            recordType: "user"
        };
        // Courtesy to restructure record before one day we have FLUID-5750 options flattening
        fluid.each(fluid.componentRecordExpected, function (troo, key) {
            if (componentOptions[key] !== undefined) {
                record[key] = componentOptions[key];
            }
        });
        record.options = componentOptions;
        var potentia = {
            path: path,
            type: "create",
            localRecord: constructOptions.localRecord,
            records: [record]
        };
        fluid.registerPotentia(potentia, transRec.transactionId);
        if (!constructOptions.transactionId) {
            fluid.commitPotentiae(transRec.transactionId);
        }
        return constructOptions.returnTransaction ? transRec : fluid.getImmediate(fluid.rootComponent, potentia.segs);
    };

    /** Destroys a component held at the specified path. The parent path must represent a component, although the component itself may be nonexistent
     * @param {String|String[]} path - Path where the new component is to be destroyed, represented as a string or array of string segments
     * @param {Instantiator} [instantiator] - [optional] The instantiator holding the component to be destroyed - if blank, the global instantiator will be used.
     * @return {TreeTransaction} The transaction that the destruction occurred in.
     */
    fluid.destroy = function (path, instantiator) {
        instantiator = instantiator || fluid.globalInstantiator;
        var segs = instantiator.parseToSegments(path);
        if (segs.length === 0) {
            fluid.fail("Cannot destroy the root component");
        }
        var transRec = fluid.registerPotentia({
            path: path,
            type: "destroy"
        });
        fluid.commitPotentiae(transRec.transactionId);
        return transRec;
    };

   /** Construct an instance of a component as a child of the specified parent, with a well-known, unique name derived from its typeName
    * @param {String|String[]} parentPath - Parent of path where the new component is to be constructed, represented as a {String} or array of {String} segments
    * @param {String|Object} options - Options encoding the component to be constructed. If this is of type String, it is assumed to represent the component's typeName with no options
    * @param {Instantiator} [instantiator] - [optional] The instantiator holding the component to be created - if blank, the global instantiator will be used
    * @return {Component} The constructed component
    */
    fluid.constructSingle = function (parentPath, options, instantiator) {
        instantiator = instantiator || fluid.globalInstantiator;
        parentPath = parentPath || "";
        var segs = fluid.model.parseToSegments(parentPath, instantiator.parseEL, true);
        if (typeof(options) === "string") {
            options = {type: options};
        }
        var type = options.type;
        if (!type) {
            fluid.fail("Cannot construct singleton object without a type entry");
        }
        options = $.extend({}, options);
        var gradeNames = options.gradeNames = fluid.makeArray(options.gradeNames);
        gradeNames.unshift(type); // principal type may be noninstantiable
        options.type = "fluid.component";
        var root = segs.length === 0;
        if (root) {
            gradeNames.push("fluid.resolveRoot");
        }
        var memberName = fluid.typeNameToMemberName(options.singleRootType || type);
        segs.push(memberName);
        return fluid.construct(segs, options);
    };

    /** Destroy an instance created by `fluid.constructSingle`
     * @param {String|String[]} parentPath - Parent of path where the new component is to be constructed, represented as a {String} or array of {String} segments
     * @param {String} typeName - The type name used to construct the component (either `type` or `singleRootType` of the `options` argument to `fluid.constructSingle`
     * @param {Instantiator} [instantiator] - [optional] The instantiator holding the component to be created - if blank, the global instantiator will be used
    */
    fluid.destroySingle = function (parentPath, typeName, instantiator) {
        instantiator = instantiator || fluid.globalInstantiator;
        var segs = fluid.model.parseToSegments(parentPath, instantiator.parseEL, true);
        var memberName = fluid.typeNameToMemberName(typeName);
        segs.push(memberName);
        fluid.destroy(segs, instantiator);
    };

    /** Registers and constructs a "linkage distribution" which will ensure that wherever a set of "input grades" co-occur, they will
     * always result in a supplied "output grades" in the component where they co-occur.
     * @param {String} linkageName - The name of the grade which will broadcast the resulting linkage. If required, this linkage can be destroyed by supplying this name to `fluid.destroySingle`.
     * @param {String[]} inputNames - An array of grade names which will be tested globally for co-occurrence
     * @param {String|String[]} outputNames - A single grade name or array of grade names which will be output into the co-occuring component
     */
    fluid.makeGradeLinkage = function (linkageName, inputNames, outputNames) {
        fluid.defaults(linkageName, {
            gradeNames: "fluid.component",
            distributeOptions: {
                record: outputNames,
                target: "{/ " + inputNames.join("&") + "}.options.gradeNames"
            }
        });
        fluid.constructSingle([], linkageName);
    };

    /** Retrieves a component by global path.
    * @param {String|String[]} path - The global path of the component to look up, expressed as a string or as an array of segments.
    * @return {Object} - The component at the specified path, or undefined if none is found.
    */
    fluid.componentForPath = function (path) {
        return fluid.globalInstantiator.pathToComponent[fluid.isArrayable(path) ? path.join(".") : path];
    };

    /** END NEXUS/POTENTIA METHODS - END OF PUBLIC API **/

    fluid.thisistToApplicable = function (record, recthis, that) {
        return {
            apply: function (noThis, args) {
                // Resolve this material late, to deal with cases where the target has only just been brought into existence
                // (e.g. a jQuery target for rendered material) - TODO: Possibly implement cached versions of these as we might do for invokers
                var resolvedThis = fluid.expandOptions(recthis, that);
                if (typeof(resolvedThis) === "string") {
                    resolvedThis = fluid.getGlobalValue(resolvedThis);
                }
                if (!resolvedThis) {
                    fluid.fail("Could not resolve reference " + recthis + " to a value");
                }
                var resolvedFunc = resolvedThis[record.method];
                if (typeof(resolvedFunc) !== "function") {
                    fluid.fail("Object ", resolvedThis, " at reference " + recthis + " has no member named " + record.method + " which is a function ");
                }
                if (fluid.passLogLevel(fluid.logLevel.TRACE)) {
                    fluid.log(fluid.logLevel.TRACE, "Applying arguments ", args, " to method " + record.method + " of instance ", resolvedThis);
                }
                return resolvedFunc.apply(resolvedThis, args);
            }
        };
    };

    fluid.changeToApplicable = function (record, that) {
        return {
            apply: function (noThis, args, localRecord, mergeRecord) {
                var parsed = fluid.parseValidModelReference(that, "changePath listener record", record.changePath);
                var value = fluid.expandOptions(record.value, that, {}, fluid.extend(localRecord, {"arguments": args}));
                var sources = mergeRecord && mergeRecord.source && mergeRecord.source.length ? fluid.makeArray(record.source).concat(mergeRecord.source) : record.source;
                parsed.applier.change(parsed.modelSegs, value, record.type, sources); // FLUID-5586 now resolved
            }
        };
    };

    // Convert "exotic records" into an applicable form ("this/method" for FLUID-4878 or "changePath" for FLUID-3674)
    fluid.recordToApplicable = function (record, that, standard) {
        if (record.changePath !== undefined) { // Allow falsy paths for FLUID-5586
            return fluid.changeToApplicable(record, that, standard);
        }
        var recthis = record["this"];
        if (record.method ^ recthis) {
            fluid.fail("Record ", that, " must contain both entries \"method\" and \"this\" if it contains either");
        }
        return record.method ? fluid.thisistToApplicable(record, recthis, that) : null;
    };

    fluid.getGlobalValueNonComponent = function (funcName, context) { // TODO: Guard this in listeners as well
        var defaults = fluid.defaults(funcName);
        if (defaults && fluid.hasGrade(defaults, "fluid.component")) {
            fluid.fail("Error in function specification - cannot invoke function " + funcName + " in the context of " + context + ": component creator functions can only be used as subcomponents");
        }
        return fluid.getGlobalValue(funcName);
    };

    fluid.makeInvoker = function (that, invokerec, name) {
        invokerec = fluid.upgradePrimitiveFunc(invokerec); // shorthand case for direct function invokers (FLUID-4926)
        if (invokerec.args !== undefined && invokerec.args !== fluid.NO_VALUE && !fluid.isArrayable(invokerec.args)) {
            invokerec.args = fluid.makeArray(invokerec.args);
        }
        var func = fluid.recordToApplicable(invokerec, that);
        var invokePre = fluid.preExpand(invokerec.args);
        var localRecord = {};
        var expandOptions = fluid.makeStackResolverOptions(that, localRecord, true);
        func = func || (invokerec.funcName ? fluid.getGlobalValueNonComponent(invokerec.funcName, "an invoker") : fluid.expandImmediate(invokerec.func, that));
        if (!func || !func.apply) {
            fluid.fail("Error in invoker record: could not resolve members func, funcName or method to a function implementation - got " + func + " from ", invokerec);
        } else if (func === fluid.notImplemented) {
            fluid.fail("Error constructing component ", that, " - the invoker named " + name + " which was defined in grade " + invokerec.componentSource + " needs to be overridden with a concrete implementation");
        }
        return function invokeInvoker() {
            if (fluid.defeatLogging === false) {
                fluid.pushActivity("invokeInvoker", "invoking invoker with name %name and record %record from path %path holding component %that",
                    {name: name, record: invokerec, path: fluid.dumpComponentPath(that), that: that});
            }
            var togo, finalArgs;
            if (that.lifecycleStatus === "destroyed") {
                fluid.log(fluid.logLevel.WARN, "Ignoring call to invoker " + name + " of component ", that, " which has been destroyed");
            } else {
                localRecord.arguments = arguments;
                if (invokerec.args === undefined || invokerec.args === fluid.NO_VALUE) {
                    finalArgs = arguments;
                } else {
                    fluid.expandImmediateImpl(invokePre, expandOptions);
                    finalArgs = invokePre.source;
                }
                togo = func.apply(null, finalArgs);
            }
            if (fluid.defeatLogging === false) {
                fluid.popActivity();
            }
            return togo;
        };
    };

    // weird higher-order function so that we can staightforwardly dispatch original args back onto listener
    fluid.event.makeTrackedListenerAdder = function (source) {
        var shadow = fluid.shadowForComponent(source);
        return function (event) {
            return {addListener: function (listener, namespace, priority, softNamespace, listenerId) {
                fluid.recordListener(event, listener, shadow, listenerId);
                event.addListener.apply(null, arguments);
            }};
        };
    };

    fluid.event.listenerEngine = function (eventSpec, callback, adder) {
        var argstruc = {};
        function checkFire() {
            var notall = fluid.find(eventSpec, function (value, key) {
                if (argstruc[key] === undefined) {
                    return true;
                }
            });
            if (!notall) {
                var oldstruc = argstruc;
                argstruc = {}; // guard against the case the callback perversely fires one of its prerequisites (FLUID-5112)
                callback(oldstruc);
            }
        }
        fluid.each(eventSpec, function (event, eventName) {
            adder(event).addListener(function () {
                argstruc[eventName] = fluid.makeArray(arguments);
                checkFire();
            });
        });
    };

    fluid.event.dispatchListener = function (that, listener, eventName, eventSpec, wrappedArgs) {
        if (eventSpec.args !== undefined && eventSpec.args !== fluid.NO_VALUE && !fluid.isArrayable(eventSpec.args)) {
            eventSpec.args = fluid.makeArray(eventSpec.args);
        }
        listener = fluid.event.resolveListener(listener); // In theory this optimisation is too aggressive if global name is not defined yet
        var dispatchPre = fluid.preExpand(eventSpec.args);
        var localRecord = {};
        var expandOptions = fluid.makeStackResolverOptions(that, localRecord, true);
        var togo = function () {
            if (fluid.defeatLogging === false) {
                fluid.pushActivity("dispatchListener", "firing to listener to event named %eventName of component %that",
                    {eventName: eventName, that: that});
            }

            var args = wrappedArgs ? arguments[0] : arguments, finalArgs;
            localRecord.arguments = args;
            if (eventSpec.args !== undefined && eventSpec.args !== fluid.NO_VALUE) {
                // In theory something more exotic happens here, and in makeInvoker - where "source" is an array we want to
                // keep its base reference stable since Function.apply will fork it sufficiently, but we really need to
                // clone each structured argument. Implies that expandImmediateImpl needs to be split in two, and operate
                // reference by "segs" rather than by "holder"
                fluid.expandImmediateImpl(dispatchPre, expandOptions);
                finalArgs = dispatchPre.source;
            } else {
                finalArgs = args;
            }
            var togo = listener.apply(null, finalArgs);
            if (fluid.defeatLogging === false) {
                fluid.popActivity();
            }
            return togo;
        };
        fluid.event.impersonateListener(listener, togo); // still necessary for FLUID-5254 even though framework's listeners now get explicit guids
        return togo;
    };

    fluid.event.resolveSoftNamespace = function (key) {
        if (typeof(key) !== "string") {
            return null;
        } else {
            var lastpos = Math.max(key.lastIndexOf("."), key.lastIndexOf("}"));
            return key.substring(lastpos + 1);
        }
    };

    fluid.event.resolveListenerRecord = function (lisrec, that, eventName, namespace, standard) {
        var badRec = function (record, extra) {
            fluid.fail("Error in listener record - could not resolve reference ", record, " to a listener or firer. " +
                "Did you miss out \"events.\" when referring to an event firer?" + extra);
        };
        fluid.pushActivity("resolveListenerRecord", "resolving listener record for event named %eventName for component %that",
            {eventName: eventName, that: that});
        var records = fluid.makeArray(lisrec);
        var transRecs = fluid.transform(records, function (record) {
            // TODO: FLUID-5242 fix - we copy here since distributeOptions does not copy options blocks that it distributes and we can hence corrupt them.
            // need to clarify policy on options sharing - for slightly better efficiency, copy should happen during distribution and not here
            // Note that fluid.mergeModelListeners expects to write to these too
            var expanded = fluid.isPrimitive(record) || record.expander ? {listener: record} : fluid.copy(record);
            var methodist = fluid.recordToApplicable(record, that, standard);
            if (methodist) {
                expanded.listener = methodist;
            }
            else {
                expanded.listener = expanded.listener || expanded.func || expanded.funcName;
            }
            if (!expanded.listener) {
                badRec(record, " Listener record must contain a member named \"listener\", \"func\", \"funcName\" or \"method\"");
            }
            var softNamespace = record.method ?
                fluid.event.resolveSoftNamespace(record["this"]) + "." + record.method :
                fluid.event.resolveSoftNamespace(expanded.listener);
            if (!expanded.namespace && !namespace && softNamespace) {
                expanded.softNamespace = true;
                expanded.namespace = (record.componentSource ? record.componentSource : that.typeName) + "." + softNamespace;
            }
            var listener = expanded.listener = fluid.expandOptions(expanded.listener, that);
            if (!listener) {
                badRec(record, "");
            }
            var firer = false;
            if (listener.typeName === "fluid.event.firer") {
                listener = listener.fire;
                firer = true;
            }
            expanded.listener = (standard && (expanded.args && listener !== "fluid.notImplemented" || firer)) ? fluid.event.dispatchListener(that, listener, eventName, expanded) : listener;
            expanded.listenerId = fluid.allocateGuid();
            return expanded;
        });
        var togo = {
            records: transRecs,
            adderWrapper: standard ? fluid.event.makeTrackedListenerAdder(that) : null
        };
        fluid.popActivity();
        return togo;
    };

    fluid.event.expandOneEvent = function (that, event) {
        var origin;
        if (typeof(event) === "string" && event.charAt(0) !== "{") {
            // Shorthand for resolving onto our own events, but with GINGER WORLD!
            origin = fluid.getForComponent(that, ["events", event]);
        }
        else {
            origin = fluid.expandOptions(event, that);
        }
        if (!origin || origin.typeName !== "fluid.event.firer") {
            fluid.fail("Error in event specification - could not resolve base event reference ", event, " to an event firer: got ", origin);
        }
        return origin;
    };

    fluid.event.expandEvents = function (that, event) {
        return typeof(event) === "string" ?
            fluid.event.expandOneEvent(that, event) :
            fluid.transform(event, function (oneEvent) {
                return fluid.event.expandOneEvent(that, oneEvent);
            });
    };

    fluid.event.resolveEvent = function (that, eventName, eventSpec) {
        fluid.pushActivity("resolveEvent", "resolving event with name %eventName attached to component %that",
            {eventName: eventName, that: that});
        var adder = fluid.event.makeTrackedListenerAdder(that);
        if (typeof(eventSpec) === "string") {
            eventSpec = {event: eventSpec};
        }
        var event = eventSpec.typeName === "fluid.event.firer" ? eventSpec : eventSpec.event || eventSpec.events;
        if (!event) {
            fluid.fail("Event specification for event with name " + eventName + " does not include a base event specification: ", eventSpec);
        }

        var origin = event.typeName === "fluid.event.firer" ? event : fluid.event.expandEvents(that, event);

        var isMultiple = origin.typeName !== "fluid.event.firer";
        var isComposite = eventSpec.args || isMultiple;
        // If "event" is not composite, we want to share the listener list and FIRE method with the original
        // If "event" is composite, we need to create a new firer. "composite" includes case where any boiling
        // occurred - this was implemented wrongly in 1.4.
        var firer;
        if (isComposite) {
            firer = fluid.makeEventFirer({name: " [composite] " + fluid.event.nameEvent(that, eventName)});
            var dispatcher = fluid.event.dispatchListener(that, firer.fire, eventName, eventSpec, isMultiple);
            if (isMultiple) {
                fluid.event.listenerEngine(origin, dispatcher, adder);
            }
            else {
                adder(origin).addListener(dispatcher);
            }
        }
        else {
            firer = {typeName: "fluid.event.firer"};
            firer.fire = function () {
                var outerArgs = fluid.makeArray(arguments);
                fluid.pushActivity("fireSynthetic", "firing synthetic event %eventName ", {eventName: eventName});
                var togo = origin.fire.apply(null, outerArgs);
                fluid.popActivity();
                return togo;
            };
            firer.addListener = function (listener, namespace, priority, softNamespace, listenerId) {
                var dispatcher = fluid.event.dispatchListener(that, listener, eventName, eventSpec);
                adder(origin).addListener(dispatcher, namespace, priority, softNamespace, listenerId);
            };
            firer.removeListener = function (listener) {
                origin.removeListener(listener);
            };
            // To allow introspection on listeners in cases such as fluid.test.findListenerId
            firer.originEvent = origin;
        }
        fluid.popActivity();
        return firer;
    };

    /* Compact expansion machinery - for short form invoker and expander references such as @expand:func(arg) and func(arg) */

    fluid.coerceToPrimitive = function (string) {
        return string === "false" ? false : (string === "true" ? true :
            (isFinite(string) ? Number(string) : string));
    };

    fluid.compactStringToRec = function (string, type) {
        var openPos = string.indexOf("(");
        var closePos = string.indexOf(")");
        if (openPos === -1 ^ closePos === -1 || openPos > closePos) {
            fluid.fail("Badly-formed compact " + type + " record without matching parentheses: " + string);
        }
        if (openPos !== -1 && closePos !== -1) {
            var trail = string.substring(closePos + 1);
            if ($.trim(trail) !== "") {
                fluid.fail("Badly-formed compact " + type + " record " + string + " - unexpected material following close parenthesis: " + trail);
            }
            var prefix = string.substring(0, openPos);
            var body = $.trim(string.substring(openPos + 1, closePos));
            var args = body === "" ? [] : fluid.transform(body.split(","), $.trim, fluid.coerceToPrimitive);
            var togo = fluid.upgradePrimitiveFunc(prefix, null);
            togo.args = args;
            return togo;
        }
        else if (type === "expander") {
            fluid.fail("Badly-formed compact expander record without parentheses: " + string);
        }
        return string;
    };

    fluid.expandPrefix = "@expand:";

    fluid.expandCompactString = function (string, active) {
        var rec = string;
        if (string.indexOf(fluid.expandPrefix) === 0) {
            var rem = string.substring(fluid.expandPrefix.length);
            rec = {
                expander: fluid.compactStringToRec(rem, "expander")
            };
        }
        else if (active) {
            rec = fluid.compactStringToRec(string, active);
        }
        return rec;
    };

    var singularPenRecord = {
        listeners: "listener",
        modelListeners: "modelListener"
    };

    var singularRecord = $.extend({
        invokers: "invoker"
    }, singularPenRecord);

    fluid.expandCompactRec = function (segs, target, source) {
        fluid.guardCircularExpansion(segs, segs.length);
        var pen = segs.length > 0 ? segs[segs.length - 1] : "";
        var active = singularRecord[pen];
        if (!active && segs.length > 1) {
            active = singularPenRecord[segs[segs.length - 2]]; // support array of listeners and modelListeners
        }
        fluid.each(source, function (value, key) {
            if (fluid.isPlainObject(value)) {
                target[key] = fluid.freshContainer(value);
                segs.push(key);
                fluid.expandCompactRec(segs, target[key], value);
                segs.pop();
                return;
            }
            else if (typeof(value) === "string") {
                value = fluid.expandCompactString(value, active);
            }
            target[key] = value;
        });
    };

    fluid.expandCompact = function (options) {
        var togo = {};
        fluid.expandCompactRec([], togo, options);
        return togo;
    };

    /** End compact record expansion machinery **/

    fluid.extractEL = function (string, options) {
        if (options.ELstyle === "ALL") {
            return string;
        }
        else if (options.ELstyle.length === 1) {
            if (string.charAt(0) === options.ELstyle) {
                return string.substring(1);
            }
        }
        else if (options.ELstyle === "${}") {
            var i1 = string.indexOf("${");
            var i2 = string.lastIndexOf("}");
            if (i1 === 0 && i2 !== -1) {
                return string.substring(2, i2);
            }
        }
    };

    fluid.extractELWithContext = function (string, options) {
        var EL = fluid.extractEL(string, options);
        if (fluid.isIoCReference(EL)) {
            return fluid.parseContextReference(EL);
        }
        return EL ? {path: EL} : EL;
    };

    /** Parse the string form of a contextualised IoC reference into an object.
     * @param {String} reference - The reference to be parsed. The character at position `index` is assumed to be `{`
     * @param {String} [index] - [optional] The index into the string to start parsing at, if omitted, defaults to 0
     * @param {Character} [delimiter] - [optional] A character which will delimit the end of the context expression. If omitted, the expression continues to the end of the string.
     * @return {ParsedContext} A structure holding the parsed structure, with members
     *    context {String|ParsedContext} The context portion of the reference. This will be a `string` for a flat reference, or a further `ParsedContext` for a recursive reference
     *    path {String} The string portion of the reference
     *    endpos {Integer} The position in the string where parsing stopped [this member is not supported and will be removed in a future release]
     */
    fluid.parseContextReference = function (reference, index, delimiter) {
        index = index || 0;
        var isNested = reference.charAt(index + 1) === "{", endcpos, context, nested;
        if (isNested) {
            nested = fluid.parseContextReference(reference, index + 1, "}");
            endcpos = nested.endpos;
        } else {
            endcpos = reference.indexOf("}", index + 1);
        }
        if (endcpos === -1) {
            fluid.fail("Cannot parse context reference \"" + reference + "\": Malformed context reference without }");
        }
        if (isNested) {
            context = nested;
        } else {
            context = reference.substring(index + 1, endcpos);
        }
        var endpos = delimiter ? reference.indexOf(delimiter, endcpos + 1) : reference.length;
        var path = reference.substring(endcpos + 1, endpos);
        if (path.charAt(0) === ".") {
            path = path.substring(1);
        }
        return {context: context, path: path, endpos: endpos};
    };

    fluid.renderContextReference = function (parsed) {
        var context = parsed.context;
        return "{" + (typeof(context) === "string" ? context : fluid.renderContextReference(context)) + "}" + (parsed.path ? "." + parsed.path : "");
    };

    // TODO: Once we eliminate expandSource (in favour of fluid.expander.fetch), all of this tree of functions can be hived off to RendererUtilities
    fluid.resolveContextValue = function (string, options) {
        function fetch(parsed) {
            fluid.pushActivity("resolveContextValue", "resolving context value %parsed", {parsed: parsed});
            var togo = options.fetcher(parsed);
            fluid.pushActivity("resolvedContextValue", "resolved value %parsed to value %value", {parsed: parsed, value: togo});
            fluid.popActivity(2);
            return togo;
        }
        var parsed;
        if (options.bareContextRefs && fluid.isIoCReference(string)) {
            parsed = fluid.parseContextReference(string);
            return fetch(parsed);
        }
        else if (options.ELstyle && options.ELstyle !== "${}") {
            parsed = fluid.extractELWithContext(string, options);
            if (parsed) {
                return fetch(parsed);
            }
        }
        while (typeof(string) === "string") {
            var i1 = string.indexOf("${");
            var i2 = string.indexOf("}", i1 + 2);
            if (i1 !== -1 && i2 !== -1) {
                if (string.charAt(i1 + 2) === "{") {
                    parsed = fluid.parseContextReference(string, i1 + 2, "}");
                    i2 = parsed.endpos;
                }
                else {
                    parsed = {path: string.substring(i1 + 2, i2)};
                }
                var subs = fetch(parsed);
                var all = (i1 === 0 && i2 === string.length - 1);
                // TODO: test case for all undefined substitution
                if (subs === undefined || subs === null) {
                    return subs;
                }
                string = all ? subs : string.substring(0, i1) + subs + string.substring(i2 + 1);
            }
            else {
                break;
            }
        }
        return string;
    };

    // This function appears somewhat reusable, but not entirely - it probably needs to be packaged
    // along with the particular "strategy". Very similar to the old "filter"... the "outer driver" needs
    // to execute it to get the first recursion going at top level. This was one of the most odd results
    // of the reorganisation, since the "old work" seemed much more naturally expressed in terms of values
    // and what happened to them. The "new work" is expressed in terms of paths and how to move amongst them.
    fluid.fetchExpandChildren = function (target, i, segs, source, mergePolicy, options) {
        if (source.expander) { // possible expander at top level
            var expanded = fluid.expandExpander(target, source, options);
            if (fluid.isPrimitive(expanded) || !fluid.isPlainObject(expanded) || (fluid.isArrayable(expanded) ^ fluid.isArrayable(target))) {
                return expanded;
            }
            else { // make an attempt to preserve the root reference if possible
                $.extend(true, target, expanded);
            }
        }
        // NOTE! This expects that RHS is concrete! For material input to "expansion" this happens to be the case, but is not
        // true for other algorithms. Inconsistently, this algorithm uses "sourceStrategy" below. In fact, this "fetchChildren"
        // operation looks like it is a fundamental primitive of the system. We do call "deliverer" early which enables correct
        // reference to parent nodes up the tree - however, anyone processing a tree IN THE CHAIN requires that it is produced
        // concretely at the point STRATEGY returns. Which in fact it is...............
        fluid.each(source, function (newSource, key) {
            if (newSource === undefined) {
                target[key] = undefined; // avoid ever dispatching to ourselves with undefined source
            }
            else if (key !== "expander") {
                segs[i] = key;
                if (fluid.getImmediate(options.exceptions, segs, i) !== true) {
                    options.strategy(target, key, i + 1, segs, source, mergePolicy);
                }
            }
        });
        return target;
    };

    // TODO: This method is unnecessary and will quadratic inefficiency if RHS block is not concrete.
    // The driver should detect "homogeneous uni-strategy trundling" and agree to preserve the extra
    // "cursor arguments" which should be advertised somehow (at least their number)
    function regenerateCursor(source, segs, limit, sourceStrategy) {
        for (var i = 0; i < limit; ++i) {
            // copy segs to avoid aliasing with FLUID-5243
            source = sourceStrategy(source, segs[i], i, fluid.makeArray(segs));
        }
        return source;
    }

    fluid.isUnexpandable = function (source) { // slightly more efficient compound of fluid.isCopyable and fluid.isComponent - review performance
        return fluid.isPrimitive(source) || !fluid.isPlainObject(source);
    };

    fluid.expandSource = function (options, target, i, segs, deliverer, source, policy, recurse) {
        var expanded, isTrunk;
        var thisPolicy = fluid.derefMergePolicy(policy);
        if (typeof (source) === "string" && !thisPolicy.noexpand) {
            if (!options.defaultEL || source.charAt(0) === "{") { // hard-code this for performance
                fluid.pushActivity("expandContextValue", "expanding context value %source held at path %path", {source: source, path: fluid.path.apply(null, segs.slice(0, i))});
                expanded = fluid.resolveContextValue(source, options);
                fluid.popActivity(1);
            } else {
                expanded = source;
            }
        }
        else if (thisPolicy.noexpand || fluid.isUnexpandable(source)) {
            expanded = source;
        }
        else if (source.expander) {
            expanded = fluid.expandExpander(deliverer, source, options);
        }
        else {
            expanded = fluid.freshContainer(source);
            isTrunk = true;
        }
        if (expanded !== fluid.NO_VALUE) {
            deliverer(expanded);
        }
        if (isTrunk) {
            recurse(expanded, source, i, segs, policy);
        }
        return expanded;
    };

    fluid.guardCircularExpansion = function (segs, i) {
        if (i > fluid.strategyRecursionBailout) {
            fluid.fail("Overflow/circularity in options expansion, current path is ", segs, " at depth " , i, " - please ensure options are not circularly connected, or protect from expansion using the \"noexpand\" policy or expander");
        }
    };

    fluid.makeExpandStrategy = function (options) {
        var recurse = function (target, source, i, segs, policy) {
            return fluid.fetchExpandChildren(target, i || 0, segs || [], source, policy, options);
        };
        var strategy = function (target, name, i, segs, source, policy) {
            fluid.guardCircularExpansion(segs, i);
            if (!target) {
                return;
            }
            if (target.hasOwnProperty(name)) { // bail out if our work has already been done
                return target[name];
            }
            if (source === undefined) { // recover our state in case this is an external entry point
                source = regenerateCursor(options.source, segs, i - 1, options.sourceStrategy);
                policy = regenerateCursor(options.mergePolicy, segs, i - 1, fluid.concreteTrundler);
            }
            var thisSource = options.sourceStrategy(source, name, i, segs);
            var thisPolicy = fluid.concreteTrundler(policy, name);
            function deliverer(value) {
                target[name] = value;
            }
            return fluid.expandSource(options, target, i, segs, deliverer, thisSource, thisPolicy, recurse);
        };
        options.recurse = recurse;
        options.strategy = strategy;
        return strategy;
    };

    fluid.defaults("fluid.makeExpandOptions", {
        ELstyle:          "${}",
        bareContextRefs:  true,
        target:           fluid.inCreationMarker
    });

    fluid.makeExpandOptions = function (source, options) {
        options = $.extend({}, fluid.rawDefaults("fluid.makeExpandOptions"), options);
        options.defaultEL = options.ELStyle === "${}" && options.bareContextRefs; // optimisation to help expander
        options.expandSource = function (source) {
            return fluid.expandSource(options, null, 0, [], fluid.identity, source, options.mergePolicy, false);
        };
        if (!fluid.isUnexpandable(source)) {
            options.source = source;
            options.target = fluid.freshContainer(source);
            options.sourceStrategy = options.sourceStrategy || fluid.concreteTrundler;
            fluid.makeExpandStrategy(options);
            options.initter = function () {
                options.target = fluid.fetchExpandChildren(options.target, 0, [], options.source, options.mergePolicy, options);
            };
        }
        else { // these init immediately since we must deliver a valid root target
            options.strategy = fluid.concreteTrundler;
            options.initter = fluid.identity;
            if (typeof(source) === "string") {
                // Copy is necessary to resolve FLUID-6213 since targets are regularly scrawled over with "undefined" by dim expansion pathway
                // However, we can't screw up object identity for uncloneable things like events resolved via local expansion
                options.target = (options.defer ? fluid.copy : fluid.identity)(options.expandSource(source));
            }
            else {
                options.target = source;
            }
            options.immutableTarget = true;
        }
        return options;
    };

    // supported, PUBLIC API function
    fluid.expand = function (source, options) {
        var expandOptions = fluid.makeExpandOptions(source, options);
        expandOptions.initter();
        return expandOptions.target;
    };

    fluid.preExpandRecurse = function (root, source, holder, member, rootSegs) { // on entry, holder[member] = source
        fluid.guardCircularExpansion(rootSegs, rootSegs.length);
        function pushExpander(expander) {
            root.expanders.push({expander: expander, holder: holder, member: member});
            delete holder[member];
        }
        if (fluid.isIoCReference(source)) {
            var parsed = fluid.parseContextReference(source);
            var segs = fluid.model.parseEL(parsed.path);
            pushExpander({
                typeFunc: fluid.expander.fetch,
                context: parsed.context,
                segs: segs
            });
        } else if (fluid.isPlainObject(source)) {
            if (source.expander) {
                source.expander.typeFunc = fluid.getGlobalValue(source.expander.type || "fluid.invokeFunc");
                pushExpander(source.expander);
            } else {
                fluid.each(source, function (value, key) {
                    rootSegs.push(key);
                    fluid.preExpandRecurse(root, value, source, key, rootSegs);
                    rootSegs.pop();
                });
            }
        }
    };

    fluid.preExpand = function (source) {
        var root = {
            expanders: [],
            source: fluid.isUnexpandable(source) ? source : fluid.copy(source)
        };
        fluid.preExpandRecurse(root, root.source, root, "source", []);
        return root;
    };

    // Main pathway for freestanding material that is not part of a component's options
    fluid.expandImmediate = function (source, that, localRecord) {
        var options = fluid.makeStackResolverOptions(that, localRecord, true); // TODO: ELstyle and target are now ignored
        var root = fluid.preExpand(source);
        fluid.expandImmediateImpl(root, options);
        return root.source;
    };

    // High performance expander for situations such as invokers, listeners, where raw materials can be cached - consumes "root" structure produced by preExpand
    fluid.expandImmediateImpl = function (root, options) {
        var expanders = root.expanders;
        for (var i = 0; i < expanders.length; ++i) {
            var expander = expanders[i];
            expander.holder[expander.member] = expander.expander.typeFunc(null, expander, options);
        }
    };

    fluid.expandExpander = function (deliverer, source, options) {
        var expander = fluid.getGlobalValue(source.expander.type || "fluid.invokeFunc");
        if (!expander) {
            fluid.fail("Unknown expander with type " + source.expander.type);
        }
        return expander(deliverer, source, options);
    };

    fluid.registerNamespace("fluid.expander");

    // "deliverer" is null in the new (fast) pathway, this is a relic of the old "source expander" signature. It appears we can already globally remove this
    fluid.expander.fetch = function (deliverer, source, options) {
        var localRecord = options.localRecord, context = source.expander.context, segs = source.expander.segs;
        // TODO: Either type-check on context as string or else create fetchSlow
        var inLocal = localRecord[context] !== undefined;
        var contextStatus = options.contextThat.lifecycleStatus;
        // somewhat hack to anticipate "fits" for FLUID-4925 - we assume that if THIS component is in construction, its reference target might be too
        // if context is destroyed, we are most likely in an afterDestroy listener and so path records have been destroyed
        var fast = contextStatus === "treeConstructed" || contextStatus === "destroyed";
        var component = inLocal ? localRecord[context] : fluid.resolveContext(context, options.contextThat, fast);
        if (component) {
            var root = component;
            if (inLocal || component.lifecycleStatus !== "constructing") {
                for (var i = 0; i < segs.length; ++i) { // fast resolution of paths when no ginger process active
                    root = root ? root[segs[i]] : undefined;
                }
            } else {
                root = fluid.getForComponent(component, segs);
            }
            if (root === undefined && !inLocal) { // last-ditch attempt to get exotic EL value from component
                root = fluid.getForComponent(component, segs);
            }
            return root;
        } else if (segs.length > 0) {
            fluid.triggerMismatchedPathError(source.expander, options.contextThat);
        }
    };

    /* "light" expanders, starting with the default expander invokeFunc,
         which makes an arbitrary function call (after expanding arguments) and are then replaced in
         the configuration with the call results. These will probably be abolished and replaced with
         equivalent model transformation machinery */

    // This one is now positioned as the "universal expander" - default if no type supplied
    fluid.invokeFunc = function (deliverer, source, options) {
        var expander = source.expander;
        var args = fluid.makeArray(expander.args);
        var whichFuncEntry = expander.func ? "func" : (expander.funcName ? "funcName" : null);
        expander.args = args; // head off case where args is an EL reference which resolves to an array
        if (options.recurse) { // only available in the path from fluid.expandOptions - this will be abolished in the end
            args = options.recurse([], args);
        } else {
            expander = fluid.expandImmediate(expander, options.contextThat, options.localRecord);
            args = expander.args;
        }
        var funcEntry = expander[whichFuncEntry];
        var func = (options.expandSource ? options.expandSource(funcEntry) : funcEntry) || fluid.recordToApplicable(expander, options.contextThat);
        if (typeof(func) === "string") {
            func = fluid.getGlobalValue(func);
        }
        if (!func) {
            fluid.fail("Error in expander record ", source.expander, ": " + source.expander[whichFuncEntry] + " could not be resolved to a function for component ", options.contextThat);
        }
        return func.apply(null, args);
    };

    // The "noexpand" expander which simply unwraps one level of expansion and ceases.
    fluid.noexpand = function (deliverer, source) {
        return source.expander.value ? source.expander.value : source.expander.tree;
    };

})(jQuery, fluid_3_0_0);
