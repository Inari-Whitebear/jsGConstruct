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

  var menu = $("#main_menu").jMenu();
  $("#menu_open").click(function() {
    var files = ipc.sendSync("openFile");
    if(files != null) {
      g.manager.openLevel(files[0]);
    }
  });

  $("#menu_exit").click(function() {
    ipc.sendSync("close");
  });

  $("#menu_new").click(function() {
    g.manager.newLevel();
  });

  $("#menu_save").click(function() {
    g.States.Main.saveLevel();
  });

  $("#menu_about").click(function() {
    $("#about_dialog").dialog({});
  });

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
});

require("./States/load.js")(game);
require("./Prefabs/load.js");
require("./Libs/NWTools.js");

g.manager = new g.Prefabs.Manager(game);
g.game = game;

game.state.start("Startup");
