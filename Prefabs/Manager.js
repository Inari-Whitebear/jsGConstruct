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

Manager.prototype.tabClicked = function(event) {
  g.Manager.setSelectedTab($(event.target).attr("tabid"));
};

Manager.prototype.setSelectedTab = function(tabid) {
  this.selectedTab = Number(tabid);
  for (var i = 0, l = this.files.length; i < l; i++) {
    if (this.files[i].tabid === this.selectedTab) {
      g.States.Main.setOpenLevel(this.files[i].level);
    }
  }
};

Manager.prototype.openLevel = function(path) {
  var contents = fs.readFileSync(path, {encoding: "utf8"});

  var level = new g.Prefabs.Level(this.game, path, contents);
  this.files.push({tabid: this.maxID, level: level});

  level.create();
  //level.show();
  this.tabs.addTab("<span tabid=\""+this.maxID+"\">unnamed</span>");
  var tab = $(this.tabs.domObject).find("[tabid=\""+this.maxID+"\"]");
  this.maxID++;
  tab.click();
};

module.exports = Manager;
