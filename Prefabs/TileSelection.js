"use strict";

function TileSelection(game, element) {
  this.elementId = element;
  this.game = game;

  this.image = $(this.elementId);
  this.tileset = new Phaser.BitmapData(this.game, element + "_data", 2048, 512);
  this.selectionCanvas = new g.Prefabs.SelectionCanvas(this.game, "tab_tile_render", "tilesetSelection", 2048, 512);
  this.cropRect = new Phaser.Rectangle(0, 0, 0, 0);

  this.onSelectionChanged = new Phaser.Signal();

  this.selectionCanvas.onSelected.add(this.selectionChanged, this);

  this.selectedTileArray = [];
}

TileSelection.prototype.updateSelectedTileArray = function() {
  this.selectedTileArray = [];
  for (var tX = 0; tX < this.selectionCanvas.selectionRect.w; tX++) {
    this.selectedTileArray[tX] = [];
    for (var tY = 0; tY < this.selectionCanvas.selectionRect.h; tY++) {
      this.selectedTileArray[tX][tY] = tX + this.selectionCanvas.selectionRect.x + (tY + this.selectionCanvas.selectionRect.y) * 128;
    }
  }
};

TileSelection.prototype.selectionChanged = function() {
  this.cropRect.x = this.selectionCanvas.selectionRect.x * 16;
  this.cropRect.y = this.selectionCanvas.selectionRect.y * 16;
  this.cropRect.width = this.selectionCanvas.selectionRect.w * 16;
  this.cropRect.height = this.selectionCanvas.selectionRect.h * 16;

  this.updateSelectedTileArray();

  this.onSelectionChanged.dispatch();
}

TileSelection.prototype.destroy = function() {
  this.selectionCanvas.destroy();
  this.onSelectionChanged.dispose();
};

TileSelection.prototype.setTileset = function(image) {
  var img = new Phaser.Image(this.game, 0, 0, image);
  this.tileset.draw(img, 0, 0, 2048, 512, null, false);
  this.tileset.update();
  window.document.getElementById(this.elementId).src = this.tileset.canvas.toDataURL();
  img.destroy();
  this.enabled = true;
};

TileSelection.prototype.disable = function(hide) {
  if (hide == null) { hide = true; }

  this.enabled = false;
  if (this.hide) {
    this.canvasOverlay.clear();
    this.tileset.loadTexture("missing");
  }
}

TileSelection.prototype.update = function() {
  this.selectionCanvas.update();
};

TileSelection.prototype.render = function() {
  this.selectionCanvas.render();
};

module.exports = TileSelection;
