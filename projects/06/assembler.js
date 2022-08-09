const fs = require("fs");

const pathToFile = process.argv[2];
const pathSegments = pathToFile.split("/");
const fileName = pathSegments[pathSegments.length - 1].split(".")[0];

const lCommand = "L_COMMAND";
const aCommand = "A_COMMAND";
const cCommand = "C_COMMAND";

parse(pathToFile);

function parse(filePath) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const asmLines = data.split("\r\n");

    let hackData = [];
    asmLines.forEach((l) => {
      if (isCommand(l)) {
        let parsed = {};
        parsed.commandType = parseCommandType(l);

        if (
          parsed.commandType === aCommand ||
          parsed.commandType === lCommand
        ) {
          parsed.symbol = parseSymbol(l);
        }

        hackData.push(parsed);
      }
    });

    fs.writeFile(
      `./${fileName}.hack`,
      hackData.map((x) => x.symbol).join("\n"),
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
}

function isCommand(inputLine) {
  // Ignore empty lines and comments
  return inputLine && !inputLine.startsWith("//");
}

function parseCommandType(inputLine) {
  if (inputLine.startsWith("(")) {
    return lCommand;
  } else if (inputLine.startsWith("@")) {
    return aCommand;
  } else {
    return cCommand;
  }
}

function parseSymbol(inputLine) {
  const regex = /.*[()@]/gm;
  return inputLine.replace(regex, "");
}
