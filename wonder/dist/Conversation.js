/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class is the central class for controlling conversations
 */
class Conversation {
  /**
   * @constructor
   * @param {WONDER} wonderInstance - The instance of wonder to which the conversation is related to
   * @param {String} [owner] - Defines the owner of the conversation, usually the caller
   */
  constructor(wonderInstance, owner) {
    /**
     * @type {GUID} id
     * @desc A unique identifier for a conversation which is created automatically
     */
    this.id = guid();

    /**
     * @type {Wonder} wonderInstance
     * @desc The wonder instance on which the conversation is located on
     * @desc Makes backreferences possible
     */
    this.wonderInstance = wonderInstance;

    /**
     * @type {Participant} myParticipant
     * @desc The local participant of the conversation
     */
    this.myParticipant = null;

    /**
     * @type {Participant} owner
     * @desc The participant who owns the conversation which is usually the caller
     */
    this.owner = owner || null;

    /**
     * @type {Array<Participant>} remoteParticipants
     * @desc An array of all remote {@link Participant}s participating in that conversation
     */
    this.remoteParticipants = [];

    /**
     * @type {MsgEvtHandler} msgEvtHandler
     * @desc The message event handler instance of the conversation which handles all incoming messages from the conversation's messaging server
     * @example conversation.msgEvtHandler = new MsgEvtHandler(wonderInstance, conversation);
     */
    this.msgEvtHandler = new MsgEvtHandler(this.wonderInstance, this);

    /**
     * @type {RtcEvtHandler} rtcEvtHandler
     * @desc The rtc event handler instance of the conversation which handles all events related to a rtc peer connection#
     * @TODO: Move this to the Participant-class as a peer connection is established to another participant.
     * This needs to be done and working before multiparty code is written.
     * @example conversation.rtcEvtHandler = new RtcEvtHandler(wonderInstance, conversation);
     */
    this.rtcEvtHandler = new RtcEvtHandler(this.wonderInstance, this);

    /**
     * @type {DataChannelEvtHandler} dataChannelEvtHandler
     * @desc The data cannel event handler for data channel events of a specific channel.
     * The event handler is registered only if a data channel is required.
     * @TODO: check if this isn't needed anymore as the codec has the handler
     * @example conversation.dataChannelEvtHandler = new dataChannelEvtHandler(wonderInstance, conversation);
     */
    this.dataChannelEvtHandler = null;

    /**
     * @type {MessagingStub} msgStub
     * @desc The messaging stub implementation instance of the messaging server which is used in this conversation
     */
    this.msgStub = null;

    /**
     * @type {String} msgSrv
     * @desc A URL as a string to a messaging server which is used in this conversation
     */
    this.msgSrv = null;

    /**
     * @type {DataChannelBroker} dataChannelBroker
     * @desc The broker which stores and handles codecs and its data channels which are used in this conversation
     */
    this.dataChannelBroker = null;
  }


  /**
   * @desc Leaves the conversation on which the function is executed on
   * @example conversation.leave();
   */
  leave() {
    var that = this;
    that.myParticipant.peerConnection.close();
    for (var i = 0; i < that.remoteParticipants.length; i++) {
      // this will trigger the iceconnectionstatechange event on the remote end
      // remote end needs to check pc.iceConnectionState == disconnected
      if (that.remoteParticipants[i].peerConnection) that.remoteParticipants[i].peerConnection.close();
      // as the message is delivered trough the pc event a separate message isn't mandatory here
    }
    if (that.msgStub) that.msgStub.disconnect(); // now disconnect from the remote messaging server
  }


  /**
   * @desc Adds a new remote participant to the conversation
   * @param {Participant} participant - The remote participant which should be added to the conversation
   */
  addRemoteParticipant(participant) {
    var existingParticipant = this.remoteParticipants.find(
      function(remoteParticipant) {
        return remoteParticipant.identity == participant.identity;
      }
    );
    if (!existingParticipant) this.remoteParticipants.push(participant);
  }


  /**
   * @desc Searches an existing participant in the conversation's remote participants
   * and return it if it exists
   * @param {Identity} identity - The identity of the remote participant to be returned
   * @return {Participant}
   */
  getRemoteParticipant(identity) {
    var existingParticipant = this.remoteParticipants.find(
      function(remoteParticipant) {
        return remoteParticipant.identity == identity;
      }
    );
    if (existingParticipant) return existingParticipant;
    return null;
  }
}
