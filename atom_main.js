"use strict";

var app = require("app");  // Module to control application life.
var path = require("path");
var BrowserWindow = require("browser-window");  // Module to create native browser window.
var ipc = require("ipc");
var dialog = require("dialog");

// Report crashes to our server.
require("crash-reporter").start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipc.on("openFile", function(event, arg) {
  var result = dialog.showOpenDialog(mainWindow, {properties: ["openFile"]});
  event.returnValue = result || null;
});

ipc.on("saveFile", function(event, arg) {
  var result = dialog.showSaveDialog(mainWindow);
  event.returnValue = result || null;
});

ipc.on("close", function() {
  mainWindow.close();
});

ipc.on("chooseFolder", function(event, arg) {
  var result = dialog.showOpenDialog(mainWindow, {properties: ["openDirectory"], title: "Graal Folder"});
  event.returnValue = result || null;
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on("ready", function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadUrl(path.join("file://", __dirname, "index.html"));

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
