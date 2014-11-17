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

function NPC(game, x, y, level, image, frame) {
  Phaser.Sprite.call(this, game, x * g.tileWidth, y * g.tileHeight, image, frame);

  this.level = level;
  this.image = image;

  Object.define(this, "worldX", {
    get: function() { return this.x / 16; },
    set: function(newValue) { this.x = newValue * 16; }
  });

  Object.define(this, "worldY", {
    get: function() { return this.y / 16; },
    set: function(newValue) { this.y = newValue * 16; }
  });
}

module.exports = NPC;
