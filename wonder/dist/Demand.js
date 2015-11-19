/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class converts different data demand types to a pre-defined format.
 * The Format contains an 'in' and 'out' object which is used to differentiate local and remote media access.
 * The output could look like this:
 * @TODO change data-object in demand to be ablte to hold an array or another object containing multiple payload types
 * @example
 * {
 *  in: {
 *    video: {
 *      mandatory: { minAspectRatio: 1.333, maxAspectRatio: 1.334 },
 *      optional : [
 *        { minFrameRate: 60 },
 *        { maxWidth: 640 },
 *        { maxHeigth: 480 }
 *      ]
 *    }
 *    audio: true,
 *    data: true
 *  },
 *  out: {
 *    video: {
 *      mandatory: { minAspectRatio: 1.4},
 *      optional : [
 *        { minFrameRate: 20 },
 *        { maxWidth: 800 }
 *      ]
 *    }
 *    audio: false,
 *    data: "chat"
 *  }
 * }
 */
class Demand {
  /**
   * @constructor
   * @param {String|Array<String>|Object} data - The resources which are requested
   * @example
   * var demand = new Demand("all"); // demand video, audio and a data channel
   * var demand = new Demand("audio"); // demands audio for both directions
   * var demand = new Demand("noRealTypeLikeVideoOrAudioOrData"); // demands nothing
   * var demand = new Demand(["audio","data"]); // demands audio and data for both directions
   * var demand = new Demand({in: "video", out: "audio"}); // demands incoming video and outgoing audio
   * var demand = new Demand({out:{data:true,video:false}}}); // demands only an outgoing data channel
   * @desc The constructor can be called with different data types and converts it to the necessary object.
   * It doesn't return the Demand-object itself rather than a general object describing the demand in a structured way.
   */
  constructor(data) {
    return Demand.convertDemand(data, Demand.getStandardDemand());
  }

  /**
   * @desc This defines the format for the output as an object.
   * @return {Object}
   */
  static getStandardDemand() {
    return {
      in : {
        'audio': false,
        'video': false,
        'data': false
      },
      out: {
        'audio': false,
        'video': false,
        'data': false
      }
    };
  }


