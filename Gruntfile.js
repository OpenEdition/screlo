module.exports = function(grunt) {
    
    var package = require('./package.json'),
        userpath,
        stylesheetUrl = grunt.option("stylesheet") ? grunt.option("stylesheet") : "https://rawgit.com/thomas-fab/screlo/master/css/screlo.css";
    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    
    if (grunt.option("userpath")) { // Usage: $ grunt --userpath="C:\path_to_your_firefox_profile\gm_scripts\screlo" 
        userpath = grunt.option( "userpath" ).replace(/\\/g, "/");
        grunt.registerTask('default', ['copy', 'preprocess:prod', 'browserify', 'concat:userscript', 'clean', 'copy:userpath', 'watch']);
    } else {
        grunt.registerTask('default', ['copy', 'preprocess:prod', 'browserify', 'concat:userscript', 'clean', 'watch']);
    } 

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: '*',
                dest: 'tmp/',
            },
            userpath: {
                expand: true,
                cwd: 'js/',
                src: 'screlo.user.js',
                dest: userpath
            }
        },
        preprocess : {
            options: {
                context : {
                    VERSION: '<%= pkg.version %>',
                    STYLESHEET: stylesheetUrl
                }
            },
            dev : {
                src : 'tmp/*',
                options: {
                    inline: true,
                    context : {
                        DEV: true
                    }
                }
            },
            prod : {
                src : 'tmp/*',
                options: {
                    inline: true
                }
            }
        },
        browserify: {
            main: {
                src: 'tmp/main.js',
                dest: 'tmp/bundle.js'
            }
        },
        concat: {
            options: {
                separator: '\n',
            },
            userscript: {
                src: ['tmp/userscript-header.txt', 'tmp/bundle.js'],
                dest: 'js/screlo.user.js'
            }
        },
        clean: ['tmp/*'],
        watch: {
            options: {
                spawn: false // Increase speed. Not spawning task runs can make the watch more prone to failing so please use as needed.
            },
            files: 'src/*',
            tasks: ['default']
        }
    });
};