const generate = require("@babel/generator").default;

const targetCalleeName = ["log", "info", "warn", "error", "debug"].map(
  (item) => {
    return `console.${item}`;
  }
);

/** Babel 插件的形式是函数返回一个对象，对象有visitor属性 */
module.exports = function ({ types, template }) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.isNew) {
          return;
        }

        const calleeName = generate(path.node.callee).code;

        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;

          const newNode = template.expression(
            `console.log("${
              state?.filename || "unkown filename"
            }: (${line}, ${column})")`
          )();
          newNode.isNew = true;

          if (path.findParent((path) => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]));
            path.skip();
          } else {
            path.insertBefore(newNode);
          }
        }
      },
    },
  };
};
