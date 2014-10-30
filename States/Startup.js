"use strict";

var g = window.g;

g.States.Startup = {
  preload: function() {
  },

  create: function() {
    g.fileManager.boot();  	
    this.game.state.start("Main");
  }
};
