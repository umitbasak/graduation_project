const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");
const xlsx = require("xlsx");

// const directory = "./morpho/morpho-v1-main/src";

const headerRow = [
  "File Name",
  "Contract Name",
  "Function Name",
  "Function Visibility",
  "Function Mutability",
  "Number of lines",
  "Number of if else statements",
  "Number of loops",
  "Number of unchecked blocks",
  "Number of inline assembly blocks",
  "Number of events emitted",
  "Number of commented lines",
  "Cyclomatic Complexity",
  "Function complexity score",
];

let xlsxData = [headerRow];

function normalize(values) {
  const maxValue = Math.max(...values);
  if (maxValue == 0) return values;
  return values.map((value) => value / maxValue);
}

function calculateComplexityScores() {
  const metricsIndices = {
    numLines: 5,
    numIfElseStatements: 6,
    numLoops: 7,
    numUncheckedBlocks: 8,
    numInlineAssemblyBlocks: 9,
    numEventsEmitted: 10,
    numComments: 11,
    cyclomaticComplexity: 12,
  };

  const weights = {
    numLines: 0.25,
    numIfElseStatements: 0.15,
    numLoops: 0.15,
    numUncheckedBlocks: 0.05,
    numInlineAssemblyBlocks: 0.05,
    numEventsEmitted: 0.05,
    numComments: 0.05,
    cyclomaticComplexity: 0.25,
  };

  const normalizedMetrics = {};

  for (const metric in metricsIndices) {
    const values = xlsxData.slice(1).map((row) => row[metricsIndices[metric]]);
    normalizedMetrics[metric] = normalize(values);
  }

  for (let i = 1; i < xlsxData.length; i++) {
    let complexityScore = 0;

    for (const metric in normalizedMetrics) {
      complexityScore += normalizedMetrics[metric][i - 1] * weights[metric];
    }

    xlsxData[i].push(complexityScore);
  }
}

function processDirectoryForFunctions(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach((file) =>
      processDirectoryForFunctions(path.join(filePath, file))
    );
  } else if (path.extname(filePath) === ".sol") {
    processSolidityFile(filePath);
  }
}

function processSolidityFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const ast = parser.parse(source, { loc: true });

  ast.children.forEach((node) => {
    if (node.type === "ContractDefinition") {
      processContractDefinition(node, filePath, source);
    }
  });
}

function calculateCyclomaticComplexity(node) {
  let decisionPoints = 1;

  parser.visit(node, {
    IfStatement: (n) => {
      decisionPoints++;
    },
    ForStatement: (n) => {
      decisionPoints++;
    },
    WhileStatement: (n) => {
      decisionPoints++;
    },
    DoWhileStatement: (n) => {
      decisionPoints++;
    },
    Conditional: (n) => {
      decisionPoints++;
    },
    BinaryOperation: (n) => {
      if (n.operator === "||" || n.operator === "&&") {
        decisionPoints++;
      }
    },
    SwitchStatement: (n) => {
      decisionPoints += n.cases.length - 1;
    },
    InlineAssemblyStatement: (n) => {
      decisionPoints++;
    },
    FunctionCall: (n) => {
      if (
        n.expression.name === "require" ||
        n.expression.name === "assert" ||
        n.expression.name === "revert"
      ) {
        decisionPoints++;
      }
    },
  });

  return decisionPoints;
}

function processContractDefinition(node, filePath, source) {
  let contractName = node.name;

  node.subNodes.forEach((subNode) => {
    if (subNode.type === "FunctionDefinition") {
      processFunctionDefinition(subNode, contractName, filePath, source);
    }
  });
}

function processFunctionDefinition(node, contractName, filePath, source) {
  let functionName = node.name;
  let functionVisibility = node.visibility;
  let functionType = node.stateMutability ?? "null";

  let numLines = node.loc.end.line - node.loc.start.line + 1;

  let functionLines = source
    .split("\n")
    .slice(node.loc.start.line - 1, node.loc.end.line);
  let numComments = functionLines.filter(
    (line) =>
      line.trim().startsWith("//") ||
      line.trim().startsWith("/*") ||
      line.trim().endsWith("*/")
  ).length;

  let numIfElseStatements = 0;
  let numLoops = 0;
  let numUncheckedBlocks = 0;
  let numInlineAssemblyBlocks = 0;
  let numEventsEmitted = 0;

  parser.visit(node, {
    IfStatement: (n) => {
      numIfElseStatements++;
    },
    ForStatement: (n) => {
      numLoops++;
    },
    WhileStatement: (n) => {
      numLoops++;
    },
    DoWhileStatement: (n) => {
      numLoops++;
    },
    UncheckedStatement: (n) => {
      numUncheckedBlocks++;
    },
    InlineAssemblyStatement: (n) => {
      numInlineAssemblyBlocks++;
    },
    EmitStatement: (n) => {
      numEventsEmitted++;
    },
  });

  let cyclomaticComplexity = calculateCyclomaticComplexity(node);

  xlsxData.push([
    filePath,
    contractName,
    functionName,
    functionVisibility,
    functionType,
    numLines,
    numIfElseStatements,
    numLoops,
    numUncheckedBlocks,
    numInlineAssemblyBlocks,
    numEventsEmitted,
    numComments,
    cyclomaticComplexity,
  ]);
}

// processDirectoryForFunctions(directory);

function exportXlsxFunctionData(directory) {
  processDirectoryForFunctions(directory);
  calculateComplexityScores();
  let workbook = xlsx.utils.book_new();
  let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
  xlsx.utils.book_append_sheet(workbook, sheet, "Functions");
  xlsx.writeFile(workbook, "./sheets/xlsxFunctions.xlsx");
  return xlsxData;
}

// let workbook = xlsx.utils.book_new();
// let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
// xlsx.utils.book_append_sheet(workbook, sheet, "Functions");
// xlsx.writeFile(workbook, "./sheets/xlsxFunctions.xlsx");

module.exports = { exportXlsxFunctionData };
