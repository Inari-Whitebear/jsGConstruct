"use strict";

var g = window.g;

module.exports = function(game) {
  require("./Startup.js");
  require("./Main.js");

  game.state.add("Startup", g.States.Startup);
  game.state.add("Main", g.States.Main);
};
