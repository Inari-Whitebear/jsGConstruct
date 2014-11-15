"use strict";

function UIManager(game) {
  this.game = game;
}

UIManager.prototype.enableUndo = function() {
  $("#menu_undo").attr("class", "");
}

UIManager.prototype.disableUndo = function() {
  $("#menu_undo").attr("class", "disabled");
}

UIManager.prototype.enableRedo = function() {
  $("#menu_redo").attr("class", "");
}

UIManager.prototype.disableRedo = function() {
  $("#menu_redo").attr("class", "disabled");
}

module.exports = UIManager;