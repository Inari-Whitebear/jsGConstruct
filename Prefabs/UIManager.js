"use strict";

function UIManager(game) {
  this.game = game;
}

UIManager.prototype.enableUndo = function() {
  $("#menu_undo").attr("class", "");
  $("#toolbar_undo").removeClass("disabled");
}

UIManager.prototype.disableUndo = function() {
  $("#menu_undo").attr("class", "disabled");
  $("#toolbar_undo").addClass("disabled");
}

UIManager.prototype.enableRedo = function() {
  $("#menu_redo").attr("class", "");
  $("#toolbar_redo").removeClass("disabled");
}

UIManager.prototype.disableRedo = function() {
  $("#menu_redo").attr("class", "disabled");
  $("#toolbar_redo").addClass("disabled");
}

module.exports = UIManager;