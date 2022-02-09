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

// Note: this file will be removed in Infusion 5 - iterateDom method will be moved into ReordererUtilities

fluid.dom = fluid.dom || {};

// Node walker function for iterateDom.
fluid.dom.getNextNode = function (iterator) {
    if (iterator.node.firstChild) {
        iterator.node = iterator.node.firstChild;
        iterator.depth += 1;
        return iterator;
    }
    while (iterator.node) {
        if (iterator.node.nextSibling) {
            iterator.node = iterator.node.nextSibling;
            return iterator;
        }
        iterator.node = iterator.node.parentNode;
        iterator.depth -= 1;
    }
    return iterator;
};

/**
 * Walks the DOM, applying the specified acceptor function to each element.
 * There is a special case for the acceptor, allowing for quick deletion of elements and their children.
 * Return "delete" from your acceptor function if you want to delete the element in question.
 * Return "stop" to terminate iteration.
 *
 * Implementation note - this utility exists mainly for performance reasons. It was last tested
 * carefully some time ago (around jQuery 1.2) but at that time was around 3-4x faster at raw DOM
 * filtration tasks than the jQuery equivalents, which was an important source of performance loss in the
 * Reorderer component. General clients of the framework should use this method with caution if at all, and
 * the performance issues should be reassessed when we have time.
 *
 * @param {Element} node - The node to start walking from.
 * @param {Function} acceptor - The function to invoke with each DOM element.
 * @param {Boolean} allNodes - Use <code>true</code> to call acceptor on all nodes, rather than just element nodes
 * (type 1).
 * @return {Object|undefined} - Returns `undefined` if the run completed successfully.  If a node stopped the run,
 * that node is returned.
 */
fluid.dom.iterateDom = function (node, acceptor, allNodes) {
    var currentNode = {node: node, depth: 0};
    var prevNode = node;
    var condition;
    while (currentNode.node !== null && currentNode.depth >= 0 && currentNode.depth < fluid.dom.iterateDom.DOM_BAIL_DEPTH) {
        condition = null;
        if (currentNode.node.nodeType === 1 || allNodes) {
            condition = acceptor(currentNode.node, currentNode.depth);
        }
        if (condition) {
            if (condition === "delete") {
                currentNode.node.parentNode.removeChild(currentNode.node);
                currentNode.node = prevNode;
            }
            else if (condition === "stop") {
                return currentNode.node;
            }
        }
        prevNode = currentNode.node;
        currentNode = fluid.dom.getNextNode(currentNode);
    }
};

// Work around IE circular DOM issue. This is the default max DOM depth on IE.
// http://msdn2.microsoft.com/en-us/library/ms761392(VS.85).aspx
fluid.dom.iterateDom.DOM_BAIL_DEPTH = 256;
