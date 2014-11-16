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

function HistoryManager(game, level, saveAmount) {
  this.game = game;
  this.level = level;

  this.saveAmount = saveAmount;
  this.savedSteps = [];
  this.stepIndex = 0;
}

HistoryManager.prototype.saveStep = function(x, y, originalArray, newArray, layer) {
  var stepInfo = {
    x: x,
    y: y,
    tileArrayNew: newArray,
    tileArrayOriginal: originalArray,
    layer: layer
  };

  if (this.stepIndex !== 0) {
    this.savedSteps.splice(0, this.stepIndex);
    this.stepIndex = 0;
  }

  this.savedSteps.unshift(stepInfo);
  this.cullSteps();
  this.updateUndoRedo();
};

HistoryManager.prototype.updateUndoRedo = function() {
  if (this.savedSteps.length === 0 || this.stepIndex === this.savedSteps.length) {
    g.uiManager.disableUndo();
  } else {
    g.uiManager.enableUndo();
  }

  if (this.savedSteps.length === 0 || this.stepIndex === 0) {
    g.uiManager.disableRedo();
  } else {
    g.uiManager.enableRedo();
  }
}

HistoryManager.prototype.doUndo = function() {
  if (this.stepIndex < this.savedSteps.length) {
    this.level.revertStep(this.savedSteps[this.stepIndex]);
    this.stepIndex++;
    this.updateUndoRedo();
  }
};

HistoryManager.prototype.doRedo = function() {
  if (this.stepIndex > 0) {
    this.stepIndex--;
    this.level.applyStep(this.savedSteps[this.stepIndex]);
    this.updateUndoRedo();
  }
};

HistoryManager.prototype.cullSteps = function() {
  if (this.savedSteps.length > this.saveAmount) {
    this.savedSteps.splice(this.saveAmount, this.savedSteps.length - this.saveAmount);
  }
};

module.exports = HistoryManager;