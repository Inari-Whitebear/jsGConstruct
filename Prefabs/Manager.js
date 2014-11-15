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
  var tab = this.addTab(this.maxID, "unnamed");
  this.maxID++;
  tab.children("a").click();
};

Manager.prototype.closeLevel = function(level) {
  if (level == null) {
    level = g.States.Main.openLevel;
  }

  if(level == null) { return; }

  for (var i = 0, l = this.files.length; i < l; i++) {
    if (this.files[i].level == level) {
      //this.tabs.removeTabs("[tabid=\"" + this.files[i].tabid + "\"]");
      this.removeTab(this.files[i].tabid);
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

  var tab = $("#level_tabs #" + this.files[i].tabid);
  tab.children("a").text(level.levelName + (level.unsaved ? " *" : ""));
}

Manager.prototype.openLevel = function(path) {
  var contents = fs.readFileSync(path, {encoding: "utf8"});

  var level = new g.Prefabs.Level(this.game, path, contents);
  this.files.push({tabid: this.maxID, level: level});

  level.create();
  var tab = this.addTab(this.maxID, level.levelName);
  this.maxID++;
  tab.children("a").click();
};

Manager.prototype.doUndo = function() {
  g.States.Main.doUndo();
};

Manager.prototype.doRedo = function() {
  g.States.Main.doRedo();
};

Manager.prototype.addTab = function(tabID, tabName) {
  var tab = $("<li role=\"presentation\" id=\""+tabID+"\"></li>").append("<a role=\"tab\" href=\"#\">" + tabName + "</a>");
  var self = this;
  tab.children("a").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
    self.setSelectedTab(($(this).parent().attr("id")));
  });  
  $("#level_tabs").append(tab);
  return tab;
};

Manager.prototype.removeTab = function(tabID) {
  $("#level_tabs #"+tabID).detach();
}

module.exports = Manager;
