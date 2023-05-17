const { exportXlsxFunctionData } = require("./xlsxFunctions");
const { exportXlsxFilesData } = require("./xlsxFiles");
const { exportXlsxContractsData } = require("./xlsxContracts");
const { exportXlsxCouplingsData } = require("./xlsxCouplings");
const xlsx = require("xlsx");

// const directory = "./example_projects/morpho/morpho-v1-main/src";
const directory = "./example_projects/uniswap/v3-core-main/contracts";

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

const functionMetrics = exportXlsxFunctionData(directory);
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

const couplingMetrics = exportXlsxCouplingsData(directory);
// console.log(couplingMetrics);

let contractsMetrics = exportXlsxContractsData(directory);
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
    numInternalImports: 0.0109,
    numExternalImports: 0.0109,
    numFunctions: 0.0109,
    numStateVariables: 0.0109,
    numLines: 0.15,
    numStructs: 0.0109,
    numUsingFor: 0.0109,
    numCustomErrorDefinition: 0.0109,
    numEvents: 0.0109,
    numInheritedClasses: 0.0109,
    numModifiers: 0.0109,
    numMappings: 0.0109,
    numArrays: 0.0109,
    numEnums: 0.0109,
    numPublicFunctions: 0.0109,
    numPrivateFunctions: 0.0109,
    numInternalFunctions: 0.0109,
    numExternalFunctions: 0.0109,
    numDefaultFunctions: 0.0109,
    numConstantStateVariables: 0.0109,
    cyclomaticComplexity: 0.25,
    numFallbackFunctions: 0.0109,
    numReceiveFunctions: 0.0109,
    numFunctionCalls: 0.0109,
    numDependencies: 0.1,
    numDependentContracts: 0.0109,
    averageFunctionComplexity: 0.25,
  };

  const normalizedMetrics = {};

  for (const metric in metricsIndices) {
    const values = contractsMetrics
      .slice(1)
      .map((row) => row[metricsIndices[metric]]);
    normalizedMetrics[metric] = normalize(values);
  }

  let totalComplexityScore = 0;

  for (let i = 1; i < contractsMetrics.length; i++) {
    let complexityScore = 0;

    for (const metric in normalizedMetrics) {
      complexityScore += normalizedMetrics[metric][i - 1] * weights[metric];
      totalComplexityScore +=
        normalizedMetrics[metric][i - 1] * weights[metric];
    }

    contractsMetrics[i].push(complexityScore);
  }

  // return the average contract complexity
  let averageContractComplexity =
    totalComplexityScore / contractsMetrics.length;
  // console.log(averageContractComplexity);
  return averageContractComplexity;
}

const averageContractComplexity = calculateComplexityScores();
const weightedContractComplexity =
  averageContractComplexity * contractsMetrics.length;
// console.log(weightedContractComplexity);

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
// console.log(contractsMetrics);

exportToXlsx("finalContractMetrics", contractsMetrics);

///////////////////////

// const filesMetrics = exportXlsxFilesData(directory);

const KLOC = contractsMetrics.at(-1)[6] / 1000;
// console.log("KLOC: " + KLOC);
// console.log("Weighted Contract Complexity: " + weightedContractComplexity);

const KLOCWeight = 0.5;
const weightedContractComplexityWeight = 0.5;

const a = 3.0;
const b = 1.12;
const c = 2.5;
const d = 0.35;

const effort =
  a *
  (weightedContractComplexity * weightedContractComplexityWeight +
    KLOC * KLOCWeight) **
    b;
console.log(
  "The estimated COCOMO effort is: " + effort.toFixed(2) + " person-month"
);
const time = c * effort ** d;
console.log(
  "The estimated time of development is: " + time.toFixed(2) + " months."
);
const personRequired = effort / time;
console.log("The number of person required is " + Math.round(personRequired));

function estimateCodeQualityBasedOnFibonacci(complexity) {
  if (0 <= complexity && complexity < 1 / 13) {
    return "AA";
  } else if (1 / 13 <= complexity && complexity < 2 / 13) {
    return "BA";
  } else if (2 / 13 <= complexity && complexity < 3 / 13) {
    return "BB";
  } else if (3 / 13 <= complexity && complexity < 5 / 13) {
    return "CB";
  } else if (5 / 13 <= complexity && complexity < 8 / 13) {
    return "CC";
  } else if (8 / 13 <= complexity && complexity < 13 / 13) {
    return "DC";
  } else if (13 / 13 <= complexity && complexity <= 1) {
    return "DD";
  } else {
    return "Invalid complexity";
  }
}

console.log(
  "Estimated Code Quality Grade: " +
    estimateCodeQualityBasedOnFibonacci(averageContractComplexity)
);
