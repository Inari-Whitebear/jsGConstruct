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

    this.selectedTileInfo = [];

    var canvas = this.subCanvas;
    var downCallback = this.subCanvasMouseDown;
    var upCallback = this.subCanvasMouseUp;
    var moveCallback = this.subCanvasMouseMove;
    var self = this;
    this.subCanvasDragging = false;
    this.subCanvasDragInfo = [0, 0, 0, 0];
    this.subCanvas.addEventListener("mousedown",function(event) {
      var offset = $(canvas).offset();
      var xClick = event.clientX - offset.left;
      var yClick = event.clientY - offset.top;
      downCallback.call(self,xClick,yClick);
    });
    this.subCanvas.addEventListener("mouseup",function(event) {
      var offset = $(canvas).offset();
      var xClick = event.clientX - offset.left;
      var yClick = event.clientY - offset.top;
      upCallback.call(self,xClick,yClick);
    });
    this.subCanvas.addEventListener("mousemove", function(event) {
      var offset = $(canvas).offset();
      var xClick = event.clientX - offset.left;
      var yClick = event.clientY - offset.top;
      moveCallback.call(self,xClick,yClick);
    });
  },

  subCanvasMouseDown: function(x, y) {
    this.subCanvasDragging = true;
    var tileX = Math.floor(x / 16);
    var tileY = Math.floor(y / 16);

    this.subCanvasOverlay.clear();
    this.subCanvasOverlay.rect(tileX * 16 - 2, tileY * 16 - 2, 4, 4, "#FF0000");
    this.subCanvasDragInfo = [ tileX, tileY, 0, 0 ];
  },

  subCanvasMouseUp: function(x, y) {
    if (this.subCanvasDragging) {
      this.subCanvasDragging = false;

      var start = [0, 0];
      var size = [0, 0];
      if (this.subCanvasDragInfo[2] < 0) {
        start[0] = this.subCanvasDragInfo[0] + this.subCanvasDragInfo[2];
        size[0] = Math.abs(this.subCanvasDragInfo[2]);
      } else {
        start[0] = this.subCanvasDragInfo[0];
        size[0] = this.subCanvasDragInfo[2];
      }

      if (this.subCanvasDragInfo[3] < 0) {
        start[1] = this.subCanvasDragInfo[3] + this.subCanvasDragInfo[1];
        size[1] = Math.abs(this.subCanvasDragInfo[3]);
      } else {
        start[1] = this.subCanvasDragInfo[1];
        size[1] = this.subCanvasDragInfo[3];
      }

      this.selectedTileInfo = [start[0], start[1], size[0], size[1]];
      this.subCanvasDragInfo = [0, 0, 0, 0];
    }
  },

  subCanvasMouseMove: function(x, y) {
    if (!this.subCanvasDragging) { return; }
    var tileX = Math.floor(x / 16);
    var tileY = Math.floor(y / 16);

    this.subCanvasDragInfo[2] = tileX - this.subCanvasDragInfo[0];
    this.subCanvasDragInfo[3] = tileY - this.subCanvasDragInfo[1];

    this.subCanvasOverlay.clear();
    var start = [0, 0];
    var size = [0, 0];
    if (this.subCanvasDragInfo[2] < 0) {
      start[0] = this.subCanvasDragInfo[0] + this.subCanvasDragInfo[2];
      size[0] = Math.abs(this.subCanvasDragInfo[2]);
    } else {
      start[0] = this.subCanvasDragInfo[0];
      size[0] = this.subCanvasDragInfo[2];
    }

    if (this.subCanvasDragInfo[3] < 0) {
      start[1] = this.subCanvasDragInfo[3] + this.subCanvasDragInfo[1];
      size[1] = Math.abs(this.subCanvasDragInfo[3]);
    } else {
      start[1] = this.subCanvasDragInfo[1];
      size[1] = this.subCanvasDragInfo[3];
    }

    if(size[0] === 0 && size[1] === 0) {
      this.subCanvasOverlay.rect(start[0] * 16 - 2, start[1] * 16 - 2, 4, 4, "#FF0000");
    } else {
      this.subCanvasOverlay.rect(start[0] * 16, start[1] * 16, size[0] * 16, size[1] * 16, "#FF0000");
    }
  },

  update: function() {
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
