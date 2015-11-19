/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class creates WONDER-compliant messages.
 * Please note that all functions in this class are static,
 * so there is no need to create MessageFactory objects.
 */
class MessageFactory {
  /**
   * @constructor
   */
  constructor() {}
    /**
     * @desc Creates an invitation message
     * @param {hhhh} from - The identity from which the message will be or was sent
     * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
     * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
     * @param {Object} demand - The demanded resources for the conversation
     * @param {Object} sessionDescription - The local description "offer" of the peer connection on the invitation sender's end
     * @return {Message}
     * @example MessageFactory.invitation(from, to, conversationId, demand, sessionDescription);
     */
  static invitation(from, to, conversationId, demand, sessionDescription) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.invitation] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.invitation] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.invitation] conversationId should be a string');
    if (!(typeof demand == 'object' || demand instanceof Object)) return new Error('[MessageFactory.invitation] demand should be an object');

    var misc = {
      'demand': demand,
      'sessionDescription': sessionDescription
    }
    return new Message(from, to, MessageType.invitation, conversationId, misc);
  }



  /**
   * @desc Creates a message to accept an invitation
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @param {Object} demand - The demanded resources for the conversation
   * @param {Object} sessionDescription - The local description "answer" of the peer connection on the invitation reveiving end
   * @return {Message}
   * @example MessageFactory.accepted(from, to, conversationId, demand, sessionDescription);
   */
  static accepted(from, to, conversationId, demand, sessionDescription) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.accepted] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.accepted] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.accepted] conversationId should be a string');
    if (!(typeof demand == 'object' || demand instanceof Object)) return new Error('[MessageFactory.accepted] demand should be an object');

    var misc = {
      'demand': demand,
      'sessionDescription': sessionDescription
    }
    return new Message(from, to, MessageType.accepted, conversationId, misc);
  }



  /**
   * @desc Creates a message to decline an invitation
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @example MessageFactory.declined(from, to, conversationId);
   * @return {Message}
   */
  static declined(from, to, conversationId) {
    console.log(from, to, conversationId);
    if (!(from instanceof Identity)) return new Error('[MessageFactory.declined] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.declined] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.declined] conversationId should be a string');

    return new Message(from, to, MessageType.declined, conversationId);
  }



  /**
   * @desc Creates a message to end a conversation
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @example MessageFactory.bye(from, to, conversationId);
   * @return {Message}
   */
  static bye(from, to, conversationId) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.bye] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.bye] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.bye] conversationId should be a string');

    return new Message(from, to, MessageType.bye, conversationId);
  }


  /**
   * @desc Creates a message containing the new demand
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @param {Object} demand - The demanded resources for the conversation
   * @example MessageFactory.updateConstraints(from, to, conversationId, demand);
   * @return {Message}
   * @TODO rename the message to updateDemand
   */
  static updateConstraints(from, to, conversationId, demand) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.updateConstraints] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.updateConstraints] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.updateConstraints] conversationId should be a string');
    if (!(typeof demand == 'object' || demand instanceof Object)) return new Error('[MessageFactory.updateConstraints] demand should be an object');

    var misc = {
      'demand': demand,
    }
    return new Message(from, to, MessageType.update, conversationId, misc);
  }



  /**
   * @desc Creates an message to update ICE candidates of a peer connection
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @param {Object} iceCandidates - An object containing new ICE candidates (STUN, TURN)
   * @example MessageFactory.updateIceCandidates(from, to, conversationId, iceCandidates);
   * @return {Message}
   */
  static updateIceCandidates(from, to, conversationId, iceCandidates) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.updateIceCandidates] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.updateIceCandidates] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.updateIceCandidates] conversationId should be a string');

    return new Message(from, to, MessageType.connectivityCandidate, conversationId, iceCandidates);
  }


  /**
   * @desc Creates a message containing the new session description
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @param {Object} sdp - The SDP object of the peer connection
   * @example MessageFactory.updateSdp(from, to, conversationId, sdp);
   * @return {Message}
   */
  static updateSdp(from, to, conversationId, sdp) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.updateConstraints] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.updateConstraints] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.updateConstraints] conversationId should be a string');
    //if( !(typeof sdp == 'object' || demand instanceof Object) ) return new Error('[MessageFactory.updateConstraints] demand should be an object');

    var misc = {
      'sdp': sdp,
    }
    return new Message(from, to, MessageType.updateSdp, conversationId, misc);
  }



  /**
   * @desc Creates a message to announce the current presence status
   * @param {Identity} from - The identity from which the message will be or was sent
   * @param {Identity|Array<Identity>} to - The identity to which the message will be or was sent
   * @param {GUID} conversationId - The conversationId of the conversation which is related to the invitation
   * @param {string} status - The presence state of the identity from which the message is sent
   * @example MessageFactory.presence(from, to, conversationId, status);
   * @return {Message}
   * @TODO use it in the communication
   */
  static presence(from, to, conversationId, status) {
    if (!(from instanceof Identity)) return new Error('[MessageFactory.presence] from should be an instance of Identity');
    if (!(to instanceof Identity || (typeof to == 'array' || to instanceof Array) && !to.find(function(i) {
        return !(i instanceof Identity)
      }))) return new Error('[MessageFactory.presence] to should be an instance of Identity or an Array with Identities');
    if (!(typeof conversationId == 'string' || conversationId instanceof String)) return new Error('[MessageFactory.presence] conversationId should be a string');

    return new Message(from, to, MessageType.presence, conversationId);
  }

}
