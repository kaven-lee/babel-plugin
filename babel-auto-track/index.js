const { transformFileSync } = require('@babel/core');
const autoTrackBabelPlugin = require('./plugin');
const fs = require('fs');
const path = require('path');

const { code } = transformFileSync(path.join(__dirname, './source.js'), {
  plugins: [[autoTrackBabelPlugin, {trackImportName: 'tracker'}]]
})

fs.writeFileSync(path.join(__dirname, './target.js'), code);

console.log('code', code)