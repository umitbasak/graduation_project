const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");
const xlsx = require("xlsx");

const directory = "./morpho/morpho-v1-main/src";

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
    "Cyclomatic Complexity"
];

let xlsxData = [headerRow];

function processDirectory(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
        fs.readdirSync(filePath).forEach((file) =>
            processDirectory(path.join(filePath, file))
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
            if (n.expression.name === 'require' || n.expression.name === 'assert' || n.expression.name === 'revert') {
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

    let functionLines = source.split('\n').slice(node.loc.start.line - 1, node.loc.end.line);
    let numComments = functionLines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().endsWith('*/')).length;

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

processDirectory(directory);

let workbook = xlsx.utils.book_new();
let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
xlsx.utils.book_append_sheet(workbook, sheet, "Functions");
xlsx.writeFile(workbook, "./sheets/xlsxFunctions.xlsx");
