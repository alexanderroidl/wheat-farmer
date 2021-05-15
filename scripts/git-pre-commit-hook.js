const childProcess = require("child_process");
const path = require("path");
const spawn = require('cross-spawn');
const chalk = require('chalk');
const Signale = require('signale').Signale;


/**
 * Spawn "git status" process and log about it
 */
function gitStatus () {
  // Initiate Signale for "git status" process
  const gitStatusSignale = new Signale({
    scope: 'git status'
  });
  gitStatusSignale.pending("Checking commited files...");

  // Spawn "git status" process
  const gitStatusProcess = spawn.sync("git", ["status"], {
    encoding: "utf-8"
  });

  // "git status" process status code was not 0 -> Stop here
  if (gitStatusProcess.status !== 0) {
    cb(`Process exited with status code ${gitStatusProcess.status}.`)
    gitStatusSignale.fatal(new Error(`Process exited with status code ${gitStatusProcess.status}.`));
    process.exit(1);
  }

  gitStatusSignale.success("Checking files successfull.");
  return gitStatusProcess;
}


/**
 * Check commited files by stdout input
 * 
 * @param {string} gitStatusStdOut Stdout of "git status" process
 * @returns {boolean} Indicates whether commited changes inside "project/build" were found
 */
function checkCommitedFiles (gitStatusStdOut) {
  let afterCommitedChangesLine = false;

  // Split "git status" process output into array of single lines
  const outputLines = gitStatusStdOut.split(/\r|\n|\r\n/);

  // Iterate through "git status" output lines
  for (const line of outputLines) {
    // Emptyl ine
    if (line.length === 0) {
      // Break loop on first empty line after "commited changes" headline
      if (afterCommitedChangesLine) {
        break;
      } else { // Just continue overwhise
        continue;
      }
    }

    // Line is "commited changes" headline
    if (line === "Changes to be committed:") {
      afterCommitedChangesLine = true;
    }

    // Match changed files inside "project/build" directory
    const REGEXP_TS_SRC_FILE = new RegExp(/ project\/build\/.*?$/);
    if (line.match(REGEXP_TS_SRC_FILE)) {
      // Break lines iteration loop on first match
      return true;
    }
  }

  return false;
}


/**
 * Spawn "yarn production" process and log about it
 */
function yarnProduction () {
  // Initiate Signale for "yarn production" process
  const yarnProductionSignale = new Signale({
    scope: 'yarn production'
  });
  yarnProductionSignale.pending("Building in production mode...");

  // Spawn "yarn production" process
  const yarnProductionProcess = spawn.sync("yarn", ["production"], {
    cwd: 'project',
    stdio: 'inherit'
  });

  // "yarn production" process status code was not 0 -> Stop here
  if (yarnProductionProcess.status !== 0) {
    yarnProductionSignale.fatal(new Error(`Process exited with status code ${gitAddProcess.status}`));
    process.exit(1);
  }

  // Update Signale for "yarn production" process
  yarnProductionSignale.success("Build successfull.");
}


/**
 * Spawn "git add" process and log about it
 */
function gitAddBuild () {
  // Initiate Signale for "git add" process
  const gitAddSignale = new Signale({
    scope: 'git add build'
  });
  gitAddSignale.pending("Adding files to commit");

  // Spawn "git add" process
  const gitAddProcess = spawn.sync("git", ["add", "build"], {
    cwd: 'project',
    stdio: 'inherit'
  });

  // "git add" process status code was not 0 -> Stop here
  if (gitAddProcess.status !== 0) {
    gitAddSignale.fatal(new Error(`Process exited with status code ${gitAddProcess.status}`));
    process.exit(1);
  }

  // Update Signale for "git add" process
  gitAddSignale.success("Added files successfully.");
}


/**
 * Main function
 */
function main () {
  // Get stdout for "git status"
  const gitStatusStdOut = gitStatus().stdout;
  // Check whether build directory changes were commited
  const buildChangesCommited = checkCommitedFiles(gitStatusStdOut)
  
  // Source has not changed -> Stop here
  if (!buildChangesCommited) {
    console.log(`No commited changes for ${chalk.yellow("project/build")} were found.`);
  }
  
  console.log();
  console.log(chalk.red(`Commited changes for ${chalk.yellow("project/build")} were found.`));
  console.log();

  // Wait half a second, then continue
  setTimeout(() => {
    // Build in production mode
    yarnProduction();

    // Add changed build files to commit
    gitAddBuild();
  }, 500);
}


/**
 * Invoke main function
 */
if (require.main === module) {
  main();
}