import { parse, ParserError } from "@solidity-parser/parser";
import fs from "fs";

function turnFileToString(file_path) {
  const file_string = fs
    .readFileSync(file_path, { encoding: "utf8", flag: "r" })
    .toString();
  return file_string;
}

// This function generates a report of the given file in the given file path
export default function GenerateReport(file_path) {
  const file_string = turnFileToString(file_path);
  const codeReport = [];
  try {
    const ast = parse(file_string, { loc: true, range: true });
    codeReport.push({
      name: "Code Length",
      value: ast.loc.end.line,
      visibility: "",
    });
    for (let index = 0; index < ast.children.length; index++) {
      let currentChild = ast.children[index];
      if (currentChild.type === "PragmaDirective") {
        codeReport.push({
          name: "Pragma Directive",
          value: currentChild.value,
          visibility: "",
        });
      }
      if (currentChild.type === "ContractDefinition") {
        for (let i = 0; i < currentChild.subNodes.length; i++) {
          const currentSubNode = currentChild.subNodes[i];
          codeReport.push({
            name: currentSubNode.type,
            value: "",
            visibility: currentSubNode.visibility,
          });
        }
      }
    }
    console.log(codeReport);
    return codeReport;
  } catch (e) {
    if (e instanceof ParserError) {
      console.error(e.errors);
    }
  }
}
