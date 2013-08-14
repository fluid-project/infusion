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
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Custom task(s):
    grunt.registerTask("minify", ["clean", "copy", "uglify"]);
    grunt.registerTask("default", ["minify"]);
};