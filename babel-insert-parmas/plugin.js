
const targetCalleeName = ['info', 'debug', 'log', 'error'].map(item => `console.${item}`)

const parametersInsertPlugin = function ({ types, template, generate }, options, dirname) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.isNew) return;
        const calleeName = path.get('callee').toString();
        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;
          const insert = template.expression(`console.log("${state.filename || 'unkown filename'}: (${line}, ${column})")`)();
          insert.isNew = true;

          if (path.findParent(path => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([insert, path.node]))
            path.skip();
          } else {
            path.insertBefore(insert);
          }
        }
      }
    }
  }
}
module.exports = parametersInsertPlugin;