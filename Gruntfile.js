var _ = require('lodash');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Project package file destination.
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            build: "build",
            products: "products"
        },
        copy: {
            src: {
                files: [{
                    src: ['src/**'],
                    dest: 'build/'
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
            my_target: {
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: './build/src/',      // Src matches are relative to this path.
                    src: ['components/**/*.js'], // Actual pattern(s) to match.
                    dest: './build/src/'   // Destination path prefix.
                }, {
                    expand: true,
                    cwd: './build/src/',
                    src: ['framework/**/*.js'],
                    dest: './build/src/'
                }, {
                    expand: true,
                    cwd: './build/src/',
                    src: ['lib/**/*.js'],
                    dest: './build/src/'
                }]
            },
            custom: {
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: './build',      // Src matches are relative to this path.
                    src: ['**/*.js'], // Actual pattern(s) to match.
                    dest: './build'   // Destination path prefix.
                }]
            }
        },
        modulefiles: {
            all: {
                src: ["./build/**/*Dependencies.json"]
            },
            custom: {
                options: {
                    exclude: grunt.option("exclude"),
                    include: grunt.option("include")
                },
                src: ["**/*Dependencies.json"]
            }
        },
        map: {
            customCopy: {
                prop: "copy.custom.files.0.src",
                fn: function (str) {
                    return str + "/**";
                }
            }
        },
        concat: {
            options: {
                separator: ';',
                banner: "/*! <%= pkg.name %> - v<%= pkg.version %> <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>*/\n"
            },
            all: {
              src: "<%= modulefiles.all.output.files %>",
              dest: './build/infusionAll.js'
            },
            custom: {
              src: "<%= modulefiles.custom.output.files %>",
              dest: './build/myInfusion.js'
            }
        },
        compress: {
            all: {
                options: {
                    archive: "products/infusionAll.zip"
                },
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: './build/',      // Src matches are relative to this path.
                    src: ['**/*'], // Actual pattern(s) to match.
                    dest: './infusion'   // Destination path prefix in the zip package
                }]
            },
            custom: {
                options: {
                    archive: "products/myInfusion.zip"
                },
                files: "<%= compress.all.files %>"
            }
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-modulefiles');

    // Custom tasks:

    // Simple task for transforming a property
    grunt.registerMultiTask('map', 'a task wrapper around the map function from lodash', function () {
        var transformed = _.map(grunt.config.get(this.data.prop), this.data.fn);
        grunt.config.set(this.data.prop, transformed);
    });

    grunt.registerTask("source", ["clean", "copy", "modulefiles", "concat"]);
    grunt.registerTask("minify", ["clean", "copy", "uglify", "modulefiles", "concat"]);
    grunt.registerTask("srczip", ["source", "compress", "clean:build"]);
    grunt.registerTask("minzip", ["minify", "compress", "clean:build"]);
    grunt.registerTask("custom", ["clean", "modulefiles:custom", "map", "copy:custom", "uglify:custom", "concat:custom", "compress:custom", "clean:build"]);
    grunt.registerTask("default", ["minzip"]);
};