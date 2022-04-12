const astDefinationsMap = new Map();
astDefinationsMap.set('Program', {
  visitor: ['body']
})
astDefinationsMap.set('VariableDeclaration', {
  visitor: ['declarations']
});
astDefinationsMap.set('VariableDeclarator', {
  visitor: ['id', 'init']
});
astDefinationsMap.set('Identifier', {});
astDefinationsMap.set('NumericLiteral', {});
astDefinationsMap.set('FunctionDeclaration', {
  visitor: ['id', 'params', 'body']
});
astDefinationsMap.set('BlockStatement', {
  visitor: ['body']
});
astDefinationsMap.set('ReturnStatement', {
  visitor: ['argument']
});
astDefinationsMap.set('BinaryExpression', {
  visitor: ['left', 'right']
});
astDefinationsMap.set('ExpressionStatement', {
  visitor: ['expression']
});
astDefinationsMap.set('CallExpression', {
  visitor: ['callee', 'arguments']
});

class NodePath {
  constructor(node, parent, parentPath) {
    this.node = node;
    this.parent = parent;
    this.parentPath = parentPath;
  }
}


function traverse(ast, visitors, parent, parentPath) {
  const defination = astDefinationsMap.get(ast.type);

  let visitorFuncs = visitors[ast.type] || {};

  if (typeof visitorFuncs === 'function') {
    visitorFuncs = {
      enter: visitorFuncs
    }
  }

  const path = new NodePath(ast, parent, parentPath);

  visitorFuncs.enter && visitorFuncs.enter(path);

  if (defination?.visitor) {
    defination.visitor.forEach(key => {
      const prop = ast[key];
      if (Array.isArray(prop)) {
        prop.forEach(childNode => {
          traverse(childNode, visitors, ast, path);
        })
      } else {
        traverse(prop, visitors, ast, path);
      }
    })
  }

  visitorFuncs.exit && visitorFuncs.exit(path);

}

module.exports = traverse;