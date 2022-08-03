const fs = require("fs");

const pathToFile = process.argv[2];
const pathSegments = pathToFile.split("/");
const fileName = pathSegments[pathSegments.length - 1].split(".")[0];

fs.readFile(pathToFile, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const asmLines = data.split("\r\n");

  let hackData = "";
  asmLines.forEach((l) => (hackData += `${l}\n`));

  fs.writeFile(`./${fileName}.hack`, hackData, (err) => {
    if (err) {
      console.error(err);
    }
  });
});
