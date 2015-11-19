var demand = true; // 1.) Boolean
var demand = "audio"; // 2.) String
var demand = [ "audio","video" /* ... */ ]; // 3.) Array of strings
var demand = { audio: true, video: true /* ... */ }; // 4.) Object
var demand = { // 4.) Object with addition requirements
  video: {
    mandatory: { maxWidth: "1920" /* ... */ },
    optional:  [ { minFrameRate: "60"}, /* ... */ ]
  }
};
var demand = { // 6.) object with in/out-requirements
  in :  { audio: true, video: { /* ... */ } },
  out : { audio: true }
};
