define(function(require, exports, module) {
  class MessagingStub_NodeJS {
    constructor() { // ...
      this.signalingServer = null;
      this.onMessage = null;
    } // ...
    connect(rtcIdentity, credentials, msgSrv, callback) {
      this.signalingServer = msgSrv;
      // ...
      this.websocket.onmessage = function(full_message) {
        var message = JSON.parse(full_message.data).body;
        that.onMessage(message);
      };
    }
  }
  return new MessagingStub_NodeJS();
});
