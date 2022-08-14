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
const symbolMap = createSymbolMap();

parse(pathToFile);

function parse(filePath) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const asmLines = data.split("\r\n");

    let romCount = 0;
    // First pass
    console.log("Starting first pass");
    asmLines.forEach((input) => {
      if (isCommand(input)) {
        const line = sanitize(input);
        const commandType = parseCommandType(line);

        if (commandType === lCommand) {
          const symbol = parseSymbol(line);
          const value = createBinaryString(romCount);
          console.log(`Adding pseudocommand: (${symbol},${value})`);
          symbolMap.set(symbol, value);
        } else {
          romCount++;
        }
      }
    });

    let ramCount = 16;
    let hackData = [];
    asmLines.forEach((input) => {
      if (isCommand(input)) {
        const line = sanitize(input);
        let parsed = {};
        parsed.commandType = parseCommandType(line);

        if (parsed.commandType === lCommand) {
          return;
        }

        if (parsed.commandType === aCommand) {
          const symbol = parseSymbol(line);

          if (!isNaN(symbol)) {
            parsed.symbol = createBinaryString(Number(symbol));
          } else {
            if (symbolMap.has(symbol)) {
              parsed.symbol = symbolMap.get(symbol);
            } else {
              symbolValue = createBinaryString(ramCount);
              symbolMap.set(symbol, symbolValue);
              parsed.symbol = symbolValue;
              ramCount++;
            }
          }
        } else if (parsed.commandType === cCommand) {
          if (line.includes("=")) {
            const parts = line.split("=");
            parsed.dest = parts[0];
            parsed.comp = parts[1];
          } else if (line.includes(";")) {
            const parts = line.split(";");
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
            ? x.symbol
            : `111${x.aCode}${x.compCode}${x.destCode}${x.jumpCode}`
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

function createSymbolMap() {
  const symbolMap = new Map();

  symbolMap.set("SP", createBinaryString(0));
  symbolMap.set("LCL", createBinaryString(1));
  symbolMap.set("ARG", createBinaryString(2));
  symbolMap.set("THIS", createBinaryString(3));
  symbolMap.set("THAT", createBinaryString(4));
  symbolMap.set("R0", createBinaryString(0));
  symbolMap.set("R1", createBinaryString(1));
  symbolMap.set("R2", createBinaryString(2));
  symbolMap.set("R3", createBinaryString(3));
  symbolMap.set("R4", createBinaryString(4));
  symbolMap.set("R5", createBinaryString(5));
  symbolMap.set("R6", createBinaryString(6));
  symbolMap.set("R7", createBinaryString(7));
  symbolMap.set("R8", createBinaryString(8));
  symbolMap.set("R9", createBinaryString(9));
  symbolMap.set("R10", createBinaryString(10));
  symbolMap.set("R11", createBinaryString(11));
  symbolMap.set("R12", createBinaryString(12));
  symbolMap.set("R13", createBinaryString(13));
  symbolMap.set("R14", createBinaryString(14));
  symbolMap.set("R15", createBinaryString(15));
  symbolMap.set("SCREEN", createBinaryString(16384));
  symbolMap.set("KBD", createBinaryString(24576));

  return symbolMap;
}
