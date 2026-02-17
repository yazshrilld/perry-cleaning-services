const fs = require("fs");
const path = require("path");

const copyFolderSync = (source, destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
};


// Copy templates
const templatesSource = path.join(__dirname, "src/templates");
const templatesDestination = path.join(__dirname, "build/templates");
copyFolderSync(templatesSource, templatesDestination);
console.log(`Copied ${templatesSource} to ${templatesDestination}`);
