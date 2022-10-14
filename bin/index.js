#! /usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");
const { copyFile, generateReadMe } = require("./functions");
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
  }
  addLintScript(projectName);

  return projectName;
};

const runInit = async () => {
  console.log("Welcome to the NIM project setup!");
  console.log(
    `If you are creating a new project, 
this tool will create the project folder for you. 
You do not need to create the folder yourself.
If you are just adding prettier and linting to an existing project,
you can just run this tool in the project folder.`
  );

  const installPackages = [...mainPackages];
  let projectName;
  const isExistingProject = await new Promise((resolve, reject) => {
    rl.question("Is this an existing project? (y/n) ", (answer) => {
      if (answer === "y") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  const isReact = await new Promise((resolve, reject) => {
    rl.question("Is React? (Y/n): ", (answer) => {
      if (answer === "y" || answer === "Y") {
        installPackages.push(...reactNpmPackages);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

  const baseCss = await new Promise((resolve, reject) => {
    rl.question("Base CSS? (y/N): ", (answer) => {
      resolve(answer);
    });
  });
  console.log("installing dependencies");
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

  if (baseCss === "y") {
    await copyCss(projectName);
  }
  console.log("Done!");
  process.exit(0);
};

const copyGitIgnore = (projectName) => {
  const gitIgnorePath = path.join(__dirname, "/.gitignore");
  const targetPath = path.join(process.cwd(), projectName, ".gitignore");
  copyFile(gitIgnorePath, targetPath);
};
const copyConfigFiles = async (projectName, isReact) => {
  console.log("Copying .eslintrc.js and prettier to project root");
  let destinationPath = projectName
    ? path.join(process.cwd(), projectName)
    : process.cwd();
  let sourcePath = isReact
    ? path.join(__dirname, "eslintrc", "react")
    : path.join(__dirname, "eslintrc", "other");
  console.log("source path", sourcePath);
  console.log("destination path", destinationPath);
  copyFile(
    path.join(sourcePath, "./.eslintrc.json"),
    path.join(destinationPath, ".eslintrc.json")
  );
  copyFile(
    path.join(__dirname, ".prettierrc"),
    path.join(destinationPath, ".prettierrc")
  );
};
const copyCss = async (projectName) => {
  console.log("Copying base css");
  let cssPath = await new Promise((resolve) => {
    rl.question("CSS path: (default src/)", (answer) => {
      resolve(answer);
    });
  });

  cssPath = cssPath === "" ? "src/" : cssPath;
  let filePath = projectName
    ? path.join(process.cwd(), projectName, cssPath)
    : path.join(process.cwd(), cssPath);
  console.log("Installing base css...");
  // check if cssPath exists
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  copyFile(path.join(__dirname, "./base.css"), filePath);
};
const addLintScript = (projectName) => {
  let filePath = projectName
    ? path.join(process.cwd(), projectName, "package.json")
    : path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  packageJson.scripts.lint = "eslint . --ext .js,.jsx,.ts,.tsx --fix";
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
};
runInit();
