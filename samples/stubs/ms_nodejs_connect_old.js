define("MessagingStub_NodeJS", function (require, exports, module) {
  function Stub() { // ...
    this.signaling_server = module.config().connectURL;
  } // ...
  Stub.prototype.connect = function (rtcIdentity, credentials, callback) {
    // ...
    this.websocket.onmessage = function (message) {
      var msg = JSON.parse(msg.data).body;
      Idp.getInstance().createIdentity(msg.from, function (identity) {
        msg.from = identity;
        Idp.getInstance().createIdentities(msg.to, function (identityArr) {
          msg.to = identityArr;
          that.baseStub.sendOtherMessages(msg);
        });
      });
    };
  }
  return new Stub();
});
