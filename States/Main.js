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

    this.subCanvasSelectionRectangle = new Phaser.BitmapData(this.game, "subCanvasSelection", 1, 1);

    var canvas = this.subCanvas;
    var downCallback = this.subCanvasMouseDown;
    var upCallback = this.subCanvasMouseUp;
    var self = this;
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
  },

  subCanvasMouseDown: function(x,y) {
    alert(this.subCanvasSelectionRectangle);
  },

  subCanvasMouseUp: function(x,y) {

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
