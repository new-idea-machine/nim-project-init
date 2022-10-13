#! /etc/bin/env node
const { execSync } = require("child_process");
execSync(
  `npm install --save-dev eslint \
eslint-config-airbnb eslint-config-prettier \
eslint-plugin-import eslint-plugin-jsx-a11y \
eslint-plugin-react eslint-plugin-react-hooks`,
  { stdio: "inherit" }
);
// copy .eslintrc.js and prettier to project root
const fs = require("fs");
const path = require("path");
console.log("copying .eslintrc.js and prettier to project root");
copyFile(
  path.join(__dirname, "./.eslintrc.json"),
  path.join(process.cwd(), ".eslintrc.json")
);
copyFile(
  path.join(__dirname, ".prettierrc"),
  path.join(process.cwd(), ".prettierrc")
);
function copyFile(source, target) {
  let targetFile = target;

  // if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}
