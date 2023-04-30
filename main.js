const { exportXlsxFunctionData } = require('./xlsxFunctions');
const { exportXlsxFilesData } = require('./xlsxFiles');
const { exportXlsxContractsData } = require('./xlsxContracts');



// console.log(exportXlsxFunctionData());
// console.log(exportXlsxFilesData());
// console.log(exportXlsxContractsData());

const functionMetrics = exportXlsxFunctionData();
console.log(functionMetrics)
const filesMetrics = exportXlsxFilesData();
const contractsMetrics = exportXlsxContractsData();