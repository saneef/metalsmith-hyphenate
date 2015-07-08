'use strict';

var debug = require('debug')('metalsmith-hyphenate');
var extname = require('path').extname;
var p5 = require('parse5');
var Hypher = require('hypher');

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
 * @return {Function}
 */

function plugin(options) {
  options = options || {};

  options.elements = options.elements || DEFAULT_ELEMENTS;
  options.langModule = options.langModule || 'hyphenation.en-us';


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

    if (dom.childNodes != null) {
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

  return function(files, metalsmith, done) {
    Object.keys(files).forEach(function(file) {

      debug('checking file: %s', file);
      if (!isHtml(file)) {
        return;
      }

      debug('hyphenating "%s"', file);
      var dom = parser.parseFragment(files[file].contents.toString());
      dom = hyphenateText(dom);
      files[file].contents = serializer.serialize(dom);
    });

    done();
  };
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
