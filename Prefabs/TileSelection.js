"use strict";

function TileSelection(game, element) {
  this.elementId = element;
  this.game = game;

  this.stage = new Phaser.Stage(this.game);
  this.canvas = Phaser.Canvas.create(2048, 512, this.elementId);
  this.renderer = new PIXI.CanvasRenderer(2048, 512, this.canvas, false);
  this.context = this.renderer.context;

  this.stage.boot();

  this.world = new Phaser.Group(this.game, null);
  this.world.camera = new Phaser.Camera(this.game, 0, 0, 0, 2048, 512);
  this.world.camera.displayObject = this.world;

  //g.fileManager.loadImage("pics1.png");
  this.tileset = new Phaser.Sprite(this.game, 0, 0, "missing");

  this.stage.addChild(this.world);
  this.world.add(this.tileset);

  Phaser.Canvas.addToDOM(this.canvas, this.elementId);
  Phaser.Canvas.setTouchAction(this.canvas);

  this.input = new Phaser.InputHandler(this.tileset);

  this.canvasOverlay = new Phaser.BitmapData(this.game, "canvasSelection", 2048, 512);
  var canvasOverlayImage = new Phaser.Image(this.game, 0, 0, this.canvasOverlay);
  this.world.add(canvasOverlayImage);

  // Setting up the events for the canvas
  var canvas = this.canvas;
  var downCallback = this.canvasMouseDown;
  var upCallback = this.canvasMouseUp;
  var moveCallback = this.canvasMouseMove;
  var self = this;
  var callbacks = {"mousedown": downCallback, "mouseup": upCallback, "mousemove": moveCallback};
  var mousePosHelper = function(event) {
    var offset = $(canvas).offset();
    var xClick = event.clientX - offset.left;
    var yClick = event.clientY - offset.top;
    callbacks[event.type].call(self,xClick,yClick);
  };
  this.canvas.addEventListener("mousedown", mousePosHelper);
  this.canvas.addEventListener("mouseup", mousePosHelper);
  this.canvas.addEventListener("mousemove", mousePosHelper);

  this.dragging = false;
  this.dirty = false;
  this.enabled = false;
  this.selectionRect = new g.Prefabs.NormRect();
  this.cropRect = new Phaser.Rectangle(0, 0, 0, 0);

  this.onTilesSelected = new Phaser.Signal();
}

TileSelection.prototype.destroy = function() {
  this.onTilesSelected.dispatch();
  this.tileset.destroy();
};

TileSelection.prototype.setTileset = function(image) {
  this.tileset.loadTexture(image);
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

TileSelection.prototype.canvasMouseDown = function(x, y) {
  if (!this.enabled) { return; }
  this.dragging = true;

  var tileX = Math.floor((x + 8) / 16);
  var tileY = Math.floor((y + 8) / 16);

  this.selectionRect.rawRect.x = tileX;
  this.selectionRect.rawRect.y = tileY;
  this.selectionRect.rawRect.w = 0;
  this.selectionRect.rawRect.h = 0;
  this.dirty = true;
};

TileSelection.prototype.canvasMouseUp = function(x, y) {
  if (!this.enabled) { return; }

  if (this.dragging) {
    this.dragging = false;
    this.selectionRect.calcRect();

    this.cropRect.x = this.selectionRect.x * 16;
    this.cropRect.y = this.selectionRect.y * 16;
    this.cropRect.width = this.selectionRect.w * 16;
    this.cropRect.height = this.selectionRect.h * 16;
    this.onTilesSelected.dispatch();
  }
};

TileSelection.prototype.canvasMouseMove = function(x, y) {
  if (!this.enabled) { return; }
  if (!this.dragging) { return; }
  var tileX = Math.floor((x + 8) / 16);
  var tileY = Math.floor((y + 8) / 16);

  var sizeW = tileX - this.selectionRect.rawRect.x;
  var sizeH = tileY - this.selectionRect.rawRect.y;

  if (this.selectionRect.rawRect.w !== sizeW || this.selectionRect.rawRect.h !== sizeH) {
    this.dirty = true;
    this.selectionRect.rawRect.w = sizeW;
    this.selectionRect.rawRect.h = sizeH;
  }
};

TileSelection.prototype.update = function() {
  if (this.dirty) {
    this.dirty = false;

    this.canvasOverlay.clear();
    this.selectionRect.calcRect();

    var drawW = this.selectionRect.w * 16;
    var drawH = this.selectionRect.h * 16;
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

    this.canvasOverlay.context.beginPath();
    this.canvasOverlay.context.lineWidth = 2;
    this.canvasOverlay.context.strokeStyle = "rgba(255,0,0,1)";
    this.canvasOverlay.context.fillStyle = "rgba(255,0,0,0.1)";
    this.canvasOverlay.context.rect(this.selectionRect.x * 16 + drawOffX, this.selectionRect.y * 16 + drawOffY, drawW, drawH);
    this.canvasOverlay.context.fill();
    this.canvasOverlay.context.stroke();
  }

  this.stage.preUpdate();
  this.stage.update();
  this.stage.postUpdate();
};

TileSelection.prototype.render = function() {
  this.renderer.render(this.stage);
  if (this.game.device.cocoonJS)
    {
        //  Horrible hack! But without it Cocoon fails to render a scene with just a single drawImage call on it.
      this.context.fillRect(0, 0, 0, 0);
    }
};

module.exports = TileSelection;