const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");

// Directory containing Solidity files
const directory =
  "./morpho/morpho-v1-main/src/aave-v2/EntryPositionsManager.sol";

function countStats(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach((file) =>
      countStats(path.join(filePath, file))
    );
  } else if (path.extname(filePath) === ".sol") {
    const source = fs.readFileSync(filePath, "utf8");
    const ast = parser.parse(source, { loc: true });
    ast.children.forEach((node) => {
      console.log(node);
    });
  }
}
countStats(directory);
