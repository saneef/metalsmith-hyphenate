'use strict';

var debug = require('debug')('metalsmith-hyphenate');
var extname = require('path').extname;
var p5 = require('parse5');
var Hypher = require('hypher');

/**
 * Expose `plugin`.
 */
module.exports = plugin;

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

  return function(files, metalsmith, done) {
    Object.keys(files).forEach(function(file) {
      debug('checking file: %s', file);
      if (!_isHtml(file)) { return; }

      debug('hyphenating "%s"', file);
      var dom = parser.parseFragment(files[file].contents.toString());

      dom = _hyphenateText(dom);

      files[file].contents = serializer.serialize(dom);
    });

    done();
  };

  /**
   * Check if a `value` is present in the array.
   *
   * @param {String} domString
   * @return {String}
   */
   function _hyphenateText(dom, forceHyphenate) {
     var results = [];

     if (forceHyphenate == null) {
      forceHyphenate = false;
    }

    if (!forceHyphenate && _isPresent(options.elements, dom.tagName)) {
      forceHyphenate = true;
    }

    if (dom.childNodes != null) {
      dom.childNodes.forEach(function(node) {
        if (node.nodeName === '#text' && forceHyphenate) {
          node.value = hypher.hyphenateText(node.value);
        } else {
          _hyphenateText(node, forceHyphenate);
        }
      });
    }

    return dom;
   }

  /**
   * Check if a `value` is present in the array.
   *
   * @param {array} arr
   * @param value
   * @return {Boolean}
   */
  function _isPresent(arr, value) {
    return arr.indexOf(value) < 0 ? false : true;
  }

  /**
   * Check if a `file` is HTML.
   *
   * @param {String} file
   * @return {Boolean}
   */

  function _isHtml(file){
    return /\.html?/.test(extname(file));
  }
}
