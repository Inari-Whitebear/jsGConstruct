"use strict";

var g = window.g;

/*
TODO:
  ~~~Bugfixes
  - change tile selection to feel better when dragging to the right/bottom (jump to next tile earlier)
  - make last row/column selectable
  - allow to go off the level to the bottom/right when placing tiles
*/

g.States.Main = {
  create: function() {
    // Setup of the tileset display, renderer, etc
    this.subStage = new Phaser.Stage(this.game);
    this.subCanvas = Phaser.Canvas.create(2048, 512, "tile_render");
    this.subRenderer = new PIXI.CanvasRenderer(2048, 512, this.subCanvas, false);
    this.subContext = this.subRenderer.context;

    this.subStage.boot();

    this.subWorld = new Phaser.Group(this.game, null);
    this.subWorld.camera = new Phaser.Camera(this.game, 0, 0, 0, 2048, 512);
    this.subWorld.camera.displayObject = this.subWorld;

    this.tileset = new Phaser.Sprite(this.game, 0, 0, "pics1", "");

    this.subStage.addChild(this.subWorld);
    this.subWorld.add(this.tileset);

    Phaser.Canvas.addToDOM(this.subCanvas, "tile_render");
    Phaser.Canvas.setTouchAction(this.subCanvas);

    this.subInput = new Phaser.InputHandler(this.tileset);

    this.subCanvasOverlay = new Phaser.BitmapData(this.game, "subCanvasSelection", 2048, 512);
    var subCanvasOverlayImage = new Phaser.Image(this.game, 0, 0, this.subCanvasOverlay);
    this.subWorld.add(subCanvasOverlayImage);

    // Setting up the events for the canvas
    var canvas = this.subCanvas;
    var downCallback = this.subCanvasMouseDown;
    var upCallback = this.subCanvasMouseUp;
    var moveCallback = this.subCanvasMouseMove;
    var self = this;
    var callbacks = { "mousedown": downCallback, "mouseup": upCallback, "mousemove": moveCallback };
    var mousePosHelper = function(event) {
      var offset = $(canvas).offset();
      var xClick = event.clientX - offset.left;
      var yClick = event.clientY - offset.top;
      callbacks[event.type].call(self,xClick,yClick);
    };
    this.subCanvas.addEventListener("mousedown", mousePosHelper);
    this.subCanvas.addEventListener("mouseup", mousePosHelper);
    this.subCanvas.addEventListener("mousemove", mousePosHelper);

    // Data for level editing
    this.activeLayer = 0;
    this.tileSelection = {
      rect: new g.Prefabs.NormRect(),
      cropRect: new Phaser.Rectangle(0, 0, 0, 0),
      mode: "none",
      dirty: false,
      dragging: false
    };
    this.openLevel = null;

    this.levelTilePlacing = new Phaser.Sprite(this.game, 0, 0, "pics1");
    this.levelTilePlacing.crop(this.tileSelection.cropRect);
    this.game.add.existing(this.levelTilePlacing);

    this.game.input.onDown.add(this.levelClick, this);
  },

  setOpenLevel: function(level) {
    if(this.openLevel != null) {
      this.openLevel.hide();
    }

    this.openLevel = level;
    this.openLevel.show();
  },

  saveLevel: function() {
    this.openLevel.save();
    g.manager.updateTab(this.openLevel);
  },

  levelClick: function() {
    if (this.openLevel == null) { return; }
    var point = Phaser.Canvas.getOffset(this.game.canvas);
    var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
    var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);

    this.openLevel.placeTiles(pointerTileX - this.tileSelection.rect.w, pointerTileY - this.tileSelection.rect.h, this.getSelectedTileArray(), this.activeLayer);
  },

  getSelectedTileArray: function() {
    var tileArray = [];
    for (var tX = 0; tX < this.tileSelection.rect.w; tX++) {
      tileArray[tX] = [];
      for (var tY = 0; tY < this.tileSelection.rect.h; tY++) {
        tileArray[tX][tY] = tX + this.tileSelection.rect.x + (tY + this.tileSelection.rect.y) * 128;
      }
    }
    return tileArray;
  },

  subCanvasMouseDown: function(x, y) {
    this.tileSelection.dragging = true;

    var tileX = Math.floor((x + 4) / 16);
    var tileY = Math.floor((y + 4) / 16);

    this.tileSelection.rect.rawRect.x = tileX;
    this.tileSelection.rect.rawRect.y = tileY;
    this.tileSelection.rect.rawRect.w = 0;
    this.tileSelection.rect.rawRect.h = 0;
    this.tileSelection.dirty = true;
  },

  subCanvasMouseUp: function(x, y) {
    if (this.tileSelection.dragging) {
      this.tileSelection.dragging = false;
      this.tileSelection.rect.calcRect();

      this.tileSelection.cropRect.x = this.tileSelection.rect.x * 16;
      this.tileSelection.cropRect.y = this.tileSelection.rect.y * 16;
      this.tileSelection.cropRect.width = this.tileSelection.rect.w * 16;
      this.tileSelection.cropRect.height = this.tileSelection.rect.h * 16;
      this.levelTilePlacing.updateCrop();
      this.tileSelection.mode = "placing";
    }
  },

  subCanvasMouseMove: function(x, y) {
    if (!this.tileSelection.dragging) { return; }
    var tileX = Math.floor(x / 16);
    var tileY = Math.floor(y / 16);

    var sizeW = tileX - this.tileSelection.rect.rawRect.x;
    var sizeH = tileY - this.tileSelection.rect.rawRect.y;

    if (this.tileSelection.rect.rawRect.w !== sizeW || this.tileSelection.rect.rawRect.h !== sizeH) {
      this.tileSelection.dirty = true;
      this.tileSelection.rect.rawRect.w = sizeW;
      this.tileSelection.rect.rawRect.h = sizeH;
    }
  },

  update: function() {
    if (this.tileSelection.dirty) {
      this.tileSelection.dirty = false;

      this.subCanvasOverlay.clear();
      this.tileSelection.rect.calcRect();

      var drawW = this.tileSelection.rect.w * 16;
      var drawH = this.tileSelection.rect.h * 16;
      var drawOffX = 0;
      var drawOffY = 0;
      if (drawW === 0) {
        drawW = 4;
        drawOffX = -2;
      }
      if (drawH === 0) {
        drawH = 4;
        drawOffY = -2;
      }

      this.subCanvasOverlay.context.beginPath();
      this.subCanvasOverlay.context.lineWidth = 2;
      this.subCanvasOverlay.context.strokeStyle = "rgba(255,0,0,1)";
      this.subCanvasOverlay.context.fillStyle = "rgba(255,0,0,0.1)";
      this.subCanvasOverlay.context.rect(this.tileSelection.rect.x * 16 + drawOffX, this.tileSelection.rect.y * 16 + drawOffY, drawW, drawH);
      this.subCanvasOverlay.context.fill();
      this.subCanvasOverlay.context.stroke();
    }

    if (this.tileSelection.mode === "placing") {
      if (this.levelTilePlacing.visible) {

        var point = Phaser.Canvas.getOffset(this.game.canvas);
        var pointerTileX = Math.round((this.game.input.mousePointer.pageX - point.x) / 16);
        var pointerTileY = Math.round((this.game.input.mousePointer.pageY - point.y) / 16);

        this.levelTilePlacing.x = pointerTileX * 16 - this.tileSelection.cropRect.width;
        this.levelTilePlacing.y = pointerTileY * 16 - this.tileSelection.cropRect.height;
        this.levelTilePlacing.bringToTop();
      }
    }

    this.subStage.preUpdate();
    this.subStage.update();
    this.subStage.postUpdate();
  },

  render: function() {
    this.subRenderer.render(this.subStage);

    if (this.game.device.cocoonJS && this.subStage.currentRenderOrderID === 1)
    {
        //  Horrible hack! But without it Cocoon fails to render a scene with just a single drawImage call on it.
        this.context.fillRect(0, 0, 0, 0);
    }
  }
};
