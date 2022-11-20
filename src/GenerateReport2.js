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
  const codeReport = {};
  try {
    const ast = parse(file_string, { loc: true, range: true });
    // const codeLength = ast.loc.end.line;
    codeReport.codeLength = ast.loc.end.line;
    for (let index = 0; index < ast.children.length; index++) {
      let currentChild = ast.children[index];
      if (currentChild.type === "PragmaDirective") {
        codeReport.PragmaDirective = currentChild.value;
      }
      if (currentChild.type === "ContractDefinition") {
        const ASTcounts = {};
        const FunctionTypeCounts = {};
        for (let i = 0; i < currentChild.subNodes.length; i++) {
          const currentSubNode = currentChild.subNodes[i];
          if (currentSubNode.type in ASTcounts) {
            ASTcounts[currentSubNode.type] += 1;
          } else {
            ASTcounts[currentSubNode.type] = 1;
          }
          if (currentSubNode.type === "FunctionDefinition") {
            if (currentSubNode.visibility in FunctionTypeCounts) {
              FunctionTypeCounts[currentSubNode.visibility] += 1;
            } else {
              FunctionTypeCounts[currentSubNode.visibility] = 1;
            }
          }
        }
        codeReport.FunctionTypeCounts = FunctionTypeCounts;
        codeReport.ASTcounts = ASTcounts;
      }
    }
    console.log(`The pragma directive of the code is ${codeReport.PragmaDirective}
  The length of the code is ${codeReport.codeLength} lines.
  AST types and counts found in the code:`);
    console.log(codeReport.ASTcounts);
    console.log(`Function types that are found in the code:`);
    console.log(codeReport.FunctionTypeCounts);
    console.log("--------------------------------------------------");
    console.log(codeReport);
    return codeReport;
  } catch (e) {
    if (e instanceof ParserError) {
      console.error(e.errors);
    }
  }
}
