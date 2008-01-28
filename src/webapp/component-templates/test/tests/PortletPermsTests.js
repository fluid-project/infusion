/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

function testCanMove() {
    assertFalse (fluid.portletPerms.canMove (dropTargetPerms, 0, 0, fluid.position.BEFORE));
    assertFalse (fluid.portletPerms.canMove (dropTargetPerms, 0, 0, fluid.position.AFTER));

    assertFalse (fluid.portletPerms.canMove (dropTargetPerms, 0, 6, fluid.position.BEFORE));
    assertFalse (fluid.portletPerms.canMove (dropTargetPerms, 0, 6, fluid.position.AFTER));

    assertFalse (fluid.portletPerms.canMove (dropTargetPerms, 2, 6, fluid.position.BEFORE));
    assertTrue (fluid.portletPerms.canMove (dropTargetPerms, 2, 6, fluid.position.AFTER));

    assertTrue (fluid.portletPerms.canMove (dropTargetPerms, 8, 8, fluid.position.BEFORE));
    assertTrue (fluid.portletPerms.canMove (dropTargetPerms, 8, 8, fluid.position.AFTER));
}