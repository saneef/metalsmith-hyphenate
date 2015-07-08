'use strict';

var debug = require('debug')('metalsmith-hyphenate');
var extname = require('path').extname;
var p5 = require('parse5');
var Hypher = require('hypher');
var lang_en = require('hyphenation.en-gb');

var h = new Hypher(lang_en);

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * A Metalsmith plugin to add soft hyphens in HTML
 *
 * @return {Function}
 */

function plugin() {
  var elements = ['p', 'a', 'li', 'ol'];

  var parser = new p5.Parser();
  var serializer = new p5.Serializer();

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

    if (!forceHyphenate && _isPresent(elements, dom.tagName)) {
      forceHyphenate = true;
    }

    if (dom.childNodes != null) {
      dom.childNodes.forEach(function(node) {
        if (node.nodeName === '#text' && forceHyphenate) {
          node.value = h.hyphenateText(node.value);
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
