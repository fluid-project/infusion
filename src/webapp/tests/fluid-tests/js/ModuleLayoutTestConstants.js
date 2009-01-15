/*
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of Cambridge

Licensed under the Educational Community License(ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when
 * testing with the data in the portlets.html file.
 */
 
/*global jQuery*/
/*global fluid*/
/*global demo*/
 
var portalRootId = "portlet-reorderer-root";
// portlet0 does not actually exist, it is in this array for padding
var portletIds = ["portlet0", "portlet1", "portlet2", "portlet3", "portlet4", "portlet5", "portlet6", "portlet7", "portlet8", "portlet9"];

var column1id = "c1";
var column2id = "c2";
var column3id = "c3";
var column4id = "c4";

var columnSelector = "[id^='c']";
var portletSelector = "[id^='portlet']";

var emptyLayout = { id:"t3", columns: [] };   

var portletRootClone;
var portletHandler;
var layoutClone;

function initReorderer() {
    var options = {
        selectors: {
            columns: columnSelector,
            modules: portletSelector,
            dropWarning: jQuery("#drop-warning"),
            lockedModules: ".locked"
        }
    };
    return fluid.reorderLayout("#" + portalRootId, options);
}

function container() {
    return jQuery("#" + portalRootId);
}

function allColumns() {
    return jQuery("[id^=c]");
}

function allPortlets() {
    return jQuery("div[id^=portlet]");
}
