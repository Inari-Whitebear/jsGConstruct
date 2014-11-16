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

var g = window.g;

g.NWTools = {
  parseNWDataString: function(nwString) {
    var data = this.createBlankNW();

    var dataValues = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    nwString = nwString.replace(/\r/g,"");
    //nwString = nwString.replace(/\n/g," ");
    var nwLines = nwString.split("\n");

    if (nwLines[0] !== "GLEVNW01") { return null; }
    var layerData = [];
    var miscData = "";
    
    var nwData, xOff, yOff, dataLength, dataLayer, boardDataString, tileB64, tileIndex, phaserIndex;
    for(var i = 0, l = nwLines.length; i < l; i++) {
      if (nwLines[i].slice(0,6) === "BOARD ") {
        nwString = nwLines[i].trim();
        nwData = nwString.split(" ");

        xOff = parseInt(nwData[1]);
        yOff = parseInt(nwData[2]);
        dataLength = parseInt(nwData[3]);
        dataLayer = parseInt(nwData[4]);

        if(dataLayer === 0) {
          if (layerData[dataLayer] == null) {
            layerData[dataLayer] = this.getBlankLayerData(0);
          }

          boardDataString = nwData[5];
          for (var j = 0, jL = boardDataString.length; j < jL; j += 2) {
            tileB64 = boardDataString.slice(j, j + 2);
            tileIndex = dataValues.indexOf(tileB64[1]);
            tileIndex += dataValues.indexOf(tileB64[0]) * dataValues.length;

            phaserIndex = this.toPhaserIndex(tileIndex);
            layerData[dataLayer][yOff][xOff + (j / 2)] = phaserIndex;
          }
        } else {
          miscData += nwLines[i] + "\n";
        }
      } else {
        miscData += nwLines[i] + "\n";
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
    data.miscData = miscData;

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

    output += level.miscData;

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
