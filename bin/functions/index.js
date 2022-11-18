const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

const generateReadMe = (projectName) => {
  const contents = fs.readFileSync(
    path.join(__dirname, "../README_TEMPLATE.md")
  );
  const newContents = contents
    .toString()
    .replace(/{projectName}/g, projectName);
  fs.writeFileSync(
    path.join(process.cwd(), projectName, "README.md"),
    newContents
  );
};

const addLintScript = (projectName) => {
  let filePath = projectName
    ? path.join(process.cwd(), projectName, "package.json")
    : path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  packageJson.scripts.lint = "eslint . --ext .js,.jsx,.ts,.tsx --fix";
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
};
const addPrettierScript = (projectName) => {
  let filePath = projectName
    ? path.join(process.cwd(), projectName, "package.json")
    : path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  packageJson.scripts.pretty = "prettier --write .";
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
};
const setTypeModule = (projectName) => {
  let filePath = projectName
    ? path.join(process.cwd(), projectName, "package.json")
    : path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  packageJson.type = "module";
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
};

const copyGitIgnore = (projectName) => {
  const gitIgnorePath = path.join(__dirname, "../files/.gitignore");
  const targetPath = path.join(process.cwd(), projectName, ".gitignore");
  copyFile(gitIgnorePath, targetPath);
};
const copyConfigFiles = async (projectName, isReact) => {
  console.log("Copying .eslintrc.js and prettier to project root");
  let destinationPath = projectName
    ? path.join(process.cwd(), projectName)
    : process.cwd();
  let sourcePath = isReact
    ? path.join(__dirname, "../eslintrc", "react")
    : path.join(__dirname, "../eslintrc", "other");
  console.log("source path", sourcePath);
  console.log("destination path", destinationPath);
  copyFile(
    path.join(sourcePath, ".eslintrc.json"),
    path.join(destinationPath, ".eslintrc.json")
  );
  copyFile(
    path.join(__dirname, "../files/.prettierrc"),
    path.join(destinationPath, ".prettierrc")
  );
};
const copyCss = async (projectName, cssPath) => {
  console.log("Copying base css");

  cssPath = cssPath === "" ? "src/" : cssPath;
  let filePath = projectName
    ? path.join(process.cwd(), projectName, cssPath)
    : path.join(process.cwd(), cssPath);
  console.log("Installing base css...");
  // check if cssPath exists
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  copyFile(path.join(__dirname, "../files/base.css"), filePath);
};

const cleanUpReactFiles = (projectName) => {
  console.log("Cleaning up react files");

  // remove files that are not needed
  let filePath = path.join(process.cwd(), projectName, "src");

  fs.unlinkSync(path.join(filePath, "App.css"));
  fs.unlinkSync(path.join(filePath, "App.test.js"));
  fs.unlinkSync(path.join(filePath, "index.css"));
  fs.unlinkSync(path.join(filePath, "logo.svg"));
  fs.unlinkSync(path.join(filePath, "reportWebVitals.js"));
  fs.unlinkSync(path.join(filePath, "setupTests.js"));

  // overwrite App.js with const App = () => <div></div>;export default App;
  const newAppContents = `import React from 'react';\nconst App=()=><div>${projectName}</div>;\n\nexport default App;`;
  fs.writeFileSync(path.join(filePath, "App.js"), newAppContents);

  // overwrite index.js
  const newIndexContents =
    'import React from "react";import ReactDOM from "react-dom/client";import App from "./App";\nconst root=ReactDOM.createRoot(document.getElementById("root"));root.render(<React.StrictMode><App/></React.StrictMode>);';
  fs.writeFileSync(path.join(filePath, "index.js"), newIndexContents);
};

module.exports = {
  generateReadMe,
  copyFile,
  addLintScript,
  addPrettierScript,
  setTypeModule,
  copyGitIgnore,
  copyConfigFiles,
  copyCss,
  cleanUpReactFiles,
};
