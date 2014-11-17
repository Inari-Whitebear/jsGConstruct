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

function SelectionCanvas(game, parent, key, width, height) {
  this.game = game;
  this.width = width;
  this.height = height;
  this.parent = parent;
  this.inPhaser = false;

  if (parent == null || typeof(parent) !== "string") {
    this.inPhaser = true;
  }

  this.overlay = new Phaser.BitmapData(this.game, key, this.width, this.height);
  this.overlayImage = new Phaser.Image(this.game, 0, 0, this.overlay);
  this.overlayImage.inputEnabled = true;

  this.pointerBuffer = {x: 0, y: 0};

  var downCallback = this.onMouseDown;
  var upCallback = this.onMouseUp;
  var moveCallback = this.onMouseMove;
  var self = this;
  var callbacks = {"mousedown": downCallback, "mouseup": upCallback, "mousemove": moveCallback};
  var domWrapper = function(event, callback) {
    var mouseHelper = function(domEvent) {
      var offset = Phaser.Canvas.getOffset(self.overlay.canvas);
      var pointerX = domEvent.clientX - offset.x;
      var pointerY = domEvent.clientY - offset.y;
      self.pointerBuffer.x = pointerX;
      self.pointerBuffer.y = pointerY;
      callback.call(self, domEvent);
    };
    return mouseHelper;
  };

  if (this.inPhaser) {
    this.overlayImage.events.onInputDown.add(this.onMouseDown, this);
    this.overlayImage.events.onInputUp.add(this.onMouseUp, this);
  } else {
    var element = window.document.getElementById(this.parent);
    element.addEventListener("mousedown", domWrapper("mousedown", callbacks.mousedown));
    element.addEventListener("mouseup", domWrapper("mouseup", callbacks.mouseup));
    element.addEventListener("mousemove", domWrapper("mousemove", callbacks.mousemove));
  }

  if (this.parent != null) {
    if (!this.inPhaser) {
      Phaser.Canvas.addToDOM(this.overlay.canvas, this.parent);
      this.overlay.canvas.style.zIndex = 50;
      this.overlay.canvas.style.position = "absolute";
      this.overlay.canvas.style.top = "0px";
      this.overlay.canvas.style.left = "0px";
    } else {
      this.parent.add(this.overlayImage);
    }
  }

  this.dragging = false;
  this.dirty = false;
  this.enabled = true;
  this.visible = true;
  this.selectionRect = new g.Prefabs.NormRect();

  this.onSelected = new Phaser.Signal();
}

SelectionCanvas.prototype.destroy = function() {
  this.onSelected.dispose();
  this.overlayImage.destroy();
};

SelectionCanvas.prototype.disable = function(hide) {
  if (hide == null) { hide = true; }

  this.enabled = false;
  if (hide) {
    this.hide();
    this.overlay.clear();
  }
};

SelectionCanvas.prototype.enable = function(show) {
  if (show == null) { show = true; }

  this.enabled = true;
  if (show) {
    this.show();
  }
};

SelectionCanvas.prototype.hide = function() {
  this.visible = false;
  this.overlay.clear();
  this.overlayImage.visible = false;
};

SelectionCanvas.prototype.show = function() {
  this.visible = true;
  this.overlayImage.visible = true;
};

SelectionCanvas.prototype.getPointer = function() {
  var point, pointerX, pointerY;
  if (this.inPhaser) {
    point = Phaser.Canvas.getOffset(this.game.canvas);
    pointerX = (this.game.input.mousePointer.pageX - point.x);
    pointerY = (this.game.input.mousePointer.pageY - point.y);
  } else {
    pointerX = this.pointerBuffer.x;
    pointerY = this.pointerBuffer.y;
  }
  return {x: pointerX, y: pointerY};
};

SelectionCanvas.prototype.onMouseDown = function() {
  if (!this.enabled) { return; }

  var pointer = this.getPointer();

  this.dragging = true;

  var tileX = Math.floor((pointer.x + 8) / 16);
  var tileY = Math.floor((pointer.y + 8) / 16);

  this.selectionRect.rawRect.x = tileX;
  this.selectionRect.rawRect.y = tileY;
  this.selectionRect.rawRect.w = 0;
  this.selectionRect.rawRect.h = 0;
  this.dirty = true;
};

SelectionCanvas.prototype.onMouseMove = function() {

};

SelectionCanvas.prototype.onMouseUp = function() {
  if (!this.enabled) { return; }

  //var pointer = this.getPointer();

  if (this.dragging) {
    this.dragging = false;
    this.selectionRect.calcRect();

    if (this.selectionRect.w === 0 || this.selectionRect.h === 0) {
      this.dirty = false;
      this.overlay.clear();
    }

    this.onSelected.dispatch();
  }
};

SelectionCanvas.prototype.updateDragging = function() {
  if (!this.enabled) { return; }
  if (!this.dragging) { return; }

  var pointer = this.getPointer();
  var tileX = Math.floor((pointer.x + 8) / 16);
  var tileY = Math.floor((pointer.y + 8) / 16);

  var sizeW = tileX - this.selectionRect.rawRect.x;
  var sizeH = tileY - this.selectionRect.rawRect.y;

  if (this.selectionRect.rawRect.w !== sizeW || this.selectionRect.rawRect.h !== sizeH) {
    this.dirty = true;
    this.selectionRect.rawRect.w = sizeW;
    this.selectionRect.rawRect.h = sizeH;
  }
};

SelectionCanvas.prototype.update = function() {
  if(this.dragging) {
    this.updateDragging();
  }
};

SelectionCanvas.prototype.render = function() {
  if (this.dirty) {
    this.dirty = false;
    this.overlay.clear();
    this.selectionRect.calcRect();

    var drawW = this.selectionRect.w * 16;
    var drawH = this.selectionRect.h * 16;
    var drawOffX = 0;
    var drawOffY = 0;
    if (drawW === 0) {
      drawW = 4;
      drawOffX = -2;
    }
    if (drawH === 0) {
      drawH = 4;
      drawOffY = -2;
    }

    this.overlay.context.beginPath();
    this.overlay.context.lineWidth = 2;
    this.overlay.context.strokeStyle = "rgba(255,0,0,1)";
    this.overlay.context.fillStyle = "rgba(255,0,0,0.1)";
    this.overlay.context.rect(this.selectionRect.x * 16 + drawOffX, this.selectionRect.y * 16 + drawOffY, drawW, drawH);
    this.overlay.context.fill();
    this.overlay.context.stroke();
  }
};

module.exports = SelectionCanvas;
