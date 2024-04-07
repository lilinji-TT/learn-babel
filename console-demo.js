const { transformFileSync } = require("@babel/core");
const insertParametersPlugin = require("./plugins/babel-for-console-plugin");
const path = require("path");

const { code } = transformFileSync(path.join(__dirname, "./source_code.js"), {
  plugins: [insertParametersPlugin],
  parserOpts: {
    sourceType: "unambiguous",
    plugins: ["jsx"],
  },
})

console.log(code);