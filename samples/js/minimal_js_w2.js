wonder.config = { idp: 'webfinger', autoAccept: false, ice: [ /* ice-servers */] }

wonder.login('alice@example.com', null);

wonder.logout();

wonder.call(recipient.value, { audio: true, video: true } );

wonder.call(recipient.value, 'audio');

wonder.call(recipient.value, {data: PayloadType.chat})
  .then(function(){
    wonder.dataChannelMsg(msg, PayloadType.chat);
  });

wonder.onMessage = function(msg, conversationId){
  switch (msg.type) {
    case MessageType.invitation:
      var confirmDialog = confirm('Call from '+msg.from+'. Accept?');
      confirmDialog == true ? wonder.answerRequest(msg, true) : wonder.answerRequest(msg, false);
      break;
    case MessageType.accepted: // do sth after call was accepted
      break;
    default: console.log(msg.type); // more types are available
  }
}

wonder.onRtcEvt = function(evt, conversationId){
  switch (evt.type) {
    case RtcEvtType.onaddstream: attachMediaStream(document.getElementById('remoteVideo'), evt.stream);
      break;
    case RtcEvtType.onaddlocalstream: attachMediaStream(document.getElementById('localVideo'), evt.stream);
      break;
    default: console.log(evt.type); // more types are available
  }
}

wonder.onDataChannelEvt = function(evt, conversationId){
  switch (evt.type) {
    case DataChannelEvtType.onmessage: // handle received message
      break;
    default: console.log(evt.type); // more types are available
  }
}
