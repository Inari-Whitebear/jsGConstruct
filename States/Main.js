"use strict";

var g = window.g;

g.States.Main = {
  create: function() {
    this.subStage = new Phaser.Stage(this.game);
    this.subCanvas = Phaser.Canvas.create(2048, 512, "tile_render");
    this.subRenderer = new PIXI.CanvasRenderer(2048, 512, this.subCanvas, false);
    this.subContext = this.subRenderer.context;

    this.subStage.boot();

    this.subWorld = new Phaser.Group(this.game, null);
    this.subWorld.camera = new Phaser.Camera(this.game, 0, 0, 0, 2048, 512);

    this.subWorld.camera.displayObject = this.subWorld;

    this.subStage.addChild(this.subWorld);

    Phaser.Canvas.addToDOM(this.subCanvas, "tile_render");
    Phaser.Canvas.setTouchAction(this.subCanvas);

    this.tileset = new Phaser.Sprite(this.game, 0, 0, "pics1", "");
    this.subInput = new Phaser.InputHandler(this.tileset);
    this.subWorld.add(this.tileset);

    this.subCanvasOverlay = new Phaser.BitmapData(this.game, "subCanvasSelection", 2048, 512);
    var subCanvasOverlayImage = new Phaser.Image(this.game, 0, 0, this.subCanvasOverlay);
    this.subWorld.add(subCanvasOverlayImage);

    var canvas = this.subCanvas;
    var downCallback = this.subCanvasMouseDown;
    var upCallback = this.subCanvasMouseUp;
    var moveCallback = this.subCanvasMouseMove;
    var self = this;
    this.subCanvasDragging = false;

    this.tileSelection = {};
    this.tileSelection.rawRect = { x: 0, y: 0, w: 0, h: 0 };
    this.tileSelection.rect = { x: 0, y: 0, w: 0, h: 0 };
    this.tileSelection.dirty = false;

    this.tileSelection.calcRect = function() {
      if(this.rawRect.w < 0) {
        this.rect.x = this.rawRect.x + this.rawRect.w;
      } else {
        this.rect.x = this.rawRect.x;
      }

      if(this.rawRect.h < 0) {
        this.rect.y = this.rawRect.y + this.rawRect.h;
      } else {
        this.rect.y = this.rawRect.y;
      }

      this.rect.w = Math.abs(this.rawRect.w);
      this.rect.h = Math.abs(this.rawRect.h);
    };

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
  },

  subCanvasMouseDown: function(x, y) {
    this.subCanvasDragging = true;
    var tileX = Math.floor((x + 4) / 16);
    var tileY = Math.floor((y + 4) / 16);

    this.tileSelection.rawRect.x = tileX;
    this.tileSelection.rawRect.y = tileY;
    this.tileSelection.rawRect.w = 0;
    this.tileSelection.rawRect.h = 0;
    this.tileSelection.dirty = true;
  },

  subCanvasMouseUp: function(x, y) {
    if (this.subCanvasDragging) {
      this.subCanvasDragging = false;
      this.tileSelection.calcRect();
    }
  },

  subCanvasMouseMove: function(x, y) {
    if (!this.subCanvasDragging) { return; }
    var tileX = Math.floor(x / 16);
    var tileY = Math.floor(y / 16);

    var sizeW = tileX - this.tileSelection.rawRect.x;
    var sizeH = tileY - this.tileSelection.rawRect.y;

    if(this.tileSelection.rawRect.w !== sizeW || this.tileSelection.rawRect.h !== sizeH) {
      this.tileSelection.dirty = true;
      this.tileSelection.rawRect.w = sizeW;
      this.tileSelection.rawRect.h = sizeH;
    }
  },

  update: function() {
    if(this.tileSelection.dirty) {
      this.tileSelection.dirty = false;

      this.subCanvasOverlay.clear();
      this.tileSelection.calcRect();
      var drawW = this.tileSelection.rect.w * 16;
      var drawH = this.tileSelection.rect.h * 16;
      var drawOffX = 0;
      var drawOffY = 0;

      if(drawW === 0) {
        drawW = 4;
        drawOffX = -2;
      }
      if(drawH === 0) {
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
