/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

define(function() {
  /**
   * @class
   * @desc This class represents a data broker for codecs and their data channels
   * @return {DataChannelBroker}
   */
  class DataChannelBroker {
    /**
     * @constructor
     */
    constructor() {
      /**
       * @desc This is an object containing a map for assigned codecs between a sender and a recipient.
       * The object makes it possible to search a codec instance by going down the hierarchy in the following order:
       * from -> to -> payloadType ->  [ codec | url | dataChannelEvtHandler ]
       * @type {Object} codecMap
       * @example
       * { // view of alice (sending direction) begins here
       *  alice: {
       *    bob: {
       *      file: {
       *        url: "https://example.net:8083/codecs/file.js", // the url to the origin of the codec
       *        dataChannleEvtHandler: DataChannelEvtHandler, // an instance of the event handler
       *        codec: codec // an instance of the codec which includes data channel
       *      },
       *      plain: {
       *        url: "http://example.org:8083/codecs/plain.js",
       *        dataChannleEvtHandler: DataChannelEvtHandler,
       *        codec: codec
       *      }
       *    }
       *    charlie: {
       *      chat: {
       *        url: "http://example.com:8083/codecs/chatcodec.js",
       *        dataChannleEvtHandler: DataChannelEvtHandler,
       *        codec: codec
       *      }
       *    }
       *  },
       *  // receiving direction begins here
       *  bob: {
       *    alice: {
       *      file: {
       *        url: "https://example.net:8083/codecs/fileCodec2.js",
       *        dataChannleEvtHandler: DataChannelEvtHandler,
       *        codec: codec
       *      }
       *    }
       *  },
       *  charlie: {
       *    alice: {
       *      chat: {
       *        url: "http://charlie.example.net:8083/codecs/charliesChatCodec.js",
       *        dataChannleEvtHandler: DataChannelEvtHandler,
       *        codec: codec
       *      }
       *    }
       *  }
       * }
       */
      this.codecMap = {};

      /**
       * @type {Object} codecs
       * @desc An object of all available codecs with the codecUrl as a key
       * It contains the instances of each required codec. The codecs are then used to
       * instanciate the codecs in the codecMap so they can be used multiple times.
       * @example
       * {
       *   "http://example.org:8083/chat.js" : chatCodec, // instance of a codec
       *   "https://example.net:8070/file.js" : fileCodec,
       *   "https://example.com:8090/image.js" : imageCodec
       * }
       */
      this.codecs = {};
    }


    /**
     * @desc The function adds a new codec from one peer to another
     * with the codecUrl as the key.
     * @param {Identity} from - The senders Identity
     * @param {Identity} to - The recipient's Identity
     * @param {PayloadType|String} payloadType - The type of the payload for the codec which may be derived from PayloadType or be a self defined string also present in the identity as a key to a codec
     * @param {DataChannelEvtHandler} dataChannelEvtHandler - The instance of DataChannelEvtHandler used for the codecs data channel
     * @return {Promise<Codec>}
     * @TODO add error handling if no codec is retrieved if(codec == false) ...
     * @TODO check if hasownproperty or try-catch is better suited
     */
    addDataChannelCodec(from, to, payloadType, dataChannelEvtHandler) {
      var that = this;
      var errMsg;

      return new Promise(function(resolve, reject) {
        // when no codecs were webfingered from bob or the payloadType doesn't match the codecs
        if (!to.codecs || !to.codecs[payloadType]) {
          // check if the codec doesn't matter
          if (payloadType == true) payloadType = PayloadType.plain; // fallback to codec plain
          else { // alice is requesting a codec that bob doesn't have
            errMsg = new Error("[DataChannelBroker addDataChannelCodec] Payload type not found for the remote participant");
            reject(errMsg);
            return errMsg;
          }
        } // else payload type found

        that.getCodec(to.codecs[payloadType]) // get the codec file
        .then(function(codec) { // iterate through the object and resolve missing hierarchies
          if (!that.codecMap[from.rtcIdentity]) that.codecMap[from.rtcIdentity] = {};
          if (!that.codecMap[from.rtcIdentity][to.rtcIdentity]) that.codecMap[from.rtcIdentity][to.rtcIdentity] = {};
          if (!that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]) that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType] = {};
          that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url = to.codecs[payloadType]; // write the url
          that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].dataChannelEvtHandler = dataChannelEvtHandler; // save the handler
          resolve(codec); // resolve the promise of addDataChannelCodec
        })
        .catch(function(error) {
          errMsg = new Error("[DataChannelBroker addDataChannelCodec] error saving the codec in the codecMap:", error);
          reject(errMsg);
          return errMsg;
        });
      });
    }


    /**
     * @desc Returns a codec and its data channel which is used from one peer to another with the codecUrl as a key
     * @param {Identity} from - The senders Identity
     * @param {Identity} to - The recipient's Identity
     * @param {PayloadType|String} payloadType - The type of the payload for the codec which may be derived from PayloadType or be a self defined string also present in the identity as a key to a codec
     * @return {Promise<Object>|false}
     * @example
     * var codec = dataChannelBroker.getDataChannelCodec(remoteIdentity, myIdentity, "https://example.com/codecFile.js");
     * @TODO: add an instance of the codec to the codecMap, it is currently only in codecs
     * @TODO check if hasownproperty or try-catch is better suited
     */
    getDataChannelCodec(from, to, payloadType) {
      if ((payloadType == true) || !payloadType) payloadType = PayloadType.plain; // fallback to codec plain
      if (this.codecMap[from.rtcIdentity]                                             &&
          this.codecMap[from.rtcIdentity][to.rtcIdentity]                             &&
          this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]                &&
          this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url            &&
          this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url]) {
            return this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url]; // return the codec
      }
      return false; // if not found
    }


    /**
     * @desc Remove a codec and its RTCDataChannel
     * @param {Identity} from - The senders Identity
     * @param {Identity} to - The recipient's Identity
     * @param {PayloadType|String} payloadType - The type of the payload for the codec which may be derived from PayloadType or be a self defined string also present in the identity as a key to a codec
     * @return {Boolean}
     * @example
     * var success = dataChannelBroker.removeDataChannelCodec(myIdentity, remoteIdentity, "http://example.com/codec.js");
     * @TODO delete also the data channel evnt handler and everything instide the codec to be sure everything is removed
     * @TODO check if hasownproperty or try-catch is better suited
     */
    removeDataChannelCodec(from, to, payloadType) {
      // check if the connection is there
      // check iteratively to avoid exceptions
      if (this.codecMap[from.rtcIdentity]                             &&
          this.codecMap[from.rtcIdentity][to.rtcIdentity]             &&
          this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]) {
            delete this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType];
            return true;
      }
      return false; // if not found
    }


    /**
     * @desc Get a specific codec from the local codec list or from a remote server
     * @param {String} codecUrl - an URL pointing to the related codec file which is also used as a key for the codecs-list
     * @return {Promise<Object>} codec
     * @example
     * dataChannelBroker.getCodec("https://c.example.net/anyCodec.js")
     * .then(function(codec){
     *   console.log("Codec found: ", codec);
     *   // do something with the codec variable
     * })
     * .catch(function(error){
     *   console.error("Error found: ", error);
     * });
     */
    getCodec(codecUrl) {
      var that = this;

      return new Promise(function(resolve, reject) {
        // error handling
        if (!codecUrl) {
          reject(Error("[DataChannelBroker getCodec] : no codecUrl specified"));
          return;
        }

        // search for the codec by URL
        if (that.codecs && that.codecs[codecUrl]) {
          resolve(that.codecs[codecUrl]);
          return;
        } else { // if it isn't present download the codec with the URL
          require([codecUrl],
            function(codec) { // successfully received the codec
              that.codecs[codecUrl] = codec; // save it locally
              resolve(codec); // and return it
            },
            function(error) { // failed to receive the codec
              reject(new Error('[DataChannelBroker getCodec] the codec could not be retrieved from the remote server: ', error));
            }
          );
        }
      });
    }


    /**
     * @desc This function removes a codec with a given url to a codec origin.
     * This function may not be needed at all since we may want to be able to
     * preserve every codecs for the application/conversation lifetime.
     * @param {String} codecUrl - an URL pointing to the related codec file
     * @return {Boolean}
     * @example var success = dataChannelBroker.removeCodec("https://codecs.example.org/imageCodec.js");
     */
    removeCodec(codecUrl) {
      if (this.codecs[codecUrl]) {
        delete this.codecs[codecUrl];
        return true;
      }
      else return false;
    }
  }

  return new DataChannelBroker();
});
