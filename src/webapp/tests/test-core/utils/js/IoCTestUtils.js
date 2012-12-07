/*
Copyright 2010-2012 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.test");

fluid.defaults("fluid.test.testEnvironment", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    components: {
        instantiator: "{instantiator}"
    },
    listeners: {
        onCreate: {
            listener: "fluid.test.testEnvironment.runTests",
            args: "{that}"
        }
    }
});

fluid.test.testEnvironment.preInit = function (that) {
    that.activeTests = 0;
};

fluid.test.makeExpander = function (that, instantiator) {
    return function (toExpand) {
        return fluid.withInstantiator(that, 
            function () {
                return fluid.expandOptions(toExpand, that);
            }, "Expanding Test Case", instantiator);
        };  
};

fluid.test.makeFuncExpander = function (expander) {
    return function (toExpand) {
        var testFunc = expander(toExpand);
        if (typeof(testFunc) === "string") {
            testFunc = fluid.getGlobalValue(testFunc);
        }
        return testFunc;
    };
};
  

fluid.test.testEnvironment.runTests = function (that) {
    var visitOptions = {
        instantiator: that.instantiator
    };
    that.testCaseHolders = [];
    var visitor = function (component) {
        if (fluid.hasGrade(component.options, "fluid.test.testCaseHolder")) {
            that.testCaseHolders.push(component);
        }
    }
    fluid.visitComponentChildren(that, visitor, visitOptions, "");
    var testCaseState = {
        root: that,
        instantiator: that.instantiator
    };
    if (that.options.markupFixture) {
        var markupContainer = fluid.container(that.options.markupFixture, false);
        that.storedMarkup = markupContainer.html();
        that.events.onDestroy.addListener(function() {
            console.log("Restoring markup " + that.storedMarkup);
            markupContainer.html(that.storedMarkup);
        });
    }
    fluid.each(that.testCaseHolders, function(testCaseHolder) {
        testCaseState.testCaseHolder = testCaseHolder;
        testCaseState.expand = fluid.test.makeExpander(testCaseHolder, that.instantiator);
        testCaseState.expandFunction = fluid.test.makeFuncExpander(testCaseState.expand);
        fluid.test.processTestCaseHolder(testCaseState);  
    });
    // Fire this event so that environments which registered no tests (due to qunit filtering)
    // will terminate immediately
    fluid.test.noteTest(testCaseState.root, 0);
};

fluid.defaults("fluid.test.testCaseHolder", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
    mergePolicy: {
        testCases: "noexpand"
    }
});

fluid.test.noteTest = function (root, count) {
    if (root.activeTests === "destroyed") {
        fluid.fail("Sequence error: attempt to use test environment ", root, 
            " which has been destroyed");
    }
    root.activeTests += count;
    console.log("noteTest for ", root, " with count " + count + " now " + root.activeTests);
    if (count === -1) {
        console.log("Test finished - restarting");
        QUnit.start();
    }
    if (root.activeTests === 0) {
        root.destroy();
        root.activeTests = "destroyed";
    }
};

fluid.test.decoders = {};

fluid.test.decoders.func = function (testCaseState, fixture) {
    var testFunc = testCaseState.expandFunction(fixture.func);
    var args = testCaseState.expand(fixture.args);
    return {
        execute: function () {
            testFunc.apply(null, fluid.makeArray(args));
        }
    };
};

fluid.test.decoders.jQueryTrigger = function (testCaseState, fixture) {
    var event = fixture.jQueryTrigger;
    var args = fluid.makeArray(testCaseState.expand(fixture.args));
    args.unshift(event);
    return {
        execute: function () {
            var element = testCaseState.expand(fixture.element);
            var jel = fluid.wrap(element);
            jel.trigger.apply(jel, args); 
        }
    };
};

fluid.test.decoders.listener = function (testCaseState, fixture) {
    var event = testCaseState.expand(fixture.event);
    var listener = testCaseState.expandFunction(fixture.listener);
    var that = {};
    that.bind = function (preWrap, postWrap) {
        var wrapped = function () {
            event.removeListener(wrapped);
            preWrap();
            listener.apply(null, arguments);
            postWrap();
            };
        event.addListener(wrapped, fixture.namespace, null, fixture.priority);
    };

    return that;
};

fluid.test.decoderDucks = ["func", "listener", "jQueryTrigger"];

fluid.test.decodeFixture = function (testCaseState, fixture) {
    var ducks = fluid.test.decoderDucks;
    var decoded = fluid.find(ducks, function (duck) {
        if (fixture[duck]) {
            return fluid.test.decoders[duck](testCaseState, fixture);
        }
    });
    if (decoded) {
        return decoded;
    }
    else {
        fluid.fail("Could not decode fixture record ", fixture, 
            " as a valid fixture type - must contain key chosen from " + 
            ducks.join(", "));
    }
};


// Compose any number of functions expressed in the CPS style into a single
// such function
fluid.composeCPS = function (funcs, argpos) {
    argpos = argpos || 0;
    return function (next) {
        return argpos === funcs.length - 1 ? funcs[argpos](next) :  
            funcs[argpos](function () {
                fluid.composeCPS(funcs, argpos + 1)(next);
            });
    };
};

fluid.test.execExecutor = function (executor, sequenceText) {
    jqUnit.setMessageSuffix(" - at sequence position " + sequenceText);
    executor.execute();
    jqUnit.setMessageSuffix("");
};

fluid.test.composeSimple = function (f1, f2) {
    return function () {
        f1(); f2();
    };
};

fluid.test.bindExecutor = function (binder, preWrap, postWrap, sequenceText) {
    function preFunc () {
        jqUnit.setMessageSuffix(" - at sequence position " + sequenceText);
    }
    function postFunc () {
        jqUnit.setMessageSuffix("");
    }
    var c = fluid.test.composeSimple;
    binder.bind(c(preWrap, preFunc), c(postFunc, postWrap));
};

fluid.test.sequenceExecutor = function (testCaseState, fixture) {
    var that = {
        testCaseState: $.extend({}, testCaseState),
        count: fixture.sequence.length,
        fixture: fixture,
        sequencePos: 0,
        executors: []
    };
    that.decode = function (pos) {
        return that.executors[pos] = 
                fluid.test.decodeFixture(that.testCaseState, that.fixture.sequence[pos]);
    };
    that.sequenceText = function (pos) {
        return (pos === undefined? that.sequencePos : pos) + " of " + that.count;
    }
    // This unfortunate style is as good as the qunit markup!
    $("#qunit-testresult").append(" &mdash; at sequence position <span class=\"jqunit-sequence\"></span>");
    that.sequenceElement = $("#qunit-testresult .jqunit-sequence");
    that.renderSequence = function () {
        that.sequenceElement.text(that.sequenceText());
    };

    that.decode(0);
    that.renderSequence();
    // this: exec, next: exec - do 1st exec, then 2nd exec (EX)
    // this: exec, next: bind - do 2nd bind (EX) FIRST, then exec [ODD - out of order]
    // this: bind, next: bind - do this bind, and send it 2nd bind (EX) as pre-wrapper
    // this: bind, next: exec - do this bind, send it exec (EX) as post-wrapper
    that.execute = function () {
        var thisExec = that.executors[that.sequencePos];
        var tpos = that.sequencePos;
        var pos = ++that.sequencePos;
        var thisText = that.sequenceText(pos);
        that.renderSequence();
        var last = pos === that.count;
        if (last) {
            if (thisExec.execute) {
                fluid.test.execExecutor(thisExec, thisText);
                testCaseState.finisher();
            }
            else {
                fluid.test.bindExecutor(thisExec, fluid.identity, testCaseState.finisher, thisText);
            }
            return;
        }
        var nextExec = that.decode(pos); // decode the NEXT executor

        if (thisExec.bind) {
            var wrappers = nextExec.bind? [that.execute, fluid.identity] : 
                [fluid.identity, that.execute];
            fluid.test.bindExecutor(thisExec, wrappers[0], wrappers[1], thisText);
        }

        if (thisExec.execute) {
            if (nextExec.bind) {
                that.execute(); // bind first [ODD]
                fluid.test.execExecutor(thisExec, thisText);
            }
            else { 
                fluid.test.execExecutor(thisExec, thisText);
                that.execute();
            }
        }
    };
    
    return that;
};

/** Top-level driver function for users. Supply an array of grade names holding the
 *  list of the testing environments to be executed in sequence
 *  @param envNames (Array of string) The testing environments to be executed
 */

