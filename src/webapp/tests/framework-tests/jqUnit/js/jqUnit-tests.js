
(function () {
    var deepEqTests = new jqUnit.TestCase ("Deep Equivalence Tests");
    
    deepEqTests.test("Test", function () {
      jqUnit.expect(12);
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
     jqUnit.expect(4);
     jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 6]);
     jqUnit.assertDeepEq("eq10", [1, 2], [1, 2, 3]);
     jqUnit.assertDeepEq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
     jqUnit.assertDeepEq("eq4", null, {p1: "thing1"});
   });
})();