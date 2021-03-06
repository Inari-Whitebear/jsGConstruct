/*
  Copyright 2014 "Neppy"

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


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
  this.tileset = "";

  this.miscData = ""; // TODO: support everything to make this unnecessary

  this.onLoaded = new Phaser.Signal();
  this.onLoaded.add(this.onLoadedSelf, this);

  this.data = {};
  this.visible = false;
  this.layers = new Phaser.Group(game, null);
  this.npcs = new Phaser.Group(game, null);
  this.loaded = false;
  this.dataLoaded = false;
  this.tileMap = new Phaser.Tilemap(game, null, g.tileWidth, g.tileHeight, this.width, this.height);
  this.unsaved = false;

  this.tileMap.setPreventRecalculate(true);

  this.historyManager = new g.Prefabs.HistoryManager(game, this, 20);

  if (data != null) {
    this.loadFrom(data, levelName);
  } else {
    this.data = g.NWTools.createBlankNW();
    this.unsaved = true;
  }
  //this.layers.push(new g.Prefabs.LevelLayer(this, 0));
}

Level.prototype.getLayerByIndex = function(index) {
  for (var i = 0, l = this.layers.length; i < l; i++) {
    if(this.layers.getAt(i).index === index) {
      return this.layers.getAt(i);
    }
  }
  return null;
};

Level.prototype.loadFrom = function(dataString, path) {
  this.data = g.NWTools.parseNWDataString(dataString);
  this.path = path;
  this.levelName = nodePath.basename(path);
  this.unsaved = false;
  this.dataLoaded = true;
};

Level.prototype.destroy = function() {
  this.tileMap.destroy();
  this.layers.destroy();
  this.onLoaded.dispose();
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
  if (this.loaded) {
    this.game.world.add(this.layers);
  }
};

Level.prototype.placeTiles = function(x, y, tileArray, layer, noHistory) {
  if (noHistory == null) { noHistory = false; }
  var org = [];

  for (var tX = 0, tXL = tileArray.length; tX < tXL; tX++) {
    org[tX] = [];
    for (var tY = 0, tYL = tileArray[0].length; tY < tYL; tY++) {
      org[tX][tY] = this.tileMap.getTile(tX + x, tY + y, layer, true).index;
      if (tileArray[tX][tY] !== -2) {
        this.tileMap.putTile(tileArray[tX][tY], tX + x, tY + y, layer);
      }
    }
  }

  if(!noHistory) {
    this.historyManager.saveStep(x, y, org, tileArray, layer);
  }

  this.unsaved = true;
  g.manager.updateTab(this);
};

var vecx = function(dir) { if (dir === 1) { return 1; } else if(dir === 3) { return -1; } return 0; };
var vecy = function(dir) { if (dir === 0) { return -1; } else if(dir === 2) { return 1; } return 0; };
var addRow = function(array, index) {
  for (var i = 0, l = array.length; i < l; i++) {
    array[i].splice(index, 0, -2);
  }
};
var addColumn = function(array, index) {
  var length = array[0].length;
  var row = [];
  for(var i = 0; i < length; i++) {
    row.push(-2);
  }
  array.splice(index, 0, row);
};
Level.prototype.floodFill = function(x, y, tile, layer, noHistory, floodFillInfo) {
  if (floodFillInfo == null) {
    floodFillInfo = {};
    floodFillInfo.top = y;
    floodFillInfo.left = x;
    floodFillInfo.width = 1;
    floodFillInfo.height = 1;
    floodFillInfo.fillIndex = this.tileMap.getTile(x, y, layer, true).index;
    floodFillInfo.data = [[-2]];
    floodFillInfo.orgData = [[-2]];
  }
  if (noHistory == null) { noHistory = false; }


  if (x < floodFillInfo.left) {
    floodFillInfo.left--;
    floodFillInfo.width++;
    addColumn(floodFillInfo.data, 0);
    addColumn(floodFillInfo.orgData, 0);
  } else if (y < floodFillInfo.top) {
    floodFillInfo.top--;
    floodFillInfo.height++;
    addRow(floodFillInfo.data, 0);
    addRow(floodFillInfo.orgData, 0);
  }

  if (x > floodFillInfo.left + floodFillInfo.width - 1) {
    floodFillInfo.width++;
    addColumn(floodFillInfo.data, floodFillInfo.width - 1);
    addColumn(floodFillInfo.orgData, floodFillInfo.width - 1);
  } else if (y > floodFillInfo.top + floodFillInfo.height - 1) {
    floodFillInfo.height++;
    addRow(floodFillInfo.data, floodFillInfo.height - 1);
    addRow(floodFillInfo.orgData, floodFillInfo.height - 1);
  }

  floodFillInfo.data[x - floodFillInfo.left][y - floodFillInfo.top] = tile;
  var tileIndex;
  tileIndex = this.tileMap.getTile(x, y, layer, true).index;
  floodFillInfo.orgData[x - floodFillInfo.left][y - floodFillInfo.top] = tileIndex;
  this.tileMap.putTile(tile, x, y, layer);
  var tX, tY;
  for (var i = 0; i < 4; i++) {
    tX = x + vecx(i);
    tY = y + vecy(i);
    if (tX >= 0 && tY >= 0 && tX < this.width && tY < this.height) {
      tileIndex = this.tileMap.getTile(tX, tY, layer, true).index;
      if (tileIndex !== -1) {
        if (tileIndex === floodFillInfo.fillIndex) {
          this.floodFill(tX, tY, tile, layer, true, floodFillInfo);
        }
      }
    }
  }

  if (!noHistory) {
    this.historyManager.saveStep(floodFillInfo.left, floodFillInfo.top, floodFillInfo.orgData, floodFillInfo.data, layer);
  }
};

Level.prototype.applyStep = function(stepInfo) {
  this.placeTiles(stepInfo.x, stepInfo.y, stepInfo.tileArrayNew, stepInfo.layer, true);
};

Level.prototype.revertStep = function(stepInfo) {
  this.placeTiles(stepInfo.x, stepInfo.y, stepInfo.tileArrayOriginal, stepInfo.layer, true);
};

Level.prototype.clearArea = function(x, y, w, h, layer) {
  var tile = -1;
  if (layer === 0) { tile = 0; }

  this.tileMap.fill(tile, x, y, w, h, layer);
};

Level.prototype.hide = function() {
  this.visible = false;
  this.game.world.remove(this.layers);
};

Level.prototype.onLoadedSelf = function() {
  this.loaded = true;
  if (this.visible) { this.show(); }
};

Level.prototype.create = function() {
  if (!this.dataLoaded) {
    this.data = g.NWTools.createBlankNW();
    this.dataLoaded = true;
  }

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

  this.miscData = this.data.miscData;
  this.tileset = "pics1.png";

  g.fileManager.loadImage("pics1.png", function(key, success) {
    this.tileMap.addTilesetImage("pics1.png", "pics1.png", g.tileWidth, g.tileHeight, 0, 0, 0);
    this.onLoaded.dispatch();
  }, this);
};

module.exports = Level;
