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

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;

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
  options.useLangAttribute = options.useLangAttribute || false;
  
  if ((options.ignore !== undefined) &&
    (Object.prototype.toString.call(options.ignore) === '[object String]')) {
    options.ignore = [options.ignore];
  }
  debug('File ignore glob expressions: %j', options.ignore);

  function createHypher(langModule) {
    try {
      return new Hypher(require(langModule));
    } catch (err) {
      console.log("Language module %s is not installed. Try 'npm install %s'",
        langModule, langModule);
    }
  }

  function getHypherByLang(lang) {
    if (!lang || !options.useLangAttribute) {
      return hyphersByLang.default;
    }
    
    var hypher = hyphersByLang[lang];
    
    if (!hypher) {
      hypher = createHypher('hyphenation.' + lang);
      hyphersByLang[lang] = hypher;
    }
    
    return hypher || hyphersByLang.default;
  }

  var hyphersByLang = {
    default: createHypher(options.langModule)
  };
  
  var hyphersStack = [hyphersByLang.default];
  
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
   * @return {String}
   */
  function hyphenateText(dom) {
    var hypher, popHypher = false;
    
    if (dom.childNodes === undefined) {
      return dom;
    }
      
    if (dom.nodeType === ELEMENT_NODE) {
      var langAttribute = dom.getAttribute('lang');
      if (langAttribute) {
        hypher = getHypherByLang(langAttribute);
        if (hypher) {
          hyphersStack.push(hypher);            
          popHypher = true;
        }
      }
    }
    
    dom.childNodes.forEach(function(node) {
      
      if (node.nodeName === '#text' && isPresent(options.elements, dom.tagName)) {
        hypher = hyphersStack[hyphersStack.length - 1];
        node.value = hypher.hyphenateText(node.value);
      } else {
        hyphenateText(node);        
      }
    });

    if (popHypher) {
      hyphersStack.pop();
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
      var dom = p5.parse(files[file].contents.toString());
      dom = hyphenateText(dom);
      files[file].contents = new Buffer(p5.serialize(dom));
    });
  };
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
