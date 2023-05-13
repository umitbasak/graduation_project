const { exportXlsxFunctionData } = require("./xlsxFunctions");
const { exportXlsxFilesData } = require("./xlsxFiles");
const { exportXlsxContractsData } = require("./xlsxContracts");
const { exportXlsxCouplingsData } = require("./xlsxCouplings");
const xlsx = require("xlsx");

function exportToXlsx(fileName, data) {
  let workbook = xlsx.utils.book_new();
  let sheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, "Functions");
  xlsx.writeFile(workbook, "./sheets/" + fileName + ".xlsx");
  return data;
}

function findComplexity(contractName, avgComplexities) {
  if (contractName === "Contract Name") {
    return "Average Function Complexity";
  }
  for (i = 0; i < avgComplexities.length; i++) {
    if (contractName === avgComplexities[i][0]) {
      return avgComplexities[i][1];
    }
  }
  return 0;
}

const functionMetrics = exportXlsxFunctionData();
// console.log(functionMetrics)

const averageFunctionComplexityOnContracts = [
  ["Contract Name", "Average Function Complexity"],
];

let contractComplexities = {};

functionMetrics.forEach((row) => {
  let contractName = row[1];
  let functionComplexity = row[row.length - 1];

  if (contractComplexities[contractName]) {
    contractComplexities[contractName].sum += functionComplexity;
    contractComplexities[contractName].count += 1;
  } else {
    contractComplexities[contractName] = { sum: functionComplexity, count: 1 };
  }
});

let avgComplexities = Object.keys(contractComplexities).map((contractName) => {
  let avgComplexity =
    contractComplexities[contractName].sum /
    contractComplexities[contractName].count;
  return [contractName, avgComplexity];
});

// console.log(avgComplexities);

const couplingMetrics = exportXlsxCouplingsData();
// console.log(couplingMetrics);

let contractsMetrics = exportXlsxContractsData();
// console.log(contractsMetrics);

contractsMetrics = contractsMetrics.map((row, i) => {
  return [...row, couplingMetrics[i][1], couplingMetrics[i][2]];
});

contractsMetrics = contractsMetrics.map((row, i) => {
  // console.log(findComplexity(row[1], avgComplexities))
  return [...row, findComplexity(row[1], avgComplexities)];
});

// console.log(contractsMetrics);

// console.log(contractsMetrics);

// normalazing the contract metrics and finding out contract complexity
function normalize(values) {
  const maxValue = Math.max(...values);
  if (maxValue == 0) return values;
  return values.map((value) => value / maxValue);
}

function calculateComplexityScores() {
  contractsMetrics[0].push("Contract Complexity Score");
  const metricsIndices = {
    numInternalImports: 2,
    numExternalImports: 3,
    numFunctions: 4,
    numStateVariables: 5,
    numLines: 6,
    numStructs: 7,
    numUsingFor: 8,
    numCustomErrorDefinition: 9,
    numEvents: 10,
    numInheritedClasses: 11,
    numModifiers: 12,
    numMappings: 13,
    numArrays: 14,
    numEnums: 15,
    numPublicFunctions: 16,
    numPrivateFunctions: 17,
    numInternalFunctions: 18,
    numExternalFunctions: 19,
    numDefaultFunctions: 20,
    numConstantStateVariables: 21,
    cyclomaticComplexity: 22,
    numFallbackFunctions: 23,
    numReceiveFunctions: 24,
    numFunctionCalls: 25,
    numDependencies: 26,
    numDependentContracts: 27,
    averageFunctionComplexity: 28,
  };

  const weights = {
    numInternalImports: 0.083,
    numExternalImports: 0.083,
    numFunctions: 0.083,
    numStateVariables: 0.083,
    numLines: 0.15,
    numStructs: 0.083,
    numUsingFor: 0.083,
    numCustomErrorDefinition: 0.083,
    numEvents: 0.083,
    numInheritedClasses: 0.083,
    numModifiers: 0.083,
    numMappings: 0.083,
    numArrays: 0.083,
    numEnums: 0.083,
    numPublicFunctions: 0.083,
    numPrivateFunctions: 0.083,
    numInternalFunctions: 0.083,
    numExternalFunctions: 0.083,
    numDefaultFunctions: 0.083,
    numConstantStateVariables: 0.083,
    cyclomaticComplexity: 0.25,
    numFallbackFunctions: 0.083,
    numReceiveFunctions: 0.083,
    numFunctionCalls: 0.083,
    numDependencies: 0.1,
    numDependentContracts: 0.083,
    averageFunctionComplexity: 0.25,
  };

  const normalizedMetrics = {};

  for (const metric in metricsIndices) {
    const values = contractsMetrics
      .slice(1)
      .map((row) => row[metricsIndices[metric]]);
    normalizedMetrics[metric] = normalize(values);
  }

  for (let i = 1; i < contractsMetrics.length; i++) {
    let complexityScore = 0;

    for (const metric in normalizedMetrics) {
      complexityScore += normalizedMetrics[metric][i - 1] * weights[metric];
    }

    contractsMetrics[i].push(complexityScore);
  }
}

calculateComplexityScores();

function addTotalMetricsToLastRow(contractsMetrics) {
  let sums = Array(contractsMetrics[0].length).fill(0);
  sums[0] = contractsMetrics.length - 1;
  sums[1] = contractsMetrics.length - 1;

  for (rowIndex = 1; rowIndex < contractsMetrics.length; rowIndex++) {
    let row = contractsMetrics[rowIndex];
    for (let i = 2; i < row.length; i++) {
      sums[i] += row[i];
    }
  }
  contractsMetrics.push(sums);
  return contractsMetrics;
}
contractsMetrics = addTotalMetricsToLastRow(contractsMetrics);
console.log(contractsMetrics);
exportToXlsx("finalContractMetrics", contractsMetrics);

///////////////////////

const filesMetrics = exportXlsxFilesData();
