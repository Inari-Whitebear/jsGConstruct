/*
  Copyright 2014 "Neppy"

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


"use strict";

require("./boot.js");


window.$ = window.jQuery = require("./Libs/jQueryUI/external/jquery/jquery.js");
window.jQueryUI = require("./Libs/jQueryUI/jquery-ui.js");
require("./Libs/jQueryUI/layout/jquery.layout.js");
require("./Libs/Bootstrap/bootstrap.js");

var g = window.g;

g.levelWidth = 64;
g.levelHeight = 64;
g.tileWidth = 16;
g.tileHeight = 16;

var game = new Phaser.Game(g.levelWidth * g.tileWidth, g.levelHeight * g.tileHeight, Phaser.CANVAS, "level_render");
var layout;
var ipc = require("ipc");

$("document").ready(function () {
  var fileNew = function() {
    g.manager.newLevel();
  };

  var fileOpen = function() {
    var files = ipc.sendSync("openFile");
    if(files != null) {
      g.manager.openLevel(files[0]);
    }
  };

  var fileSave = function() {
    g.manager.saveLevel();
  };

  var fileClose = function() {
    g.manager.closeLevel();
  };

  var doUndo = function() {
    g.manager.doUndo();
  };

  var doRedo = function() {
    g.manager.doRedo();
  };

  $("#menu_open").click(fileOpen);
  $("#menu_exit").click(function() {
    ipc.sendSync("close");
  });
  $("#menu_new").click(fileNew);
  $("#menu_save").click(fileSave);
  $("#menu_saveAs").click(function() {
    g.manager.saveLevel(null, true);
  });

  $("#menu_about").click(function() {
    $("#about_dialog").dialog({});
  });

  $("#menu_undo").click(doUndo);
  $("#toolbar_undo").click(doUndo);

  $("#menu_redo").click(doRedo);
  $("#toolbar_redo").click(doRedo);

  $("#menu_close").click(fileClose);

  //$("#side_tabs_tiles").click();

  layout = $("body").layout( {
    defaults: {
      applyDefaultStyles: true,
      closable: false,
      resizable: false,
      slideable: false
    },
    north: {
      size: "auto"
    },
    east: {
      resizable: true
    },
    south: {
      size: 30
    }
  });

  var graalFolder = ipc.sendSync("chooseFolder");

  if(graalFolder == null) {
    ipc.sendSync("close");
  }

  g.graalFolder = graalFolder[0];

  $("#toolbar_new").click(fileNew);
  $("#toolbar_open").click(fileOpen);
  $("#toolbar_save").click(fileSave);
  $("#toolbar_close").click(fileClose);
});

require("./States/load.js")(game);
require("./Prefabs/load.js");
require("./Libs/NWTools.js");

g.manager = new g.Prefabs.Manager(game);
g.fileManager = new g.Prefabs.FileManager(game);
g.uiManager = new g.Prefabs.UIManager(game);
g.game = game;

game.state.start("Startup");
