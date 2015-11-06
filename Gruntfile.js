/*global module:false*/
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            browser: {
                src: ['lib/*.js', 'test/*.js', 'example/*.js'],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        },
        clean: ['coverage'],
        exec: {
            test: {
                command: '"./node_modules/.bin/mocha" --recursive',
                stdout: true,
                stderr: true
            },
            cover: {
                command: '"./node_modules/.bin/istanbul" cover "./node_modules/mocha/bin/_mocha" -- --recursive',
                stdout: true,
                stderr: true
            }
        },
        watch: {
            src: {
                files: ['lib/*.js'],
                tasks: 'dev'
            }
        }
    });

    grunt.registerTask('dev', ['jshint', 'exec:test']);

    grunt.registerTask('build', ['jshint', 'clean', 'exec:cover']);

    grunt.registerTask('default', ['build']);

};
