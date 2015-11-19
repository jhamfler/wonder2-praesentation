/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class is an event handler vor events coming from a peer connection
 */
class RtcEvtHandler {
  /**
   * @constructor
   * @param {WONDER} wonderInstance - The instance of the WONDER class used as a backreference
   * @param {Conversation} conversation - An reference to the corresponding conversation
   */
  constructor(wonderInstance, conversation) {
    /**
     * @type {WONDER} wonderInstance
     * @desc Backreference to the wonder instance
     */
    this.wonderInstance = wonderInstance;

    /**
     * @type {Conversation} conversation
     * @desc An reference to the corresponding conversation
     */
    this.conversation = conversation;

    /**
     * @type {Array} msgbuf
     * @desc An array for buffering ICE candidate messages before they are sent
     */
    this.msgbuf = [];
  }


  /**
   * @desc This event handler processes events coming from a peer connection.
   * @param {Object} evt - an event containing the RTC events
   * @example
   * participant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);
   * @TODO The event handler should be in the participant as the peer connection is also there.
   */
  onEvt(evt) {
    var that = this;

    switch (evt.type) {
      case RtcEvtType.onaddstream:
        console.log('[RtcEvtHandler onEvt] onaddstream!', evt);
        break;

      case RtcEvtType.onaddlocalstream:
        console.log('[RtcEvtHandler onEvt] onaddlocalstream', evt);
        break;

      case RtcEvtType.onnegotiationneeded:
        console.log('[RtcEvtHandler onEvt] onnegotiationneeded', evt);
        that.conversation.myParticipant.peerConnection.createOffer(
          function(offer) {
            that.conversation.myParticipant.peerConnection.setLocalDescription(
              offer,
              function() {
                var msg = MessageFactory.updateSdp(
                  that.conversation.myParticipant.identity,
                  that.conversation.remoteParticipants[0].identity,
                  that.conversation.id,
                  offer
                );
                that.conversation.msgStub.sendMessage(msg);
              },
              errorHandler
            );
          },
          errorHandler
        );
        break;

      case RtcEvtType.onicecandidate:
        console.log('[RtcEvtHandler onEvt] icecandidate: ', evt);
        // candidate exists in e.candidate
        // its triggered when the local machine wants ice

        if (!evt.candidate) return; // when there is no ice candidate present we cannot establish a connection (STUN/TURN needed); or it is the last candidate
        console.log('[RtcEvtHandler onEvt] conversation: ', this.conversation);
        console.log(evt);

        var newcandidate = new RTCIceCandidate({ // @TODO remove this and test it
          sdpMLineIndex: 0,
          candidate: evt.candidate.candidate,
          sdpMid: evt.candidate.sdpMid
        });

        var msg = MessageFactory.updateIceCandidates(
          that.conversation.myParticipant.identity,
          that.conversation.remoteParticipants[0].identity,
          that.conversation.id,
          evt.candidate
        ); // create a message with the icecandidates in it

        if (that.conversation.msgEvtHandler.ice) { // send directly when allowed
          that.conversation.msgStub.sendMessage(msg);
          // and all others
          for (var i = that.msgbuf.length - 1; i >= 0; i--) {
            that.conversation.msgStub.sendMessage(that.msgbuf[i]);
            that.msgbuf.splice(i, 1);
          }
        } else {
          that.msgbuf.push(msg);
        }
        break;

      case RtcEvtType.onsignalingstatechange:
        console.log('[RtcEvtHandler onEvt] onsignalingstatechange', evt);
        break;

      case RtcEvtType.onremovestream:
        console.log('[RtcEvtHandler onEvt] onremovestream', evt);

        break;

      case RtcEvtType.oniceconnectionstatechange:
        console.log("[RtcEvtHandler onEvt] iceConnectionStatechange NOW: ", evt);
        break;

      case RtcEvtType.ondatachannel:
        console.log('[RtcEvtHandler onEvt] ondatachannel', evt);
        if (that.conversation.dataChannelEvtHandler)
          evt.channel.onmessage = that.conversation.dataChannelEvtHandler.onEvt.bind(that.conversation.dataChannelEvtHandler);
        else {
          // @TODO remove static link to the participant, get it more dynamically to support multiparty conversations
          console.log("that.conversation.remoteParticipants[0].demand",that.conversation.remoteParticipants[0].demand);
          console.log(that.conversation.remoteParticipants[0].demand.out.data);
          var codec = that.conversation.dataChannelBroker.getDataChannelCodec(
            that.conversation.myParticipant.identity,
            that.conversation.remoteParticipants[0].identity,
            that.conversation.remoteParticipants[0].demand.out.data
          );
          evt.channel.onmessage = codec.onDataMessage.bind(codec);
          evt.channel.payloadType = that.conversation.remoteParticipants[0].demand.out.data;
        }
        break;

      default:
        console.log('[RtcEvtHandler onEvt] default', evt);
        break;
    }

    this.wonderInstance.onRtcEvt(evt);
  }

}
