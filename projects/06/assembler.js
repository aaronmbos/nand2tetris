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
    asmLines.forEach((input) => {
      if (isCommand(input)) {
        const l = sanitize(input);
        let parsed = {};
        parsed.commandType = parseCommandType(l);

        if (
          parsed.commandType === aCommand ||
          parsed.commandType === lCommand
        ) {
          parsed.symbol = parseSymbol(l);
        } else {
          if (l.includes("=")) {
            const parts = l.split("=");
            parsed.dest = parts[0];
            parsed.comp = parts[1];
          } else if (l.includes(";")) {
            const parts = l.split(";");
            parsed.comp = parts[0];
            parsed.jump = parts[1];
          }
        }

        hackData.push(parsed);
      }
    });

    fs.writeFile(
      `./${fileName}.hack`,
      hackData
        .map((x) => (x.symbol ? x.symbol : `${x.dest}/${x.comp}/${x.jump}`))
        .join("\n"),
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

function sanitize(inputLine) {
  const commentIndex = inputLine.indexOf("//");

  if (commentIndex === -1) {
    return inputLine.trim();
  }

  return inputLine.substring(0, commentIndex).trim();
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
  const regex = /[@()]/g;
  return inputLine.replace(regex, "");
}

function createDestMap() {
  const destMap = new Map();

  destMap.set("M", "001");
  destMap.set("D", "010");
  destMap.set("MD", "011");
  destMap.set("A", "100");
  destMap.set("AM", "101");
  destMap.set("AD", "110");
  destMap.set("AMD", "111");

  return destMap;
}

function createJumpMap() {
  const jumpMap = new Map();

    jumpMap.set("JGT", "001");
    jumpMap.set("JEQ", "010");
    jumpMap.set("JGE", "011");
    jumpMap.set("JLT", "100");
    jumpMap.set("JNE", "101");
    jumpMap.set("JLE", "110");
    jumpMap.set("JMP", "111");

  return jumpMap;
}
