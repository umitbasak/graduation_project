const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");
const xlsx = require("xlsx");

// Directory containing Solidity files
const directory = "./morpho/morpho-v1-main/src";

let xlsxData = [
  [
    "File Name",
    "Contract Name",
    "Internal Imports",
    "External Imports",
    "Functions",
    "State Variables",
  ],
];

function countStats(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach((file) =>
      countStats(path.join(filePath, file))
    );
  } else if (path.extname(filePath) === ".sol") {
    const source = fs.readFileSync(filePath, "utf8");
    const ast = parser.parse(source, { loc: true });
    let contractName;
    let numInternalImports = 0;
    let numExternalImports = 0;
    let numFunctions = 0;
    let numStateVariables = 0;
    ast.children.forEach((node) => {
      if (node.type === "ContractDefinition") {
        contractName = node.name;

        node.subNodes.forEach((subNode) => {
          //   console.log(subNode.type);
          if (subNode.type === "FunctionDefinition") {
            numFunctions++;
          } else if (subNode.type === "StateVariableDeclaration") {
            numStateVariables += subNode.variables.length;
          }
        });
        xlsxData.push([
          filePath,
          contractName,
          numInternalImports,
          numExternalImports,
          numFunctions,
          numStateVariables,
        ]);
      }
      //  else if (node.type === "ImportDirective") {
      //   const importedFile = node.path;
      //   if (importedFile.startsWith("./") || importedFile.startsWith("../")) {
      //     numInternalImports++;
      //   } else {
      //     numExternalImports++;
      //   }
      // }
    });
  }
}
countStats(directory);

// console.log(xlsxData);

let workbook = xlsx.utils.book_new();
let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
xlsx.utils.book_append_sheet(workbook, sheet, "Contracts");
xlsx.writeFile(workbook, "contract_stats.xlsx");
