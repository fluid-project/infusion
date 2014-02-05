var _ = require("lodash");

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Project package file destination.
        pkg: grunt.file.readJSON("package.json"),
        allBuildName: "<%= pkg.name %>",
        customBuildName: (grunt.option("name") || "custom") + "-<%= pkg.name %>",
        clean: {
            build: "build",
            products: "products"
        },
        copy: {
            all: {
                files: [{
                    src: ["src/**"],
                    dest: "build/"
                }]
            },
            custom: {
                files: [{
                    src: "<%= modulefiles.custom.output.dirs %>",
                    dest: "build/"
                }]
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            all: {
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: "./build/src/",      // Src matches are relative to this path.
                    src: ["components/**/*.js"], // Actual pattern(s) to match.
                    dest: "./build/src/"   // Destination path prefix.
                }, {
                    expand: true,
                    cwd: "./build/src/",
                    src: ["framework/**/*.js"],
                    dest: "./build/src/"
                }, {
                    expand: true,
                    cwd: "./build/src/",
                    src: ["lib/**/*.js"],
                    dest: "./build/src/"
                }]
            },
            custom: {
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: "./build",      // Src matches are relative to this path.
                    src: ["**/*.js"], // Actual pattern(s) to match.
                    dest: "./build"   // Destination path prefix.
                }]
            }
        },
        modulefiles: {
            all: {
                src: ["./src/**/*Dependencies.json"]
            },
            custom: {
                options: {
                    exclude: grunt.option("exclude"),
                    include: grunt.option("include")
                },
                src: ["./src/**/*Dependencies.json"]
            }
        },
        map: {
            copyDirs: {
                prop: "copy.custom.files.0.src",
                fn: function (str) {
                    return str + "/**";
                }
            },
            concatAllFiles: {
                prop: "concat.all.src",
                fn: function (str) {
                    console.log(str);
                    return "build/" + str;
                }
            },
            concatCustomFiles: {
                prop: "concat.custom.src",
                fn: function (str) {
                    console.log(str);
                    return "build/" + str;
                }
            }
        },
        concat: {
            options: {
                separator: ";",
                banner: "/*! <%= pkg.name %> - v<%= pkg.version %> <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>*/\n"
            },
            all: {
              src: "<%= modulefiles.all.output.files %>",
              dest: "./build/<%= allBuildName %>.js"
            },
            custom: {
              src: "<%= modulefiles.custom.output.files %>",
              dest: "./build/<%= customBuildName %>.js"
            }
        },
        compress: {
            all: {
                options: {
                    archive: "products/<%= allBuildName %>-<%= pkg.version %>.zip"
                },
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: "./build/",      // Src matches are relative to this path.
                    src: ["**/*"], // Actual pattern(s) to match.
                    dest: "./infusion"   // Destination path prefix in the zip package
                }]
            },
            custom: {
                options: {
                    archive: "products/<%= customBuildName %>-<%= pkg.version %>.zip"
                },
                files: "<%= compress.all.files %>"
            }
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-modulefiles");

    // Custom tasks:

    // Simple task for transforming a property
    grunt.registerMultiTask("map", "a task wrapper around the map function from lodash", function () {
        var transformed = _.map(grunt.config.get(this.data.prop), this.data.fn);
        grunt.config.set(this.data.prop, transformed);
    });

    grunt.registerTask("pathMap", "", function (target) {
        if (target === "all") {
            grunt.task.run("map:concatAllFiles");
        } else if (target === "custom") {
            grunt.task.run("map:copyDirs", "map:concatCustomFiles");
        }
    });

    // Task for organizing the build
    grunt.registerTask("build", "Generates a minified or source distribution for the specified build target", function (target) {
        var tasks = [
            "clean",
            "modulefiles:" + target,
            "pathMap:" + target,
            "copy:" + target,
            "uglify:" + target,
            "concat:" + target,
            "compress:" + target,
            "clean:build"
        ];
        // remove the uglify task when creating a source build
        if (grunt.option("source")) {
            _.pull(tasks, "uglify:" + target);
        }
        grunt.task.run(tasks);
    });

    // grunt.registerTask("default", ["minzip"]);
    grunt.registerTask("default", ["build:all"]);
    grunt.registerTask("custom", ["build:custom"]);
};