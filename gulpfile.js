/**
 * Dependencies
 */
const spawn = require('child_process').spawn;
const del = require('del');
// Gulp general 
const gulp = require('gulp');
const sourceMaps = require('gulp-sourcemaps');
const prettyError = require('gulp-prettyerror');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
// Gulp scripts
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require('vinyl-buffer');
const tsify = require("tsify");
const uglify = require("gulp-uglify");
const stripDebug = require("gulp-strip-debug");
// Gulp styles
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const autoPrefixer = require('gulp-autoprefixer');
// Gulp HTML
const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');


/**
 * Variables/Constants
 */
let webServerProcess = null;
let webServerTimeout = null;
let browserSyncRunning = false;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';



/**
 * Scripts task
 */
function scripts () {
    const tsConfig = require('./tsconfig.json');
  
    return browserify('./src/ts/index.ts', {
        basedir: "./",
        debug: true,
        cache: {},
        packageCache: {}
      })
      .plugin(tsify, tsConfig.compilerOptions)
      .transform("babelify", {
         extensions: [".ts"]
       })
      .bundle()
      .on('error', function (err) {
        console.log(err);
        this.emit('end')
      })
      .pipe(source("index.js"))
      .pipe(buffer())
      .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init({ loadMaps: true })))
      .pipe(gulpif(IS_PRODUCTION, uglify()))
      .pipe(gulpif(IS_PRODUCTION, stripDebug()))
      .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write('.')))
      .pipe(gulp.dest('build/js'));
}


/**
 * HTML task
 */
function html () {
    return gulp.src('**/*.pug', {
        cwd: 'src/pug'
    })
    .pipe(prettyError())
    .pipe(pug())
    .pipe(gulpif(IS_PRODUCTION, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('.', {
        cwd: 'build'
    }));
}


/**
 * Styles task
 */
function styles () {
    return gulp.src('**/*.scss', {
        cwd: 'src/scss'
    })
    .pipe(prettyError())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init()))
    .pipe(sass())
    .pipe(gulpif(IS_PRODUCTION, csso()))
    .pipe(autoPrefixer())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write('.')))
    .pipe(gulp.dest('css', {
        cwd: 'build'
    }));
}


/**
 * Static task
 */
function static () {
    return gulp.src('**/*', {
        cwd: 'src/static',
        dot: true
    })
    .pipe(gulp.dest('.', {
        cwd: 'build'
    }))
}


/**
 * Clear build directory
 */
async function clearBuild (cb) {
    await del('**/*', {
        cwd: 'build'
    }, )
}


/**
 * Start or restart server
 */
function initWebServer () {
    if (webServerProcess) {
        webServerProcess.stdin.pause();
        webServerProcess.kill();
    }

    webServerProcess = spawn('node', ['index.js']);
    if (!browserSyncRunning) {
        browserSync.init(null, {
            proxy: "http://localhost:3000/?debug",
            files: ["build/**/*.*"],
            port: 7000,
        });

        browserSyncRunning = true;
    } else {
        browserSync.reload();
    }

    webServerProcess.stdout.on('data', (data) => console.log(data.toString()));
    webServerProcess.stderr.on('data', (data) => console.log(data.toString()));
    webServerProcess.stdin.on('data', (data) => console.log(data.toString()));
}


/**
 * Watch task
 */
function watch () {
    gulp.watch('**/*.pug', { cwd: 'src/pug' }, html);
    gulp.watch('**/*.scss', { cwd: 'src/scss' }, styles);
    gulp.watch('**/*.ts', { cwd: 'src/ts' }, scripts);
    gulp.watch('**/*', { cwd: 'src/static', static});

    gulp.watch('**/*', { cwd: 'src', delay: 1000 }, (cb) => {
        initWebServer();
        cb();
    });

    initWebServer();
}


/**
 * Export tasks
 */
module.exports = {
    default: gulp.parallel(scripts, html, styles, static),
    clearBuild,
    watch
};