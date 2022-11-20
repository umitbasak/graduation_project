import fs from "fs";
import GenerateReport from "./GenerateReport.js";
import GenerateSpreadsheet from "./GenerateSpreadsheet.js";

export default function IterateDirectory(file_path) {
  fs.readdirSync(file_path).forEach((file) => {
    console.log(file);
    const report = GenerateReport(file_path + file);
    GenerateSpreadsheet(report, file.toString());
  });
}
