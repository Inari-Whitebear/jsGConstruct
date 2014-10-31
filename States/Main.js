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
    this.tileSelection.onSelectionChanged.add(this.tileSelectionChanged, this);
    //this.tileSelection.onTilesSelected.add(this.tileSelectionChanged, this);

    // Data for level editing
    this.activeLayer = 0;
    this.placeMode = "none";
    this.openLevel = null;

    this.levelTilePlacing = new Phaser.Sprite(this.game, 0, 0, "missing");
    this.levelTilePlacing.crop(this.tileSelection.cropRect);
    this.game.add.existing(this.levelTilePlacing);

    this.game.input.onDown.add(this.levelClick, this);
    this.game.input.onUp.add(this.levelMouseUp, this);

    this.levelSelection = new g.Prefabs.SelectionCanvas(this.game, this.game.world, "levelSelection", 64 * 16, 64 * 16);

    this.setMode("none");
  },

  tileSelectionChanged: function() {
    this.levelTilePlacing.updateCrop();
    this.setMode("placing");
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

  getPointerTile: function() {
    var point = Phaser.Canvas.getOffset(this.game.canvas);
    var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
    var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);
    return [pointerTileX, pointerTileY];
  },

  levelClick: function() {
    if (this.openLevel == null) { return; }
    if (this.placeMode !== "placing") { return; }

    var pointerTile = this.getPointerTile();
    if (this.game.input.mouse.button === 0) {
      this.openLevel.placeTiles(pointerTile[0] - this.tileSelection.selectionCanvas.selectionRect.w, pointerTile[1] - this.tileSelection.selectionCanvas.selectionRect.h, this.tileSelection.selectedTileArray, this.activeLayer);
    } else if (this.game.input.mouse.button === 2) {
      this.openLevel.floodFill(pointerTile[0] - this.tileSelection.selectionCanvas.selectionRect.w, pointerTile[1] - this.tileSelection.selectionCanvas.selectionRect.h, this.tileSelection.selectedTileArray[0][0], this.activeLayer);
    }
  },

  levelMouseUp: function() {
    var pointerTile = this.getPointerTile();
    this.setMode("none");
  },

  setMode: function(newMode) {
    this.placeMode = newMode;
    switch(this.placeMode) {
      case "placing":
        this.levelTilePlacing.visible = true;
        this.levelSelection.disable(true);
        break;
      case "none":
        this.levelTilePlacing.visible = false;
        this.levelSelection.enable(true);
    }
  },

  update: function() {
    //ToDo: make this cleaner
    this.levelSelection.overlayImage.bringToTop();

    this.levelSelection.update();

    if (this.placeMode === "placing") {
      if (this.levelTilePlacing.visible) {
        var pointerTile = this.getPointerTile();

        this.levelTilePlacing.x = pointerTile[0] * 16 - this.tileSelection.cropRect.width;
        this.levelTilePlacing.y = pointerTile[1] * 16 - this.tileSelection.cropRect.height;
        this.levelTilePlacing.bringToTop();
      }
    }

    this.tileSelection.update();
  },

  render: function() {
    this.tileSelection.render();
    this.levelSelection.render();
  }
};
