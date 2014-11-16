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

UIManager.prototype.setEnabled = function(name, enabled) {
  var func = "addClass";
  if (enabled) { func = "removeClass"; }

  $("#menu_" + name)[func]("disabled");
  $("#toolbar_" + name)[func]("disabled");
};

module.exports = UIManager;