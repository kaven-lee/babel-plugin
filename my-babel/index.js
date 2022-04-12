const { parse } = require('./parser');
const traverse =  require('./traverse')
const path = require('path');
const fs = require('fs');

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), { encoding: 'utf-8' });

const ast = parse(sourceCode, {
  plugins: ['literal']
});

traverse(ast, {
  Identifier(node) {
      node.name = 'b';
  }
});

console.log(ast.body[0].declarations[0])