var localVideo, remoteVideo, myIdentity, conversation;
var iceServers = { /* ... */ };

/* Definition of the constraints for the initial creation of the RTCPeerConnection,
in this example the conversation is requested with audio/video in both directions */
var constraints = [{
  constraints: "",
  type: ResourceType.AUDIO_VIDEO,
  direction: "in_out"
}];

function login() {
  var myRtcIdentity = document.getElementById('loginText').value;
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  var listener = this.onMessage.bind(this); // bind main event listener listener

  Idp.getInstance().createIdentity(myRtcIdentity, function(identity) { // create own Identity
    myIdentity = identity; // keep reference for later use
    myIdentity.resolve(function(stub) { // download and instantiate (own) MessagingStub
      stub.addListener(listener);
      stub.connect(myRtcIdentity, "", function() { // connect own Stub to own domain
        console.log("own stub connected");
      });
    });
  });
}

function doCall() {
  var peers = document.getElementById('callTo').value.split(";");
  conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), iceServers);
  var invitation {
    peers: peers
  };
  conversation.open(peers, constraints, invitation);
}

function onMessage(message) {
  switch (message.type) {
    case MessageType.BYE:
      localVideo.src = '';
      remoteVideo.src = '';
      conversation = null;
      break;
    case MessageType.INVITATION:
      var accept = confirm("Call from: " + message.from.rtcIdentity + " Accept?");
      if (accept == true) { //  Create new conversation object
        conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), iceServers, constraints);
        conversation.acceptInvitation(message);
      } else conversation.reject(message);
      break;
  }
};

function onRTCEvt(event, evt) {
  switch (event) {
    case 'onaddstream': attachMediaStream(remoteVideo, evt.stream);
      break;
    case 'onaddlocalstream': attachMediaStream(localVideo, evt.stream);
      break;
  }
};

function hangup() {
  localVideo.src = '';
  remoteVideo.src = '';
  conversation.bye();
  conversation = null;
}
