/*

 Copyright 2008-2009 University of Toronto

 Dual licensed under the MIT(http://www.opensource.org/licenses/mit-license.php) 
 and GPL(http://www.opensource.org/licenses/gpl-license.php) licenses.

*/

(function() {
    jqUnit.module("tabindex");

    // Constants.
    var LIST_WITH_SEL = "#listWithTabIndex";
    var LINK_WITH_SEL = "#linkWithTabIndex";
    var LINK_NEGATIVE_SEL = "#linkWithNegativeTabIndex";
    var HEADING_WITHOUT_SEL = "#headingWithNoTabIndex";
    var LINK_WITHOUT_SEL = "#linkNoTabIndex";
    var LIST_ITEM_WITHOUT_SEL = "#foodNoTabIndex";

    jqUnit.test("getTabindex", function() {
        jqUnit.expect(5);

        // Test an element with a tabindex of 0.
        var element = jQuery(LIST_WITH_SEL);
        jqUnit.equals(element.fluid("tabindex"), 0, "The element should return a tabindex of 0.");

        // And one with a postive tabindex.
        element = jQuery(LINK_WITH_SEL);
        jqUnit.equals(element.fluid("tabindex"), 2, "The link should have a positive tabindex.");

        // And one with a negative tabindex.
        element = jQuery(LINK_NEGATIVE_SEL);
        jqUnit.equals(element.fluid("tabindex"), -1, "The link should have a negative tabindex.");

        // And a regular element without a tabindex.
        element = jQuery(HEADING_WITHOUT_SEL);
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "The heading should have an undefined tabindex.");

        // And a link without a tabindex.
        element = jQuery(LINK_WITHOUT_SEL);
        jqUnit.equals(element.fluid("tabindex"), 0, "The link should have an undefined tabindex.");
    });

    jqUnit.test("setTabIndex() on element with no previous tabindex", function() {
        jqUnit.expect(7);

        var element = jQuery(HEADING_WITHOUT_SEL);
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "The heading should have an undefined tabindex.");

        // Set a positive string
        element.fluid("tabindex", "1");
        jqUnit.equals(element.fluid("tabindex"), 1, "The heading should have a tabindex of 1.");

        // Set a zero string
        element.fluid("tabindex", "0");
        jqUnit.equals(element.fluid("tabindex"), 0, "The heading should now have a tabindex of 0.");

        // Set a negative string
        element.fluid("tabindex", "-1");
        jqUnit.equals(element.fluid("tabindex"), -1, "The heading should now have a tabindex of -1.");

        // Set a positive number
        element.fluid("tabindex", 12);
        jqUnit.equals(element.fluid("tabindex"), 12, "The heading should now have a tabindex of 12.");

        // Set a zero number
        element.fluid("tabindex", 0);
        jqUnit.equals(element.fluid("tabindex"), 0, "The heading should now have a tabindex of 0.");

        // Set a negative string
        element.fluid("tabindex", -1);
        jqUnit.equals(element.fluid("tabindex"), -1, "The heading should now have a tabindex of -1.");
    });

    jqUnit.test("setTabIndex() on element with existing tabindex", function() {
        jqUnit.expect(2);

        var element = jQuery(LINK_WITH_SEL);
        jqUnit.equals(element.fluid("tabindex"), 2, "To start with, the link should have a tabindex of 2.");

        element.fluid("tabindex", -1);
        jqUnit.equals(element.fluid("tabindex"), -1, "After setting it, the link should now have a tabindex of -1.");
    });

    jqUnit.test("removeTabindex()", function() {
        jqUnit.expect(9);

        // Grab an element that isn't naturally focussable but already has a tabindex and remove it.
        var element = jQuery(LIST_WITH_SEL);
        jqUnit.equals(element.fluid("tabindex"), 0, "Before removing, the list should have a tabindex of 0.");
        element.fluid("tabindex.remove");
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "After removing it, the list's tabindex should be undefined.");

        element = jQuery(LINK_WITH_SEL);
        jqUnit.equals(element.fluid("tabindex"), 2, "Before removing, the link should have a tabindex of 2.");
        element.fluid("tabindex.remove");
        jqUnit.equals(element.fluid("tabindex"), 0, "After removing it, the link's tabindex should revert to the default.");

        // Grab an element without a tabindex, give it one, then remove it.
        element = jQuery(LIST_ITEM_WITHOUT_SEL);
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "Before adding one, the link should have an undefined tabindex.");
        element.fluid("tabindex", 0);
        jqUnit.equals(element.fluid("tabindex"), 0, "After adding it, the link should have a tabindex of 0.");
        element.fluid("tabindex.remove");
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "After removing it, the link should have an undefined tabindex again.");

        // Grab an element with no tabindex and try to remove it.
        element = jQuery(HEADING_WITHOUT_SEL);
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "Before removing it, the headings's tabindex should be undefined.");
        element.fluid("tabindex.remove");
        jqUnit.equals((typeof element.fluid("tabindex")), 'undefined', "After removing it, the headings's tabindex should still be undefined.");
    });

    jqUnit.test("hasTabindex()", function() {
        jqUnit.expect(5);

        // Test an element with a positive tab index.
        var element = jQuery(LINK_WITH_SEL);
        jqUnit.ok(element.fluid("tabindex.has"), "A link with a postive tabindex should report as having a tabindex.");

        // One with a zero tabindex.
        element = jQuery(LIST_WITH_SEL);
        jqUnit.ok(element.fluid("tabindex.has"), "A list with a zero tabindex should report as having a tabindex.");

        // One with a negative tabindex.
        element = jQuery(LINK_NEGATIVE_SEL);
        jqUnit.ok(element.fluid("tabindex.has"), "A link with a negative tabindex should report as having a tabindex.");

        // And a few without.
        element = jQuery(HEADING_WITHOUT_SEL);
        jqUnit.ok(!element.fluid("tabindex.has"), "A heading without a tabindex should not report as having a tabindex.");

        element = jQuery(LINK_WITHOUT_SEL);
        jqUnit.ok(element.fluid("tabindex.has"), "A link without a tabindex should still report as having a tabindex.");
    });
})();
