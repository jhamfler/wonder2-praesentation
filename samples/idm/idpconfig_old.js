function Idp(rtcIdentity, options) { // constructor
  if (!options) {
    if (typeof idp_options != 'undefined') options = idp_options;
    else options = {};
  }
  // ...
  this.domain = options.domain || '127.0.0.1';
  this.protocol = options.protocol || 'http';
  this.wsQuery = options.wsQuery;
  this.port = options.port || '28017';
  this.path = options.path || '/webrtc/users/?jsonp=returnIdentity&filter_rtcIdentity=';
  if (this.path.indexOf('/') != 0) this.path = "/" + this.path;
  // ...
}
