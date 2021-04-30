// Gulp general 
const gulp = require('gulp');
const sourceMaps = require('gulp-sourcemaps');
const prettyError = require('gulp-prettyerror');
// Gulp scripts
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
// Gulp styles
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const autoPrefixer = require('gulp-autoprefixer');


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
      .pipe(prettyError())
      .pipe(source("index.js"))
      .pipe(gulp.dest('build/js'));
}


/**
 * HTML task
 */
function html () {
    return gulp.src('**/*.html', {
        cwd: 'src/html'
    })
    .pipe(prettyError())
    .pipe(gulp.dest('html', {
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
    .pipe(sourceMaps.init())
    .pipe(sass())
    .pipe(csso())
    .pipe(autoPrefixer())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('css', {
        cwd: 'build'
    }));
}


/**
 * Watch task
 */
function watch () {
    gulp.watch('**/*.html', { cwd: 'src/html' }, html);
    gulp.watch('**/*.scss', { cwd: 'src/scss' }, styles);
    gulp.watch('**/*.ts', { cwd: 'src/ts' }, scripts);
}


/**
 * Export tasks
 */
module.exports = {
    default: gulp.parallel(scripts, html, styles),
    watch
};