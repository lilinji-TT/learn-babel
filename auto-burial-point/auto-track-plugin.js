const { declare } = require("@babel/helper-plugin-utils");
const importModule = require("@babel/helper-module-imports");
const { importDeclaration } = require("@babel/types");

const autoTrackPlugin = declare((api, options, dirname) => {
  api.assertVersion(7);

  return {
    visitor: {
      Program: {
        enter(path, state) {
          path.traverse({
            ImportDeclaration(curPath) {
              const requirePath = curPath.get("source").node.value;

              if (requirePath === options.trackerPath) {
                const specifierPath = curPath.get("specifiers.0");
                if (specifierPath.isImportSpecifier()) {
                  state.trackerImportId = specifierPath.toString();
                } else if (specifierPath.isImportNamespaceSpecifier()) {
                  state.trackerImportId = specifierPath.get("local").toString(); // tracker 模块的 Id
                }
                path.stop(); // 找到了就停止遍历
              }
            },
          });

          if (!state.trackerImportId) {
            state.trackerImportId = importModule.addDefault(path, "tracker", {
              nameHint: path.scope.generateUid("tracker"),
            }).name; // tracker 模块的 Id
            state.trackerAST = api.template.statement(
              `${state.trackerImportId}()`
            )(); // 埋点代码的AST
          }
        },
      },
      "ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration"(
        path,
        state
      ) {
        const bodyPath = path.get("body");

        // 判断是否有函数体
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackAST);
        } else {
          const ast = api.template.statement(
            `${state.trackerImportId}();return PREV_BODY;`
          )({ PREV_BODY: bodyPath.node });
          bodyPath.replaceWith(ast);
        }
      },
    },
  };
});

module.exports = autoTrackPlugin;
