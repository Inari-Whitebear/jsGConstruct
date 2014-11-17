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

function NormRect(x, y, w, h) {
  this.rawRect = {};
  this.rawRect.x = x || 0;
  this.rawRect.y = y || 0;
  this.rawRect.w = w || 0;
  this.rawRect.h = h || 0;

  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.calcRect();
}

NormRect.prototype.calcRect = function() {
  if (this.rawRect.w < 0) {
    this.x = this.rawRect.x + this.rawRect.w;
  } else {
    this.x = this.rawRect.x;
  }

  if (this.rawRect.h < 0) {
    this.y = this.rawRect.y + this.rawRect.h;
  } else {
    this.y = this.rawRect.y;
  }

  this.w = Math.abs(this.rawRect.w);
  this.h = Math.abs(this.rawRect.h);
};

module.exports = NormRect;
