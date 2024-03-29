/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests.contextAware");

jqUnit.module("Context Awareness");

fluid.defaults("fluid.tests.contextAware.base", {
    gradeNames: ["fluid.contextAware", "fluid.component"],
    contextAwareness: {
        food: {
            defaultGradeNames: "food.carrots"
        }
    }
});

fluid.tests.contextAware.testChecks = function (checks) {
    var contextAware = fluid.tests.contextAware.base({
        contextAwareness: {
            food: {
                checks: checks
            }
        }
    });
    var names = contextAware.options.gradeNames;
    return fluid.remove_if(fluid.makeArray(names), function (name) {
        return (/fluid\.contextAware|fluid\.tests\.contextAware\.base|fluid\.component/).test(name);
    });
};

fluid.tests.contextAware.testChecksData = [
    {
        message: "No checks, the default type tag should be returned",
        checks: {},
        result: "food.carrots"
    }, {
        message: "One matching context, should return the correct context name",
        markers: "animal.cat",
        checks: {
            cat: {
                contextValue: "{animal.cat}",
                gradeNames: "food.fancyFeast"
            }
        },
        result: "food.fancyFeast"
    }, {
        message: "Both contexts match, so the first gradeName should be returned",
        markers: ["animal.cat", "animal.dog"],
        checks: {
            cat: {
                contextValue: "{animal.cat}",
                gradeNames: "food.fancyFeast",
                priority: "before:dog"
            },
            dog: {
                "contextValue": "{animal.dog}",
                "gradeNames": "food.iams"
            }
        },
        result: "food.fancyFeast"
    }, {
        message: "First context doesn't match, second context should match and return the correct grade name",
        markers: ["animal.cat", "animal.dog"],
        checks: {
            hamster: {
                contextValue: "{animal.hamster}",
                gradeNames: "food.fancyFeast",
                priority: "before:dog"
            },
            dog: {
                contextValue: "{animal.dog}",
                gradeNames: "food.iams"
            }
        },
        result: "food.iams"
    }, {
        message: "Neither feature context, default value should be returned",
        markers: ["animal.cat", "animal.dog"],
        checks: {
            gerbil: {
                contextValue: "{animal.gerbil}",
                gradeNames: "food.celery"
            },
            crocodile: {
                contextValue: "{animal.crocodile}",
                gradeNames: "food.arm"
            }
        },
        result: "food.carrots"
    }, {
        message: "Comparison with specific context values",
        markers: {
            "api.version" : {
                value: "1_3"
            }
        },
        checks: {
            is_1_3: {
                contextValue: "{api.version}",
                equals: "1_3",
                gradeNames: "api_1_3"
            },
            is_1_2: {
                contextValue: "{api.version}",
                equals: "1_2",
                gradeNames: "api_1_2"
            }
        },
        result: "api_1_3"
    }
];

jqUnit.test("contextAware target", function () {
    fluid.each(fluid.tests.contextAware.testChecksData, function (item) {
        var markers = fluid.typeCode(item.markers) === "object" ? item.markers : fluid.arrayToHash(fluid.makeArray(item.markers));
        fluid.contextAware.makeChecks(markers);
        var names = fluid.tests.contextAware.testChecks(item.checks);
        jqUnit.assertDeepEq(item.message, fluid.makeArray(item.result), names);
        fluid.contextAware.forgetChecks(fluid.keys(markers));
    });
});

fluid.defaults("fluid.tests.contextAware.multiple", {
    gradeNames: ["fluid.contextAware", "fluid.component"],
    contextAwareness: {
        food: {
            defaultGradeNames: "food.carrots"
        },
        weakest: {
            defaultGradeNames: "weakest.priority",
            priority: "last"
        },
        urgency: {
            defaultGradeNames: "above.food",
            priority: "before:food" // Note that stronger grades (those which override others) appear to the RIGHT in defaults
        },
        strongest: {
            defaultGradeNames: "strongest.priority",
            priority: "first"
        }
    }
});

jqUnit.test("contextAware multiple blocks with priority", function () {
    var that = fluid.tests.contextAware.multiple();
    var expectedOrder = ["strongest.priority", "above.food", "food.carrots", "weakest.priority"];
    var foundGrades = that.options.gradeNames.filter(function (gradeName) {
        return expectedOrder.indexOf(gradeName) !== -1;
    });
    jqUnit.assertDeepEq("Context awareness gradenames must appear in priority order ", expectedOrder, foundGrades);
});

fluid.tests.contextAware.isResolvable = function (typeName) {
    var component = fluid.expandOptions("{" + typeName + "}", fluid.rootComponent);
    return !!(component && component.options.value);
};

