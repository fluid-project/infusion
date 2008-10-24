fluid.tests = fluid.tests || {};

(function($) {

  fluid.tests.testParser = function() {
    var deepEqTests = new jqUnit.TestCase("Deep Equivalence Tests");
    
    deepEqTests.test("Test", function () {
      jqUnit.assertDeepEq("eq1", {p1: "thing1"}, {p1: "thing1"});
      jqUnit.assertDeepNeq("eq2", {p1: "thing1"}, {p2: "thing1"});
      jqUnit.assertDeepNeq("eq3", {p1: "thing1"}, null);
      jqUnit.assertDeepNeq("eq4", null, {p1: "thing1"});
      jqUnit.assertDeepEq("eq5", null, null);
      jqUnit.assertDeepEq("eq6", undefined, undefined);
      jqUnit.assertDeepNeq("eq7", {p1: "thing1", p2: "thing"}, {p1: "thing1"});
      jqUnit.assertDeepNeq("eq8", {p1: "thing1"}, {p1: "thing1", p2: "thing"});
      jqUnit.assertDeepEq("eq9", [1, 2], [1, 2]);
      jqUnit.assertDeepNeq("eq10", [1, 2], [1, 2, 3]);
      jqUnit.assertDeepNeq("eq11", [1, [2,3,4]], [1, [2,3,4, 5]]);
      jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
        
      });
      
    var parserTests = new jqUnit.TestCase("Selector Parser Test");
    
    parserTests.test("Test", function() {
      var tree = fluid.parseSelector("  div span#id  > .class");
      jqUnit.assertEquals("treeLength", 3, tree.length);
      var expected = [
         {predList: [{tag: "div"}]}, 
         {predList: [{tag: "span"}, {id: "id"} ], child: true},
         {predList: [{clazz: "class"}]}
         ];
      jqUnit.assertDeepEq("Misparse: Tree was " + JSON.stringify(tree), expected, tree);
    
      });
    
    var renderTests = new jqUnit.TestCase("Selector Render Test");
    
    renderTests.test("Selector-based render test", function() {
      var tree = {"header:": []};
      var reps = 5;
      for (var i = 0; i < reps; ++ i) {
        tree["header:"][i] = i + 1;
        }
      var templates = fluid.selfRender($("#table-header"), tree, 
        { cutpoints: [{selector: "th.column-header", id: "header:"}]
      });
      
      var rendered = $("#table-header").get(0).innerHTML;
      
      var lumps = templates[0].lumps;
      var found = false;
      
      for (var i = 0; i < lumps.length; ++ i) {
        if (lumps[i].rsfID === "header:") found = true;
        }
     
      jqUnit.assertTrue("Template+selector parse", found);
      
      jqUnit.assertFalse("Template render", rendered.indexOf("5") === -1); 
    
      });
    
    renderTests.test("ID-based render test", function() {
      var contentTree = {
        "data-row:" : [
            {"species": "Man", "score": 7.44 },
            {"species": "Dolphin", "score": 5.31 },
            {"species": "Chimpanzee", "score": 2.49 },
            {"species": "Rhesus Monkey", "score": 2.09 },
            {"species": "Elephant", "score": 1.87 },
            {"species": "Whale", "score": 1.76 },
            {"species": "Dog", "score": 1.17 },
            {"species": "CATT", "score": 1.00 },
            {"species": "Horse", "score": 0.86 },
            {"species": "Sheep", "score": 0.81 },
            {"species": "Mouse", "score": 0.50 },
            {"species": "Rat", "score": 0.40 },
            {"species": "Rabbit", "score": 0.40 }             ]
        };

      fluid.selfRender($(".paged-content"), contentTree);
      var rows = $(".paged-content tr").length;
      jqUnit.assertEquals("Rendered row count", 14, rows);
      var cells = $(".paged-content td").length;
      jqUnit.assertEquals("Rendered cell count", 26, cells);
      
    });
    
 //   rendertests.test("Invalid trees", function() {
 //     var node = $(".RSF-77-test");
 //     var error;
 //     try {
 //      fluid.selfRender(node, {
 //         "row:": ["Label 1", "Label 2"]
 //         });
 //     }
 //     catch (e) {
 //      error = e;
 //     }
 //     jqUnit.assertNotUndefined("Invalid tree")
 //   });
    
    renderTests.test("ID relation rewriting", function() {
      // Tests FLUID-1676
      var node = $(".RSF-77-test");
      fluid.selfRender(node, {
        "row:": [{ID: "target", value: "Label 1"}, {ID: "target", value: "Label 2"}]
        });
      var labels = $(".RSF-77-test label");
      jqUnit.assertEquals("2 labels", 2, labels.length);
      var fors = fluid.transform(labels, function(element) {return $(element).attr("for");});
      var hash = {};
      for (var i = 0; i < fors.length; ++ i) {
        jqUnit.assertFalse("Unique targets", hash[fors[i]]);
        hash[fors[i]] = true;
        var target = fluid.byId(fors[i]);
        jqUnit.assertTrue("Target exists in document", target);
        jqUnit.assertEquals("Target is a span", "span", target.tagName.toLowerCase());
      }
      
    });
    
    renderTests.test("ID relation non-interference", function() {
      // Also tests FLUID-1677
      fluid.selfRender($(".RSF-111-test"));
      var label = $(".RSF-111-test label");
      jqUnit.assertEquals("Target undisturbed", "target2", label.attr("for"));
    });
    
    
    renderTests.test("Simple UIBound tests", function() {
      var node = $(".FLUID-1696-test");
      var templates = fluid.selfRender(node, 
        {checkbox1: true,
         checkbox2: false, 
         field: "Value"});
      fluid.testUtils.assertNode("Render with values", 
        {nodeName: "input", "class": "checkbox1", type: "checkbox", value: "true", checked: "checked"}, 
        $(".checkbox1", node));
      fluid.testUtils.assertNode("Render with values", 
        {nodeName: "input", "class": "checkbox2", type: "checkbox", value: "true", checked: undefined}, 
        $(".checkbox2", node));  
      fluid.testUtils.assertNode("Render with values", 
        {nodeName: "input", "class": "field", type: "text", value: "Value"}, 
        $(".field", node));          
        
      
      fluid.reRender(templates, node, {checkbox1: null, checkbox2: null, field: null});
      fluid.testUtils.assertNode("Render without values", 
        {nodeName: "input", "class": "checkbox1", type: "checkbox", value: "true", checked: undefined}, 
        $(".checkbox1", node));
      fluid.testUtils.assertNode("Render without values", 
        {nodeName: "input", "class": "checkbox2", type: "checkbox", value: "true", checked: "checked"}, 
        $(".checkbox2", node));  
      fluid.testUtils.assertNode("Render without values", 
        {nodeName: "input", "class": "field", type: "text", value: "Thing"}, 
        $(".field", node));
      
    });
    
    var selection_tree = {
        ID: "select",
        selection: "Apocatastasis",
        optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
        optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
        };
        
    var multiple_selection_tree = fluid.copy(selection_tree);
    multiple_selection_tree.selection = ["Enchiridion", "Apocatastasis"];
    
    renderTests.test("UISelect tests with HTML select", function() {
      var node = $(".UISelect-test-select");
      var templates = fluid.selfRender(node, {children: [fluid.copy(selection_tree)]});
      var options = $("option", node);
      fluid.testUtils.assertNode("Render UISelect options", 
        [{nodeName: "option", selected: undefined, value: "Enchiridion", nodeText: "Enchiridion"},
         {nodeName: "option", selected: "selected", value: "Apocatastasis", nodeText: "ApoCATTastasis"},
         {nodeName: "option", selected: undefined, value: "Exomologesis", nodeText: "Exomologesis"}],
         options);
      var select = $("select", node);
      fluid.testUtils.assertNode("Render UISelect select", 
        {nodeName: "select", multiple: undefined}, select);
    });
    
   renderTests.test("UISelect tests with HTML multiple select", function() {
      var node = $(".UISelect-test-select");
      var templates = fluid.selfRender(node, {children: [fluid.copy(multiple_selection_tree)]});
      var options = $("option", node);
      fluid.testUtils.assertNode("Render UISelect", 
        [{nodeName: "option", selected: "selected", value: "Enchiridion", nodeText: "Enchiridion"},
         {nodeName: "option", selected: "selected", value: "Apocatastasis", nodeText: "ApoCATTastasis"},
         {nodeName: "option", selected: undefined, value: "Exomologesis", nodeText: "Exomologesis"}],
         options);
      var select = $("select", node);
      fluid.testUtils.assertNode("Render UISelect select", 
        {nodeName: "select", multiple: "multiple"}, select);
   });
    
    renderTests.test("UISelect tests with radio buttons", function() {
      var node = $(".UISelect-test-radio-1");
      var tree = {children: [fluid.copy(selection_tree)].concat( 
        fluid.transform(selection_tree.optionlist, function(option, index) {
          return {
            ID: "radio-row:", 
            children: [
                 {ID: "radio", parentRelativeID: "..::select", choiceindex: index},
                 {ID: "label", parentRelativeID: "..::select", choiceindex: index}]
        };
      }))};
      var templates = fluid.selfRender(node, tree);
      var inputs = $("input", node);
      fluid.testUtils.assertNode("Render UISelect as radio buttons", 
        [{nodeName: "input", checked: undefined, value: "Enchiridion", type: "radio"},
         {nodeName: "input", checked: "checked", value: "Apocatastasis", type: "radio"},
         {nodeName: "input", checked: undefined, value: "Exomologesis", type: "radio"}],
         inputs);
      var names = fluid.transform(inputs, function(node) {return $(node).attr("name");});
      jqUnit.assertValue("Name should be assigned", names[0]);
      jqUnit.assertTrue("Name should have been rewritten", names[0] !== "vocable");
      jqUnit.assertEquals("Names should be identical", names[0], names[1]);
      jqUnit.assertEquals("Names should be identical", names[1], names[2]);
    });
    
    renderTests.test("UISelect tests with checkboxes", function() {
      var node = $(".UISelect-test-check-1");
      var tree = {children: [fluid.copy(multiple_selection_tree)].concat( 
        fluid.transform(selection_tree.optionlist, function(option, index) {
          return {
            ID: "checkbox-row:", 
            children: [
                 {ID: "checkbox", parentRelativeID: "..::select", choiceindex: index},
                 {ID: "label", parentRelativeID: "..::select", choiceindex: index}]
        };
      }))};
      var templates = fluid.selfRender(node, tree);
      var inputs = $("input", node);
      fluid.testUtils.assertNode("Render UISelect as checkboxes", 
        [{nodeName: "input", checked: "checked", value: "Enchiridion", type: "checkbox"},
         {nodeName: "input", checked: "checked", value: "Apocatastasis", type: "checkbox"},
         {nodeName: "input", checked: undefined, value: "Exomologesis", type: "checkbox"}],
         inputs);
      var names = fluid.transform(inputs, function(node) {return $(node).attr("name");});
      jqUnit.assertValue("Name should be assigned", names[0]);
      jqUnit.assertTrue("Name should have been rewritten", names[0] !== "vocable");
      jqUnit.assertEquals("Names should be identical", names[0], names[1]);
      jqUnit.assertEquals("Names should be identical", names[1], names[2]);
    });

    renderTests.test("UILink rendering", function() {
      var tree = {children: [
         {ID: "link-1", target:"dynamic-target.html"},
         {ID: "link-2", target:"dynamic-target-2.jpg"}
       ]};
      var node = $(".link-test-1");
      var templates = fluid.selfRender(node, fluid.copy(tree));
      var link = $("a", node);
      jqUnit.assertTrue("Link rendered", link.length > 0);
      jqUnit.assertEquals("Rewritten target", "dynamic-target.html", link.attr("href"));
      var img = $("img", link);
      jqUnit.assertTrue("Image rendered", img.length > 0);
      jqUnit.assertEquals("Rewritten target", "dynamic-target-2.jpg", img.attr("src"));
      
      tree.children[0].linktext = "Dynamic text";
      fluid.reRender(templates, node, fluid.copy(tree));
      
      var link = $("a", node);
      fluid.testUtils.assertNode("UILink text material overwrite", 
        {nodeName: "a", href: "dynamic-target.html", nodeText: "Dynamic text"}, link);
      var img = $("img", node);
      jqUnit.assertTrue("Image not rendered", img.length === 0);
      
      var node2 = $(".link-test-2");
      fluid.selfRender(node2, fluid.copy(tree));
      
      var link2 = $("a", node2);
      fluid.testUtils.assertNode("UILink text material overwrite", 
        {nodeName: "a", href: "dynamic-target.html", nodeText: "Dynamic text"}, link2);
        
      var form = $("form", node2);
      jqUnit.assertTrue("Form rendered", form.length > 0);
      jqUnit.assertEquals("Rewritten target", "dynamic-target-2.jpg", form.attr("action"));
      
    });

    var model = {
        values: ["Enchiridion", "Apocatastasis", "Exomologesis"],
        names: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
    };

    var binding_tree = {
      children: [{
        ID: "select",
        selection: {valuebinding: "model.value"},
        optionlist: {valuebinding: "model.values"},
        optionnames: {valuebinding: "model.names"}
        }]
    };

    renderTests.test("UISelect binding tests with HTML select", function() {
      var node = $(".UISelect-test-select");
      var model1 = $.extend(true, {}, model, {choice: "Enchiridion"});

      var templates = fluid.selfRender(node, fluid.copy(binding_tree));
      var options = $("option", node);
      
      });


    renderTests.test("Properties unescaping", function() {
      
      jqUnit.assertEquals("Simple unescaping", "This is a thing", 
          fluid.unescapeProperties("This\\ is\\ a\\ thing")[0]);
      jqUnit.assertEquals("Unicode unescaping", "\u30b5\u30a4\u30c8\u304b\u3089\u3053\u306e\u30da\u30fc\u30b8\u3092\u524a\u9664",
          fluid.unescapeProperties("\\u30b5\\u30a4\\u30c8\\u304b\\u3089\\u3053\\u306e\\u30da\\u30fc\\u30b8\\u3092\\u524a\\u9664")[0])
          // 10 slashes ACTUALLY means 5 REAL \ characters 
      jqUnit.assertDeepEq("Random junk", ["\\\\\\\\\\ \t\nThing\x53\u0000", true],
          fluid.unescapeProperties("\\\\\\\\\\\\\\\\\\\\\ \\t\\nThing\\x53\\u0000\\"));
      });

    var resourceSpec = {properties: {href: "data/testProperties.properties"},
                              json: {href: "data/testProperties.json"}};    
    fluid.fetchResources(resourceSpec, function() {
        renderTests.test("Properties file parsing", function() {
            jqUnit.assertNotNull("Fetched properties file", resourceSpec.properties.resourceText);
            jqUnit.assertNotNull("Fetched JSON file", resourceSpec.json.resourceText);
            var json = JSON.parse(resourceSpec.json.resourceText);
            var properties = fluid.parseJavaProperties(resourceSpec.properties.resourceText);
            jqUnit.assertDeepEq("Parsed properties equivalent", json, properties);        
        });
      
      });

    
    };
  })(jQuery); 