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