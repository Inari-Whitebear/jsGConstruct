"use strict";

var g = window.g;

g.NWTools = {
  parseNWDataString: function(nwString) {
    var data = {};
    data.layers = [];

    data.layers.push({});

    return data;
  },

  getNWDataString: function(level) {
    var output = "GLEVNW01";

    return output;
  }
};
