"use strict";

var g = window.g;

function Level(game, levelName, data, width, height) {
  if (width == null) { width = g.levelWidth; }
  if (height == null) { height = g.levelHeight; }

  this.width = width;
  this.height = height;
  this.levelName = levelName;
  this.game = game;

  this.data = {};
  this.visible = false;
  this.layers = new Phaser.Group(game, null);
  this.npcs = new Phaser.Group(game, null);
  this.loaded = false;
  this.dataLoaded = false;
  this.tileMap = new Phaser.Tilemap(game, null, g.tileWidth, g.tileHeight, this.width, this.height);

  this.tileMap.setPreventRecalculate(true);

  if (data != null)
    this.loadFrom(data);
  //this.layers.push(new g.Prefabs.LevelLayer(this, 0));
}

Level.prototype.loadFrom = function(dataString) {
  this.data = g.NWTools.parseNWDataString(dataString);
  this.dataLoaded = true;
};

Level.prototype.save = function() {

};

Level.prototype.show = function() {
  this.visible = true;
  this.game.world.add(this.layers);
};

Level.prototype.placeTiles = function(x, y, tileArray, layer) {
  for (var tX = 0, tXL = tileArray.length; tX < tXL; tX++) {
    for (var tY = 0, tYL = tileArray[0].length; tY < tYL; tY++) {
      this.tileMap.putTile(tileArray[tX][tY], tX + x, tY + y, layer);
    }
  }
};

Level.prototype.hide = function() {
  this.visible = false;
  this.game.world.remove(this.layers);
};

Level.prototype.create = function() {
  if (!this.dataLoaded) {
    this.data = g.NWTools.createBlankNW();
    this.dataLoaded = true;
  }

  this.loaded = true;

  for (var i = 0, l = this.data.layers.length; i < l; i++) {
    var layer = this.tileMap.createBlankLayer("layer_" + i, this.width, this.height, g.tileWidth, g.tileHeight, this.layers);
    if (i === 0) {
      this.tileMap.fill(0, 0, 0, this.width, this.height, layer.index);
    }
  }

  this.tileMap.addTilesetImage("pics1", "pics1", g.tileWidth, g.tileHeight, 0, 0, 0);
};

module.exports = Level;
