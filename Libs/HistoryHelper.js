"use strict";

var g = window.g;

g.HistoryHelper = {
  applyStep: function(stepInfo) {
    stepInfo.level.applyStep(stepInfo);
  },

  revertStep: function(stepInfo) {
    stepInfo.level.revertStep(stepInfo);
  }
};