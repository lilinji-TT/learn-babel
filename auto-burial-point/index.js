const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const autoTrackPlugin = require("./auto-track-plugin");
const fs = require("fs");
const path = require("path");

const sourceCode = fs.readFileSync(path.join(__dirname, "./source_code.js"), {
  encoding: "utf-8",
});

const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous",
});

const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [
      autoTrackPlugin,
      {
        trackerPath: "tracker",
      },
    ],
  ],
});

fs.writeFile("new_source_code.js", code, "UTF-8", (e) => {
  if (err) {
    console.error("Error: ", err.message);
  } else {
    console.log("Successfully generated new source code");
  }
});
console.log(code);
