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


var fs = require("fs");
var nodePath = require("path");

function FileManager(game) {
  this.loadedFiles = {};
  this.loading = {};
  this.game = game;
}

FileManager.prototype.boot = function() {
  this.game.load.onFileComplete.add(this.loaderFileComplete, this);
}

FileManager.prototype.load = function(name, objectType, callback, thisArg) {
  if (name in this.loadedFiles) {
    if (this.loadedFiles[name].object == false) {
      this["create_" + objectType](this.loadedFiles[name].path);
      this.loadedFiles[name].object = true;
      if (!(name in this.loading)) { this.loading[name] = []; }
      this.loading[name].push([callback, thisArg]);
    } else {
      callback.call(thisArg, name, true);
    }
    return;
  }

  var path = this.search(name);
  if (path != null) {
    this["create_" + objectType](path);
    this.loadedFiles[name] = {path: path, loaded: true};
    if (!(name in this.loading)) { this.loading[name] = []; }
    this.loading[name].push([callback, thisArg]);
  }
};

FileManager.prototype.search = function(name) {
  var found = null;

  this.walk(g.graalFolder, function(baseName, fileName, isDirectory) {
    if (!isDirectory) {
      if (baseName == name) {
        found = fileName;  
        return true;
      } else {
        if(!(baseName in this.loadedFiles)) {
          this.loadedFiles[baseName] = {path: fileName, object: null};
        }
      }
    }
    return false;
  });

  if (found != null) {
    return found;
  }
};

FileManager.prototype.walk = function(path, callback) {
  //console.log("Walking path " + path);
  var results = fs.readdirSync(path);
  var stat, fullPath, baseName;
  for (var i = 0, l = results.length; i < l; i++) {
    fullPath = nodePath.join(path, results[i]);
    baseName = results[i];
    stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (callback.call(this, baseName, fullPath, true)) {
        return true;
      }
      if (this.walk(fullPath, callback)) {
        return true;
      }
    } else {
      if (callback.call(this, baseName, fullPath, false)) {
        return true;
      }
    }
  }
  return false;
}


FileManager.prototype.loadImage = function(name, callback, thisArg) {
  this.load(name, "image", callback, thisArg);
}

FileManager.prototype.loaderFileComplete = function(progress, key, success) {
  if (key in this.loading) {
    for (var i = 0, l = this.loading[key].length; i < l; i++) {
      this.loading[key][i][0].call(this.loading[key][i][1], key, success);
    }
    delete this.loading[key];
  }
};

FileManager.prototype.create_image = function(path) {
  this.game.load.image(nodePath.basename(path), path);
  this.game.load.start();
}

module.exports = FileManager;