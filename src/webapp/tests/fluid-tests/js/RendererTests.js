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
    
    var messageBase = {
        message1: "A simple message",
        message2: "A second message",
        message3: "Every {0} has {1} {2}(s)"
    }
    
    renderTests.test("ID relation rewriting and template messaging", function() {
      // Tests FLUID-1676
      var node = $(".RSF-77-test");
      fluid.selfRender(node, {
        "row:": [{ID: "target", value: "Target 1"}, {ID: "target", value: "Target 2"}]
        }, {messageSource: {type: "data", messages: messageBase}});
      var targets = $("span", node);
      jqUnit.assertNotEquals("Unique target ids", targets[0].id, targets[1].id);
      var labels = $("label", node);
      fluid.testUtils.assertNode("Rendered messages", 
          [{nodeText: messageBase.message1, "for": targets[0].id}, 
           {nodeText: messageBase.message1, "for": targets[1].id}], labels)
    });
    
    renderTests.test("ID relation non-interference", function() {
      // Also tests FLUID-1677
      fluid.selfRender($(".RSF-111-test"));
      var label = $(".RSF-111-test label");
      jqUnit.assertEquals("Target undisturbed", "target2", label.attr("for"));
    });
    
   
    renderTests.test("UIMessage tests", function() {
        var node = $(".UIMessage-test");
        function expectMessage(message) {
            var messageNode = $("span", node);
            fluid.testUtils.assertNode("Rendered message", {nodeText: message}, messageNode);
        }
        var tree = { ID: "message", messagekey: "message1"};
        var options = {messageSource: {type: "data", messages: messageBase}};
        var templates = fluid.selfRender(node, tree, options);
        expectMessage(messageBase.message1);
        
        fluid.reRender(templates, node, { ID: "message", messagekey: ["junk1", "junk2", "message2"]}, options);
        expectMessage(messageBase.message2);
        
        fluid.reRender(templates, node, { ID: "message", messagekey: "message3", args: ["CATT", "four", "leg"]}, options);
        expectMessage("Every CATT has four leg(s)");
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
    
    // Common data for all the tests which deal with UISelect components
    
    var selection_tree = {
        ID: "select",
        selection: "Apocatastasis",
        optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
        optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
        };
        
        
    var model = {
        values: ["Enchiridion", "Apocatastasis", "Exomologesis"],
        names: ["Enchiridion", "ApoCATTastasis", "Exomologesis"]
    };

    var binding_tree = {
      children: [{
        ID: "select",
        selection: {valuebinding: "choice"},
        optionlist: {valuebinding: "values"},
        optionnames: {valuebinding: "names"}
        }]
    };
        
    var multiple_selection_tree = fluid.copy(selection_tree);
    multiple_selection_tree.selection = ["Enchiridion", "Apocatastasis"];
    
    
    function makeBindingTest(message, testfunc) {
        renderTests.test(message, function () {testfunc(null);});
        renderTests.test(message + " with autobind", function() {testfunc({autoBind: true});});
    }
    
    function merge(target, source) {
      return $.extend(true, target, source);
    }
    
    function singleSelectionRenderTests(node) {
      var options = $("option", node);
      fluid.testUtils.assertNode("Render UISelect options", 
        [{nodeName: "option", selected: undefined, value: "Enchiridion", nodeText: "Enchiridion"},
         {nodeName: "option", selected: "selected", value: "Apocatastasis", nodeText: "ApoCATTastasis"},
         {nodeName: "option", selected: undefined, value: "Exomologesis", nodeText: "Exomologesis"}],
         options);
      var select = $("select", node);
      fluid.testUtils.assertNode("Render UISelect select", 
        {nodeName: "select", multiple: undefined}, select);      
    }
    
    renderTests.test("UISelect tests with HTML select", function() {
        var node = $(".UISelect-test-select");
        fluid.selfRender(node, {children: [fluid.copy(selection_tree)]});
        singleSelectionRenderTests(node);
    });
    
    
    makeBindingTest("UISelect binding tests with HTML select", function(opts) {
        var node = $(".UISelect-test-select");
        var model1 = $.extend(true, {}, model, {choice: "Apocatastasis"});
  
        fluid.selfRender(node, fluid.copy(binding_tree), merge({model: model1}, opts));
        singleSelectionRenderTests(node);
        var select = $("select", node);
        select.val("Enchiridion");
        select.change();
        if (!opts) {fluid.applyChange(select);}
        jqUnit.assertEquals("Applied value to model", "Enchiridion", model1.choice);
        });
      
    function multipleSelectionRenderTests(node) {
        var options = $("option", node);
        fluid.testUtils.assertNode("Render UISelect", 
          [{nodeName: "option", selected: "selected", value: "Enchiridion", nodeText: "Enchiridion"},
           {nodeName: "option", selected: "selected", value: "Apocatastasis", nodeText: "ApoCATTastasis"},
           {nodeName: "option", selected: undefined, value: "Exomologesis", nodeText: "Exomologesis"}],
           options);
        var select = $("select", node);
        fluid.testUtils.assertNode("Render UISelect select", 
          {nodeName: "select", multiple: "multiple"}, select);  
     }
    
    renderTests.test("UISelect tests with HTML multiple select", function() {
        var node = $(".UISelect-test-select");
        var templates = fluid.selfRender(node, {children: [fluid.copy(multiple_selection_tree)]});
        multipleSelectionRenderTests(node);
    });
    
    makeBindingTest("UISelect binding tests with HTML multiple select", function(opts) {
        var node = $(".UISelect-test-select");
        var model2 =  $.extend(true, {}, model, {choice: ["Enchiridion", "Apocatastasis"]});
        var templates = fluid.selfRender(node, fluid.copy(binding_tree), merge({model: model2}, opts));
        multipleSelectionRenderTests(node);
        var select = $("select", node);
        select.val(["Exomologesis", "Apocatastasis"]);
        select.change();
        if (!opts) {fluid.applyChange(select);}
        jqUnit.assertDeepEq("Applied value to model", ["Apocatastasis", "Exomologesis"], model2.choice);
    });
    
    function singleSelectionRadioRenderTests(node) {
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
        jqUnit.assertNotEquals("IDs should be different", inputs[0].id, inputs[1].id);
        jqUnit.assertNotEquals("IDs should be different", inputs[1].id, inputs[2].id);
        var labels = $("label", node);
        fluid.testUtils.assertNode("Labels and relations",
        [{nodeName: "label", "for": inputs[0].id, "nodeText": "Enchiridion"},
         {nodeName: "label", "for": inputs[1].id, "nodeText": "ApoCATTastasis"},
         {nodeName: "label", "for": inputs[2].id, "nodeText": "Exomologesis"}], labels);
    }
    // commn utility function to make a simple view of rows, where each row has a selection
    // control and a label
    function explodeSelectionToInputs(optionlist, rowname, inputname, labelname) {
         return fluid.transform(optionlist, function(option, index) {
              return {
                ID: rowname, 
                children: [
                     {ID: inputname, parentRelativeID: "..::select", choiceindex: index},
                     {ID: labelname, parentRelativeID: "..::select", choiceindex: index}]
           }});
    }
   
    renderTests.test("UISelect tests with radio buttons", function() {
        var node = $(".UISelect-test-radio-1");
        var tree = {children: [fluid.copy(selection_tree)].concat(
              explodeSelectionToInputs(selection_tree.optionlist, "radio-row:", "radio", "label"))};
        fluid.selfRender(node, tree);
        singleSelectionRadioRenderTests(node);
    });
    
    makeBindingTest("UISelect binding tests with radio buttons", function(opts) {
        var node = $(".UISelect-test-radio-1");
        var model3 = $.extend(true, {}, model, {choice: "Apocatastasis"});
        var tree = fluid.copy(binding_tree);
        tree.children = tree.children.concat(
              explodeSelectionToInputs(selection_tree.optionlist, "radio-row:", "radio", "label"));
        fluid.selfRender(node, tree, merge({model: model3}, opts));
        singleSelectionRadioRenderTests(node);
        var inputs = $("input", node);
        fluid.value(inputs, "Enchiridion");
        $(inputs[0]).change();
        if (!opts) {fluid.applyChange(inputs);}
        jqUnit.assertEquals("Applied value to model", "Enchiridion", model3.choice);
    });
    
    function multipleSelectionCheckboxRenderTests(node) {
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
    }
    
    renderTests.test("UISelect tests with checkboxes", function() {
      var node = $(".UISelect-test-check-1");
      var tree = {children: [fluid.copy(multiple_selection_tree)].concat( 
        explodeSelectionToInputs(selection_tree.optionlist, "checkbox-row:", "checkbox", "label"))};
      fluid.selfRender(node, tree);
      multipleSelectionCheckboxRenderTests(node);
    });
    
    makeBindingTest("UISelect binding tests with checkboxes", function(opts) {
      var node = $(".UISelect-test-check-1");
      var model4 = $.extend(true, {}, model, {choice: ["Enchiridion", "Apocatastasis"]});
      var tree = fluid.copy(binding_tree);
      tree.children = tree.children.concat( 
        explodeSelectionToInputs(selection_tree.optionlist, "checkbox-row:", "checkbox", "label"));
      fluid.selfRender(node, tree, merge({model: model4}, opts));
      multipleSelectionCheckboxRenderTests(node);
      var inputs = $("input", node);
      fluid.value(inputs, ["Exomologesis", "Apocatastasis"]);
      $(inputs[0]).change();
      if (!opts) {fluid.applyChange(inputs);}
      jqUnit.assertDeepEq("Applied value to model", ["Apocatastasis", "Exomologesis"], model4.choice);
    });

    renderTests.test("UILink rendering", function() {
      // must use absolute URLs for tests, since IE will rewrite relative ones by itself
      var link_target = "http://www.site/dynamic-target.html";
      var link_target_2 = "http://www.site/dynamic-target-2.jpg"
      var tree = {children: [
         {ID: "link-1", target: link_target},
         {ID: "link-2", target: link_target_2}
       ]};
      var node = $(".link-test-1");
      var templates = fluid.selfRender(node, fluid.copy(tree));
      var link = $("a", node);
      jqUnit.assertTrue("Link rendered", link.length > 0);
      // can only test endsWith on IE, since it expands relative links to 
      jqUnit.assertEquals("Rewritten target", link_target, link.attr("href"));
      var img = $("img", link);
      jqUnit.assertTrue("Image rendered", img.length > 0);
      jqUnit.assertEquals("Rewritten target", link_target_2, img.attr("src"));
      
      tree.children[0].linktext = "Dynamic text";
      fluid.reRender(templates, node, fluid.copy(tree));
      
      return;
      
      var link = $("a", node);
      fluid.testUtils.assertNode("UILink text material overwrite", 
        {nodeName: "a", href: link_target, nodeText: "Dynamic text"}, link);
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
    
    renderTests.test("Basic input rendering and binding", function() {
      var model = { "string": "value", "boolean": false };      
      var tree = {children: [
         {ID: "input", valuebinding: "string"},
         {ID: "checkbox", valuebinding: "boolean"}
       ]};
      var node = $(".basic-input-1");
      fluid.selfRender(node, tree, {model: model, autoBind: true});
      
      var text = $(".text", node);
      fluid.testUtils.assertNode("Rendered field", 
        {nodeName: "input", type: "text", value: "value"}, text);
      text.val("New value");
      text.change();
      jqUnit.assertEquals("Model updated", "New value", model.string);
      
      var checkbox = $(".checkbox");
      fluid.testUtils.assertNode("Rendered field", 
        {nodeName: "input", type: "checkbox", value: "true", checked: undefined}, checkbox);
      fluid.value(checkbox, true); // irregularity in jQuery.val() would force us to use jQuery.checked otherwise 
      checkbox.change();
      jqUnit.assertEquals("Model updated", true, model["boolean"]);
      
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