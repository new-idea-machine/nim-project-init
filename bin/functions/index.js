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

module.exports = {
  generateReadMe,
  copyFile
};
