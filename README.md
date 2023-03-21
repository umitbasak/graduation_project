# Graduation Project

Static Analysis Tool for Solidity Codebases

In order to run the project:<br/>
npm install<br/>

For extracting the metrics for each individual file:
node xlsxFiles.js

For extracting the metrics for each individual contract:
node xlsxContracts.js

Quick guide:
JS files parse the solidity files inside the "morpho" directory and generate a report from them, after that they export these reports to spreadsheets which can
be located in "./sheets/" directory.
