/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';


/**
 * @class
 * @desc This class represents an identity.
 * The identity is the view of the WONDER framework of a user's representation
 * and will be filled with information coming from the identity provider.
 */
class Identity {
  /**
   * @constructor
   * @param {String} rtcIdentity - The username including the domain part of the identity which must be unique
   * @param {String} remoteIdp - The URL of the remote identity provider
   * @param {MessagingStub} msgStub - The messaging stub instance which will be used to connect the identity to its domain
   * @param {String} msgStubUrl - The URL to the origin of the messaging stub
   * @param {String} msgSrv - The URL to the messaging server which will be used for the identity's domain
   * @param {Object} [codecs] - An array containing the codec URLs for the data channel
   * @param {Object} [credentials] - An object containing credentials for the identity; can contain login information for the messaging server
   */
  constructor(rtcIdentity, remoteIdp, msgStub, msgStubUrl, msgSrv, codecs, credentials) {
    /**
     * @type {String} rtcIdentity
     * @desc The username including the domain of the Identity
     * @example alice@example.com
     */
    this.rtcIdentity = rtcIdentity;

    /**
     * @type {String} remoteIdp
     * @desc The URL to the remote Idp
     * @example 'webfinger' // recommended
     * 'http://example.net/idp.php?user='
     */
    this.remoteIdp = remoteIdp;

    /**
     * @type {MessagingStub} msgStub
     * @desc The instance of the messaging stub of the identity's domain
     * which will be used to connect the identity to it's messaging server;
     * it will also be used to communicate with the messaging server
     * @example
     * define(function(require, exports, module) {
     *   class MessagingStubOfExampleDomain {
     *     constructor() {
     *       this.onMessage = null; // message event handler will use this to register itself on the stub
     *     }
     *     connect(rtcIdentity, credentials, msgSrv, callback) {
     *       // ...
     *       this.websocket.onmessage = function(msg) {
     *         // ...
     *         that.onMessage(msg); // give the message as a JSON-object to the registered function to process it in wonder
     *       };
     *       // ...
     *     }
     *     sendMessage(message) { ... }
     *     disconnect() { ... }
     *   }
     *   return new MessagingStubOfExampleDomain();
     * });
     */
    this.msgStub = msgStub;

    /**
     * @type {String} msgStubUrl
     * @desc The URL to the location where the messagingStub was downloaded from
     * @example 'http://example.net:8082/stubsDirectory/MessagingStubOfExampleDomain.js'
     */
    this.msgStubUrl = msgStubUrl;

    /**
     * @type {String} msgSrv
     * @desc The URL to the messaging server of the identity's domain
     * @example 'ws://example.org:12345'
     */
    this.msgSrv = msgSrv;

    /**
     * @type {Object} codecs
     * @desc An object containing payloadtypes as keys to the links of codec libraries
     * @example
     * { chat: "http://example.net:8083/codecs/chat.js"
     *   file: "http://example.net:8083/codecs/file.js" }
     */
    this.codecs = codecs;

    /**
     * @type {Object} [credentials]
     * @desc An object containing credentials for the identity;
     * can be used to be able to login to the identity's messaging server
     * @example // ims login example
     * { "privid" : "identifier@subdomain.example.org:1234",
     *   "pubid" : "pudIdentifier",
     *   "proxy" : "10.11.12.13:12333",
     *   "pwd" : "userPassword"                              }
     */
    this.credentials = credentials;
  }
}
