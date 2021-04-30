// @ts-check

const loaderUtils = require('loader-utils');

const loader = function (source) {
  /** @type { { module?: string; tagger?: string; package?: string; localPath?: string; } } */
  const config = loaderUtils.getOptions(this) || {};

  config.module = config['module'] || 'CssModules';
  config.tagger = config['tagger'] || 'css';

  const packageName = config['package'] || 'cultureamp/elm-css-modules-loader';
  const taggerName = [
    '',
    packageName.replace(/-/g, '_').replace(/\//g, '$'),
    config.module.replace(/\./g, '_'),
    config.tagger,
  ].join('$');

  return transform(source, taggerName);
};

/**
 * @param {string} source
 * @param {string} taggerName
 * @returns {string}
 */
function transform(source, taggerName) {
  const escapedTaggerName = taggerName.replace(/\$/g, '\\$');
  const moduleNameCapture = "'([a-zA-Z-_./]+)'";
  const expectedClassRules = "{[a-zA-Z0-9:, ']*}";

  const regexp = regexpForFunctionCall('A2', [
    escapedTaggerName,
    moduleNameCapture,
    expectedClassRules,
  ]);
  return source.replace(regexp, 'A2(' + taggerName + ", '$1', require('$1'));");
}

function regexpForFunctionCall(fnName, args) {
  const optionalWhitespace = '\\s*';
  const argumentParts = [];
  for (let i = 0; i < args.length; i++) {
    argumentParts.push(optionalWhitespace);
    argumentParts.push(args[i]);
    if (i < args.length - 1) {
      argumentParts.push(',');
    }
    argumentParts.push(optionalWhitespace);
  }
  let parts = [fnName, '\\(', ...argumentParts, '\\)'];
  return new RegExp(parts.join(''), 'g');
}

module.exports = loader;
