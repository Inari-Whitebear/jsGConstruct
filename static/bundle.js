(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"E:\\https\\jsgconstruct\\States\\Main.js":[function(require,module,exports){
"use strict";

var g = window.g;

g.States.Main = {
	create: function() {
		
	}
};

},{}],"E:\\https\\jsgconstruct\\States\\Startup.js":[function(require,module,exports){
"use strict";

var g = window.g;

g.States.Startup = {
	create: function() {
		this.game.start("Main");
	}
};

},{}],"E:\\https\\jsgconstruct\\States\\load.js":[function(require,module,exports){
"use strict";

var g = window.g;

module.exports = function(game) {
	require("./Startup.js");
	require("./Main.js");

	game.state.add("Startup", g.States.Startup);
	game.state.add("Main", g.States.Main);
}

},{"./Main.js":"E:\\https\\jsgconstruct\\States\\Main.js","./Startup.js":"E:\\https\\jsgconstruct\\States\\Startup.js"}],"E:\\https\\jsgconstruct\\boot.js":[function(require,module,exports){
"use strict";

var g = window.g || {};

g.States = {};
g.Prefabs = {};

window.g = g;

},{}],"E:\\https\\jsgconstruct\\main.js":[function(require,module,exports){
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

},{"./States/load.js":"E:\\https\\jsgconstruct\\States\\load.js","./boot.js":"E:\\https\\jsgconstruct\\boot.js"}]},{},["E:\\https\\jsgconstruct\\main.js"]);
