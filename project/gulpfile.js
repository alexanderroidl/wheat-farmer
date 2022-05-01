/**
 * Dependencies
 */
require("dotenv").config();

const spawn = require("child_process").spawn;
const del = require("del");
const chalk = require("chalk");
const ESLint = require("eslint").ESLint;
// Gulp general
const gulp = require("gulp");
const sourceMaps = require("gulp-sourcemaps");
const prettyError = require("gulp-prettyerror");
const gulpif = require("gulp-if");
const browserSync = require("browser-sync").create();
// Gulp scripts
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const tsify = require("tsify");
const uglify = require("gulp-uglify");
const stripDebug = require("gulp-strip-debug");
// Gulp styles
const sass = require("gulp-sass")(require("node-sass"));
const csso = require("gulp-csso");
const autoPrefixer = require("gulp-autoprefixer");
// Gulp HTML
const pug = require("gulp-pug");
const htmlmin = require("gulp-htmlmin");


/**
 * Variables/Constants
 */
let webServerProcess = null;
let browserSyncRunning = false;
let linterErrorCount = 0;
let restartServerTimeout = null;

const IS_PRODUCTION = process.env.NODE_ENV === "production";


/**
 * Lint task
 */
async function lint (cb) {
  try {
    // Initiate Linter
    const eslint = new ESLint();
    const results = await eslint.lintFiles(["src/ts/**/*.ts"]);
  
    // Compute total amount of errors and warnings combined
    const errorsWarningsCount = results.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.errorCount + currentValue.warningCount;
    }, 0);

    // Compute and save total amount of errors (Later checked in TypeScript task)
    linterErrorCount = results.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.errorCount;
    }, 0);

    // Total amount of errors and warnings is greater than zero
    if (errorsWarningsCount > 0) {
      // Load formatter, generate result text
      const formatter = await eslint.loadFormatter("stylish");
      const resultText = formatter.format(results);

      console.error(resultText);
    }

    cb();
  } catch (error) {
    console.error(error);
  }
}


/**
 * Scripts task
 */
function scripts (cb) {
  // Count of total errors produced by previous ESLint execution was greater than zero
  if (linterErrorCount > 0) {
    // Inform about abortion of current task
    console.error(
      chalk.red("[TYPESCRIPT]"),
      `Aborting compilation because of ${chalk.red(linterErrorCount)} ESLint errors.`
    );

    // Stop current task
    cb();
    return;
  }

  // Reset count of total ESLint errors
  linterErrorCount = 0;
  
  // Load TypeScript project file
  const tsConfig = require("./tsconfig.json");
  
  return browserify("./src/ts/index.ts", {
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
    .on("error", function (err) {
      console.log(err);
      this.emit("end");
    })
    .pipe(source("index.js"))
    .pipe(buffer())
    .pipe(prettyError())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init({ loadMaps: true })))
    .pipe(gulpif(IS_PRODUCTION, uglify()))
    .pipe(gulpif(IS_PRODUCTION, stripDebug()))
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write(".")))
    .pipe(gulp.dest("build/js"));
}


/**
 * HTML task
 */
function html () {
  return gulp.src("**/*.pug", {
    cwd: "src/pug"
  })
    .pipe(prettyError())
    .pipe(pug())
    .pipe(gulpif(IS_PRODUCTION, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(".", {
      cwd: "build"
    }));
}


/**
 * Styles task
 */
function styles () {
  return gulp.src("**/*.scss", {
    cwd: "src/scss"
  })
    .pipe(prettyError())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init()))
    .pipe(sass())
    .pipe(gulpif(IS_PRODUCTION, csso()))
    .pipe(autoPrefixer())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write(".")))
    .pipe(gulp.dest("css", {
      cwd: "build"
    }));
}


/**
 * Static task
 */
function copy () {
  return gulp.src("**/*", {
    cwd: "src/static",
    dot: true
  })
    .pipe(prettyError())
    .pipe(gulp.dest(".", {
      cwd: "build"
    }));
}


/**
 * Clear build directory
 */
async function clearBuild (cb) {
  await del("**/*", {
    cwd: "build"
  });
}


/**
 * Start or restart server
 */
function startExpressServer (cb) {
  restartServerTimeout = null;

  // If web server process exists, kill it
  if (webServerProcess) {
    webServerProcess.stdin.pause();
    webServerProcess.kill();
  }

  // Reverse express and browserSync port
  // We do this so it ends up always being the same outside port being used, both while developing and in production
  process.env.EXPRESS_PORT = 9000;
  process.env.BROWSERSYNC_PORT = 3000;

  // Spawn child process of express server using modified environmental variables
  webServerProcess = spawn("node", ["express.js"], {
    env: {...process.env}
  });

  // BrowserSync is currently not running
  if (!browserSyncRunning) {
    browserSync.init(null, {
      proxy: `${process.env.WEB_PROTOCOL}://${process.env.HOST_ADDRESS}:${process.env.EXPRESS_PORT}/?debug`,
      files: ["build/**/*.*"],
      port: process.env.BROWSERSYNC_PORT,
      open: false
    });

    browserSyncRunning = true;
  } else {
    browserSync.reload();
  }

  // Pipe all outputs to this process
  webServerProcess.stdout.on("data", (data) => console.log(data.toString()));
  webServerProcess.stderr.on("data", (data) => console.log(data.toString()));
  webServerProcess.stdin.on("data", (data) => console.log(data.toString()));

  // Invoke callback if provided
  if (typeof cb === "function") {
    cb();
  }
}


function restartExpressServer (cb) {
  if (restartServerTimeout !== null) {
    clearTimeout(restartServerTimeout);
  }

  restartServerTimeout = setTimeout(() => startExpressServer(cb), 1500);
}


/**
 * Watch task
 */
function watch () {
  // Launch pug, styles and static tasks upon file changes
  gulp.watch("**/*.pug", { cwd: "src/pug" }, gulp.series(html, restartExpressServer));
  gulp.watch("**/*.scss", { cwd: "src/scss" }, gulp.series(styles, restartExpressServer));
  gulp.watch("**/*", { cwd: "src/static" }, gulp.series(copy, restartExpressServer));

  // When TS source files or ESLint rules change, lint and compile afterwards (if successful)
  gulp.watch([
    ".eslintrc.js",
    "src/ts/**/*.ts"
  ], gulp.series(lint, scripts, restartExpressServer));

  // Start express server initially
  startExpressServer();
}


/**
 * Export tasks
 */
module.exports = {
  default: gulp.parallel(gulp.series(lint, scripts), html, styles, copy),
  clearBuild,
  watch
};