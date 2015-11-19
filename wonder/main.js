/**
 * @desc WONDER example application
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

 setTimeout(function() {


   /**
   * global variables
   */
   var conversation = null;
   var filesToSend = null;
   var chatDataChannelCreated = false;
   var fileDataChannelCreated = false;
   var ImageDataChannelCreated = false;
   var msgQueue = [];

   /**
   * get buttons
   */
   var loginbtn = document.getElementById('loginBtn');
   var imsloginBtn = document.getElementById('imsLoginBtn');
   var logoutbtn = document.getElementById('logoutBtn');
   var videoBtn = document.getElementById('videoCallBtn');
   var audioBtn = document.getElementById('audioCallBtn');
   var msgBtn = document.getElementById('sendMessageBtn');
   var sendFileBtn = document.getElementById('sendFile');
   var sendImageBtn = document.getElementById('sendImage');


   /**
   * get inputs
   */
   var loginname = document.getElementById('loginInput');
   var recipient = document.getElementById('recipient');
   var msgInput = document.getElementById('messageText');
   var fileInput = document.getElementById('fileInput');


   /**
   * get video elements
   */
   var localVideo = document.getElementById('localVideo');
   var remoteVideo = document.getElementById('remoteVideo');


   /**
   * get video elements
   */
   var chatBox = document.getElementById('chatView');

   wonder.config = config.wonder;


   /**
   * common login
   */
   if(loginbtn){
    loginbtn.onclick = function() {
      login();
    }
   }

   /**
   * ims login
   */
   if(imsloginBtn){
    imsloginBtn.onclick = function() {
      var credentials = {};
      var IMSprivateID = document.getElementById('loginInput').value;
      var IMSpublicID = document.getElementById('imsPublicId').value;
      var IMSpassword = document.getElementById('imsPass').value;
      var IMSproxy = document.getElementById('imsProxy').value;

      credentials.user = IMSprivateID.split(':')[0];
      credentials.realm = credentials.user.split('@')[1];
      credentials.pubID = 'sip:' + IMSpublicID + '@' + credentials.realm;
      credentials.role = '';
      credentials.pass = IMSpassword;
      credentials.pcscf = IMSproxy;

      console.log(credentials);
      login(credentials);
    }
   }


   /**
   * Functions
   */
   function login(credentials){
    console.log('login...');

    // login only with username
    wonder.login(loginname.value, credentials)
      .then(function(data) {
        //
      })
      .catch(function(error) {
        console.log(error);
      });


      wonder.onMessage = function(msg, conversationId){
        switch (msg.type) {
          case MessageType.invitation:
            console.log('[main] Message invitation:', msg, conversationId);

            if(!wonder.config.autoAccept) {
              var confirmDialog = confirm('Call from '+msg.from+'. Would you like to accept?');
              if (confirmDialog == true) {
                  wonder.answerRequest(msg, true).then(function(){
                    console.log('[main] Message invitation: user accepted invtitation');
                  });
              } else {
                  wonder.answerRequest(msg, false).then(function(){
                    console.log('[main] Message invitation: user declined invtitation');
                  });
              }
            }
            break;

          case MessageType.accepted:
            console.log('[main] Message accepted:', msg, conversationId);
            if(msg.misc.demand.in.data || msg.misc.demand.out.data) {
              if(msg.misc.demand.in.data == PayloadType.chat) chatDataChannelCreated = true;
              else if(msg.misc.demand.in.data == PayloadType.file) fileDataChannelCreated = true;
              else if(msg.misc.demand.in.data == PayloadType.image) imageDataChannelCreated = true;
              else console.error("[main] Message accepted: PayloadType unknown");
            }

            break;

          case MessageType.declined:
            console.log('[main] Message declined:', msg, conversationId);
            break;

          case MessageType.bye:
            console.log('[main] Message: bye', msg, conversationId);
            break;

          case MessageType.update:
            console.log('[main] Message: update', msg, conversationId);
            break;

          case MessageType.updateSdp:
            console.log('[main] Message: updateSdp', msg, conversationId);
            break;

          case MessageType.updated:
            console.log('[main] Message: updated', msg, conversationId);
            break;

          case MessageType.connectivityCandidate:
            console.log('[main] Message: connectivityCandidate', msg, conversationId);
            break;

          case MessageType.message:
            console.log('[main] Message: message', msg, conversationId);
            break;

          default:
            console.log('[main] Message default:', msg, conversationId);
            break;
        }
      }

      wonder.onRtcEvt = function(evt, conversationId){
        switch (evt.type) {
          case RtcEvtType.onaddstream:
            console.log('[main] RtcEvt onaddstream:', evt, conversationId);
            document.getElementById('remoteVideo').addEventListener(
              'loadedmetadata',
              function() {
                console.log('Remote video videoWidth: ' + this.videoWidth + 'px,  videoHeight: ' + this.videoHeight + 'px');
              }
            );
            attachMediaStream(document.getElementById('remoteVideo'), evt.stream);
            break;

          case RtcEvtType.onaddlocalstream:
            console.log('[main] RtcEvt onaddlocalstream:', evt, conversationId);
            attachMediaStream(document.getElementById('localVideo'), evt.stream);
            break;

          case RtcEvtType.onResourceParticipantAddedEvt:
            console.log('[main] RtcEvt onResourceParticipantAddedEvt:', evt, conversationId);
            break;

          case RtcEvtType.onnegotiationneeded:
            console.log('[main] RtcEvt onnegotiationneeded:', evt, conversationId);
            break;

          case RtcEvtType.onicecandidate:
            console.log('[main] RtcEvt onicecandidate:', evt, conversationId);
            break;

          case RtcEvtType.onsignalingstatechange:
            console.log('[main] RtcEvt onsignalingstatechange:', evt, conversationId);
            break;

          case RtcEvtType.onremovestream:
            console.log('[main] RtcEvt onremovestream:', evt, conversationId);
            break;

          case RtcEvtType.oniceconnectionstatechange:
            console.log('[main] RtcEvt oniceconnectionstatechange:', evt, conversationId);
            break;

          case RtcEvtType.ondatachannel:
            console.log('[main] RtcEvt ondatachannel:', evt, conversationId);
            if(evt.channel.payloadType) sendMessages(evt.channel.payloadType); // send messages
            else console.error("payloadType unknown");
            break;

          default:
            console.log('[main] RtcEvt default:', evt, conversationId);
            break;
        }
      }

      wonder.onDataChannelEvt = function(evt, conversationId){
        switch (evt.type) {
          case DataChannelEvtType.onopen:
            console.log('[main] DataChannelEvt onopen:', evt, conversationId);
            break;

          case DataChannelEvtType.onclose:
            console.log('[main] DataChannelEvt onclose:', evt, conversationId);
            break;

          case DataChannelEvtType.ondatachannel:
            console.log('[main] DataChannelEvt ondatachannel:', evt, conversationId);
            break;

          case DataChannelEvtType.onmessage:
            console.log('[main] DataChannelEvt onmessage:', evt, conversationId);
            if(evt.target.payloadType == PayloadType.chat) {
              var parsedData = JSON.parse(evt.data);
              var chatBoxElement = document.createElement('p');
              chatBoxElement.innerHTML = parsedData.from + ': ' + parsedData.content;
              chatBox.appendChild(chatBoxElement);
            }
            else if(evt.target.payloadType == PayloadType.image){
              var img = document.createElement('img');
              img.src = evt.data;
              console.log(img, chatBox);
              chatBox.appendChild(img);
            }
            break;

          default:
            console.log('[main] DataChannelEvt default:', evt, conversationId);
            break;
        }
      }

   }

   logoutbtn.onclick = function() {
    console.log('logout...');

    // login only with username
    wonder.logout()
      .then(function(data) {
        console.log();
      })
      .catch(function(error) {
        console.log(error);
      });

   }




   videoBtn.onclick = function() {
    console.log('start video call...');

    var complexDemand = {
      'video': {
        'mandatory': {
          'maxWidth': '1920',
          'maxHeight': '1080',
          'minAspectRatio': '1.77',
          'minFrameRate': '3',
          'maxFrameRate': '64'
        },
        'optional': [{
          'minFrameRate': '60'
        }, {
          'maxWidth': '640'
        }, {
          'maxHeigth': '480'
        }]
      },
      audio: true
    };
   /*
   var complexDemand = {
    'in' : {
      'video': {
        'mandatory': {
          'maxWidth': '1920',
          'maxHeight': '1080',
          'minAspectRatio': '1.77',
          'minFrameRate': '3',
          'maxFrameRate': '64'
        },
        'optional': [{
          'minFrameRate': '60'
        }, {
          'maxWidth': '640'
        }, {
          'maxHeigth': '480'
        }]
      }
    },
    'out' : {
      'video': {
        'mandatory': {
          'maxWidth': '1280',
          'maxHeight': '720',
          'minAspectRatio': '1.77',
          'minFrameRate': '2',
          'maxFrameRate': '32'
        },
        'optional': [{
          'minFrameRate': '60'
        }, {
          'maxWidth': '640'
        }, {
          'maxHeigth': '480'
        }]
      }
    }
   };
   */
    wonder.call(recipient.value, complexDemand);
   }

   audioBtn.onclick = function() {
    console.log('start audio call...');

    wonder.call(recipient.value, 'audio');
   }



   /**
   * data channel operations
   */
   msgBtn.onclick = function() {
    console.log('message to send: ', msgInput.value);

    var msg = {
      from: loginname.value,
      to: recipient.value,
      content: msgInput.value
    }

    msgQueue.push(msg); // queue messages

    if(!chatDataChannelCreated){ // establish dataChannel first
      wonder.call(recipient.value, {data: PayloadType.chat})
      .then(function(){
        sendMessages(PayloadType.chat);
      });
    } else {
      sendMessages(PayloadType.chat);
    }

    var chatBoxElement = document.createElement('p');
    chatBoxElement.innerHTML = loginname.value + ': ' + msgInput.value;
    chatBox.appendChild(chatBoxElement);
   }

   sendFileBtn.onclick = function() {
    console.log('files to send: ', filesToSend);

    var msg = {
      from: loginname.value,
      to: recipient.value,
      files: filesToSend
    }

    if(!fileDataChannelCreated){ // establish dataChannel first
      wonder.call(recipient.value, {data: PayloadType.file}).then(function(){
        sendMessages(PayloadType.file);
      });
    } else {
      sendMessages(PayloadType.file);
    }
   }

   sendImageBtn.onclick = function() {
    console.log('Images to send: ', filesToSend);

    var msg = {
      from: loginname.value,
      to: recipient.value,
      images: filesToSend
    }

    msgQueue.push(msg); // queue messages

    if(!ImageDataChannelCreated){ // establish dataChannel first
      wonder.call(recipient.value, {data: PayloadType.image}).then(function(){
        sendMessages(PayloadType.image);
      });
    } else {
      sendMessages(PayloadType.image);
    }
   }


   function sendMessages(payloadType){
    if(msgQueue.length > 0){
      wonder.dataChannelMsg(msgQueue[0], payloadType)
      .then(function(){
        msgQueue.splice(0, 1); // delete this element
        sendMessages(payloadType); // send next message
      });
    }
   }




   /**
   * onChange function for file input changes
   */
   fileInput.onchange = function() {
    console.log('file input changed', this.files);

    filesToSend = this.files; // files as an array
   };


   login(); // automatic login

 }, 2000);
