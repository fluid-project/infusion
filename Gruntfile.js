module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Project package file destination.
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            build: "build"
        },
        copy: {
            src: {
                files: [{
                    src: ['src/**'],
                    dest: 'build/'
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
            }
        },
        concat: {
            options: {
                separator: ';',
                banner: "/*! <%= pkg.name %> - v<%= pkg.version %> <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>*/\n"
            },
            dist: {
              src: ['./build/src/lib/**/*.js', './build/src/framework/**/*.js', './build/src/components/**/*.js'],
              dest: './build/infusionAll.js'
            }
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Custom task(s):
    grunt.registerTask("source", ["clean", "copy", "concat"]);
    grunt.registerTask("minify", ["clean", "copy", "uglify", "concat"]);
    grunt.registerTask("default", ["minify"]);
};