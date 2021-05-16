const expect = require("chai").expect;
const preCommitHook = require("./git-pre-commit-hook");

const GIT_STATUS_WITHOUT_BUILD_CHANGES = `
On branch development
Your branch is up to date with 'origin/development'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   test.abc

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .eslintrc.js
        modified:   project/build/css/style.css
        modified:   project/build/index.html
        modified:   project/build/js/index.js
        modified:   project/package.json
        modified:   project/src/ts/core/bit-math.ts
        modified:   project/yarn.lock
        modified:   scripts/git-pre-commit-hook.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        project/build/css/style.css.map
        project/build/js/index.js.map
        project/src/ts/core/bit.math.spec.ts
        scripts/git-pre-commit-hook.spec.js`;


const GIT_STATUS_WITH_BUILD_CHANGES = `Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   .eslintrc.js
        new file:   .mocharc.js
        modified:   package.json
        modified:   project/.eslintrc.js
        new file:   project/.mocharc.js
        modified:   project/build/js/index.js
        new file:   project/build/js/index.js.map
        new file:   test.abc

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   ../README.md
        modified:   project/build/css/style.css
        modified:   project/build/index.html
        modified:   project/src/ts/base/world.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        project/build/css/style.css.map
        project/src/ts/core/bit-math.spec.ts
        scripts/git-pre-commit-hook.spec.js`;

describe("Having commited build changes should lead to production build", () => {
  it("No build changes should equal false", () => {
    expect(preCommitHook.checkCommitedFiles(GIT_STATUS_WITHOUT_BUILD_CHANGES)).to.equal(false);
  });

  it("Build changes should equal true", () => {
    expect(preCommitHook.checkCommitedFiles(GIT_STATUS_WITH_BUILD_CHANGES)).to.equal(true);
  });
});