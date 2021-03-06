/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

define(function() {

  function dataChannel(wonderInstance, recipient, conversation, payloadType) {
    return new Promise(function(resolve, reject) {

      console.log('[dataChannel] establishing data channel to', recipient, 'with', conversation.myParticipant.demand, 'payloadType=',payloadType);

      if (typeof recipient !== 'string') return new Error('false type of recipient');

      // create remote identity and participant
      wonderInstance.localIdp.getIdentity(recipient)
      .then(function(identity) {

        // check if the remote participant exists
        var participant = conversation.getRemoteParticipant(identity);

        // if a Data-Channel to that participant/identity wasn't created already
        if (!participant) {
          participant = new Participant(wonderInstance, identity, {in:{data: payloadType}, out:{data:payloadType}}); // create a new participant
          conversation.addRemoteParticipant(participant); // set the conversation's participants
          conversation.msgSrv = identity.msgSrv; // use the recipient's messaging server
        }

        // check if we are already on the same messaging server as the remote participant
        if (conversation.msgSrv == conversation.myParticipant.identity.msgSrv) {
          // remote identity exists on the same server as mine
          conversation.msgStub = conversation.myParticipant.identity.msgStub; // so use my connection
          console.log("[dataChannel] already connected to the remote participants msgServer");
          resolve();
        } else {
          // if it is another server then create a new connection
          conversation.msgStub = new identity.msgStub.constructor; // use the remote identity's msgStub

          // connect the stub of the conversation to the remote server
          conversation.msgStub.connect(
            wonderInstance.myIdentity.rtcIdentity, // use my rtcIdentity to connect to the remote server
            participant.identity.credentials, // use the remote participants credentials for that
            participant.identity.msgSrv, // the destination messaging server
            function() { // successfully connected
              console.log('[dataChannel] connected to remote participants msgServer');
              resolve();
            }
          );
        }
        return identity; // pass identity to next .then-function
      })
      .catch(function(error) {
        reject(error);
      }) // promise of getIdentity is over here

      // take the promise from getIdentity
      .then(function(identity) {
        require(["DataChannelBroker"],
          // successfully received the DataChannelBroker
          function(dataChannelBroker) {
            // set the conversation's messaging event handler for every message coming through the messaing server
            conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);

            // assign the dataChannelBroker to the conversation for later reference
            conversation.dataChannelBroker = dataChannelBroker;

            // create a new data channel handler for every data channel
            var dataChannelEvtHandler = new DataChannelEvtHandler(wonderInstance, conversation);

            // download a new codec; add it to the broker; add the event handler to the codec
            dataChannelBroker.addDataChannelCodec(
              conversation.myParticipant.identity, // from me
              identity, // to the remote participant
              payloadType, // with the codec of the remote participant || or plain
              dataChannelEvtHandler // and the handler of the channel
            )
            .then(function(codec){
              // get the codec
              var codec = dataChannelBroker.getDataChannelCodec(conversation.myParticipant.identity, identity, payloadType);

              // overwrite the codec with the help of its constructor
              codec.dataChannel = conversation.myParticipant.peerConnection.createDataChannel(guid()); // create the datachannel and assign it to the codec
              codec.dataChannel.payloadType = payloadType;
              codec.onMessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler); // register the handler which will receive the message after the codec is finished decoding the message
              codec.from = conversation.myParticipant.identity; // tell the codec from whom messages are coming to be sent over the channel
              codec.to = identity; // tell the codec who the receiver is, can be helpful i.e. for chat communication

              // also register the dataChannel in its handler for easier reference
              dataChannelEvtHandler.dataChannel = codec.dataChannel;

              // override the functions which may be defined in the required codec to standard ones for correct functionality
              // when the data channel is ready then assign the codec's onDataMessage function to the channel
              codec.dataChannel.onopen = function(evt) {
                if (codec.dataChannel.readyState === 'open') codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
              }

              // register the data channel handler and bind its class as "this" inside the function
              codec.dataChannel.onclose = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
              // attach the data channel to the conversation for testing
              //conversation.dc = codec.dataChannel; // TODO: THIS NEEDS TO BE HANDELED LATER ON!!!!

              // TODO: THIS NEEDS TO BE DONE EVERY TIME A PEERCONNECTION IS CREATED
              // ondatachannel is a rtcEvent and therefore needs to be handled there
              conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

              conversation.myParticipant.peerConnection.createOffer( // create the sdp offer now for both participants
                function(offer) {
                  console.log("[dataChannel createOffer] offer from alice: ", offer.sdp);
                  conversation.myParticipant.peerConnection.setLocalDescription( // now set the peer connection description
                    offer, // with the local offer
                    function() {
                      console.log("[dataChannel createOffer] local description success");
                    },
                    function(error) {
                      console.log(error);
                      reject(error);
                    }
                  );

                  var msg = MessageFactory.invitation( // create the message for the remote participant
                    conversation.myParticipant.identity,
                    conversation.remoteParticipants[0].identity,
                    conversation.id,
                    conversation.remoteParticipants[0].demand, // also send the demand so bob knows what to expect from alice
                    offer // include the sdp offer for bob
                  );
                  conversation.msgStub.sendMessage(msg); // and send the message
                },
                function(error) {
                  console.log(error);
                  reject(error);
                }
              ); // create offer ends here

              resolve(conversation.id); // return the conversationId if everything went right
            },
            // DataChannelBroker download failed
            function(error) {
              reject(Error('[dataChannel] dataChannelBroker requiring failed: ', error));
            }
          );
        }) // addDataChannelCodec promise ends here
        .catch(function(error){
          console.error(error);
        });
      })
      .catch(function(error) {
        reject(new Error('dataChannel: ', error));
      }); // promise returned by getIdentity ends here


    });
  }

  return dataChannel;
});
