const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");
const xlsx = require("xlsx");

const directory = "./morpho/morpho-v1-main/src";

let xlsxData = [
    [
        "File Name",
        "Contract Name",
        "Internal Imports",
        "External Imports",
        "Functions",
        "State Variables",
        "Number of lines",
        "Number of structs",
        "Number of using-for",
        "Number of custom error definitions",
        "Number of events",
        "Number of inherited classes",
        "Number of modifiers",
        "Number of mappings",
        "Number of arrays",
        "Number of enums",
        "Number of public functions",
        "Number of private functions",
        "Number of internal functions",
        "Number of external functions",
        "Number of constant state variables",
        "Number of libraries",
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

        ast.children.forEach((node) => {
            if (node.type === "ContractDefinition") {

                let contractName;
                let numInternalImports = 0;
                let numExternalImports = 0;
                let numFunctions = 0;
                let numStateVariables = 0;
                let numLines = 0;
                let numStructs = 0;
                let numUsingFor = 0;
                let numCustomErrors = 0;
                let numEventDefinitions = 0;
                let numInheritance = 0;
                let numModifiers = 0;
                let numMappings = 0;
                let numArrays = 0;
                let numEnums = 0;
                let numPublicFunctions = 0;
                let numPrivateFunctions = 0;
                let numInternalFunctions = 0;
                let numExternalFunctions = 0;
                let numConstantStateVariables = 0;
                let numLibraries = 0;


                contractName = node.name;

                node.baseContracts.forEach((baseContract) => {
                    if (baseContract.type === "InheritanceSpecifier") {
                        numInheritance++;
                    }
                });

                node.subNodes.forEach((subNode) => {
                    if (subNode.type === "FunctionDefinition") {
                        numFunctions++;
                        switch (subNode.visibility) {
                            case "public":
                                numPublicFunctions++;
                                break;
                            case "private":
                                numPrivateFunctions++;
                                break;
                            case "internal":
                                numInternalFunctions++;
                                break;
                            case "external":
                                numExternalFunctions++;
                                break;
                        }
                    } else if (subNode.type === "StateVariableDeclaration") {
                        numStateVariables += subNode.variables.length;
                        subNode.variables.forEach((variable) => {
                            if (variable.isImmutable) {
                                numConstantStateVariables++;
                            }
                            if (variable.typeName.type === "Mapping") {
                                numMappings++;
                            } else if (variable.typeName.type === "ArrayTypeName") {
                                numArrays++;
                            }
                        });
                    } else if (subNode.type === "StructDefinition") {
                        numStructs++;
                    } else if (subNode.type === "UsingForDeclaration") {
                        numUsingFor++;
                    } else if (subNode.type === "CustomErrorDefinition") {
                        numCustomErrors++;
                    } else if (subNode.type === "EventDefinition") {
                        numEventDefinitions++;
                    } else if (subNode.type === "ModifierDefinition") {
                        numModifiers++;
                    } else if (subNode.type === "EnumDefinition") {
                        numEnums++;
                    }
                });


                numLines = node.loc.end.line - node.loc.start.line + 1;

                xlsxData.push([
                    filePath,
                    contractName,
                    numInternalImports,
                    numExternalImports,
                    numFunctions,
                    numStateVariables,
                    numLines,
                    numStructs,
                    numUsingFor,
                    numCustomErrors,
                    numEventDefinitions,
                    numInheritance,
                    numModifiers,
                    numMappings,
                    numArrays,
                    numEnums,
                    numPublicFunctions,
                    numPrivateFunctions,
                    numInternalFunctions,
                    numExternalFunctions,
                    numConstantStateVariables,
                    numLibraries,
                ]);
            } else if (node.type === "ImportDirective") {
                const importedFile = node.path;
                if (xlsxData.length > 1) {
                    if (importedFile.startsWith("./") || importedFile.startsWith("../")) {
                        xlsxData[xlsxData.length - 1][2]++; // Increment internal imports
                    } else {
                        xlsxData[xlsxData.length - 1][3]++; // Increment external imports
                    }
                }
            }
        });
    }
}
countStats(directory);

let workbook = xlsx.utils.book_new();
let sheet = xlsx.utils.aoa_to_sheet(xlsxData);
xlsx.utils.book_append_sheet(workbook, sheet, "Contracts");
xlsx.writeFile(workbook, "./sheets/xlsxContractsUpdated.xlsx");
