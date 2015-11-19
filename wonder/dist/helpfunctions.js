/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Paulo Chainho <paulo-g-chainho@ptinovacao.pt>
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Miguel Seijo Simo <Miguel.Seijo@telekom.de>
 * @author Vasco Amaral <vasco-m-amaral@ptinovacao.pt>
 * @author Kay Haensge <Kay.Haensge@telekom.de>
 * @author Luis Oliveira <luis-f-oliveira@ptinovacao.pt>
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

/**
 * @ignore
 */
function uuid4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}



/**
 * @desc The function generates a unique id
 * @typedef {string} GUID
 * @example 12345678-9ABC-DEF0-1234-56789ABCDEF0
 */
function guid() {
  return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + uuid4() + uuid4();
}



/**
 * @desc This function logs errors
 * @return {function}
 */
var errorHandler = function(error) {
  console.log(error);
}



/**
 * @desc This is a polyfill for Array.find which iterates through an array and returns the desired value.
 * It expects a function as a parameter which must return false when the current value isn't the desired value
 * and true if the value is the searched one. It only returns the first value which is a match and ignores the following.
 * @return {Object}
 * @example
 * var a = {a:true , b:true };
 * var b = {a:true , b:false};
 * var c = {a:false, b:true };
 * var d = {a:false, b:false};
 * var array = [a,b,c,d];
 * var value = array.find( function(obj){
 *   return obj.a == false;
 * });
 * console.log(value); // returns the object c: {a: false, b: true}
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
