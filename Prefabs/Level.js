"use strict";

var g = window.g;
var fs = require("fs");
var nodePath = require("path");

function Level(game, levelName, data, width, height) {
  if (width == null) { width = g.levelWidth; }
  if (height == null) { height = g.levelHeight; }

  this.width = width;
  this.height = height;
  this.levelName = levelName;
  this.path = "";
  this.game = game;

  this.data = {};
  this.visible = false;
  this.layers = new Phaser.Group(game, null);
  this.npcs = new Phaser.Group(game, null);
  this.loaded = false;
  this.dataLoaded = false;
  this.tileMap = new Phaser.Tilemap(game, null, g.tileWidth, g.tileHeight, this.width, this.height);
  this.unsaved = false;

  this.tileMap.setPreventRecalculate(true);

  if (data != null)
    this.loadFrom(data, levelName);
  //this.layers.push(new g.Prefabs.LevelLayer(this, 0));
}

Level.prototype.loadFrom = function(dataString, path) {
  this.data = g.NWTools.parseNWDataString(dataString);
  this.path = path;
  this.levelName = nodePath.basename(path);
  this.unsaved = false;
  this.dataLoaded = true;
};

Level.prototype.save = function(forceChoice) {
  if(this.path === "" || forceChoice) {
    var ipc = require("ipc");
    var path = ipc.sendSync("saveFile");
    if(path != null) {
      this.path = path;
      this.levelName = nodePath.basename(path);
      this.unsaved = true;
    } else {
      if(forceChoice) { return; }
    }
  }

  if(this.path !== "") {
    fs.writeFileSync(this.path, g.NWTools.getNWDataString(this), {encoding: "utf8"});
    this.unsaved = false;  
  }
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
  this.unsaved = true;
  g.manager.updateTab(this);
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
    var layerCSV = this.data.layers[i];
    //this.game.cache.addTilemap("tempLoadCSV", "", layerCSV, Phaser.Tilemap.CSV);

    var mapData = Phaser.TilemapParser.parseCSV("", layerCSV, g.tileWidth, g.tileHeight);
    this.tileMap.layers[i] = mapData.layers[0];

    var layer = this.tileMap.createLayer(i, this.width * g.tileWidth, this.height * g.tileHeight, this.layers);
    /*if (i === 0) {
      this.tileMap.fill(0, 0, 0, this.width, this.height, layer.index);
    }*/
  }

  this.tileMap.addTilesetImage("pics1", "pics1", g.tileWidth, g.tileHeight, 0, 0, 0);
};

module.exports = Level;
