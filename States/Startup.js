"use strict";

var g = window.g;

g.States.Startup = {
  preload: function() {
    this.game.load.image("pics1","pics1.png");
    this.game.load.image("block","block.png");
  },

  create: function() {
    this.game.state.start("Main");
  }
};
