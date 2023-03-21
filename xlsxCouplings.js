const fs = require('fs');
const path = require('path');
const parser = require('@solidity-parser/parser');
const XLSX = require("xlsx");

const directory = './morpho/morpho-v1-main/src';



function getImports(fileContent, filePath) {
    let imports = [];
    const ast = parser.parse(fileContent, { tolerant: true });

    parser.visit(ast, {
        ImportDirective(node) {
            let importPath = node.path;

            if (importPath.startsWith('.')) {
                importPath = path.join(path.dirname(filePath), importPath);
            }

            imports.push(path.normalize(importPath));
        },
    });

    return imports;
}


function getContractNames(fileContent) {
    let contractNames = [];
    const ast = parser.parse(fileContent, { tolerant: true });

    parser.visit(ast, {
        ContractDefinition(node) {
            contractNames.push(node.name);
        },
    });

    return contractNames;
}

function analyzeFiles(filePath) {
    let fileDependencies = [];

    if (fs.statSync(filePath).isDirectory()) {
        fs.readdirSync(filePath).forEach((file) => {
            const childDependencies = analyzeFiles(path.join(filePath, file));
            fileDependencies = fileDependencies.concat(childDependencies);
        });
    } else if (path.extname(filePath) === '.sol') {
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = getImports(content, filePath);
        const contractNames = getContractNames(content);
        fileDependencies.push({ filePath, contractNames, imports });
    }

    return fileDependencies;
}

function printDependencies(fileDependencies) {
    fileDependencies.forEach(({ filePath, contractNames, imports }) => {
        console.log(`File: ${filePath}`);
        console.log(`Contracts: ${contractNames.join(', ')}`);

        console.log(`Depends on: ${imports.length} contract(s)`);
        if (imports.length > 0) {
            console.log('Imports:');
            imports.forEach((importPath) => {
                console.log(`  - ${importPath}`);
            });
        }

        const normalizedFilePath = filePath.replace(/\\/g, '/');
        const dependentFiles = fileDependencies.filter((fileDep) =>
            fileDep.imports.some((importPath) => importPath.endsWith(normalizedFilePath))
        );

        console.log(`Depended on by: ${dependentFiles.length} contract(s)`);

        if (dependentFiles.length > 0) {
            console.log('Dependent contracts:');
            dependentFiles.forEach(({ filePath: dependentFilePath, contractNames: dependentContractNames }) => {
                console.log(`  - ${dependentFilePath} (${dependentContractNames.join(', ')})`);
            });
        }

        console.log('----------');
    });
}

function saveToXLSX(fileDependencies) {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [['Contract Name', 'Dependencies', 'Dependent Contracts']];

    fileDependencies.forEach(({ filePath, contractNames, imports }) => {
        const normalizedFilePath = filePath.replace(/\\/g, '/');
        const dependentFiles = fileDependencies.filter((fileDep) =>
            fileDep.imports.some((importPath) => importPath.endsWith(normalizedFilePath))
        );

        contractNames.forEach((contractName) => {
            worksheetData.push([
                contractName,
                imports.length,
                dependentFiles.length,
            ]);
        });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');

    const outputFile = "./sheets/xlsxCouplings.xlsx";
    XLSX.writeFile(workbook, outputFile);
    console.log(`Results saved to ${outputFile}`);
}

const fileDependencies = analyzeFiles(directory);
printDependencies(fileDependencies);
saveToXLSX(fileDependencies);
