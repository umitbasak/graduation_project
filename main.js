import GenerateReport from "./src/GenerateReport.js";
import GenerateSpreadsheet from "./src/GenerateSpreadsheet.js";

const file_path = "./src/sample_codes/safe_remote_purchase.sol";

const report = GenerateReport(file_path);
console.log("---------------------------");
console.log(JSON.stringify(report));
// GenerateSpreadsheet(JSON.stringify(report));
