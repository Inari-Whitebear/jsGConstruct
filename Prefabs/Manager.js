"use strict";

var fs = require("fs");

var g = window.g;

function Manager(game, tabs) {
  this.game = game;
  this.tabs = tabs;
  this.maxID = 0;

  this.files = [];
}

Manager.prototype.newLevel = function() {
  var level = new g.Prefabs.Level(this.game, "unnamed");
  this.files.push({tabid: this.maxID, level: level});

  level.create();
  this.tabs.addTab("<span tabid=\""+this.maxID+"\">unnamed</span>");
  var tab = $(this.tabs.domObject).find("[tabid=\""+this.maxID+"\"]");
  this.maxID++;
  tab.click();
};

Manager.prototype.closeLevel = function(level) {
  if (level == null) {
    level = g.States.Main.openLevel;
  }

  if(level == null) { return; }

  for (var i = 0, l = this.files.length; i < l; i++) {
    if (this.files[i].level == level) {
      this.tabs.removeTabs("[tabid=\"" + this.files[i].tabid + "\"]");
      break;
    }
  }

  this.files.splice(i, 1);

  if (g.States.Main.openLevel == level) {
    if (this.files.length > 0) {
      var newId;
      if (i > 0) {
        var newId = i - 1;
      } else {
        newId = 0;
      }

      var tab = $(this.tabs.domObject).find("[tabid=\""+this.files[newId].tabid+"\"]");
      tab.click();
    } else {
      level.hide();
      g.States.Main.openLevel = null;
    }
  }

  level.destroy();
};

Manager.prototype.saveLevel = function(level, forceChoice) {
  if(level == null) {
    level = g.States.Main.openLevel;
  }

  if(level == null) { return; }

  level.save(forceChoice);
  this.updateTab(level);
};

Manager.prototype.tabClicked = function(event) {
  g.manager.setSelectedTab($(event.target).attr("tabid"));
};

Manager.prototype.setSelectedTab = function(tabid) {
  this.selectedTab = Number(tabid);
  for (var i = 0, l = this.files.length; i < l; i++) {
    if (this.files[i].tabid === this.selectedTab) {
      g.States.Main.setOpenLevel(this.files[i].level);
    }
  }
};

Manager.prototype.updateTab = function(level) {
  for (var i = 0, l = this.files.length; i < l; i++) {
    if(this.files[i].level == level) {
      break;
    }
  }
  var tab = $(this.tabs.domObject).find("[tabid=\"" + this.files[i].tabid + "\"]");
  tab.text(level.levelName + (level.unsaved ? " *" : ""));
}

Manager.prototype.openLevel = function(path) {
  var contents = fs.readFileSync(path, {encoding: "utf8"});

  var level = new g.Prefabs.Level(this.game, path, contents);
  this.files.push({tabid: this.maxID, level: level});

  level.create();
  this.tabs.addTab("<span tabid=\"" + this.maxID + "\">" + level.levelName + "</span>");
  var tab = $(this.tabs.domObject).find("[tabid=\"" + this.maxID + "\"]");
  this.maxID++;
  tab.click();
};

Manager.prototype.doUndo = function() {
  g.States.Main.doUndo();
};

Manager.prototype.doRedo = function() {
  g.States.Main.doRedo();
};

module.exports = Manager;