  /**
   * @desc The function converts different demand requests to a unified format.
   * @param {String|Array<String>|Object} data - The requested demand which should be converted
   * @param {Object} demand - The standard demand object
   * @return {Object}
   */
  static convertDemand(data, demand) {

    // case data is a string
    if (typeof data === 'string' || data instanceof String) {
      if (data === '' || data === 'all') return demandAll(demand);
      else return stringToDemand(data, demand);
    }

    // case data is an array of Strings
    else if (data instanceof Array) {
      if (data.length === 0) return demandAll(demand);
      else return arrayToDemand(data, demand);
    }

    // case data is an Object
    else if (data instanceof Object) {
      if (data === null || data === undefined || Object.keys(data).length === 0) return demandAll(demand);
      return objectToDemand(data, demand);
    }
    else return demandAll(demand);


    /**
     * @desc Convertes a string to a standardized format
     * @param {String} data - The requested demand which should be converted
     * @param {Object} demand - The standard demand object
     * @return {Object}
     */
    function stringToDemand(data, demand) {
      console.log('[Demand convertDemand] converting String:', data, 'to Demand ', demand);

      if (demand.in.hasOwnProperty(data) && demand.out.hasOwnProperty(data)) {
        demand.in[data] = true;
        demand.out[data] = true;
      }
      return demand;
    }


    /**
     * @desc Convertes an array to a standardized format
     * @param {Array<String>} data - The requested demand which should be converted
     * @param {Object} demand - The standard demand object
     * @return {Object}
     */
    function arrayToDemand(data, demand) {
      console.log('[Demand convertDemand] converting Array:', data, 'to Demand');

      for (var i = 0; i < data.length; i++) {
        if (demand.in.hasOwnProperty(data[i]) && demand.out.hasOwnProperty(data[i])) {
          demand.in[data[i]] = true;
          demand.out[data[i]] = true;
        }
      }

      return demand;
    }


    /**
     * @desc Convertes an object to a standardized format
     * @param {Object} data - The requested demand which should be converted
     * @param {Object} demand - The standard demand object
     * @return {Object}
     */
    function objectToDemand(data, demand) {
      console.log('[Demand convertDemand] converting Object:', data, 'to Demand');

      // if already has the sub-objects "in" and "out"
      if (data.hasOwnProperty('in') || data.hasOwnProperty('out')) {
        // iterate through "in" and "out"
        for (var direction in demand) {
          // iterate through demand types ("audio", "video", "data")
          for (var prop in demand[direction]) {
            if (data[direction].hasOwnProperty(prop)) {
              if (data[direction][prop] === true || data[direction][prop] === false || typeof data[direction][prop] == 'object' || data[direction][prop] instanceof Object) {
                demand[direction][prop] = data[direction][prop];
              } else {
                if (prop == "data") {
                  demand[direction][prop] = data[direction][prop]; // { data: "chat" }
                }
                else demand[direction][prop] = false;
              }
            }
          }
        }
        // if "in" and "out" is not specified, set attributes for both directions
      } else {
        for (var prop in demand.in) {
          if (data.hasOwnProperty(prop)) {
            if (data[prop] === true || data[prop] === false || typeof data[prop] == 'object' || data[prop] instanceof Object) {
              demand.in[prop] = data[prop];
              demand.out[prop] = data[prop];
            } else {
              if (typeof data[prop] == 'string' || data[prop] instanceof String) {// { data: "plain" }
                demand.in[prop] = data[prop]; // {in: {data : "plain"}}
                demand.out[prop] = data[prop]; // {in: {data : "plain"}}
              } else {
                demand.in[prop] = false;
                demand.out[prop] = false;
              }
            }
          }
        }
      }

      return demand;
    }

    /**
     * @desc Returns a demand which requires everything as a standardized demand format
     * @return {Object}
     */
    function demandAll() {
      console.log('[Demand convertDemand] Wrong format:', data, 'using backup: set all to true');

      return {
        in : {
          'audio': true,
          'video': true,
          'data': true
        },
        out: {
          'audio': true,
          'video': true,
          'data': true
        }
      };

    }
  }


  /**
   * @desc The function assigns all properties which are wanted in the additional demand to the target demand.
   * @param {Object} targetDemand - The targeted demand to be modified
   * @param {Object} additionalDemand - The additinal demand which should be added to the targetDemand
   * @return {Object}
   * @example Demand.updateDemandAllow(demandToModify, demandToAdd);
   */
  static updateDemandAllow(targetDemand, additionalDemand){
    targetDemand     = this.convertDemand(targetDemand    , this.getStandardDemand());
    additionalDemand = this.convertDemand(additionalDemand, this.getStandardDemand());

    // iterate through "in" and "out"
    for (var direction in targetDemand) {
      // iterate through demand types ("audio", "video", "data")
      for (var prop in targetDemand[direction]) {
          // if the property is true in the additionalDemand then add it ti the targetDemand
          if (additionalDemand[direction][prop]) targetDemand[direction][prop] = additionalDemand[direction][prop];
      }
    }
    return targetDemand;
  }


   /**
    * @desc The function sets all properties which are not wanted in the restrictive demand to false in the target demand.
    * @param {Object} targetDemand - The targeted demand an which a specific demand type should be removed
    * @param {Object} restrictiveDemand - The demand which should be set to false in the targetDemand
    * @return {Object}
    * @example
    * Demand.updateDemandDisallow(demandToModify, demandToRemove);
    * Demand.updateDemandDisallow(demandToModify, {data:true}) // sets data to false in demandToModify
    */
  static updateDemandDisallow(targetDemand, restrictiveDemand){
    targetDemand      = this.convertDemand(targetDemand     , this.getStandardDemand());
    restrictiveDemand = this.convertDemand(restrictiveDemand, this.getStandardDemand());

    // iterate through "in" and "out"
    for (var direction in targetDemand) {
      // iterate through demand types ("audio", "video", "data")
      for (var prop in targetDemand[direction]) {
          // if the property is false in the restriction, then add it to the targetDemand
          if (restrictiveDemand[direction][prop]) targetDemand[direction][prop] = false;
      }
    }
    return targetDemand;
  }
}
