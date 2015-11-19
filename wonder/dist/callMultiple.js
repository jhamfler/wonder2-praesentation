/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */

'use strict';

define(function() {
  function callMultiple(wonderInstance, recipients, conversation) {
    return new Promise(function(resolve, reject) {

      console.log('[callMultiple] Multiparty call to', recipients, 'with', demand);

      if (typeof recipients !== 'array') return new Error('false type of recipients');

      // create remote identity and participant
      wonderInstance.localIdp.getIdentity(recipients)
        .then(function(identities) {
          conversation.owner = conversation.myParticipant; // set me to the owner as i started the conversation

          for (var i = 0; i < identities.length; i++) {
            var participant = new Participant(wonderInstance, identities[i]);
            conversation.remoteParticipants.push(participant); // set the conversation's participants
          }
          resolve(conversation);
        })
        .catch(function(error) {
          reject(new Error('[callMultiple] error: ', error));
        });
    });
  }

  return callMultiple;
});
