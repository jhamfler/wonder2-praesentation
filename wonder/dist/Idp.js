/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 */


'use strict';

/**
 * @class
 * @desc This class is the central class for resolving identities and exists only once in each wonder instance.
 * The Idp is a singleton object, there will always be just one instance of it, no matter how often the constructor is called.
 */
class Idp {
  /**
   * @constructor
   * @param {String} [remoteIdp] - The url string to a remote Idp.
   * @param {Identity} [myIdentity] - The own Identity
   */
  constructor(remoteIdp, myIdentity) {
    /**
     * @type {String|Object} remoteIdp
     * @desc The url string to a remote Idp or an string for a well-known IdP like 'webfinger'. Default: webfinger
     */
    this.remoteIdp = remoteIdp || 'webfinger';

    /**
     * @type {Array<Identity>} resolvedIdentities
     * @desc containing already known identities.
     */
    this.resolvedIdentities = [];

    /**
     * @type {String} messagingServer
     * @desc contains the url to the messaging server, which is received from the remote Idp.
     */
    this.messagingServer = null;

    /**
     * @type {Identity} myIdentity
     * @desc contains the identity of the local user
     */
    this.myIdentity = myIdentity;
  }


  /**
   * @desc Return an Identity by searching resolved ones XOR resolve them on the fly
   * @param {String} rtcIdentity - identity identifier to resolve an identity
   * @param {Object} credentials - additional credentials of the identity
   * @return {Promise<Identity>}
   */
  getIdentity(rtcIdentity, credentials) {
    var that = this;

    return new Promise(function(resolve, reject) {
      if (!rtcIdentity) reject(new Error('[Idp getIdentity] no rtcIdentity parameter'));

      // return the resolved identity if it exists
      for (var i = 0; i < that.resolvedIdentities.length; i++) {
        if (that.resolvedIdentities[i].rtcIdentity === rtcIdentity) {
          console.log('[Idp getIdentity] identity already exists in:', that.resolvedIdentities);
          resolve(that.resolvedIdentities[i]);
          return; // needs to be here because resolve isn't leaving the function
        }
      }


      // otherwise ask the remote idp
      that.askRemoteIdp(rtcIdentity, credentials)
        // both remote idp and msg download server answered correctly
        .then(function(identity) {
          if (identity) resolve(identity);
          else reject(new Error('[Idp getIdentity] no identity resolved from remote idp'));
        })
        // an error was thrown, possibly due to the network
        .catch(function(error) {
          reject(error);
        });

    });
  }



