/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class represents a participant of a conversation.
 * Identities can be stored in multiple participants but participants
 * with the same identity cannot be in the same conversation.
 */
class Participant {
  /**
   * @constructor
   * @param {WONDER} wonderInstance - The instance of the WONDER class used as a backreference
   * @param {Identity} identity - The identity of the participant
   * @param {Demand} demand - The resources a participant demands for the communication
   */
  constructor(wonderInstance, identity, demand) {
    /**
     * @type {WONDER} wonderInstance
     * @desc Backreference to the WONDER instance
     */
    this.wonderInstance = wonderInstance;

    /**
     * @type {Identity} identity
     * @desc The identity of the participant
     */
    this.identity = identity;

    /**
     * @type {Demand} demand
     * @desc The resources a participant demands for the communication
     */
    this.demand = new Demand(demand);

    /**
     * @type {RTCPeerConnection} peerConnection
     * @desc Used to hold the RTCPeerConnection to this participant
     */
    this.peerConnection = null;
  }

  /**
   * @desc Returns the RtcPeerConnection of this participant
   * @return {RTCPeerConnection}
   */
  getRtcPeerConnection() {
    return this.peerConnection;
  }

  /**
   * @desc Sets the RtcPeerConnection of this participant
   * @param {RTCPeerConnection} rtcPeerConnection - The rtcPeerConnection to be set for this participant
   */
  setRtcPeerConnection(rtcPeerConnection) {
    this.peerConnection = rtcPeerConnection;
    this.peerConnection.onaddstream = this.wonderInstance.conversations[0].rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.onicecandidate = this.wonderInstance.conversations[0].rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.onIceStateChange = this.wonderInstance.conversations[0].rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
  }

  /**
   * @desc This function updates the demand by adding the new demand to the existing demand
   * @param {Demand} demand - The demand to be included in the currently stored demand
   * @TODO rename the function to addDemand
   */
  updateDemand(demand) {
    this.demand = Demand.updateDemandAllow(this.demand, demand);
  }
}
