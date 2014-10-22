"use strict";

require("./boot.js");

var g = window.g;

g.levelWidth = 64;
g.levelHeight = 64;
g.tileWidth = 16;
g.tileHeight = 16;

var game = new Phaser.Game(g.levelWidth * g.tileWidth, g.levelHeight * g.tileHeight, Phaser.WEBGL, "main_render");

require("./States/load.js")(game);


/*
var myState = {
	preload: function() {
		this.game.load.image("block", "block.png");
	},

	create: function() {
		this.subStage = new Phaser.Stage(game);
		this.subCanvas = Phaser.Canvas.create(100,100,"sub_render");
		this.subRenderer = new PIXI.WebGLRenderer(100, 100, this.subCanvas, false, true, false);

		this.subStage.boot();

		this.subWorld = new Phaser.Group(this.game, null);
		this.subWorld.camera = new Phaser.Camera(this.game, 0, 0, 0, this.game.width, this.game.height);

		this.subWorld.camera.displayObject = this.subWorld;

		this.subStage.addChild(this.subWorld);

		Phaser.Canvas.addToDOM(this.subCanvas, "sub_render");

		this.testSprite = new Phaser.Sprite(game, 0, 0, "block", "");
		this.testSprite2 = new Phaser.Sprite(game, 32, 0, "block", "");

		this.subWorld.add(this.testSprite2);

		this.game.world.add(this.testSprite);

	},

	update: function() {
		this.subStage.preUpdate();
		this.subStage.update();
		this.subStage.postUpdate();
	},

	render: function() {
		//this.subStage.preRender();
		this.subRenderer.render(this.subStage);
	}
};

game.state.add("Main",myState);

game.state.start("Main");*/