  /**
   * @desc Resolve an identity by asking the remote idp for information
   * @param {String} rtcIdentity - Identity identifier to resolve an identity from the remote idp
   * @param {Object} credentials - additional credentials of the identity
   * @return {Promise<Identity>}
   */
  askRemoteIdp(rtcIdentity, credentials) {
    var that = this;
    var localMsgStubUrl = null;
    var remoteMsgStubUrl = null;
    var messagingServer = null;
    var remoteMessagingServer = null;
    var codecs = {};

    return new Promise(function(resolve, reject) {
      if (!rtcIdentity) reject(new Error('[Idp askRemoteIdp] no rtcIdentity in parameter'));
      console.log('[Idp askRemoteIdp] asking remote Idp...');

      if (that.remoteIdp === 'webfinger') {
        require(['webfinger'], function() {
          askWebFinger();
        }, function(error) {
          reject(new Error('[Idp askRemoteIdp] webfinger not found', error));
        });
      } else askJsonpIdp();


      /**
       * askWebFinger will search for identities using the webfinger protocol
       */
      function askWebFinger() {
        // using the webfinger class
        var webfinger = new WebFinger({
          webfist_fallback: false, // defaults to false, fallback to webfist
          tls_only: false, // defaults to true
          uri_fallback: true, // defaults to false
          request_timeout: 10000, // defaults to 10000
        });

        webfinger.lookup(rtcIdentity, function(err, data) {
          if (err) {
            reject((new Error('[Idp askRemoteIdp] error: ', err.message)));
          } else {
            console.log('[Idp askRemoteIdp] found Webfinger entry for ' + rtcIdentity + ': ', data);

            /**
             * get the MessagingStub URL's
             * possibly there are different URL's for local and remote stubs depending on the domain
             */
            for (var val in data.object.properties) {
              if (data.object.properties[val] === 'localStub') localMsgStubUrl = val;
              if (data.object.properties[val] === 'remoteStub') remoteMsgStubUrl = val;
              if (data.object.properties[val] === 'messagingServer') messagingServer = val;
              if (data.object.properties[val] === 'messagingServer_remote') remoteMessagingServer = val;
              if (data.object.properties[val].substr(0, 5) == 'codec') {
                var codecKey = data.object.properties[val].substr(6); // cut 'codec_'
                codecs[codecKey] = val;
              }
            };
            console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);

            if ( remoteMsgStubUrl && remoteMessagingServer ) {
                var localDomain = that.myIdentity.split("@")[1];
                var requestedDomain = rtcIdentity.split("@")[1];
                if ( localDomain != requestedDomain ) {
                    console.log("[Idp askRemoteIdp] using remote MsgStub '" + remoteMsgStubUrl + "' for identity: " + rtcIdentity );
                    localMsgStubUrl = remoteMsgStubUrl;
                    messagingServer = remoteMessagingServer;
                }
            }

            that.getMsgStub(localMsgStubUrl)
              // successfully resolved the messaging stub
              .then(function(msgStub) {
                var identity = new Identity(rtcIdentity, that.remoteIdp, msgStub, localMsgStubUrl, messagingServer, codecs, credentials);
                that.resolvedIdentities.push(identity); // store identity in array
                resolve(identity); // return the identity
              })
              // failed to resolve the messaging stub
              .catch(function(error) {
                reject(error);
              });
          }
        });
      }


      /**
       * askOtherIdp is trying to connect to an IdP using the given IdP-options
       */
      function askJsonpIdp() {
        require([that.remoteIdp + rtcIdentity],
          // successfully received the identity
          function(data) {
            console.log('[Idp askJsonpIdp] remote idp answered: ', data);
            localMsgStubUrl = data.rows[0].messagingStubURL;
            messagingServer = data.rows[0].messagingServer;
            codecs = {};

            for (val in data.rows[0]) {
              if (val.substr(0, 5) === 'codec') {
                var codecKey = val.substr(6); // cut 'codec_'
                codecs[codecKey] = data.rows[0][val];
                console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);
              }
            }

            that.getMsgStub(localMsgStubUrl)
              // successfully resolved the messaging stub
              .then(function(msgStub) {
                var identity = new Identity(rtcIdentity, that.remoteIdp, msgStub, localMsgStubUrl, messagingServer, codecs, credentials);
                that.resolvedIdentities.push(identity); // store identity in the idp
                resolve(identity); // return the identity
              })
              // failed to resolve the messaging stub
              .catch(function(error) {
                reject(new Error('[Idp askJsonpIdp] the messaging stub could not be loaded for ' + rtcIdentity + ': ', error));
              });
          },
          // failed to receive the identity
          function(error) {
            reject(new Error('[Idp askJsonpIdp] the identity could not be resolved from remote idp: ', error));
          }
        );
      }


    });
  }



  /**
   * @desc Resolve a messaging stub by asking a stub providing server
   * @param {string} localMsgStubUrl - URL to a messaging stub for a specific messaging server
   * @return {MessagingStub}
   */
  getMsgStub(localMsgStubUrl) {
    var that = this;
    console.log('[Idp getMsgStub] asking stub server for an implementation: ', localMsgStubUrl);

    return new Promise(function(resolve, reject) {
      require([localMsgStubUrl],
        // successfully received the messaging stub
        function(msgStub) {
          console.log('[Idp getMsgStub] received stub: ', msgStub);
          resolve(msgStub);
        },
        // messaging stub download failed
        function(error) {
          reject(Error('[Idp getMsgStub] messaging stub could not be retrieved from URL; possibly a malformed URL or the server is unreachable: ', error));
        }
      );
    });
  }
}
