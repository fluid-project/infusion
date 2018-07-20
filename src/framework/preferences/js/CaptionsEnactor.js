/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global YT */

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * captions
     *
     * An enactor that is capable enabling captions on embedded YouTube videos
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.captions", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.captions": {
                "model.enabled": "default"
            }
        },
        events: {
            onVideoElmLocated: null
        },
        selectors: {
            videos: "iframe[src^=\"https://www.youtube.com/embed/\"]"
        },
        model: {
            enabled: false
        },
        dynamicComponents: {
            player: {
                type: "fluid.prefs.enactor.captions.youTubePlayer",
                createOnEvent: "onVideoElmLocated",
                container: "{arguments}.0",
                options: {
                    model: {
                        captions: "{captions}.model.enabled"
                    }
                }
            }
        },
        listeners: {
            "onCreate.checkYouTubeAPI": "fluid.prefs.enactor.captions.waitForYouTubeAPI"
        }
    });

    // After FLUID-6148 (https://issues.fluidproject.org/browse/FLUID-6148) is complete. It should be possible to
    // just source the dynamic components with the videos selector. The framework should at that time be able to
    // handle the asynchrony of waiting for YT in the expander that creates the player.
    fluid.prefs.enactor.captions.waitForYouTubeAPI = function (that) {
        var promise = fluid.promise();
        promise.then(function () {
            that.locate("videos").each(function (index, elm) {
                that.events.onVideoElmLocated.fire($(elm));
            });
        }, function (error) {
            fluid.log(fluid.logLevel.WARN, error);
        });

        if (fluid.get(window, ["YT", "Player"])) {
            promise.resolve();
        } else {
            // the YouTube iframe api will call onYouTubeIframeAPIReady after the api has loaded
            window.onYouTubeIframeAPIReady = promise.resolve;
        }

        return promise;
    };

    /**
     * See: https://developers.google.com/youtube/iframe_api_reference#Events for details on the YouTube player
     * events. This includes when they are fired and what data is passed along.
     */
    fluid.defaults("fluid.prefs.enactor.captions.youTubePlayer", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            onReady: null,
            onStateChange: null,
            onPlaybackQualityChange: null,
            onPlaybackRateChange: null,
            onError: null,
            onApiChange: null
        },
        model: {
            captions: false,
            track: {}
        },
        members: {
            player: {
                expander: {
                    funcName: "fluid.prefs.enactor.captions.youTubePlayer.initYTPlayer",
                    args: ["{that}"]
                }
            },
            tracklist: []
        },
        invokers: {
            applyCaptions: {
                funcName: "fluid.prefs.enactor.captions.youTubePlayer.applyCaptions",
                args: ["{that}.player", "{that}.model.track", "{that}.model.captions"]
            }
        },
        modelListeners: {
            "setCaptions": {
                listener: "{that}.applyCaptions",
                path: ["captions", "track"],
                excludeSource: "init"
            }
        },
        listeners: {
            "onApiChange.prepTrack": {
                listener: "fluid.prefs.enactor.captions.youTubePlayer.prepTrack",
                args: ["{that}", "{that}.player"]
            },
            "onApiChange.applyCaptions": {
                listener: "{that}.applyCaptions",
                priority: "after:prepTrack"
            }
        }
    });

    /**
     * Convert queryString into a parameter object. Note that repeated parameters will be replaced with the last one.
     *
     * @param {String} queryStr - the query string to parse. It assumes the first character is not "?";
     *
     * @return {Object} - An Object representation of the key/value pairs from the query string.
     */
    fluid.prefs.enactor.captions.youTubePlayer.parseQueryString = function (queryStr) {
        queryStr = queryStr[0] === "?" ? queryStr.slice(1) : queryStr;
        var params = {};

        if (queryStr) {
            var strParams = queryStr.split("&");

            fluid.each(strParams, function (strParam) {
                strParam = decodeURIComponent(strParam);
                var paramVals = strParam.split("=");
                params[paramVals[0]] = paramVals[1];
            });
        }

        return params;
    };

    /**
     * Adds the "enabledjsapi=1" query paramater to the query string at the end of the src attribute.
     * If "enabledjsapi" already exists it will modify its value to 1. This is required for API access
     * to the embedded YouTube video.
     *
     * @param {jQuery|Element} videoElm - a reference to the existing embedded YouTube video.
     */
    fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI = function (videoElm) {
        videoElm = $(videoElm);
        var uri = videoElm.attr("src");
        var segs = uri.split("?");
        var params = fluid.prefs.enactor.captions.youTubePlayer.parseQueryString(segs[1] || "");

        params.enablejsapi = 1;
        segs[1] = $.param(params);

        videoElm.attr("src", segs.join("?"));
    };

    /**
     * An instance of a YouTube player from the YouTube iframe API
     *
     * @typedef {Object} YTPlayer
     */

    /**
     * Initializes the YT.Player using the existing embedded video (component's container). An ID will be added to the
     * video element if one does not already exist.
     *
     * @param {Component} that - the component

     * @return {YTPlayer} - an instance of a YouTube player controlling the embedded video
     */
    fluid.prefs.enactor.captions.youTubePlayer.initYTPlayer = function (that) {
        var id = fluid.allocateSimpleId(that.container);
        fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI(that.container);
        return new YT.Player(id, {
            events: {
                onReady: that.events.onReady.fire,
                onStateChange: that.events.onStateChange.fire,
                onPlaybackQualityChange: that.events.onPlaybackQualityChange.fire,
                onPlaybackRateChange: that.events.onPlaybackRateChange.fire,
                onError: that.events.onError.fire,
                onApiChange: that.events.onApiChange.fire
            }
        });
    };

    /**
     * Enables/disables the captions on an embedded YouTube video. Requires that the player be initiallized and the API
     * ready for use.
     *
     * @param {YTPlayer} player - an instance of a YouTube player
     * @param {Object} track - a track object for the {YTPlayer}
     * @param {Boolean} state - true - captions enabled; false - captions disabled.
     */
    fluid.prefs.enactor.captions.youTubePlayer.applyCaptions = function (player, track, state) {
        // The loadModule method from the player must be ready first. This is made available after
        // the onApiChange event has fired.
        if (player.loadModule) {
            if (state) {
                player.loadModule("captions");
                player.setOption("captions", "track", track);
            } else {
                player.unloadModule("captions");
            }
        }
    };

    /**
     * Prepares the track to be used when captions are enabled. It will use the first track in the tracklist, and update
     * the "track" model path with it.
     *
     * @param {Component} that - the component
     * @param {YTPlayer} player - an instance of a YouTube player
     */
    fluid.prefs.enactor.captions.youTubePlayer.prepTrack = function (that, player) {
        player.loadModule("captions");
        var tracklist = player.getOption("captions", "tracklist");

        if (tracklist.length && !that.tracklist.length) {
            // set the tracklist and use first track for the captions
            that.tracklist = tracklist;
            that.applier.change("track", tracklist[0], "ADD", "prepTrack");
        }
    };


})(jQuery, fluid_3_0_0);
