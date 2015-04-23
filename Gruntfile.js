module.exports = function(grunt) {
    
    require('load-grunt-tasks')(grunt); // load all grunt tasks. Done! 
    
    var userpath,
        www,
        subfolder,
        cdn = "https://rawgit.com/brrd/screlo/master/",
        defaultTask;
   
    
    /* Default task */
    
    defaultTask = ['copy:tmp', 'preprocess', 'browserify', 'concat:userscript', 'copy:css', 'copy:updatescript', 'clean'];
    
    if (grunt.option("userpath")) { // Usage: $ grunt --userpath="C:\path_to_your_firefox_profile\gm_scripts\screlo" 
        userpath = grunt.option( "userpath" ).replace(/\\/g, "/");
        defaultTask.push("copy:userscript");
    }
    
    if (grunt.option("www") && grunt.option("subfolder")) { // Usage: $ grunt --www="C:\path_to_www" --subfolder="screlo_dir_in_www"
        www = grunt.option( "www" ).replace(/\\/g, "/") + "/";
        subfolder = grunt.option( "subfolder" ).replace(/\\/g, "/") + "/";
        cdn = "http://localhost/" + subfolder;
        defaultTask.push("copy:localhost");
    } else if (grunt.option("develop")) {
        cdn = "https://rawgit.com/brrd/screlo/develop/";
    }
    
    if (!grunt.option("nowatch")) {
        defaultTask.push("watch");
    }
    
    grunt.registerTask('default', defaultTask);
    
    
/* Generate test info : $ grunt buildinfos */
    
    grunt.registerTask('buildinfos', 'This task builds a markdown info page from the screlo tests source file.', function () {
        
        function getTestsInfos (tests) {
            function getInfo (test) {
                var type = test.type || "danger",
                    links,
                    info = "";
                if (!test) {
                    return false;
                }
                if (test.name) {
                    info += "## Test #" + test.id + " - " + test.name + "\n\n";
                }
                info += "Type : " + type + "\n\n";
                info += test.description + "\n\n";
                if (test.links && test.links.length >= 2) {
                    links = test.links;
                    info += "**À lire dans la documentation**\n\n";
                    for (var j=0; j<links.length; j=j+2) {
                        if (links[j] && links[j+1]) {
                            info += "* [" + links[j] + "](" + links[j+1] + ")\n";
                        }
                    }
                    info += "\n";
                }
                return info;
            }
            var infos = [],
                thisId,
                thisInfo;
            for (var i=0; i<tests.length; i++) {
                if (tests[i].id && tests[i].description) {
                    thisId = tests[i].id;
                    thisInfo = getInfo(tests[i]);
                    infos[thisId] = thisInfo;
                }
            }
            return infos.join('\n');
        }
        var tests = require('./src/tests-revues.js'),
            header = "<!-- Attention : cette page est générée automatiquement à partir du code source de Screlo. Ne pas la modifier ici. -->\n\n# Tests Revues\n",
            content = header + getTestsInfos(tests);
        grunt.file.write('docs/tests-revues.md', content);
    });
    
    /* Init config*/

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            tmp: {
                expand: true,
                cwd: 'src/',
                src: '**',
                dest: '.tmp/',
            },
            css: {
                expand: true,
                cwd: '.tmp/css/',
                src: '*.css',
                dest: 'dist/', 
            },
            updatescript: {
                expand: true,
                cwd: '.tmp/',
                src: 'screlo-update.js',
                dest: 'dist/', 
            },
            userscript: {
                expand: true,
                cwd: 'dist/',
                src: 'screlo.user.js',
                dest: userpath
            },
            localhost: {
                src: ['dist/**/*', 'img/**/*'],
                dest: www + subfolder
            }
        },
        preprocess : {
            options: {
                context : {
                    VERSION: '<%= pkg.version %>',
                    UPDATE: 'https://github.com/brrd/screlo/raw/master/dist/screlo.user.js',
                    CDN: cdn,
                    HOMEPAGE: '<%= pkg.homepage %>',
                    DESCRIPTION: '<%= pkg.description %>'
                }
            },
            main : {
                src : ['.tmp/**.*', '.tmp/css/*.css'],
                options: {
                    inline: true
                }
            }
        },
        browserify: {
            options: {
                browserifyOptions: {
                    debug: false // Impossible pour l'instant
                }
            },
            main: {
                src: '.tmp/main.js',
                dest: '.tmp/bundle.js'
            }
        },
        concat: {
            options: {
                separator: '\n',
            },
            userscript: {
                src: ['.tmp/userscript-header.txt', '.tmp/bundle.js'],
                dest: 'dist/screlo.user.js'
            }
        },
        clean: ['.tmp/**/*'],
        watch: {
            options: {
                spawn: false // Increase speed. Not spawning task runs can make the watch more prone to failing so please use as needed.
            },
            files: 'src/**',
            tasks: ['default']
        }
    });
};