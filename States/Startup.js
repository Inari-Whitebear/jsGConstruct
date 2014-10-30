"use strict";

var g = window.g;

g.States.Startup = {
  preload: function() {
  	this.game.load.image("missing", "missing.png");
  },

  create: function() {
    g.fileManager.boot();  	
    this.game.state.start("Main");
  }
};
