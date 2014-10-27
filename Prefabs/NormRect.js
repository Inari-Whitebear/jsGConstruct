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
};

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
}

module.exports = NormRect;