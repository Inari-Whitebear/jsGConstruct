"use strict";

var g = window.g;

function NPC(game, x, y, level, image, frame) {
  Phaser.Sprite.call(this, game, x * g.tileWidth, y * g.tileHeight, image, frame);

  this.level = level;
  this.image = image;

  Object.define(this, "worldX", {
    get: function() { return this.x / 16; },
    set: function(newValue) { this.x = newValue * 16; }
  });

  Object.define(this, "worldY", {
    get: function() { return this.y / 16; },
    set: function(newValue) { this.y = newValue * 16; }
  });
}



module.exports = NPC;