fluid.test.runTests = function (envNames) {
    var index = 0;
    var nextLater;
    var next = function () {
        if (index < envNames.length) {
            fluid.invokeGlobalFunction(envNames[index++], [{
                listeners: {
                    onDestroy: nextLater
                }
            }]);
        }
    };
    nextLater = function () {
        setTimeout(next, 1);
    }
    next();
};

fluid.test.processTestCase = function (testCaseState) {
    var testCase = testCaseState.testCase;
    var jCase = new jqUnit.TestCase(testCase.name);
    var fixtures = testCase.tests;
    fluid.each(fixtures, function (fixture) {
        var testType = "asyncTest";

        var testFunc = function () {
            if (fixture.expect !== undefined) {
                jqUnit.expect(fixture.expect);
            }
            if (fixture.sequence) {
                fluid.test.sequenceExecutor(testCaseState, fixture).execute();
            }
            else {
                var decoded = fluid.test.decodeFixture(testCaseState, fixture);
                if (decoded.execute) {
                    decoded.execute();
                    testCaseState.finisher();
                }
            }
        };
        // Note that this test relies on an implementation detail of qunit. For those
        // tests which fail the "validTest" test due to being filtered out in the UI, 
        // they result in no material placed in the queue. We escape the case where they
        // might enter the queue and immediately leave it as a result of only ever issuing
        // asynchronous tests
        var oldLength = QUnit.config.queue.length;
        jCase[testType](fixture.name, testFunc);
        if (QUnit.config.queue.length === oldLength) {
            console.log("Skipped test " + fixture.name);
        }
        else {
            fluid.test.noteTest(testCaseState.root, 1);
        }
    });
};

fluid.test.processTestCaseHolder = function (testCaseState) {
    var cases = testCaseState.testCaseHolder.options.testCases;
    fluid.each(cases, function (testCase) {
        testCaseState.testCase = testCase;
        testCaseState.finisher = function () {
            console.log("Finisher for ", testCaseState);
            fluid.test.noteTest(testCaseState.root, -1);
        };
        fluid.test.processTestCase(testCaseState);  
    });
};