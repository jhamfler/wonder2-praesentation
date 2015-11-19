/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

define(function() {

  function callSingle(wonderInstance, recipient, conversation, demand) {
    return new Promise(function(resolve, reject) {
      console.log(conversation);
      // error handling
      if (typeof recipient !== 'string') return new Error('false type of recipient');

      // create remote identity and participant
      wonderInstance.localIdp.getIdentity(recipient)
      .then(function(identity) {
        var participant = new Participant(wonderInstance, identity);
        conversation.remoteParticipants.push(participant); // set the conversation's participants
        conversation.msgSrv = identity.msgSrv; // use the recipient's messaging server
        if (conversation.msgSrv == conversation.myParticipant.identity.msgSrv) {
          // remote identity exists on the same server as mine
          conversation.msgStub = conversation.myParticipant.identity.msgStub;
          console.log("[callSingle] already connected to the remote participants msgServer");
        } else {
          // if its another server create a new connection
          conversation.msgStub = new identity.msgStub.constructor; // use the remote identity's msgStub
          // connect the stub of the conversation to the remote server
          conversation.msgStub.connect(
            wonderInstance.myIdentity.rtcIdentity, // use my rtcIdentity to connect to the remote server
            participant.identity.credentials, // use the remote participants credentials for that
            participant.identity.msgSrv, // the destination messaging server
            function() { // successfully connected
              console.log('[callSingle] connected to REMOTE PARTICIPANTs msgServer');
              resolve(conversation.id);
              return conversation.id;
            }
          );
        }

        // set the conversation's messaging event handler for every message coming throuh the messaing server
        conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);
      })
      .catch(function(error) {
        reject(error);
      }) // Promise of getIdentity is over here

      // take the promise from getIdentity
      .then(function(conversationId) {
        // needs to be here when data audio and video are requested all together
        Demand.updateDemandDisallow(demand, {data:true})

        navigator.mediaDevices.getUserMedia(demand.out) // local participant demands video or audio to send
        .then(function(stream) {
          var evt = {
            type: RtcEvtType.onaddlocalstream,
            stream: stream
          }
          conversation.rtcEvtHandler.onEvt(evt);
          conversation.myParticipant.peerConnection.addStream(stream); // add the stream to the peer connection to send it later on
          conversation.myParticipant.peerConnection.createOffer( // create the sdp offer now for both participants
            function(offer) {
              console.log("[callSingle] offer from alice: ", offer.sdp);
              conversation.myParticipant.peerConnection.setLocalDescription( // now set the peer connection description
                offer, // with the local offer
                function() {
                  console.log("[callSingle] local description success");
                  var msg = MessageFactory.invitation( // create the message for the remote participant
                    conversation.myParticipant.identity,
                    conversation.remoteParticipants[0].identity,
                    conversation.id,
                    conversation.myParticipant.demand, // also send the demand so bob knows what to expect from alice
                    offer // include the sdp offer for bob
                  );
                  console.log(msg);
                  conversation.msgStub.sendMessage(msg); // and send the mesage
                },
                function(error) {
                  console.log(error);
                  reject(error);
                }
              );
            },
            function(error) {
              console.log(error);
              reject(error);
            }, {
              offerToReceiveAudio: 1,
              offerToReceiveVideo: 1
            }
          ); // create offer ends here
          resolve(conversation.id);
        })
        .catch(function(error) {
          reject(error);
          return error;
        }); // getUserMedia promise ends here

        resolve(conversation.id); // return the conversationId if everything went right
      })
      .catch(function(error) {
        reject(new Error('[callSingle] error:', error));
      }); // promise returned by getIdentity ends here

    }); // callSingle promise will be returned here
  }

  return callSingle; // necessary due to requireJS
});
