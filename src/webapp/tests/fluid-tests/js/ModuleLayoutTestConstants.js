/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * This file contains test constants and setup and teardown functions that are used when
 * testing with the data in the portlets.html file.
 */
 
var portalRootId = "portlet-reorderer-root";

var portlet1id = "portlet1";
var portlet2id = "portlet2";
var portlet3id = "portlet3";
var portlet4id = "portlet4";
var portlet5id = "portlet5";
var portlet6id = "portlet6";
var portlet7id = "portlet7";
var portlet8id = "portlet8";
var portlet9id = "portlet9";
var column1id = "c1";
var column2id = "c2";
var column3id = "c3";
var column4id = "c4";

var emptyLayout = { id:"t3", columns:[ ] };   

var portletRootClone;
var portletHandler;
var layoutClone;

function initReorderer() {
    var options = {dropWarningId: "drop-warning"};
    return fluid.initLayoutCustomizer (layoutClone, demo.portal.dropTargetPerms, undefined, options);
}
        
        
/*
 * This setUp will be called before each of the tests that are included in portlets.html 
 * layout and dropTargetPerms are defined in portlets.js
 */
function setUp() {
    var table = fluid.utils.jById (portalRootId);
    portletRootClone = table.clone();
    layoutClone = jQuery.extend(true, {}, demo.portal.layout);
    var options = {
      moduleLayout: {
        layout: layoutClone,
        permissions: demo.portal.dropTargetPerms 
      }
    } 

    
    portletHandler = fluid.moduleLayoutHandler (null, options);
}

function tearDown() {
    fluid.utils.jById (portalRootId).replaceWith (portletRootClone);
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
