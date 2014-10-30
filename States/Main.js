"use strict";

var g = window.g;

/*
TODO:
  ~~~Bugfixes
  - change tile selection to feel better when dragging to the right/bottom (jump to next tile earlier)
  - allow to go off the level to the bottom/right when placing tiles
*/

g.States.Main = {
  create: function() {
    this.tileSelection = new g.Prefabs.TileSelection(this.game, "tile_render");
    this.tileSelection.onTilesSelected.add(this.tileSelectionChanged, this);

    // Data for level editing
    this.activeLayer = 0;
    this.placeMode = "none";
    this.openLevel = null;

    this.levelTilePlacing = new Phaser.Sprite(this.game, 0, 0, "missing");
    this.levelTilePlacing.crop(this.tileSelection.cropRect);
    this.game.add.existing(this.levelTilePlacing);

    this.game.input.onDown.add(this.levelClick, this);
  },

  tileSelectionChanged: function() {
    this.levelTilePlacing.updateCrop();
    this.placeMode = "placing";
  },

  setOpenLevel: function(level) {
    if(this.openLevel != null) {
      this.openLevel.hide();
    }

    this.openLevel = level;
    if (this.openLevel.loaded) {
      this.openLevelLoaded();
    } else {
      this.openLevel.onLoaded.addOnce(this.openLevelLoaded, this);
    }
  },

  openLevelLoaded: function()
  {
    if (!this.openLevel.loaded) { return; }
    this.openLevel.show();

    this.tileSelection.setTileset(this.openLevel.tileset);
    this.levelTilePlacing.loadTexture(this.openLevel.tileset);
    this.levelTilePlacing.updateCrop();
  },

  levelClick: function() {
    if (this.openLevel == null) { return; }
    var point = Phaser.Canvas.getOffset(this.game.canvas);
    var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
    var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);

    this.openLevel.placeTiles(pointerTileX - this.tileSelection.selectionRect.w, pointerTileY - this.tileSelection.selectionRect.h, this.getSelectedTileArray(), this.activeLayer);
  },

  getSelectedTileArray: function() {
    var tileArray = [];
    for (var tX = 0; tX < this.tileSelection.selectionRect.w; tX++) {
      tileArray[tX] = [];
      for (var tY = 0; tY < this.tileSelection.selectionRect.h; tY++) {
        tileArray[tX][tY] = tX + this.tileSelection.selectionRect.x + (tY + this.tileSelection.selectionRect.y) * 128;
      }
    }
    return tileArray;
  },

  update: function() {
    if (this.placeMode === "placing") {
      if (this.levelTilePlacing.visible) {

        var point = Phaser.Canvas.getOffset(this.game.canvas);
        var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
        var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);

        this.levelTilePlacing.x = pointerTileX * 16 - this.tileSelection.cropRect.width;
        this.levelTilePlacing.y = pointerTileY * 16 - this.tileSelection.cropRect.height;
        this.levelTilePlacing.bringToTop();
      }
    }

    this.tileSelection.update();
  },

  render: function() {
    this.tileSelection.render();
  }
};
