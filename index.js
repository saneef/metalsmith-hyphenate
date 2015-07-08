'use strict';
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

  return function(files){
    for (var file in files) {
      console.log(file);
    }
  };

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
}
