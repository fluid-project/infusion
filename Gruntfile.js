module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Project package file destination.
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                mangle: {
                    // except: ["jQuery", "fluid", "fluid_1_5", "gpii"]
                },
                compress: true
            },
            my_target: {
                files: {
                    // "build/NPGatheringTool.js": ["build/NPGatheringTool.js"]
                }
            }
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("grunt-contrib-uglify");

    // Custom task(s):
    grunt.registerTask("uglify", ["uglify"]);
};