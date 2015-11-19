/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

/**
 * @class
 * @desc This class is an event handler for events coming from a RTCDataChannel.
 */
class DataChannelEvtHandler {
  /**
   * @constructor
   * @param {WONDER} wonderInstance - A reference to the instance of the WONDER class to which the DataChannelEvtHandler is related
   * @param {Conversation} conversation - An reference to the instance of the Conversation class to which the DataChannelEvtHandler is related
   * @example var dataChannelEvtHandler = new DataChannelEvtHandler(wonderIntance, conversation);
   */
  constructor(wonderInstance, conversation) {
    /**
     * @type {WONDER} wonderInstance
     * @desc A reference to the wonder instance on which the data channel event handler is used
     */
    this.wonderInstance = wonderInstance;

    /**
     * @type {Conversation} conversation
     * @desc A reference to the conversation the data channel event handler is present on
     */
    this.conversation = conversation;

    /**
     * @type {RTCDataChannel} dataChannel
     * @desc A reference to the data channel for which the data channel event handler handles events
     */
    this.dataChannel;
  }


  /**
   * @desc This function processes the events of a data channel.
   * Is is ment to be called after the events were processed by the datachannel's codec
   * but could also be used directly on the datachannel without a codec.
   * @param {Object} evt - The Event originationg from a RTCDataChannel
   * @example // usage without the codec inbetween
   * var dataChannel = peerConnection.createDataChannel(guid());
   * dataChannel.onmessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
   * @example // usage with the codec inbetween
   * codec.dataChannel = peerConnection.createDataChannel(guid());
   * codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
   * codec.onMessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
   */
  onEvt(evt) { // getting the conversation from the constructor doesnt work as on
    var that = this;
    console.log("[DataChannelEvtHandler] event:", evt);

    switch (evt.type) {
      case DataChannelEvtType.onopen:
        //console.log("this should be never ever called");
        console.log('[DataChannelEvtHandler onEvt] onopen', evt);
        // if the data channel is established the onmessage listener can be called
        //if (that.dataChannel.readyState === 'open') that.dataChannel.onmessage = that.onEvt;
        if (dataChannel.readyState === 'open') dataChannel.onmessage = that.onEvt;
        //if (that.conversation.dc.readyState === 'open') that.conversation.dc.onmessage = that.onEvt;
        break;

      case DataChannelEvtType.onclose:
        console.log('[DataChannelEvtHandler onEvt] onclose', evt);
        break;

      case DataChannelEvtType.ondatachannel:
        console.log('[DataChannelEvtHandler onEvt] ondatachannel', evt);
        break;

      case DataChannelEvtType.onmessage:
        console.log('[DataChannelEvtHandler onEvt] onmessage', evt);

        break;

      default:
        console.log('[DataChannelEvtHandler onEvt] default', evt);
        break;
    }

    this.wonderInstance.onDataChannelEvt(evt);
  }


}
