"use strict";

var g = window.g;

g.NWTools = {
  parseNWDataString: function(nwString) {
    var data = this.createBlankNW();

    var dataValues = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    nwString = nwString.replace(/\r/g," ");
    nwString = nwString.replace(/\n/g," ");

    if (nwString.slice(0,8) !== "GLEVNW01") { return null; }
    nwString = nwString.slice(9);

    var layerData = [];

    while (nwString.slice(0,6) === "BOARD ") {
      nwString = nwString.slice(6);
      var pos = nwString.indexOf(" ");
      var xOff = parseInt(nwString.slice(0, pos));
      nwString = nwString.slice(pos + 1);

      pos = nwString.indexOf(" ");
      var yOff = parseInt(nwString.slice(0, pos));
      nwString = nwString.slice(pos + 1);

      pos = nwString.indexOf(" ");
      var dataLength = parseInt(nwString.slice(0, pos));
      nwString = nwString.slice(pos + 1);

      pos = nwString.indexOf(" ");
      var dataLayer = parseInt(nwString.slice(0, pos));
      nwString = nwString.slice(pos + 1);

      if(dataLayer === 0) {
        if (layerData[dataLayer] == null) {
          layerData[dataLayer] = this.getBlankLayerData(0);
        }

        var boardDataString = nwString.slice(0, dataLength * 2);
        for (var i = 0; i < boardDataString.length; i += 2) {
          var tileB64 = boardDataString.slice(i, i + 2);
          var tileIndex = dataValues.indexOf(tileB64[1]);
          tileIndex += dataValues.indexOf(tileB64[0]) * dataValues.length;

          var phaserIndex = this.toPhaserIndex(tileIndex);
          layerData[dataLayer][yOff][xOff + (i / 2)] = phaserIndex;
        }
        nwString = nwString.slice(dataLength * 2);
        nwString = nwString.trim();
      }
    }
/*
    var links = [];

    var pos = nwString.indexOf("LINK");
    if( pos !== -1 )
    {
      nwString = nwString.slice(pos);

      while(nwString.slice(0,5) === "LINK ")
      {
        nwString = nwString.slice(5);

        pos = nwString.indexOf(" ");
        var levelTarget = nwString.slice(0,pos);
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var xPos = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var yPos = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var lWidth = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var lHeight = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var nX = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        pos = nwString.indexOf(" ");
        var nY = parseInt(nwString.slice(0,pos));
        nwString = nwString.slice(pos + 1);

        links.push({ level: levelTarget, x: xPos, y: yPos, w: lWidth, h: lHeight, nX: nX, nY: nY});
      }
    }

    var npcs = [];

    pos = nwString.indexOf("NPC");
    while( pos !== -1 )
    {
      nwString = nwString.slice(pos);

      nwString = nwString.slice(4);

      pos = nwString.indexOf(" ");
      var npcImage = nwString.slice(0,pos);
      nwString = nwString.slice(pos + 1);

      pos = nwString.indexOf(" ");
      var npcX = parseInt(nwString.slice(0,pos));
      nwString = nwString.slice(pos + 1);

      pos = nwString.indexOf(" ");
      var npcY = parseInt(nwString.slice(0,pos));
      nwString = nwString.slice(pos + 1);

      var npc = { image: ( npcImage === "-" ? "" : npcImage ), x: npcX, y: npcY };
      npcs.push(npc);

      pos = nwString.indexOf("NPCEND");
      nwString = nwString.slice(pos + 6);

      pos = nwString.indexOf("NPC");
    }*/

    var layerOutput = [];
    var output = "";
    for(i = 0; i < 1; i++) {
      output = "";
      for(var y = 0; y < 64; y++) {
        output += layerData[i][y].join(",") + "\n";
      }
      layerOutput[i] = output;
    }

    data.layers = layerOutput;

    return data;
  },

  getBlankLayerData: function(fillIndex) {
    var layerData = [];
    for (var y = 0; y < 64; y++) {
      layerData[y] = [];
      for (var x = 0; x < 64; x++) {
        layerData[y][x] = fillIndex;
      }
    }
    return layerData;
  },

  createBlankNW: function() {
    var data = {};
    data.layers = [];

    var layerData = this.getBlankLayerData(0);
    var layerOutput = [];
    var output = "";
    for(var y = 0; y < 64; y++) {
      output += layerData[y].join(",") + "\n";
    }

    data.layers.push(output);

    return data;
  },

  getNWDataString: function(level) {
    var output = "GLEVNW01\n";
    var dataValues = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    var layer, tileData, dataLine, layerData, index, tileDataString;
    for(var i = 0, l = level.tileMap.layers.length; i < l; i++) {
      layer = level.tileMap.layers[i];
      tileData = layer.data;
      layerData = "";

      // TODO: fix for multi-layer support
      for(var y = 0; y < level.height; y++) {
        dataLine = "";
        for(var x = 0; x < level.width; x++) {
          index = this.toGraalIndex(tileData[y][x].index);
          tileDataString = dataValues.slice(index % dataValues.length, (index % dataValues.length) + 1);
          tileDataString = dataValues.slice(Math.floor(index / dataValues.length), Math.floor(index / dataValues.length) + 1 ) + tileDataString;

          dataLine += tileDataString;
        }
        if(dataLine !== "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") {
          layerData += "BOARD 0 " + y + " 64 " + i + " " + dataLine + "\n";
        }        
      }
      output += layerData;
    }

    return output;
  },

  toPhaserIndex: function(graalIndex) {
    var section = Math.floor(graalIndex / 512);
    var sectionIndex = graalIndex % 512;
    var tileXPos = section * 16 + (sectionIndex % 16);
    var tileYPos = Math.floor(sectionIndex / 16);

    var phaserIndex = tileYPos * 128 + tileXPos;
    return phaserIndex;
  },

  toGraalIndex: function(phaserIndex) {
    var tileXPos = phaserIndex % 128;
    var tileYPos = Math.floor(phaserIndex / 128);
    var section = Math.floor(tileXPos / 16);
    var sectionIndex = tileYPos * 16 + (tileXPos % 16);

    var graalIndex = section * 512 + sectionIndex;
    return graalIndex;
  }
};
