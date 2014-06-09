/**
 * Credit to https://github.com/ridgehkr/ for the general style and design.
 */

var paths = {
	src: {
		scripts: [
			'src/bower_components/modernizr/modernizr.js',
			'src/bower_components/jquery/dist/jquery.min.js',
			'src/bower_components/fastclick/lib/fastclick.js',
			'src/bower_components/jquery.cookie/jquery.cookie.js',
			'src/bower_components/jquery-placeholder/jquery.placeholder.js',
			'src/bower_components/foundation/js/foundation.min.js',
			'src/scripts/**/*.js'
		],
		styles: [
			'src/styles/**/*.{css,scss}'
		],
		images: [
			'src/images/**/*.{png,jpg,jpeg,gif}'
		],
		fonts: [ 
			'src/fonts/**/*', 
			'src/bower_components/font-awesome/fonts/*.{eot,svg,ttf,woff,otf}' 
		],
		templates: [
			'src/templates/*.mustache'
		],
		partials: [
			'src/templates/partials/**/*.mustache',
			'src/templates/layout/**/*.mustache'
		]
	},
	build: {
		scripts: 'build/scripts',
		styles: 'build/styles',
		images: 'build/images',
		fonts: 'build/fonts',
		templates: 'build',
	},
};

// Port to listen on.
var listenPort = process.env.PORT || 1337;

// Load plugins
var gulp = require('gulp'),
	gulpSass = require('gulp-ruby-sass'),
	gulpAutoprefixer = require('gulp-autoprefixer'),
	gulpUglify = require('gulp-uglify'),
	gulpRename = require('gulp-rename'),
	gulpClean = require('gulp-clean'),
	gulpConcat = require('gulp-concat'),
	gulpUtil = require('gulp-util'),
	gulpMustache = require('gulp-mustache'),
	gulpLiveReload = require('gulp-livereload'),
	lr = require('tiny-lr'),
	fs = require('fs'),
	glob = require('glob'),
	async = require('async'),
	express = require('express');

var expressApp = express();
expressApp.use(express.static(__dirname+'/build/'));

var liveReload = lr();

gulp.task('styles', function() {
	return gulp.src( paths.src.styles )
		.pipe(gulpSass({ style: 'compressed' }))
		.pipe(gulpAutoprefixer('last 2 version', '> 5%', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest( paths.build.styles ))
		.pipe(gulpLiveReload( liveReload ));
});

gulp.task('fonts', function() {
	return gulp.src( paths.src.fonts )
		.pipe(gulp.dest( paths.build.fonts ));
});

gulp.task('images', function() {
	return gulp.src( paths.src.images )
		.pipe(gulp.dest( paths.build.images ))
		.pipe(gulpLiveReload( liveReload ));
});

gulp.task('scripts', function() {
	return gulp.src( paths.src.scripts )
		.pipe(gulpUglify())
		.pipe(gulpConcat('app.js'))
		.pipe(gulp.dest( paths.build.scripts ))
		.pipe(gulpLiveReload( liveReload ));
});

// callback( err, underscored_name, content )
function parseMustache (path, after, callback) {
	if( typeof after === 'function' ) {
		callback = after;
		after = '';
	}
	after = after ? after : '';
	callback = typeof callback === 'function' ? callback : function() { /* NADA */ };

	// If not a valid mustache file just return nothing.
	if( path.indexOf('.mustache') < 0 ) 
		return callback('Invalid mustache file: '+path);

	var content = fs.readFileSync(path);
	var underscored_name = path.replace('.mustache','');

	underscored_name = underscored_name.replace(after, '');
	while( underscored_name.indexOf('/') >= 0 ) {
		underscored_name = underscored_name.replace('/','_');
	}
	
	if( underscored_name.substr(0,1) == "_" ) {
		underscored_name = underscored_name.substr(1);
	}

	return fs.readFile(path, {encoding: 'utf8'}, function (err, data) {
		if( err ) 
			return callback('Error reading file: '+err);

		return callback('', underscored_name, data);
	});
}

function parseGlobs (partialGlobs, callback) {
    var partials = {};
    async.each(
        partialGlobs,
        function (partialGlob, eachCallback) {
            glob(partialGlob, {}, function(err, partialFiles) {
                async.each(
                    partialFiles,
                    function (partialFile, nestedEachCallback) {
                        parseMustache(partialFile, partialGlob.substring(0,partialGlob.indexOf('*')), function (parseErr, name, content) {
                            if( err ) 
                                return nestedEachCallback(parseErr);

                            partials[name] = content;
                            
                            return nestedEachCallback();
                        });
                    },
                    function (nestedErr) {
                        eachCallback(nestedErr);
                    }
                );
            });
        },
        function (err) {
            if( err ) {
                return callback(err);
            }

            return callback('', partials);
        }
    );
}

gulp.task('templates', function() {
	return parseGlobs( paths.src.partials, function (err, partials) {
		gulp.src( paths.src.templates )
			.pipe(gulpMustache({},{},partials))
			.pipe(gulp.dest( paths.build.templates ))
			.pipe(gulpLiveReload( liveReload ));
	});
});

gulp.task('clean', function() {
	return gulp.src([ 
			paths.build.styles, 
			paths.build.fonts, 
			paths.build.scripts, 
			paths.build.images,
			paths.build.templates+'/**/*html'
		], {read: false})
		.pipe(gulpClean());
});

gulp.task('clean-styles', function() {
	return gulp.src([ paths.build.styles ], {read: false})
		.pipe(gulpClean());
});

gulp.task('clean-scripts', function() {
	return gulp.src([ paths.build.scripts ], {read: false})
		.pipe(gulpClean());
});

gulp.task('clean-images', function() {
	return gulp.src([ paths.build.images ], {read: false})
		.pipe(gulpClean());
});

gulp.task('clean-fonts', function() {
	return gulp.src([ paths.build.fonts ], {read: false})
		.pipe(gulpClean());
});

gulp.task('clean-templates', function() {
	return gulp.src([ paths.build.templates+'/**/*html' ], {read: false})
		.pipe(gulpClean());
});

gulp.task('default', ['clean'], function() {
	gulp.start( 'styles', 'fonts', 'scripts', 'images', 'templates' );
});

gulp.task('server', function() {
	gulp.start( 'styles', 'fonts', 'scripts', 'images', 'templates' );
	gulp.watch( paths.src.styles , ['clean-styles', 'styles'] );
	gulp.watch( paths.src.fonts , ['clean-fonts', 'fonts'] );
	gulp.watch( paths.src.images , ['clean-images', 'images'] );
	gulp.watch( paths.src.scripts , ['clean-scripts', 'scripts'] );
	gulp.watch( paths.src.templates , ['clean-templates', 'templates'] );
	var expressServer = expressApp.listen(listenPort, function() {
	    console.log('Listening @ http://localhost:%d/', expressServer.address().port);
	});
});
