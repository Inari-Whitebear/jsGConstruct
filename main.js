"use strict";

require("./boot.js");


window.$ = window.jQuery = require("./Libs/jQueryUI/external/jquery/jquery.js");
window.jQueryUI = require("./Libs/jQueryUI/jquery-ui.js");
require("./Libs/jQueryUI/layout/jquery.layout.js");
require("./Libs/jQueryUI/jMenu/jMenu.jquery.js");
require("./Libs/jQuery-ScrollTabs/js/jquery.scrolltabs.js");
require("./Libs/jQuery-ScrollTabs/js/jquery.mousewheel.js");

var g = window.g;

g.levelWidth = 64;
g.levelHeight = 64;
g.tileWidth = 16;
g.tileHeight = 16;

var game = new Phaser.Game(g.levelWidth * g.tileWidth, g.levelHeight * g.tileHeight, Phaser.CANVAS, "level_render");
var layout;
var ipc = require("ipc");
//var tabs;

$("document").ready(function () {
  g.manager.tabs = $("#level_tabs").scrollTabs({
    click_callback: g.manager.tabClicked
  });

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

  var menu = $("#main_menu").jMenu();
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

  $("#menu_undo").click(function() {
    g.manager.doUndo();
  });

  $("#menu_redo").click(function() {
    g.manager.doRedo();
  });

  $("#menu_close").click(fileClose);

  var side_tabs = $("#side_tabs").scrollTabs({
    click_callback: function(e) {
      switch(e.target.innerText) {
        case "Tiles":
          //$("#tile_render").show();
        break;
        default:
          //$("#tile_render").hide();
        break;
      }
    }
  });

  $("#side_tabs_tiles").click();

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

  $("#toolbar_new").button({
    icons: {
      primary: "ui-icon-document"
    },
    text: false
  }).click(fileNew);
  $("#toolbar_open").button({
    icons: {
      primary: "ui-icon-folder-open"
    },
    text: false
  }).click(fileOpen);
  $("#toolbar_save").button({
    icons: {
      primary: "ui-icon-disk"
    },
    text: false
  }).click(fileSave);
  $("#toolbar_close").button({
    icons: {
      primary: "ui-icon-folder-collapsed"
    },
    text: false
  }).click(fileClose);      
});

require("./States/load.js")(game);
require("./Prefabs/load.js");
require("./Libs/NWTools.js");

g.manager = new g.Prefabs.Manager(game);
g.fileManager = new g.Prefabs.FileManager(game);
g.game = game;

game.state.start("Startup");
