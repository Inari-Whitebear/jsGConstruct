"use strict";

var g = window.g;

/*
TODO:
  ~~~Bugfixes
  - change tile selection to feel better when dragging to the right/bottom (jump to next tile earlier)?
  - allow to go off the level to the bottom/right when placing tiles
*/

g.States.Main = {
  create: function() {
    this.tileSelection = new g.Prefabs.TileSelection(this.game, "tile_render");
    this.tileSelection.onSelectionChanged.add(this.tileSelectionChanged, this);

    // Data for level editing
    this.activeLayer = 0;
    this.placeMode = "none";
    this.openLevel = null;

    this.levelTilePlacing = new Phaser.BitmapData(this.game, "levelTilePlacing", 1, 1);
    this.levelTilePlacingImage = new Phaser.Image(this.game, 0, 0, this.levelTilePlacing);
    this.game.add.existing(this.levelTilePlacingImage);

    this.game.input.onDown.add(this.levelMouseDown, this);
    this.game.input.onUp.add(this.levelMouseUp, this);

    this.keyCaptures = {};

    this.keyCaptures.c = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
    this.keyCaptures.c.onUp.add(this.onKeyCopy, this);
    this.keyCaptures.v = this.game.input.keyboard.addKey(Phaser.Keyboard.V);
    this.keyCaptures.v.onUp.add(this.onKeyPaste, this);

    this.clipboardTileArray = [];

    this.levelSelection = new g.Prefabs.SelectionCanvas(this.game, this.game.world, "levelSelection", 64 * 16, 64 * 16);

    this.setMode("none");
  },

  onKeyCopy: function() {
    if (!this.keyCaptures.c.altKey && !this.keyCaptures.c.shiftKey && this.keyCaptures.c.ctrlKey) {
      this.onCopy();
    }
  },

  onCopy: function() {
    this.clipboardTileArray = [];
    for (var tX = 0; tX < this.levelSelection.selectionRect.w; tX++) {
      this.clipboardTileArray[tX] = [];
      for (var tY = 0; tY < this.levelSelection.selectionRect.h; tY++) {
        this.clipboardTileArray[tX][tY] = this.openLevel.tileMap.getTile(tX + this.levelSelection.selectionRect.x, tY + this.levelSelection.selectionRect.y, this.activeLayer, true);
      }
    }
  },

  onKeyPaste: function() {
    if (!this.keyCaptures.v.altKey && !this.keyCaptures.v.shiftKey && this.keyCaptures.v.ctrlKey) {
      this.onPaste();
    }
  },

  onPaste: function() {
    this.updateLevelTilePlacing(this.levelSelection.selectionRect, this.openLevel.getLayerByIndex(this.activeLayer).canvas);
  },

  updateLevelTilePlacing: function(sourceRect, source) {
    this.levelTilePlacing.clear();
    this.levelTilePlacing.resize(sourceRect.w * 16, sourceRect.h * 16);
    this.levelTilePlacing.copy(source, sourceRect.x * 16, sourceRect.y * 16, sourceRect.w * 16, sourceRect.h * 16, 0, 0);
  },

  tileSelectionChanged: function() {
    this.updateLevelTilePlacing(this.tileSelection.selectionCanvas.selectionRect, this.tileSelection.tileset);
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
  },

  getPointerTile: function() {
    var point = Phaser.Canvas.getOffset(this.game.canvas);
    var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
    var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);
    return [pointerTileX, pointerTileY];
  },

  levelMouseDown: function() {
    if (this.openLevel == null) { return; }
    if (this.placeMode !== "placing" && this.placeMode !== "paste") { return; }

    var sourceArray = this.tileSelection.selectedTileArray;
    if (this.placeMode === "paste") {
      sourceArray = this.clipboardTileArray;
    }

    var pointerTile = this.getPointerTile();
    if (this.game.input.mouse.button === 0) {
      this.openLevel.placeTiles(pointerTile[0] - this.levelTilePlacingImage.width / 16, pointerTile[1] - this.levelTilePlacingImage.height / 16, sourceArray, this.activeLayer);
    } else if (this.game.input.mouse.button === 2) {
      this.openLevel.floodFill(pointerTile[0] - this.levelTilePlacingImage.width / 16, pointerTile[1] - this.levelTilePlacingImage.height / 16, sourceArray, this.activeLayer);
    }
  },

  levelMouseUp: function() {
    var pointerTile = this.getPointerTile();
    this.setMode("none");
  },

  setMode: function(newMode) {
    this.placeMode = newMode;
    switch(this.placeMode) {
      case "paste":
      case "placing":
        this.levelTilePlacingImage.visible = true;
        this.levelSelection.disable(true);
        break;
      case "none":
        this.levelTilePlacingImage.visible = false;
        this.levelSelection.enable(true);
    }
  },

  update: function() {
    //ToDo: make this cleaner
    this.levelSelection.overlayImage.bringToTop();

    this.levelSelection.update();

    if (this.placeMode === "placing" || this.placeMode === "paste") {
      if (this.levelTilePlacingImage.visible) {
        var pointerTile = this.getPointerTile();

        this.levelTilePlacingImage.x = pointerTile[0] * 16 - this.levelTilePlacingImage.width;
        this.levelTilePlacingImage.y = pointerTile[1] * 16 - this.levelTilePlacingImage.height;
        this.levelTilePlacingImage.bringToTop();
      }
    }

    this.tileSelection.update();
  },

  render: function() {
    this.tileSelection.render();
    this.levelSelection.render();
  }
};
