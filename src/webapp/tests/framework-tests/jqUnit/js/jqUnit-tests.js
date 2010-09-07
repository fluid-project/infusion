/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function () {
    var deepEqTests = new jqUnit.TestCase ("Deep Equivalence Tests");
    
    deepEqTests.test("Test", function () {
      expect(12);
      jqUnit.assertDeepEq("eq1", {p1: "thing1"}, {p1: "thing1"});
      jqUnit.assertDeepNeq("eq2", {p1: "thing1"}, {p2: "thing1"});
      jqUnit.assertDeepNeq("eq3", {p1: "thing1"}, null);
      jqUnit.assertDeepNeq("eq4", null, {p1: "thing1"});
      jqUnit.assertDeepEq("eq5", null, null);
      jqUnit.assertDeepEq("eq6", undefined, undefined);
      jqUnit.assertDeepNeq("eq7", {p1: "thing1", p2: "thing"}, {p1: "thing1"});
      jqUnit.assertDeepNeq("eq8",  {p1: "thing1"}, {p1: "thing1", p2: "thing"});
      jqUnit.assertDeepEq("eq9", [1, 2], [1, 2]);
      jqUnit.assertDeepNeq("eq10", [1, 2], [1, 2, 3]);
      jqUnit.assertDeepNeq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
      jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
      });


   deepEqTests.test("THESE TESTS SHOULD FAIL - testing message support", function() {
     expect(4);
     jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 6]);
     jqUnit.assertDeepEq("eq10", [1, 2], [1, 2, 3]);
     jqUnit.assertDeepEq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
     jqUnit.assertDeepEq("eq4", null, {p1: "thing1"});
   });
})();