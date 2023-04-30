const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");
const xlsx = require("xlsx");

// Directory containing Solidity files
const directory = "./morpho/morpho-v1-main/src";

let xlsxData = [
  [
    "File Name",
    "Number of Lines",
    "Number of Contracts",
    "Internal Imports",
    "External Imports",
  ],
];

let totalNumContracts = 0;
let totalNumLines = 0;
let totalNumInternalImports = 0;
let totalNumExternalImports = 0;

function processDirectoryForFiles(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach((file) =>
      processDirectoryForFiles(path.join(filePath, file))
    );
  } else if (path.extname(filePath) === ".sol") {
    const source = fs.readFileSync(filePath, "utf8");
    const ast = parser.parse(source, { loc: true });
    let numLines = source.split("\n").length;
    let numInternalImports = 0;
    let numExternalImports = 0;
    let numContracts = 0;
    ast.children.forEach((node) => {
      if (node.type === "ContractDefinition") {
        numContracts++;
      } else if (node.type === "ImportDirective") {
        const importedFile = node.path;
        if (importedFile.startsWith("./") || importedFile.startsWith("../")) {
          numInternalImports++;
        } else {
          numExternalImports++;
        }
      }
    });
    totalNumContracts += numContracts;
    totalNumExternalImports += numExternalImports;
    totalNumInternalImports += numInternalImports;
    totalNumLines += numLines;
    xlsxData.push([
      filePath,
      numLines,
      numContracts,
      numInternalImports,
      numExternalImports,
    ]);
  }
}
processDirectoryForFiles(directory);

// console.log(xlsxData);

xlsxData.push([
  "TOTAL",
  totalNumLines,
  totalNumContracts,
  totalNumInternalImports,
  totalNumExternalImports,
]);

function exportXlsxFilesData(){
  processDirectoryForFiles(directory);
  return xlsxData;
}

let workbook = xlsx.utils.book_new();
let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
xlsx.utils.book_append_sheet(workbook, sheet, "Contracts");
xlsx.writeFile(workbook, "./sheets/xlsxFiles.xlsx");

module.exports = { exportXlsxFilesData };