fluid.tests.contextAware.assertResolvable = function (typeHash) {
    fluid.each(typeHash, function (value, key) {
        jqUnit.assertEquals("Typename " + key + " should be resolvable: " + value, value, fluid.tests.contextAware.isResolvable(key));
    });
};

fluid.tests.contextAware.setEnvironment = function () {
    jqUnit.assertTrue("The setEnvironment check was run", true);
    return true;
};

fluid.tests.contextAware.notSetEnvironment = function () {
    jqUnit.assertTrue("The notSetEnvironment test was run", true);
    return false;
};

jqUnit.test("fluid.contextAware.check and fluid.contextAware.forget", function () {
    jqUnit.expect(10);

    var checkSet = {
        "check.set.one": {funcName: "fluid.tests.contextAware.setEnvironment"},
        "check.set.two": {func: fluid.tests.contextAware.setEnvironment}
    };

    var checksNotSet = {
        "check.notSet.one": {funcName: "fluid.tests.contextAware.notSetEnvironment"},
        "check.notSet.two": {func: fluid.tests.contextAware.notSetEnvironment}
    };

    fluid.contextAware.makeChecks(checkSet);
    fluid.tests.contextAware.assertResolvable({
        "check.set.one": true,
        "check.set.two": true
    });

    fluid.contextAware.makeChecks(checksNotSet);
    fluid.tests.contextAware.assertResolvable({
        "check.notSet.one": false,
        "check.notSet.two": false
    });

    fluid.contextAware.forgetChecks(fluid.keys(checkSet));
    fluid.contextAware.forgetChecks(fluid.keys(checksNotSet));

    fluid.tests.contextAware.assertResolvable({
        "check.set.one": false,
        "check.set.two": false
    });
});

/** FLUID-6438 contextAwareness dynamic grade application order **/

fluid.defaults("fluid.tests.fluid6438context", {
    gradeNames: "fluid.component",
    buildingOptions: {
        contextOption: 42
    }
});

fluid.defaults("fluid.tests.fluid6438outer", {
    gradeNames: ["fluid.tests.fluid6438base", "fluid.contextAware"],
    contextAwareness: {
        food: {
            defaultGradeNames: "fluid.tests.fluid6438context"
        }
    }
});

fluid.tests.fluid6438consume = function (buildingOptions) {
    jqUnit.assertEquals("ContextAwareness contributed grade should already have arrived", 42, buildingOptions.contextOption);
    return null;
};

fluid.defaults("fluid.tests.fluid6438base", {
    gradeNames: ["fluid.component", "@expand:fluid.tests.fluid6438consume({that}.options.buildingOptions)"]
});

jqUnit.test("FLUID-6438: Ordering of fluid.contextAware grade application", function () {
    jqUnit.expect(1);
    fluid.tests.fluid6438outer();
});

/** FLUID-6440 contextAwareness and grade closure algorithm **/

fluid.defaults("fluid.tests.fluid6440foodContext", {
    gradeNames: "fluid.component",
    foodValue: "carrots",
    secondaryFoodValue: "cheese"
});

fluid.defaults("fluid.tests.fluid6440intermediateOutput", {
    gradeNames: "fluid.component",
    secondaryFoodValue: "corn"
});

fluid.defaults("fluid.tests.fluid6440contextOut", {
    secondaryFoodValue: "courses"
});

fluid.tests.fluid6440intermediate = function (foodValue) {
    jqUnit.assertEquals("Nullary contextAwareness value applied already", "carrots", foodValue);
    return "fluid.tests.fluid6440intermediateOutput";
};

fluid.defaults("fluid.tests.fluid6440base", {
    gradeNames: ["fluid.component", "fluid.contextAware", "@expand:fluid.tests.fluid6440intermediate({that}.options.foodValue)"],
    contextAwareness: {
        food: {
            defaultGradeNames: "fluid.tests.fluid6440foodContext"
        },
        ambition: {
            checks: {
                firstCheck: {
                    contextValue: "{fluid6440intermediateOutput}.options.foodValue",
                    gradeNames: "fluid.tests.fluid6440contextOut"
                }
            }
        }
    }
});

jqUnit.test("FLUID-6440: Grade closure for ContextAwareness", function () {
    jqUnit.expect(3);
    var that = fluid.tests.fluid6440base();
    jqUnit.assertTrue("Final grade output through repeated ContextAwareness application",
        fluid.componentHasGrade(that, "fluid.tests.fluid6440contextOut"));
    jqUnit.assertEquals("ContextAwareness grade has overridden computed option value", "courses", that.options.secondaryFoodValue);
});
