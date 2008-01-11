/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

function testGetRightSiblingInfo() {
    var imageList = findOrderableByDivAndId();

    var rightSibling = fluid.itemInfos.getRightSiblingInfo(fluid.testUtils.byId(firstReorderableId), imageList);
    assertEquals("The item to the right of the first image should be the second image", 
        fluid.testUtils.byId(secondReorderableId), rightSibling.item);
    assertFalse("No wrap to the right of the first image", rightSibling.hasWrapped);

    rightSibling = fluid.itemInfos.getRightSiblingInfo(fluid.testUtils.byId(thirdReorderableId), imageList);
    assertEquals("The item to the right of the third image should be the fourth image", 
        fluid.testUtils.byId(fourthReorderableId), rightSibling.item);
    assertFalse("No wrap to the right of the third image", rightSibling.hasWrapped);

    rightSibling = fluid.itemInfos.getRightSiblingInfo(fluid.testUtils.byId(lastReorderableId), imageList);
    assertEquals("The item to the right of the last image should be the first image", 
        fluid.testUtils.byId(firstReorderableId), rightSibling.item);
    assertTrue("Wrap to the right of the last image", rightSibling.hasWrapped); 
    
    rightSibling = fluid.itemInfos.getRightSiblingInfo(fluid.testUtils.byId(thirdImageId), imageList);
    assertEquals("When a non-orderable is passed to getRightSiblingInfo the first orderable should be returned.", 
        firstReorderableId, rightSibling.item.id);
}

function testGetLeftSiblingInfo() {
    var imageList = findOrderableByDivAndId();

    var leftSibling = fluid.itemInfos.getLeftSiblingInfo(fluid.testUtils.byId(fourthReorderableId), imageList);
    assertEquals("The item to the left of the fourth image should be the third image", 
        fluid.testUtils.byId(thirdReorderableId), leftSibling.item);
    assertFalse("No wrap to the left of the fourth image", leftSibling.hasWrapped);

    leftSibling = fluid.itemInfos.getLeftSiblingInfo(fluid.testUtils.byId(lastReorderableId), imageList);
    assertEquals("The item to the left of the last image should be the second last image", 
        fluid.testUtils.byId(secondLastReorderableId), leftSibling.item);
    assertFalse("No wrap to the left of the last image", leftSibling.hasWrapped);

    leftSibling = fluid.itemInfos.getLeftSiblingInfo(fluid.testUtils.byId(firstReorderableId), imageList);
    assertEquals("The item to the left of the first image should be the last image", 
        fluid.testUtils.byId(lastReorderableId), leftSibling.item);
    assertTrue("Wrap to the left of the first image", leftSibling.hasWrapped);

    leftSibling = fluid.itemInfos.getLeftSiblingInfo(fluid.testUtils.byId(thirdImageId), imageList);
    assertEquals("When a non-orderable is passed to getLeftSiblingInfo the first orderable should be returned.", 
        firstReorderableId, leftSibling.item.id);
    assertFalse("No wrap when non-reorderable is passed in.", leftSibling.hasWrapped);  

}
