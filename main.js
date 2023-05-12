const { exportXlsxFunctionData } = require("./xlsxFunctions");
const { exportXlsxFilesData } = require("./xlsxFiles");
const { exportXlsxContractsData } = require("./xlsxContracts");
const { exportXlsxCouplingsData } = require("./xlsxCouplings");

function findComplexity(contractName, avgComplexities) {
    // avgComplexities.forEach(element => {
    //     if(contractName === element[0]) {
    //         // console.log(contractName, element[0], element[1]);
    //         // console.log(element[1]);
    //         return element[1];
    //     }
    // });
    if(contractName === "Contract Name") {
        return "Average Function Complexity";
    }
    for(i=0; i<avgComplexities.length; i++){
        if(contractName===avgComplexities[i][0]){
            return avgComplexities[i][1];
        }
    }
}

const functionMetrics = exportXlsxFunctionData();
// console.log(functionMetrics)

const averageFunctionComplexityOnContracts = [["Contract Name", "Average Function Complexity"]];

// Assuming contractsMetrics is an array of arrays where each sub-array corresponds to a row of the data you've given
// and the last item of each sub-array is the Function complexity score, while the second item is the Contract Name.

let contractComplexities = {};

functionMetrics.forEach(row => {
    let contractName = row[1];
    let functionComplexity = row[row.length - 1];  // assuming the complexity score is a string with a comma as decimal separator

    if (contractComplexities[contractName]) {
        contractComplexities[contractName].sum += functionComplexity;
        contractComplexities[contractName].count += 1;
    } else {
        contractComplexities[contractName] = { sum: functionComplexity, count: 1 };
    }
});

let avgComplexities = Object.keys(contractComplexities).map(contractName => {
    let avgComplexity = contractComplexities[contractName].sum / contractComplexities[contractName].count;
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
})

// contractsMetrics[0].push("Average Function Complexity");

console.log(contractsMetrics);

// console.log(contractsMetrics);

// normalazing the contract metrics and finding out contract complexity
// function normalize(values) {
//   const maxValue = Math.max(...values);
//   return values.map((value) => value / maxValue);
// }

// function calculateComplexityScores() {
//   const metricsIndices = {
//     numLines: 5,
//     numIfElseStatements: 6,
//     numLoops: 7,
//     numUncheckedBlocks: 8,
//     numInlineAssemblyBlocks: 9,
//     numEventsEmitted: 10,
//     numComments: 11,
//     cyclomaticComplexity: 12,
//   };

//   const weights = {
//     numLines: 0.2,
//     numIfElseStatements: 0.15,
//     numLoops: 0.15,
//     numUncheckedBlocks: 0.1,
//     numInlineAssemblyBlocks: 0.1,
//     numEventsEmitted: 0.1,
//     numComments: 0.05,
//     cyclomaticComplexity: 0.15,
//   };

//   const normalizedMetrics = {};

//   for (const metric in metricsIndices) {
//     const values = xlsxData.slice(1).map((row) => row[metricsIndices[metric]]);
//     normalizedMetrics[metric] = normalize(values);
//   }

//   for (let i = 1; i < xlsxData.length; i++) {
//     let complexityScore = 0;

//     for (const metric in normalizedMetrics) {
//       complexityScore += normalizedMetrics[metric][i - 1] * weights[metric];
//     }

//     xlsxData[i].push(complexityScore);
//   }
// }

///////////////////////

const filesMetrics = exportXlsxFilesData();
