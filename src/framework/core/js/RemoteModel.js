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
            onWriteError: null,
            onFetchError: null
        },
        members: {
            pendingRequests: {
                write: null,
                fetch: null
            }
        },
        model: {
            buffered: {
                // an implementor must setup a model relay between the buffered local value and the portions of the
                // component's model state that should be updated with the remote source.
                local: {},
                remote: {},
                requestInFlight: false
            }
        },
        modelListeners: {
            "buffered.requestInFlight": {
                listener: "fluid.remoteModelComponent.launchPendingRequest",
                args: ["{that}"]
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
        if (!that.model.buffered.requestInFlight) {
            if (that.pendingRequests.fetch) {
                that.fetch();
            } else if (that.pendingRequests.write) {
                that.write();
            }
        }
    };

    fluid.remoteModelComponent.updateModelFromFetch = function (that, fetchedModel) {
        var remoteChanges = fluid.modelPairToChanges(fetchedModel, that.model.buffered.remote, "buffered.local");
        var localChanges = fluid.modelPairToChanges(that.model.buffered.local, that.model.buffered.remote, "buffered.local");
        var changes = remoteChanges.concat(localChanges);

        // perform model updates in a single transaction
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "buffered.local", type: "DELETE"}); // clear old local model
        transaction.change("buffered.local", that.model.buffered.remote); // reset local model to the base for applying changes.
        transaction.fireChangeRequest({path: "buffered.remote", type: "DELETE"}); // clear old remote model
        transaction.change("buffered.remote", fetchedModel); // update remote model to fetched changes.
        fluid.fireChanges(transaction, changes); // apply changes from remote and local onto base model.
        transaction.commit(); // submit transaction
    };

    fluid.remoteModelComponent.fetch = function (that) {
        var promise = fluid.promise();

        if (that.pendingRequests.fetch) {
            fluid.promise.follow(that.pendingRequests.fetch, promise);
        } else {
            that.pendingRequests.fetch = promise;
        }

        if (!that.model.buffered.requestInFlight) {
            that.applier.change("buffered.requestInFlight", true);
            var reqPromise = that.fetchImpl();
            reqPromise.then(function (data) {
                that.pendingRequests.fetch = null;
                fluid.remoteModelComponent.updateModelFromFetch(that, data);
                that.applier.change("buffered.requestInFlight", false);
            }, that.events.onFetchError.fire);
            fluid.promise.follow(reqPromise, that.pendingRequests.fetch);
        }
        return promise;
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

        if (that.model.buffered.requestInFlight) {
            that.pendingRequests.write = activePromise;
        } else {
            that.applier.change("buffered.requestInFlight", true);
            that.pendingRequests.write = null;

            if (fluid.model.diff(that.model.buffered.local, that.model.buffered.remote)) {
                activePromise.resolve(that.model.buffered.local);
            } else {
                var reqPromise = that.writeImpl(that.model.buffered.local);
                reqPromise.then(function () {
                    that.applier.change("buffered.requestInFlight", false);
                }, that.events.onWriteError.fire);
                fluid.promise.follow(reqPromise, activePromise);
            }
        }

        return promise;
    };

})(jQuery, fluid_3_0_0);
