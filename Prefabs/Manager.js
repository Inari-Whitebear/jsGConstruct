"use strict";

var fs = require("fs");

var g = window.g;

function Manager(game) {
  this.game = game;
  this.files = [];
}

Manager.prototype.open = function(path) {
  var contents = fs.readFileSync(path, {encoding: "utf8"});

  var level = new g.Prefabs.Level(this.game, path, contents);
  this.files.push(level);

  level.create();
  level.show();
};

module.exports = Manager;
