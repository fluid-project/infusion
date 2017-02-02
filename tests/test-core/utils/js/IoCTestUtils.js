/*
Copyright 2010 Lucendo Development Ltd.
Copyright 2012-2014 Raising the Floor - US
Copyright 2013 OCAD University
Copyright 2014-2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit, QUnit */

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.test.testEnvironment", {
        gradeNames: ["fluid.component"],
        components: {
            sequenceListener: {
                type: "fluid.test.sequenceListener"
            }
        },
        hangWait: 5000, // number of milliseconds to wait for a listener fixture before emitting a diagnostic
        events: {
            onBeginSequence: null,
            onBeginSequenceStep: null,
            onEndSequenceStep: null,
            onEndSequence: null,
            onSequenceHang: null
        },
        members: {
            activeTests: 0,
            capturedMarkup: {
                expander: {
                    funcName: "fluid.test.captureMarkup",
                    args: "{that}.options.markupFixture"
                }
            }
        },
        listeners: {
            onCreate: {
                listener: "fluid.test.testEnvironment.runTests",
                args: "{that}"
            },
            "onBeginSequenceStep.checkHang": {
                listener: "fluid.test.checkHang.beginStep",
                args: ["{arguments}.1", "{that}"]
            },
            "onEndSequence.checkHang": {
                listener: "fluid.test.checkHang.endSequence",
                args: ["{arguments}.1", "{that}"]
            },
            "onSequenceHang.checkHang": {
                listener: "fluid.test.checkHang.reportHang",
                args: ["{arguments}.0", "{that}"]
            }
        }
    });

    fluid.defaults("fluid.test.testCaseHolder", {
        gradeNames: ["fluid.component"],
        mergePolicy: {
            modules: "noexpand",
            moduleSource: "noexpand"
        },
        events: {
            onTestCaseStart: null
        }
    });

    fluid.registerNamespace("fluid.test.checkHang");

    fluid.test.checkHang.beginStep = function (sequenceState, testEnvironment) {
        clearTimeout(sequenceState.hangTimer);
        sequenceState.hangTimer = setTimeout(
            function () {
                testEnvironment.events.onSequenceHang.fire(sequenceState);
            }, testEnvironment.options.hangWait);
    };

    fluid.test.checkHang.endSequence = function (sequenceState) {
        clearTimeout(sequenceState.hangTimer);
    };

    fluid.test.checkHang.reportHang = function (sequenceState, testEnvironment) {
        fluid.log(fluid.logLevel.IMPORTANT, "Test case listener has not responded after " + testEnvironment.options.hangWait + "ms - at sequence pos " +
            sequenceState.sequenceText() + " sequence element ", sequenceState.sequence[sequenceState.sequencePos - 1], " of fixture " + sequenceState.fixture.name);
    };

    fluid.defaults("fluid.test.sequenceListener", {
        gradeNames: ["fluid.component", "fluid.contextAware"]
    });

    /** In the browser only, hijack a piece of the QUnit UI in order to show the running sequence number **/

    fluid.contextAware.makeAdaptation({
        distributionName: "fluid.test.browserSequenceDistribution",
        targetName: "fluid.test.sequenceListener",
        adaptationName: "browserSequence",
        checkName: "browserSequence",
        record: {
            contextValue: "{fluid.browser}",
            gradeNames: "fluid.test.browserSequenceListener"
        }
    });

    fluid.defaults("fluid.test.browserSequenceListener", {
        gradeNames: ["fluid.component"],
        listeners: {
            "{testEnvironment}.events.onBeginSequence": {
                listener: "fluid.test.browserSequenceListener.onBeginSequence",
                args: ["{that}", "{arguments}.1"]
            },
            "{testEnvironment}.events.onBeginSequenceStep": {
                listener: "fluid.test.browserSequenceListener.onBeginSequenceStep",
                args: "{that}"
            }
        }
    });

    fluid.test.browserSequenceListener.onBeginSequence = function (that, sequenceExecutor) {
        // This unfortunate style is as good as the qunit markup!
        $("#qunit-testresult").append(" &mdash; at sequence position <span class=\"jqunit-sequence\"></span>");
        that.sequenceElement = $("#qunit-testresult .jqunit-sequence");
        that.renderSequence = function () {
            that.sequenceElement.text(sequenceExecutor.sequenceText());
        };
        that.renderSequence();
    };

    fluid.test.browserSequenceListener.onBeginSequenceStep = function (that) {
        that.renderSequence();
    };

    /** DECODER INFRASTRUCTURE
     * This operates a set of duck-typed records defined in fluid.test.decoderDucks.
     * These define a set of records of two types:
     *   - an "executor", an active record which, for example calls function or launches a task,
     *   - a "binder", a passive record which registers a listener for a one-shot activity.
     * These records are decoded from JSON, IoC-expanded and turned into binder or executor "mini-thats"
     * which are then operated by the sequence executor
     */

    fluid.test.makeExpander = function (that) {
        return function (toExpand, localRecord, contextThat) {
            return fluid.expandOptions(toExpand, contextThat || that, {}, localRecord);
        };
    };

    fluid.test.makeFuncExpander = function (expander) {
        return function (toExpand, type, args, localRecord, contextThat) {
            var rec = fluid.compactStringToRec(toExpand, type);
            if (typeof(rec) === "string") {
                rec = fluid.upgradePrimitiveFunc(rec, null);
            }
            if (rec.args === fluid.NO_VALUE) {
                rec.args = args;
            }
            var expanded = expander(rec, localRecord, contextThat);
            if (typeof(expanded.funcName) === "string") {
                expanded.func = fluid.getGlobalValue(expanded.funcName);
            }
            expanded.args = fluid.makeArray(expanded.args);
            expanded.apply = function () {
                return expanded.func.apply(null, expanded.args);
            };
            return expanded;
        };
    };

    fluid.test.decodeListener = function (testCaseState, fixture) {
        var listener, member;
        if (fixture.listener) {
            member = "listener";
            // We don't use most of the workflow of expandFunction since listener argument resolution must be lazy
            listener = testCaseState.expandFunction(fixture.listener).func;
        }
        else if (fixture.listenerMaker) {
            member = "listenerMaker";
            var maker = testCaseState.expandFunction(fixture.listenerMaker).func;
            if (!maker || !maker.apply) {
                fluid.fail("Unable to decode entry " + fixture.listenerMaker + " of fixture ", fixture, " to a function - got ", maker);
            }
            var args = testCaseState.expand(fixture.makerArgs);
            listener = maker.apply(null, args);
        } else {
            listener = fluid.identity;
        }
        if (typeof(listener) !== "function") {
            fluid.fail("Unable to decode entry " + member + " of fixture ", fixture, " to a function - record is ", listener);
        }
        var togo;
        if (fixture.args !== undefined) {
            togo = function () {
                var expandedArgs = testCaseState.expand(fixture.args, {"arguments": arguments}, fixture.contextThat);
                return listener.apply(null, fluid.makeArray(expandedArgs));
            };
        } else {
            togo = listener;
        }
        return togo;
    };

    fluid.test.decodeElement = function (testCaseState, fixture) {
        var element = testCaseState.expand(fixture.element);
        var jel = fluid.wrap(element);
        if (!jel || jel.length === 0) {
            fluid.fail("Unable to decode entry \"element\" of fixture ", fixture, " to a DOM element");
        }
        return jel;
    };

    fluid.test.decoders = {};

    fluid.test.decoders.func = function (testCaseState, fixture) {
        return {
            execute: function (executeDone) {
                var record = testCaseState.expandFunction(fixture.func || fixture.funcName, "function executor", fixture.args, null, fixture.contextThat);
                if (typeof(record.func) !== "function") {
                    fluid.fail("Unable to decode entry func or funcName of fixture ", fixture, " to a function - got ", record);
                }
                record.apply();
                executeDone();
            }
        };
    };

    fluid.test.decoders.funcName = fluid.test.decoders.func;

    fluid.test.decoders.task = function (testCaseState, fixture) {
        if ((fixture.resolve === undefined) === (fixture.reject === undefined)) {
            fluid.fail("Error in task fixture ", fixture, ": exactly one out of \"resolve\" and \"reject\" members must be set");
        }
        return {
            execute: function (executeDone) {
                var task = testCaseState.expandFunction(fixture.task, "task executor", fixture.args, null, fixture.contextThat);
                var promise = task.apply(null);
                var handlers = fixture.resolve ?
                    [fluid.test.decoders.task.makePromiseBinder(testCaseState, fixture, executeDone, "resolve"),
                     fluid.test.decoders.task.makeMismatchedBinder(fixture, executeDone, "reject", "resolve")] :
                    [fluid.test.decoders.task.makeMismatchedBinder(fixture, executeDone, "resolve", "reject"),
                     fluid.test.decoders.task.makePromiseBinder(testCaseState, fixture, executeDone, "reject")];
                promise.then(handlers[0], handlers[1]);
            }
        };
    };

    fluid.test.decoders.task.makePromiseBinder = function (testCaseState, fixture, executeDone, method) {
        return function (payload) {
            var record = testCaseState.expandFunction(fixture[method], "promise " + method + " binder",
                fluid.firstDefined(fixture[method + "Args"], "{arguments}.0"), {arguments: [payload]}, fixture.contextThat);
            record.apply();
            executeDone();
        };
    };

    fluid.test.renderErrorAsString = function (error) {
        return fluid.transform(error, function (arg) {
            return fluid.isPrimitive(arg) ? arg : JSON.stringify(arg, null, 2);
        }).join("");
    };

    fluid.test.decoders.task.makeMismatchedBinder = function (fixture, executeDone, method, otherMethod) {
        return function (payload) {
            var error = ["Failure in task fixture ", fixture, ": promise has received disposition \"" + method + "\" with payload ", payload, " when \"" + otherMethod + "\" was expected"];
            fluid.log.apply(null, [fluid.logLevel.WARN].concat(error));
            jqUnit.fail(fluid.test.renderErrorAsString(error));
            executeDone();
        };
    };

    fluid.test.decoders.jQueryTrigger = function (testCaseState, fixture) {
        var event = fixture.jQueryTrigger;
        return {
            execute: function (executeDone) {
                var args = fluid.makeArray(testCaseState.expand(fixture.args));
                args.unshift(event);
                var element = fluid.test.decodeElement(testCaseState, fixture);
                element.trigger.apply(element, args);
                executeDone();
            }
        };
    };

    fluid.test.decoders.jQueryBind = function (testCaseState, fixture) {
        var event = fixture.jQueryBind;
        var listener = fluid.test.decodeListener(testCaseState, fixture);
        var element;
        var that = fluid.test.makeBinder(listener,
            function (wrapped) {
                element = fluid.test.decodeElement(testCaseState, fixture);
                var args = fluid.makeArray(testCaseState.expand(fixture.args));
                args.unshift(event);
                args.push(wrapped);
                element.one.apply(element, args);
            }, fluid.identity  // do nothing on unbind, jQuery.one has done it
        );
        return that;
    };

    fluid.test.composeSimple = function (f1, f2) {
        return function () {
            f1();
            f2();
        };
    };

    fluid.test.makeBinder = function (listener, innerBinder, innerRemover) {
        var that = {};
        that.bind = function (preWrap, postWrap) {
            var wrapped = function () {
                innerRemover(wrapped); // Since we have just fired, we can now unbind ourselves from whatever the listener was bound to
                preWrap();
                listener.apply(null, arguments);
                postWrap();
            };
            innerBinder(wrapped);
        };
        return that;
    };

    // TODO: This will eventually go into the core framework for "Luke Skywalker Event Binding"
    fluid.analyseTarget = function (testCaseState, material, expectedPrefix) {
        if (fluid.isIoCReference(material)) {
            var parsed = fluid.parseContextReference(material);
            if (fluid.isIoCSSSelector(parsed.context)) {
                var selector = fluid.parseSelector(parsed.context, fluid.IoCSSMatcher);
                var headContext = fluid.extractSelectorHead(selector);
                var holder = testCaseState.testCaseHolder;
                var head = fluid.resolveContext(headContext, holder);
                if (!head) {
                    fluid.fail("Error in test case selector ", material, " cannot resolve to a root component from holder ", holder);
                }
                var segs = fluid.model.parseEL(parsed.path);
                if (segs.length < 2 || segs[0] !== expectedPrefix) {
                    fluid.fail("Error in test case selector ", material, " must start with path " + expectedPrefix);
                }
                return {selector: selector, head: head, path: segs.slice(1)};
            }
        }
        return {resolved: testCaseState.expand(material)};
    };

    fluid.test.decoders.event = function (testCaseState, fixture) {
        var analysed = fluid.analyseTarget(testCaseState, fixture.event, "events");
        var listener = fluid.test.decodeListener(testCaseState, fixture);
        var priority = fixture.priority === undefined ? "last:testing" : fixture.priority;
        var bind, unbind;
        if (analysed.resolved) {
            var event = analysed.resolved;
            bind = function (wrapped) {
                event.addListener(wrapped, fixture.namespace, priority);
            };
            unbind = function (wrapped) {
                event.removeListener(wrapped);
            };
        }
        else if (analysed.path) {
            var id;

            bind = function (wrapped) {
                var options = {};
                fluid.set(options, ["listeners"].concat(analysed.path), {
                    listener: wrapped,
                    args: fixture.args,
                    namespace: fixture.namespace,
                    priority: fixture.priority
                });
                id = fluid.pushDistributions(analysed.head, analysed.selector, fixture.event,
                    [{options: options, recordType: "distribution", priority: fluid.mergeRecordTypes.distribution}]
                );
            };
            unbind = function () {
                fluid.clearDistribution(analysed.head, id);
            };
        } else {
            fluid.fail("Error decoding event fixture ", fixture, ": must be able to look up member \"event\" to one or more events");
        }
        return fluid.test.makeBinder(listener, bind, unbind);
    };

    fluid.test.decoders.changeEvent = function (testCaseState, fixture) {
        var event = testCaseState.expand(fixture.changeEvent);
        var listener = fluid.test.decodeListener(testCaseState, fixture);
        var listenerId = fluid.allocateGuid();
        var that = fluid.test.makeBinder(listener, function (wrapped) {
            var spec = fixture.path === undefined ? fixture.spec : {path: fixture.path};
            if (spec === undefined || spec.path === undefined) {
                fluid.fail("Error in changeEvent fixture ", fixture,
                   ": could not find path specification named \"path\" or \"spec\"");
            }
            spec.listenerId = listenerId;
            spec.transactional = true;
            if (spec.priority === undefined) {
                spec.priority = "last:testing";
            }
            event.addListener(spec, wrapped, fixture.namespace);
        }, function () {
            event.removeListener(listenerId);
        });
        return that;
    };

    fluid.test.decoderDucks = ["func", "funcName", "event", "changeEvent", "task", "jQueryTrigger", "jQueryBind"];

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

    /** EXECUTOR APPARATUS
     * Operates on a stream of the "mini-thats" decoded from the sequence by the decoder infrastructure.
     * These need to be bound in a slightly odd way because of the nature of the passive "binder" records.
     * These require a listener to be registered on the target at the latest possible time before the
     * event might fire, and then unregistered at the earliest possible time after the event has fired.
     * This requires lots of juggling with callbacks and wrappers.
     */

    fluid.test.execExecutor = function (executor, sequenceText, executeDone) {
        jqUnit.setMessageSuffix(" - at sequence position " + sequenceText);
        executor.execute(executeDone);
        jqUnit.setMessageSuffix("");
    };

    /** Operate the `bind` action of an bind-type executor (a decoded sequence element) which acts either
      * i) After an exec-type executor has concluded, OR
      * ii) After a bind-type executor has just begun its "fire" action
      * Note that the executor itself will have been constructed by `fluid.test.makeBinder` which operates the unbind/bind
      * logic within the wrapper it constructs for the listener to be fired
      * @param binder {Binder} An object with a member `bind` accepting two nullary functions as dispensed from `fluid.test.makeBinder`
      * @param preWrap {Function()} A nullary function to be invoked before the binding action
      * @param postWrap {Function()} A nullary function to be invoked before the unbinding action
      * @param sequenceText {String} A string representing the sequence position that the binder occupies
      */

    fluid.test.bindExecutor = function (binder, preWrap, postWrap, sequenceText) {
        function preFunc() {
            jqUnit.setMessageSuffix(" - at sequence position " + sequenceText);
        }
        function postFunc() {
            jqUnit.setMessageSuffix("");
        }
        var c = fluid.test.composeSimple;
        binder.bind(c(preWrap, preFunc), c(postFunc, postWrap));
    };

    // This check executes immediately BEFORE an initial execute or AFTER an initial bind
    fluid.test.checkTestStart = function (testCaseState) {
        if (!testCaseState.started) { // Support for FLUID-4929
            testCaseState.started = true;
            testCaseState.testCaseHolder.events.onTestCaseStart.fire(testCaseState.testCaseHolder);
        }
    };

    fluid.test.checkComponentGrade = function (component, gradeNames, expectedGrade, name, record) {
        if (!fluid.componentHasGrade(component, expectedGrade)) {
            fluid.fail("Unable to look up " + name + " ", gradeNames, " to a component descended from \"" + expectedGrade + "\" - got component ", component, " from fixture ", record);
        }
    };

    fluid.test.resolveSequence = function (fixture, testCaseHolder) {
        if (fixture.sequenceGrade) {
            var path = fluid.pathForComponent(testCaseHolder);
            var seqPath = path.concat(["sequenceComponent"]);
            var sequenceComponent = fluid.construct(seqPath, {type: fixture.sequenceGrade});

            fluid.test.checkComponentGrade(sequenceComponent, fixture.sequenceGrade, "fluid.test.sequence", "sequenceGrade", fixture);
            var elements = fluid.transform(sequenceComponent.options.sequenceElements, function (element, i) {
                var elementPath = seqPath.concat(["sequenceElement-" + i]);
                var constructOptions = fluid.extend({type: element.gradeNames}, element.options);
                var elementComponent = fluid.construct(elementPath, constructOptions);
                fluid.test.checkComponentGrade(elementComponent, element.gradeNames, "fluid.test.sequenceElement", "sequence element gradeNames", element);
                var innerSequence = fluid.makeArray(fluid.copy(elementComponent.options.sequence));
                fluid.each(innerSequence, function (oneInnerSequence) {
                    oneInnerSequence.contextThat = elementComponent;
                });
                return {
                    sequence: innerSequence,
                    contextThat: elementComponent,
                    priority: element.priority
                };
            });
            elements.sequence = {
                sequence: fluid.makeArray(fixture.sequence)
            };
            var sortedSequence = fluid.parsePriorityRecords(elements, "testing sequence element");
            return fluid.getMembers(sortedSequence, "sequence");
        } else {
            return fixture.sequence;
        }
    };

    fluid.test.sequenceExecutor = function (testCaseState, fixture) {
        var sequence = fluid.flatten(fluid.test.resolveSequence(fixture, testCaseState.testCaseHolder));
        if (sequence.length === 0) {
            fluid.fail("Error in test fixture ", fixture, ": no elements in sequence");
        }
        // lightweight pseudocomponent "that" holding per-sequence state - named "sequenceState" by users
        // TODO: Why on earth did we not use the IoC system itself for this?
        var that = {
            testCaseState: $.extend({}, testCaseState),
            count: sequence.length,
            fixture: fixture,
            sequence: sequence,
            sequencePos: 0,
            executors: []
        };

        that.decode = function (pos) {
            that.executors[pos] = fluid.test.decodeFixture(that.testCaseState, that.sequence[pos]);
            return that.executors[pos];
        };
        that.sequenceText = function (pos) {
            return (pos === undefined ? that.sequencePos : pos) + " of " + that.count;
        };
        testCaseState.events.onBeginSequence.fire(testCaseState, that);

        var finishSequence = function () {
            testCaseState.events.onEndSequence.fire(testCaseState, that);
            testCaseState.finisher();
        };

        that.decode(0);
        // this: exec, next: exec - do 1st exec, then 2nd exec (EX)
        // this: exec, next: bind - do 2nd bind (EX) FIRST, then exec [ODD - out of order]
        // this: bind, next: bind - do this bind, and send it 2nd bind (EX) as pre-wrapper
        // this: bind, next: exec - do this bind, send it exec (EX) as post-wrapper
        that.execute = function () {
            var thisExec = that.executors[that.sequencePos];
            if (thisExec.execute) { // All exec cases up front, all bind cases afterwards
                fluid.test.checkTestStart(testCaseState);
            }
            var pos = ++that.sequencePos;
            var thisText = that.sequenceText(pos);
            testCaseState.events.onBeginSequenceStep.fire(testCaseState, that);
            var last = pos === that.count;
            if (last) {
                if (thisExec.execute) {
                    fluid.test.execExecutor(thisExec, thisText, finishSequence);
                }
                else {
                    fluid.test.bindExecutor(thisExec, fluid.identity, finishSequence, thisText);
                    fluid.test.checkTestStart(testCaseState);
                }
                return;
            }
            var nextExec = that.decode(pos); // decode the NEXT executor

            if (thisExec.bind) {
                var wrappers = nextExec.bind ? [that.execute, fluid.identity] :
                    [fluid.identity, that.execute];
                fluid.test.bindExecutor(thisExec, wrappers[0], wrappers[1], thisText);
                fluid.test.checkTestStart(testCaseState);
            }

            if (thisExec.execute) {
                if (nextExec.bind) {
                    that.execute(); // bind first [ODD]
                    fluid.test.execExecutor(thisExec, thisText, fluid.identity);
                }
                else {
                    fluid.test.execExecutor(thisExec, thisText, that.execute);
                }
            }
        };

        return that;
    };

    /** MAIN IMPLEMENTATION of the logic for constructing, scanning, and destroying testEnvironment
     * and testCaseHolder components
     */

    fluid.defaults("fluid.test.sequenceElement", {
        gradeNames: "fluid.component",
        mergePolicy: {
            sequence: "noexpand, replace"
        }
    });

    fluid.defaults("fluid.test.sequence", {
        gradeNames: "fluid.component"
    });

    fluid.test.noteTest = function (root, count) {
        if (root.activeTests === "destroyed") {
            return;
        }
        root.activeTests += count;
        if (count === -1) {
            fluid.log(fluid.logLevel.TRACE, "Restarting QUnit for new fixture from environment ", root);
            QUnit.start();
        }
        if (root.activeTests === 0) {
            root.destroy();
            root.activeTests = "destroyed";
        }
    };

    fluid.test.processTestCase = function (testCaseState) {
        var testCase = testCaseState.testCase;
        if (!testCase.name) {
            fluid.fail("Error in configuration of testCase - required field \"name\" is missing in ", testCase);
        }
        jqUnit.module(testCase.name);
        var fixtures = fluid.makeArray(testCase.tests);
        fluid.each(fixtures, function (fixture, index) {
            var testType = "asyncTest";

            var testFunc = function () {
                if (fixture.expect !== undefined) {
                    jqUnit.expect(fixture.expect);
                }
                if (fixture.sequence || fixture.sequenceGrade) {
                    fluid.test.sequenceExecutor(testCaseState, fixture).execute();
                }
                else {
                    var decoded = fluid.test.decodeFixture(testCaseState, fixture);
                    if (decoded.execute) {
                        decoded.execute(testCaseState.finisher);
                    }
                }
            };
            // Note that this test relies on an implementation detail of qunit. For those
            // tests which fail the "validTest" test due to being filtered out in the UI,
            // they result in no material placed in the queue. We escape the case where they
            // might enter the queue and immediately leave it as a result of only ever issuing
            // asynchronous tests
            var oldLength = QUnit.config.queue.length;
            if (!fixture.name) {
                fluid.fail("Error in configuration of test fixture - required field \"name\" is missing in ", fixture, " at index " + index + " of test case ", testCase);
            }
            jqUnit[testType](fixture.name, testFunc);
            if (QUnit.config.queue.length === oldLength) {
                fluid.log(fluid.logLevel.IMPORTANT, "Skipped test " + fixture.name);
            }
            else {
                fluid.log(fluid.logLevel.IMPORTANT, "Successfully queued test " + fixture.name);
                fluid.test.noteTest(testCaseState.root, 1);
            }
        });
    };

    fluid.test.processTestCaseHolder = function (testCaseState) {
        var modules = fluid.makeArray(testCaseState.testCaseHolder.options.modules);
        if (modules.length === 0) {
            fluid.fail("Error in test case environment ", testCaseState, ": no modules found in options.modules");
        }
        fluid.each(modules, function (testCase) {
            testCaseState.testCase = testCase;
            testCaseState.finisher = function () {
                fluid.invokeLater(function () { // finish asynchronously to avoid destroying components that may be listening in final fixture
                    fluid.test.noteTest(testCaseState.root, -1);
                });
            };
            fluid.test.processTestCase(testCaseState);
        });
    };

    fluid.test.expandModuleSource = function (moduleSource, testCaseState) {
        var funcSpec = moduleSource.func || moduleSource.funcName;
        var record = testCaseState.expandFunction(funcSpec, "moduleSource", moduleSource.args);
        return record.apply();
    };

    fluid.test.captureMarkup = function (markupFixture) {
        if (markupFixture) {
            var markupContainer = fluid.container(markupFixture, false);
            return {
                container: markupContainer,
                markup: markupContainer[0].innerHTML
            };
        }
    };

    fluid.test.testEnvironment.runTests = function (that) {
        that.testCaseHolders = [];
        var visitor = function (component) {
            if (fluid.componentHasGrade(component, "fluid.test.testCaseHolder")) {
                that.testCaseHolders.push(component);
            }
        };
        visitor(that); // FLUID-5753
        fluid.visitComponentChildren(that, visitor, {});
        // This structure is constructed here, reused for each "TestCaseHolder" but is given a shallow
        // clone in "sequenceExecutor".
        var testCaseState = {
            root: that,
            events: that.events,
            hangWait: that.options.hangWait
        };
        if (that.options.markupFixture) {
            that.events.afterDestroy.addListener(function () {
                that.capturedMarkup.container[0].innerHTML = that.capturedMarkup.markup;
            });
        }
        fluid.each(that.testCaseHolders, function (testCaseHolder) {
            testCaseState.started = false;
            testCaseState.testCaseHolder = testCaseHolder;
            testCaseState.expand = fluid.test.makeExpander(testCaseHolder);
            testCaseState.expandFunction = fluid.test.makeFuncExpander(testCaseState.expand);
            if (testCaseHolder.options.moduleSource) {
                testCaseHolder.options.modules = fluid.test.expandModuleSource(testCaseHolder.options.moduleSource, testCaseState, testCaseHolder);
            }
            fluid.test.processTestCaseHolder(testCaseState);
        });
        // Fire this event so that environments which registered no tests (due to qunit filtering)
        // will terminate immediately
        fluid.test.noteTest(testCaseState.root, 0);
    };

    fluid.test.makeTestRunner = function () {
        var that = {
            index: 0,
            stopped: true,
            envs: []
        };
        that.next = function () {
            if (that.index < that.envs.length) {
                that.stopped = false;
                var env = that.envs[that.index];
                if (typeof(env) === "string") {
                    env = {type: env};
                }
                var options = $.extend(true, {}, env.options, {
                    listeners: {
                        afterDestroy: that.nextLater
                    }
                });
                if (!env.type) {
                    fluid.fail("Error in IoC Testing fixture - required member \"type\" was not found - fixture was ", env);
                }
                // Constructs a component of type fluid.test.testEnvironment whose onCreate will then execute fluid.test.testEnvironment.runTests
                // and whose afterDestroy (scheduled internally) will invoke our nextLater
                fluid.invokeGlobalFunction(env.type, [options]);
                that.index++;
            } else {
                that.stopped = true;
                QUnit.config.testsArriving = false;
            }
        };
        that.nextLater = function () {
            fluid.invokeLater(that.next);
        };
        that.append = function (envs) {
            that.envs = that.envs.concat(envs);
            if (that.stopped) {
                that.next();
            }
        };
        // FLUID-5810: Support our patched option for QUnit to prevent premature test termination
        QUnit.config.testsArriving = true;
        return that;
    };

    /** Top-level driver function for users. Supply an array of grade names holding the
     *  list of the testing environments to be executed in sequence
     *  @param envs (Array of string/object) The testing environments to be executed - either a simple
     *  string holding the testing environment's name, or a record {type: typeName, options: options} holding
     *  IoC configuration for the environment as if for a subcomponent.
     */

    fluid.test.runTests = function (envs) {
        if (!fluid.test.iocTestState) {
            fluid.test.iocTestState = fluid.test.makeTestRunner();
        }
        fluid.test.iocTestState.append(envs);
    };

})(jQuery, fluid_3_0_0);
