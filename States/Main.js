"use strict";

var g = window.g;

var ipc = require("ipc");

g.States.Main = {
  create: function() {
    this.subStage = new Phaser.Stage(game);
    this.subCanvas = Phaser.Canvas.create(100,100,"tile_render");
    this.subRenderer = new PIXI.WebGLRenderer(100, 100, this.subCanvas, false, true, false);

    this.subStage.boot();

    this.subWorld = new Phaser.Group(this.game, null);
    this.subWorld.camera = new Phaser.Camera(this.game, 0, 0, 0, this.game.width, this.game.height);

    this.subWorld.camera.displayObject = this.subWorld;

    this.subStage.addChild(this.subWorld);

    Phaser.Canvas.addToDOM(this.subCanvas, "tile_render");
  }
};