#! /usr/bin/env node
const { execSync } = require("child_process");
const readline = require("readline");
const {
  generateReadMe,
  setTypeModule,
  addLintScript,
  addPrettierScript,
  copyCss
} = require("./functions");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const mainPackages = [
  "eslint",
  "eslint-config-prettier",
  "eslint-plugin-import"
];

const nonReactNpmPackages = ["eslint-config-airbnb-base"];

const reactNpmPackages = [
  "eslint-config-airbnb",
  "eslint-plugin-react",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-react-hooks"
];
const createProject = async (isReact) => {
  const projectName = await new Promise((resolve) => {
    rl.question("Project name: ", (answer) => {
      resolve(answer);
    });
  });
  if (isReact) {
    console.log("Running npx create-react-app...");
    execSync(`npx create-react-app ${projectName}`);
  } else {
    console.log("initializing npm package...");
    execSync(`mkdir ${projectName}`);
    execSync(`cd ${projectName} && npm init -y`);
    execSync(`cd ${projectName} && git init`);
    execSync(`cd ${projectName} && touch index.js`);
    setTypeModule(projectName);
  }
  addLintScript(projectName);
  addPrettierScript(projectName);

  return projectName;
};

const runInit = async () => {
  console.log("Welcome to the NIM project setup!");
  console.log(
    `If you are creating a new project, 
this tool will create the project folder for you. 
You do not need to create the folder yourself.
If you are just adding prettier and linting to an existing project,
you can just run this tool inside the project folder.`
  );

  const installPackages = [...mainPackages];
  let projectName;
  const isExistingProject = await new Promise((resolve, reject) => {
    rl.question("Is this an existing project? (y/N) ", (answer) => {
      if (answer === "y") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  const isReact = await new Promise((resolve, reject) => {
    rl.question("Is React? (y/N): ", (answer) => {
      if (answer === "y" || answer === "Y") {
        installPackages.push(...reactNpmPackages);
        resolve(true);
      } else {
        installPackages.push(...nonReactNpmPackages);
        resolve(false);
      }
    });
  });

  console.log("installing dev dependencies");
  // copy .eslintrc.js and prettier to project root
  if (!isExistingProject) {
    projectName = await createProject(isReact);
    execSync(`cd ${projectName} && npm i -D ${installPackages.join(" ")}`);
    console.log("Generating README.md");
    generateReadMe(projectName);
    await copyConfigFiles(projectName, isReact);

    console.log("Running npm run lint...");
    execSync(`cd ${projectName} && npm run lint`);
    copyGitIgnore(projectName);
  } else {
    execSync(`npm i -D ${installPackages.join(" ")}`);
    await copyConfigFiles(projectName, isReact);

    addLintScript();
  }

  const baseCss = await new Promise((resolve, reject) => {
    rl.question("Base CSS? (y/N): ", (answer) => {
      resolve(answer);
    });
  });
  if (baseCss === "y") {
    let cssPath = await new Promise((resolve) => {
      rl.question("CSS path: (default src/)", (answer) => {
        resolve(answer);
      });
    });
    await copyCss(projectName, cssPath);
  }
  console.log("Done!");
  process.exit(0);
};

runInit();
