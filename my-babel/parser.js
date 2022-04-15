const acorn = require("acorn");

const syntaxPlugins = {
  'literal': require('./acorn-plugins/literal'),
}

const defaultOptions = {
  plugins: []
}

function parse(code, options) {

  const _options = Object.assign({}, defaultOptions, options)

  const newParser = options.plugins.reduce((Parser, pluginName) => {
    const plugin = syntaxPlugins[pluginName];
    return plugin ? Parser.extend(plugin) : Parser;
  }, acorn.Parser);

  return newParser.parse(code, { locations: true });
}

module.exports =  { parse };