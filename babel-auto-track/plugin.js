const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    visitor: {
      Program: {
        enter(path, state) {
          path.traverse({
            ImportDeclaration(impPath) {
              // 判断是否有track引入包 如果有把名字放到state 然后结束遍历
              const trackImportName = impPath.get('source').node.value;
              if (trackImportName === options.trackImportName) {
                const trackSpecifierPath = impPath.get('specifiers.0')
                state.trackerImportId = trackSpecifierPath.get('local').toString();
                impPath.stop();
              }
            }
          })
          // 如果没有引入就手动引入track模块
          if (!state.trackerImportId) {
            state.trackerImportId = importModule.addDefault(path, options.trackImportName, {
              nameHint: path.scope.generateUid('tracker')
            }).name;
          }
          // 创建需要插入的模版
          state.trackerTemplate = api.template.statement(`${state.trackerImportId}('METHOD_NAME');`);
        },

      },
      // 遍历所有函数声明
      'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
        // 拿到方法名字
        let methodName;
        const currentType = path.get('type').node;
        switch (currentType) {
          case 'FunctionDeclaration':
            methodName = path.get('id').node.name;
            break;
          case 'FunctionExpression':
            methodName = path.parentPath.get('id').node.name;
            break;
          case 'ArrowFunctionExpression':
            methodName = path.parentPath.get('id').node.name;
            break;
          case 'ClassMethod':
            methodName = path.get('key').node.name;
            break;
          default:
            break;
        }

        // 判断有@track-ignore注释不插入函数
        let currentNode = path.node;
        if (['FunctionExpression', 'ArrowFunctionExpression'].includes(currentType)) {
          const variablePath = path.findParent((curPath) => curPath.get('type').node === 'VariableDeclaration');
          currentNode = variablePath.node;
        }
        if (currentNode.leadingComments?.length > 0 && /@track-ignore/.test(currentNode.leadingComments[0].value)) {
          delete currentNode.leadingComments;
          delete currentNode.trailingComments;
          return;
        }

        // 如果函数没有函数体 给函数创建一个函数体并插入track函数
        const bodyPath = path.get('body');
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackerTemplate({ METHOD_NAME: methodName }));
        } else {
          const ast = api.template.statement(`{${state.trackerImportId}('${methodName}');return PREV_BODY;}`)({ PREV_BODY: bodyPath.node });
          bodyPath.replaceWith(ast);
        }
      }
    }
  }
})