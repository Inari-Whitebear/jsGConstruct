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

$("document").ready(function () {
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

  var tabs = $("#level_tabs").scrollTabs();

  var menu = $("#main_menu").jMenu();
  $("#menu_open").click(function() {
    var files = ipc.sendSync("openFile");
    if(files != null) {
      g.Manager.open(files[0]);
    }
  });

  $("#menu_exit").click(function() {
    ipc.sendSync("close");
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
});

//layout.options.east.resizable = true;



require("./States/load.js")(game);
require("./Prefabs/load.js");
require("./Libs/NWTools.js");

g.Manager = new g.Prefabs.Manager(game);

game.state.start("Startup");