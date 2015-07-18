'use strict';

var debug = require('debug')('metalsmith-hyphenate');
var extname = require('path').extname;
var p5 = require('parse5');
var Hypher = require('hypher');
var minimatch = require('minimatch');

/**
 * Default Elements to hyphenate
 */
var DEFAULT_ELEMENTS = ['p', 'a', 'li', 'ol'];

/**
 * A Metalsmith plugin to add soft hyphens in HTML
 *
 * @param {Object} options (optional)
 *   @property {Array} [elements=['p', 'a', 'li', 'ol']] - HTML elements which needs to be hyphenated
 *   @property {Array} [langModule='hyphenation.en-us'] - Hypher language module(pattern) to use
 *   @property {String|Array} [ignore] - Glob expressions to ignore a file, or a set of files
 * @return {Function}
 */

function plugin(options) {
  options = options || {};

  options.elements = options.elements || DEFAULT_ELEMENTS;
  options.langModule = options.langModule || 'hyphenation.en-us';

  if ((options.ignore !== undefined) &&
    (Object.prototype.toString.call(options.ignore) === '[object String]')) {
    options.ignore = [options.ignore];
  }
  debug('File ignore glob expressions: %j', options.ignore);

  var parser = new p5.Parser();
  var serializer = new p5.Serializer();

  try {
    var hypher = new Hypher(require(options.langModule));
  } catch (err) {
    console.log("Language module %s is not installed. Try 'npm install %s'",
      options.langModule, options.langModule);
  }

  /**
   * Check if a `value` is present in the array.
   *
   * @param {array} arr
   * @param value
   * @return {Boolean}
   */
  function isPresent(arr, value) {
    return arr.indexOf(value) < 0 ? false : true;
  }

  /**
   * Check if a `file` is HTML.
   *
   * @param {String} file
   * @return {Boolean}
   */

  function isHtml(file) {
    return /\.html?/.test(extname(file));
  }

  /**
   * Traverses throught parsed DOM, and hyphenate text nodes
   *
   * @param {String} domString
   * @param {Boolean} forceHyphenate
   * @return {String}
   */
  function hyphenateText(dom, forceHyphenate) {
    if (forceHyphenate === undefined) {
      forceHyphenate = false;
    }

    if (isPresent(options.elements, dom.tagName)) {
      forceHyphenate = true;
    }

    if (dom.childNodes !== undefined) {
      dom.childNodes.forEach(function(node) {
        if (node.nodeName === '#text' && forceHyphenate) {
          node.value = hypher.hyphenateText(node.value);
        } else {
          hyphenateText(node, forceHyphenate);
        }
      });
    }

    return dom;
  }

  /**
   * Check if the file matches the ignore glob patterns
   *
   * @param {String} file
   * @return {Boolean}
   */
  function isIgnoredFile(file) {
    if (options.ignore !== undefined) {
      var result = false;

      options.ignore.forEach(function(pattern) {
        if (minimatch(file, pattern)) {
          result = true;
          return false;
        }
      });

      return result;
    }

    return false;
  }

  return function(files, metalsmith, done) {
    setImmediate(done);

    Object.keys(files).forEach(function(file) {
      debug('checking if file matches ignore patterns: %s', file);
      if (isIgnoredFile(file) === true) {
        return;
      }

      debug('checking if it is an HTML file: %s', file);
      if (isHtml(file) === false) {
        return;
      }

      debug('hyphenating "%s"', file);
      var dom = parser.parseFragment(files[file].contents.toString());
      dom = hyphenateText(dom);
      files[file].contents = new Buffer(serializer.serialize(dom));
    });
  };
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
