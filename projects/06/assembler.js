const fs = require("fs");

const pathToFile = process.argv[2];
const pathSegments = pathToFile.split("/");
const fileName = pathSegments[pathSegments.length - 1].split(".")[0];

const lCommand = "L_COMMAND";
const aCommand = "A_COMMAND";
const cCommand = "C_COMMAND";
const destMap = createDestMap();
const compMap = createCompMap();
const jumpMap = createJumpMap();

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

          parsed.destCode = destMap.get(parsed.dest) ?? "000";
          parsed.jumpCode = jumpMap.get(parsed.jump) ?? "000";
          parsed.compCode = compMap.get(parsed.comp);
          parsed.aCode = parsed.comp.includes("M") ? 1 : 0;
        }

        hackData.push(parsed);
      }
    });

    fs.writeFile(
      `./${fileName}.hack`,
      hackData
        .map((x) =>
          x.symbol
            ? createBinaryString(Number(x.symbol))
            : `${x.destCode}/${x.compCode}/${x.jumpCode}`
        )
        .join("\n"),
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
}

// https://stackoverflow.com/a/24153275/8548471
// Need to slice first 16 chars because Hack is 16-bit
function createBinaryString(nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (
    var nFlag = 0, nShifted = nMask, sMask = "";
    nFlag < 32;
    nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
  );
  return sMask.slice(16);
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

function createCompMap() {
  const compMap = new Map();

  compMap.set("0", "101010");
  compMap.set("1", "111111");
  compMap.set("-1", "111010");
  compMap.set("D", "001100");
  compMap.set("A", "110000");
  compMap.set("!D", "001101");
  compMap.set("!A", "110001");
  compMap.set("-D", "001111");
  compMap.set("-A", "110011");
  compMap.set("D+1", "011111");
  compMap.set("A+1", "110111");
  compMap.set("D-1", "001110");
  compMap.set("A-1", "110010");
  compMap.set("D+A", "000010");
  compMap.set("D-A", "010011");
  compMap.set("A-D", "000111");
  compMap.set("D&A", "000000");
  compMap.set("D|A", "010101");
  compMap.set("M", "110000");
  compMap.set("!M", "110001");
  compMap.set("-M", "110011");
  compMap.set("M+1", "110111");
  compMap.set("M-1", "110010");
  compMap.set("D+M", "000010");
  compMap.set("D-M", "010011");
  compMap.set("M-D", "000111");
  compMap.set("D&M", "000000");
  compMap.set("D|M", "010101");

  return compMap;
}
