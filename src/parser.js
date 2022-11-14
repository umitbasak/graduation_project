import { parse, ParserError } from "@solidity-parser/parser";
import fs from "fs";

const file_content = fs
  .readFileSync("./safe_remote_purchase.sol", { encoding: "utf8", flag: "r" })
  .toString();

// console.log(file_content);

// const input = `
//     contract test {
//         uint256 a;
//         function f() {}
//     }
// `;

const input = file_content;

const codeReport = {};

try {
  const ast = parse(input, { loc: true, range: true });
  //   console.log(ast);
  //   console.log(ast.children);
  const codeLength = ast.loc.end.line;
  codeReport.codeLength = codeLength;
  //   console.log(codeLength);
  for (let index = 0; index < ast.children.length; index++) {
    let currentChild = ast.children[index];
    // console.log(ast.children[index]);
    if (currentChild.type === "ContractDefinition") {
      //   console.log(currentChild);
      const ASTcounts = {};
      for (let i = 0; i < currentChild.subNodes.length; i++) {
        const currentSubNode = currentChild.subNodes[i];
        if (currentSubNode.type in ASTcounts) {
          ASTcounts[currentSubNode.type] += 1;
        } else {
          ASTcounts[currentSubNode.type] = 1;
        }
      }
      codeReport.ASTcounts = ASTcounts;
      //   console.log(ASTcounts);
    }
  }

  //   for (child of ast.children) {
  //     console.log(child);
  //     if (child.type === "ContractDefinition") {
  //       console.log(child);
  //     }
  //   }

  console.log(`The length of the code is ${codeReport.codeLength} lines.
AST types and counts found in the code:`);
  console.log(codeReport.ASTcounts);
} catch (e) {
  if (e instanceof ParserError) {
    console.error(e.errors);
  }
}
