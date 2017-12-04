/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.remoteModelComponent", {
        gradeNames: ["fluid.modelComponent"],
        events: {
            afterFetch: null,
            onFetch: null,
            onFetchError: null,
            afterWrite: null,
            onWrite: null,
            onWriteError: null
        },
        members: {
            pendingRequests: {
                write: null,
                fetch: null
            }
        },
        model: {
            // an implementor must setup a model relay between the buffered local value and the portions of the
            // component's model state that should be updated with the remote source.
            local: {},
            remote: {},
            requestInFlight: false
        },
        modelListeners: {
            "requestInFlight": {
                listener: "fluid.remoteModelComponent.launchPendingRequest",
                args: ["{that}"]
            }
        },
        listeners: {
            "afterFetch.updateModel": {
                listener: "fluid.remoteModelComponent.updateModelFromFetch",
                args: ["{that}", "{arguments}.0"],
                priority: "before:unblock"
            },
            "afterFetch.unblock": {
                listener: "fluid.remoteModelComponent.unblockFetchReq",
                args: ["{that}"]
            },
            "onFetchError.unblock": {
                listener: "fluid.remoteModelComponent.unblockFetchReq",
                args: ["{that}"]
            },
            "afterWrite.unblock": {
                changePath: "requestInFlight",
                value: false
            },
            "onWriteError.unblock": {
                changePath: "requestInFlight",
                value: false
            }
        },
        invokers: {
            fetch: {
                funcName: "fluid.remoteModelComponent.fetch",
                args: ["{that}"]
            },
            fetchImpl: "fluid.notImplemented",
            write: {
                funcName: "fluid.remoteModelComponent.write",
                args: ["{that}"]
            },
            writeImpl: "fluid.notImplemented"
        }
    });

    fluid.remoteModelComponent.launchPendingRequest = function (that) {
        if (!that.model.requestInFlight) {
            if (that.pendingRequests.fetch) {
                that.fetch();
            } else if (that.pendingRequests.write) {
                that.write();
            }
        }
    };

    fluid.remoteModelComponent.updateModelFromFetch = function (that, fetchedModel) {
        var remoteChanges = fluid.modelPairToChanges(fetchedModel, that.model.remote, "local");
        var localChanges = fluid.modelPairToChanges(that.model.local, that.model.remote, "local");
        var changes = remoteChanges.concat(localChanges);

        // perform model updates in a single transaction
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "local", type: "DELETE"}); // clear old local model
        transaction.change("local", that.model.remote); // reset local model to the base for applying changes.
        transaction.fireChangeRequest({path: "remote", type: "DELETE"}); // clear old remote model
        transaction.change("remote", fetchedModel); // update remote model to fetched changes.
        fluid.fireChanges(transaction, changes); // apply changes from remote and local onto base model.
        transaction.commit(); // submit transaction
    };

    fluid.remoteModelComponent.makeSequneceStrategy = function (payload) {
        return {
            invokeNext: function (that) {
                var lisrec = that.sources[that.index];
                lisrec.listener = fluid.event.resolveListener(lisrec.listener);
                var value = lisrec.listener.apply(null, [payload, that.options]);
                return value;
            },
            resolveResult: function () {
                return payload;
            }
        };
    };

    fluid.remoteModelComponent.makeSequence = function (listeners, payload, options) {
        var sequencer = fluid.promise.makeSequencer(listeners, options, fluid.remoteModelComponent.makeSequneceStrategy(payload));
        fluid.promise.resumeSequence(sequencer);
        return sequencer;
    };

    fluid.remoteModelComponent.fireEventSequence = function (event, payload, options) {
        var listeners = fluid.makeArray(event.sortedListeners);
        var sequence = fluid.remoteModelComponent.makeSequence(listeners, payload, options);
        return sequence.promise;
    };

    fluid.remoteModelComponent.fetch = function (that) {
        var promise = fluid.promise();
        var activePromise;

        if (that.pendingRequests.fetch) {
            activePromise = that.pendingRequests.fetch;
            fluid.promise.follow(activePromise, promise);
        } else {
            activePromise = promise;
            that.pendingRequests.fetch = promise;
        }

        if (!that.model.requestInFlight) {
            var onFetchSeqPromise = fluid.remoteModelComponent.fireEventSequence(that.events.onFetch);
            onFetchSeqPromise.then(function () {
                that.applier.change("requestInFlight", true);
                var reqPromise = that.fetchImpl();
                reqPromise.then(function (data) {
                    var afterFetchSeqPromise = fluid.remoteModelComponent.fireEventSequence(that.events.afterFetch, data);
                    fluid.promise.follow(afterFetchSeqPromise, activePromise);
                }, that.events.onFetchError.fire);

            }, that.events.onFetchError.fire);
        }
        return promise;
    };

    fluid.remoteModelComponent.unblockFetchReq = function (that) {
        that.pendingRequests.fetch = null;
        that.applier.change("requestInFlight", false);
    };

    fluid.remoteModelComponent.write = function (that) {
        var promise = fluid.promise();
        var activePromise;

        if (that.pendingRequests.write) {
            activePromise = that.pendingRequests.write;
            fluid.promise.follow(that.pendingRequests.write, promise);
        } else {
            activePromise = promise;
        }

        if (that.model.requestInFlight) {
            that.pendingRequests.write = activePromise;
        } else {
            var onWriteSeqPromise = fluid.remoteModelComponent.fireEventSequence(that.events.onWrite);
            onWriteSeqPromise.then(function () {
                that.applier.change("requestInFlight", true);
                that.pendingRequests.write = null;

                if (fluid.model.diff(that.model.local, that.model.remote)) {
                    var afterWriteSeqPromise = fluid.remoteModelComponent.fireEventSequence(that.events.afterWrite, that.model.local);
                    fluid.promise.follow(afterWriteSeqPromise, activePromise);
                } else {
                    var reqPromise = that.writeImpl(that.model.local);
                    reqPromise.then(function (data) {
                        var afterWriteSeqPromise = fluid.remoteModelComponent.fireEventSequence(that.events.afterWrite, data);
                        fluid.promise.follow(afterWriteSeqPromise, activePromise);
                    }, that.events.onWriteError.fire);;
                }
            }, that.events.onWriteError.fire);
        }

        return promise;
    };

})(jQuery, fluid_3_0_0);
