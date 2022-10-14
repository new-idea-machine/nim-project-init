#! /usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");
const { copyFile } = require("./functions");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const mainPackages = [
  "eslint",
  "eslint-config-airbnb",
  "eslint-config-prettier",
  "eslint-plugin-import"
];

const reactNpmPackages = [
  "eslint-plugin-react",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-react-hooks"
];

const runInit = async () => {
  const installPackages = [...mainPackages];
  const projectName = await new Promise((resolve) => {
    rl.question("Project name: ", (answer) => {
      resolve(answer);
    });
  });
  const isReact = await new Promise((resolve, reject) => {
    rl.question("Is React? (Y/n): ", (answer) => {
      resolve(answer);
    });
  });
  const baseCss = await new Promise((resolve, reject) => {
    rl.question("Base CSS? (y/N): ", (answer) => {
      resolve(answer);
    });
  });
  if (isReact === "y") {
    console.log("Running npx create-react-app...");
    execSync(`npx create-react-app ${projectName}`);
    installPackages.push(...reactNpmPackages);
  } else {
    console.log("initializing npm package...");
    execSync(`mkdir ${projectName}`);
    execSync(`cd ${projectName} && npm init -y`);
    execSync(`cd ${projectName} && git init`);
  }
  console.log("installing dependencies");

  execSync(`cd ${projectName} && npm i -D ${installPackages.join(" ")}`);

  // copy .eslintrc.js and prettier to project root
  console.log("copying .eslintrc.js and prettier to project root");
  copyFile(
    path.join(__dirname, "./.eslintrc.json"),
    path.join(process.cwd(), projectName, ".eslintrc.json")
  );
  copyFile(
    path.join(__dirname, ".prettierrc"),
    path.join(process.cwd(), projectName, ".prettierrc")
  );

  if (baseCss === "y") {
    let cssPath = await new Promise((resolve) => {
      rl.question("CSS path: (default src/)", (answer) => {
        resolve(answer);
      });
    });
    cssPath = cssPath === "" ? "src/" : cssPath;
    console.log("Installing base css...");
    // check if cssPath exists
    if (!fs.existsSync(path.join(process.cwd(), projectName, cssPath))) {
      fs.mkdirSync(path.join(process.cwd(), projectName, cssPath));
    }
    copyFile(
      path.join(__dirname, "./base.css"),
      path.join(process.cwd(), projectName, cssPath)
    );
  }
  console.log("Generating README.md");
  generateReadMe(projectName);
  console.log("Done!");
  process.exit(0);
};

runInit();
