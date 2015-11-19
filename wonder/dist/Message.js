/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class is a data holder for all messages that are sent between two WONDER implementations.
 * @desc The messages must be in that format when they arrive at another WONDER instance
 * and therefore need to be preserved while being sent through a messaging server.
 * @example var message = new Message(from, to, MessageType.invitation, conversationId, misc);
 */
class Message {
  /**
   * @constructor
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {(Identity|Array<Identity>)} to - The identity or identities that will receive the message
   * @param {String} type - The type of the message which is a shortform of the intention or action of the message
   * @param {GUID} conversationId - A unique ID for the conversation the message is related to
   * @param {Object} [misc] - Additional information related to the type of the message.
   */
  constructor(from, to, type, conversationId, misc) {
    /**
     * @type {GUID} id
     * @desc A unique ID for the message to be able to distinguish messages
     */
    this.id = guid();

    /**
     * @type {Identity} from
     * @desc The identity from which the message will be or was sent
     */
    this.from = from;

    /**
     * @type {Identity|Array<Identity>} to
     * @desc The target identity or identities to receive the message
     */
    this.to = to;

    /**
     * @type {MessageType} type
     * @desc Type of the message which must be one of the types defined in MessageType
     * @example MessageType.invitation
     */
    this.type = type;

    /**
     * @type {GUID} conversationId
     * @desc The unique id of the conversation, the message is related to
     */
    this.conversationId = conversationId;

    /**
     * @type {object} misc
     * @desc Additional information related to the type of the message
     * @example { 'demand': demand,
     *            'sessionDescription': sessionDescription }
     */
    this.misc = misc;
  }
}
