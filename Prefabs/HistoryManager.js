"use strict";

var g = window.g;

function HistoryManager(game, saveAmount) {
  this.game = game;

  this.saveAmount = saveAmount;
  this.savedSteps = [];
  this.stepIndex = 0;
}

HistoryManager.prototype.saveStep = function(level, x, y, originalArray, newArray, layer) {
  var stepInfo = {
    x: x,
    y: y,
    tileArrayNew: newArray,
    tileArrayOriginal: originalArray,
    layer: layer,
    level: level
  };

  if (this.stepIndex !== 0) {
    this.savedSteps.splice(0, this.stepIndex);
    this.stepIndex = 0;
  }

  this.savedSteps.unshift(stepInfo);
  this.cullSteps();
};

HistoryManager.prototype.doUndo = function() {
  if (this.stepIndex < this.savedSteps.length) {
    g.HistoryHelper.revertStep(this.savedSteps[this.stepIndex]);
    this.stepIndex++;
  }
};

HistoryManager.prototype.doRedo = function() {
  if (this.stepIndex > 0) {
    this.stepIndex--;
    g.HistoryHelper.applyStep(this.savedSteps[this.stepIndex]);
  }
};

HistoryManager.prototype.cullSteps = function() {
  if (this.savedSteps.length > this.saveAmount) {
    this.savedSteps.splice(this.saveAmount, this.savedSteps.length - this.saveAmount);
  }
};

module.exports = HistoryManager;