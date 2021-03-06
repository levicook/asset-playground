'use strict';

var EXPRESS_PORT    = 2001,
    LIVERELOAD_PORT = 2002,

    browserify = require('browserify'),
    cache      = require('gulp-cached'),
    concat     = require('gulp-concat'),
    glob       = require('glob'),
    gulp       = require('gulp'),
    gulpLR     = require('gulp-livereload'),
    jshint     = require('gulp-jshint'),
    less       = require('gulp-less'),
    rename     = require('gulp-rename'),
    rev        = require('gulp-rev'),
    tinyLR     = require('tiny-lr')(),
    uglify     = require('gulp-uglify'),

    strings   = require('./src/shared/strings'),
    hasPrefix = strings.hasPrefix,
    hasSuffix = strings.hasSuffix,

    vendorJS = {
        demo: [
            './bower_components/canjs/can.object.js',
            './bower_components/canjs/can.fixture.js',
        ],
        main: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/bootstrap/dist/js/bootstrap.js',
            './bower_components/underscore/underscore.js',
            './bower_components/uri.js/src/URI.js',
            './bower_components/canjs/can.jquery.js',
            './bower_components/canjs/can.list.sort.js',
            './bower_components/canjs/can.stache.js',
        ],
        test: [
            './bower_components/mocha/mocha.js',
            './bower_components/chai/chai.js',
        ]
    };

// ------------------------------------------

function shouldBrowserify(reqPath) {
    return !hasPrefix(reqPath, '/vendor') && hasSuffix(reqPath, '.js');
}

function newBrowserifyFor(reqPath) {
    var b = browserify({
        bundleExternal: false
    });

    b.add('./src' + reqPath);

    b.transform(require('rfileify'));

    return b;
}

// ------------------------------------------

gulp.task('express', function () {
    var browserify     = require('browserify'),
        connectLR      = require('connect-livereload'),
        express        = require('express'),
        lessMiddleware = require('less-middleware'),
        serveIndex     = require('serve-index'),
        serveStatic    = require('serve-static');

    var app = express();

    app.get('/', function(req, res) {
        res.sendfile('./src/demo/main.html');
    });

    app.use(function (req, res, next) {
        if (shouldBrowserify(req.path)) {
            res.set('Content-Type', 'application/javascript');
            newBrowserifyFor(req.path).bundle().pipe(res);
            return;
        }
        next();
    });

    app.use(function (req, res, next) {
        if (hasSuffix(req.path, '/demo.html')) {
            res.sendfile('./src/shared/layout/demo.html');
            return;
        }
        next();
    });

    app.use(function (req, res, next) {
        if (hasSuffix(req.path, '/test.html')) {
            res.sendfile('./src/shared/layout/test.html');
            return;
        }
        next();
    });


    app.use(connectLR({ port: LIVERELOAD_PORT }));

    app.use(serveIndex('./src', { icons: true }));

    app.use(lessMiddleware('./src', {
        compiler: { compress: false },
        dest: './pkg',
        force: true
    }));

    app.use(serveStatic('./src'));
    app.use(serveStatic('./pkg'));
    app.use('/mocha', serveStatic('./bower_components/mocha'));

    app.use(require('errorhandler')())

    app.get('/demos-and-tests.json', function(req, res) {
        glob('./src/**/{demo,test}.js', function (err, files) {
            if (err) {
                res.json(500, err);
                return;
            }

            var demos = [];
            var tests = [];

            files.forEach(function (file) {
                file = file.replace('./src', '').replace('.js', '.html');
                if (hasSuffix(file, 'test.html') ) {
                    tests.push(file);
                } else {
                    demos.push(file);
                }
            })

            res.json({
                demos: demos,
                tests: tests,
            });
        });
    });

    app.get('/rev-manifest.json', function(req, res) {
        var manifest = {
            'vendor-main.js': 'vendor-main.js'
        };

        glob('./src/pages/**/main.{js,less}', function (err, files) {
            if (err) {
                res.json(500, err);
                return;
            }

            files.forEach(function (file) {
                file = file.replace('./src/', '').replace('.less', '.css');
                manifest[file] = file;
            });

            res.json(manifest);
        });
    });

    app.listen(EXPRESS_PORT);
});

// ------------------------------------------

gulp.task('htmlhint', function () {
    var htmlhint = require("gulp-htmlhint");

    return gulp
    .src("./src/**/*.{html,mustache}")
    .pipe(htmlhint({ htmlhintrc: '.htmlhintrc' }))
    .pipe(htmlhint.reporter())
    .pipe(gulpLR(tinyLR))
});

// ------------------------------------------

gulp.task('jshint', ['jshint:main', 'jshint:test']);

gulp.task('jshint:main', function() {
    return gulp
    .src([
        './src/**/*.js',
        '!./src/**/test.js'
    ])
    .pipe(cache('js'))
    .pipe(jshint('.main.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpLR(tinyLR))
});

gulp.task('jshint:test', function() {
    return gulp
    .src('./src/**/test.js')
    .pipe(cache('js'))
    .pipe(jshint('.test.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpLR(tinyLR))
});

// ------------------------------------------

gulp.task('pkg:vendor-main.js', function() {
    return gulp
    .src(vendorJS.main)
    .pipe(concat('vendor-main.js'))
    .pipe(gulp.dest('./pkg'))
});

gulp.task('pkg:vendor-demo.js', function() {
    return gulp
    .src(vendorJS.main.concat(vendorJS.demo))
    .pipe(concat('vendor-demo.js'))
    .pipe(gulp.dest('./pkg'))
});

gulp.task('pkg:vendor-test.js', function() {
    return gulp
    .src(vendorJS.main.concat(vendorJS.demo).concat(vendorJS.test))
    .pipe(concat('vendor-test.js'))
    .pipe(gulp.dest('./pkg'))
});

// ------------------------------------------

gulp.task('dist:img', function() {
    return gulp
    .src('./src/**/img/**')
    .pipe(gulp.dest('./dist'));
});


gulp.task('dist:vendor-main.js', ['pkg:vendor-main.js'], function () {
    return gulp
    .src('./pkg/vendor-main.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
});

gulp.task('dist', [
    'dist:img',
    'dist:vendor-main.js',
    'pkg:vendor-demo.js', // \__ So we don't muck up our dev environment.
    'pkg:vendor-test.js', // /
], function () {
    return gulp
    .src([
        './dist/**/*.css',
        './dist/**/*.js',
        './dist/vendor-main.js'
    ])
    .pipe(rev())
    .pipe(gulp.dest('./dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./dist'))
});

// ------------------------------------------

gulp.task('livereload', function () {
    tinyLR.listen(LIVERELOAD_PORT);
});

// ------------------------------------------

gulp.task('watch', ['pkg'], function () {
    gulp.watch('./src/**/*.js', ['jshint']);

    gulp.watch('./src/**/*.{html,mustache}', ['htmlhint']);

    gulp.watch('./src/**/*.less').on('change', function(file) {
        tinyLR.changed({
            body: {
                files: [file.path]
            }
        });
    });
});

// ------------------------------------------

gulp.task('pkg', [
    'pkg:vendor-demo.js',
    'pkg:vendor-main.js',
    'pkg:vendor-test.js',
]);

gulp.task('default', [
    'express',
    'livereload',
    'watch',
], function () {
    console.log('[express   ] listening at http://127.0.0.1:' + EXPRESS_PORT);
    console.log('[livereload] listening at http://127.0.0.1:' + LIVERELOAD_PORT);
});
