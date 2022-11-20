import xlsx from "xlsx";
// const workSheetColumnName = [];

// const workSheetName = "Code Report";

// const file_path = "./export/code_report.xlsx";

export default function GenerateSpreadsheet(jsonObject, fileName) {
  var workBook = xlsx.utils.book_new();
  var workSheet = xlsx.utils.json_to_sheet(jsonObject);
  xlsx.utils.book_append_sheet(workBook, workSheet);
  xlsx.writeFile(workBook, "./src/export/" + fileName + ".xlsx");
}
