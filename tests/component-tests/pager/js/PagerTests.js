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

/* global jqUnit */

(function ($) {
    "use strict";

    jqUnit.module("Pager Tests");

    fluid.registerNamespace("fluid.tests");

    /* Convenience markup driven pager creator */
    var markupPager = function (container, options) {
        options = $.extend(true, {}, options, {
            gradeNames: "fluid.tests.testMarkupPager",
            pageList: {
                type: "fluid.pager.directPageList"
            }
        });

        return fluid.pager(container, options);
    };

    /* Convenience test functions */
    var enabled = function (str, link) {
        jqUnit.assertFalse(str + " link is enabled",
            link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.disabled));
    };

    var disabled = function (str, link) {
        jqUnit.assertTrue(str + " link is disabled",
            link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.disabled));
    };

    var current = function (str, link) {
        jqUnit.assertTrue(str + " link is selected",
            link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));
    };

    var notCurrent = function (str, link) {
        jqUnit.assertFalse(str + " link is not selected",
            link.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));
    };

    // This is a "white-box" test which depends on the exact internals of the Pager
    jqUnit.test("Pager setup", function () {
        var pager = markupPager("#gradebook");

        var pagerTop = pager.pagerBar;
        jqUnit.assertEquals("Pager top is set", "pager-top", pagerTop.container[0].id);

        jqUnit.assertEquals("Page Links are set", 3, pagerTop.pageList.pageLinks.length);
        jqUnit.assertEquals("Previous is set", "previous-top", pagerTop.previousNext.previous[0].id);
        jqUnit.assertEquals("Next is set", "next-top", pagerTop.previousNext.next[0].id);

        var pagerBottom = pager["pagerBar-1"];
        jqUnit.assertEquals("Pager bottom is set", "pager-bottom", pagerBottom.container[0].id);

        jqUnit.assertEquals("Page Links are set", 3, pagerBottom.pageList.pageLinks.length);
        jqUnit.assertEquals("Previous is set", "previous-bottom", pagerBottom.previousNext.previous[0].id);
        jqUnit.assertEquals("Next is set", "next-bottom", pagerBottom.previousNext.next[0].id);

    });

    fluid.tests.pagerModelChange = function (newPageIndex, oldPageIndex, pageChangeStats) {
        pageChangeStats.pageNum = newPageIndex;
        pageChangeStats.oldPageNum = oldPageIndex;
    };

    // TODO: Write this up as a successful example of refactoring through use of the new framework
    // TODO: Now even more successful with FLUID-4258 system
    var pageChangeOptions = {
        members: {
            pageChangeStats: {}
        },
        modelListeners: {
            "pageIndex": "fluid.tests.pagerModelChange({change}.value, {change}.oldValue, {fluid.pager}.pageChangeStats)"
        }
    };

    jqUnit.test("Initially First Selected", function () {
        var pager = markupPager("#gradebook", pageChangeOptions);

        var firstLink = $("#top1");
        var firstLinkBottom = $("#bottom1");
        var previous = $("#previous-top");
        var next = $("#next-top");
        var previousBottom = $("#previous-bottom");
        var nextBottom = $("#next-bottom");

        current("First top", firstLink);
        current("First bottom", firstLinkBottom);
        disabled("Previous top", previous);
        disabled("Previous bottom", previousBottom);
        enabled("Next top", next);
        enabled("Next bottom", nextBottom);

        jqUnit.assertEquals("The onPageChange event should be fired upon initialization.", 0, pager.pageChangeStats.pageNum);
        jqUnit.assertUndefined("The oldPageNum for the onPageChange event should be undefined.", pager.pageChangeStats.oldPageNum);
    });

    jqUnit.test("Click link", function () {
        var pager = markupPager("#gradebook", pageChangeOptions);
        var link1 = $("#top1");
        var link1Bottom = $("#bottom1");
        var link2 = $("#top2");
        var anchor2 = $("a", link2);
        var link2Bottom = $("#bottom2");
        var previous = $("#previous-top");
        var next = $("#next-top");
        var previousBottom = $("#previous-bottom");
        var nextBottom = $("#next-bottom");

        anchor2.simulate("click");
        jqUnit.assertEquals("Page number is 1.", 1, pager.pageChangeStats.pageNum);
        jqUnit.assertEquals("Old page number is 0.", 0, pager.pageChangeStats.oldPageNum);

        current("Link 2 top", link2);
        current("Link 2 bottom", link2Bottom);
        notCurrent("Link 1", link1);
        notCurrent("Link 1 bottom", link1Bottom);
        enabled("Next top", next);
        enabled("Next bottom", nextBottom);
        enabled("Previous top", previous);
        enabled("Previous bottom", previousBottom);

        pager.pageChangeStats = {};
        anchor2.simulate("click");
        jqUnit.assertUndefined("Link 2 clicked again - callback not called.", pager.pageChangeStats.pageNum);
        jqUnit.assertUndefined("Link 2 clicked again - callback not called.", pager.pageChangeStats.oldPageNum);
    });

    jqUnit.test("Links between top and bottom", function () {
        var pager = markupPager("#plants", pageChangeOptions);
        var nonPageLink = $("#chives");
        var topLink = $("#plants-top2");
        var pageLink = $("#plants-bottom2");

        jqUnit.assertEquals("Initially, the first page should be selected.", 0, pager.pageChangeStats.pageNum);
        nonPageLink.simulate("click");
        pager.pageChangeStats = {};
        jqUnit.assertUndefined("When a non-page link is clicked, no events should be fired.", pager.pageChangeStats.pageNum);
        pageLink.simulate("click");

        jqUnit.assertEquals("Page number is 1.", 1, pager.pageChangeStats.pageNum);
        jqUnit.assertEquals("Old page number is 0.", 0, pager.pageChangeStats.oldPageNum);
        jqUnit.assertTrue("Link 2 top is styled as current",
            topLink.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));
        jqUnit.assertTrue("Link 2 bottom is styled as current",
            pageLink.hasClass(fluid.defaults("fluid.pager.pagerBar").styles.currentPage));
    });

    jqUnit.test("Pager Next/Previous", function () {
        markupPager("#gradebook");

        var nextLink = $("#next-top");
        var previousLink = $("#previous-top");
        var firstLink = $("#top1");
        var secondLink = $("#top2");
        var lastLink = $("#top3");

        current("Initially, first", firstLink);
        disabled("Initially, previous", previousLink);
        enabled("Initially, next", nextLink);

        nextLink.simulate("click");
        current("After clicking next, second", secondLink);
        notCurrent("After clicking next, first", firstLink);
        enabled("After clicking next, previous", previousLink);
        enabled("After clicking next, next", nextLink);

        previousLink.simulate("click");
        current("After clicking previous, first", firstLink);
        notCurrent("After clicking previous, second", secondLink);
        disabled("After clicking previous, previous", previousLink);
        enabled("After clicking previous, next", nextLink);

        previousLink.simulate("click");
        current("After clicking previous on first page, first is still", firstLink);
        disabled("After clicking previous on first page, previous", previousLink);

        lastLink.simulate("click");
        current("After clicking last, last", lastLink);
        notCurrent("After clicking last, first", firstLink);
        enabled("After clicking last, previous", previousLink);
        disabled("After clicking last, next", nextLink);

        nextLink.simulate("click");
        current("After clicking next on last page, last is still", lastLink);
        enabled("After clicking next on last page, previous", previousLink);
        disabled("After clicking next on last page, next", nextLink);
    });

})(jQuery);
