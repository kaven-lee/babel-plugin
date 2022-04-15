const { parse } = require('./parser');
const traverse = require('./traverse')
const generate = require('./generator')
const path = require('path');
const fs = require('fs');

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), { encoding: 'utf-8' });

const ast = parse(sourceCode, {
  plugins: ['literal']
});

traverse(ast, {
  Identifier(path) {
    path.node.name = 'b';
  }
});

const { code, map } = generate(ast, sourceCode, 'sourceCode');

fs.writeFileSync(path.join(__dirname, './target.js'), code);

console.log(ast.body[0].declarations[0])