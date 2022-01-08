(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = __importDefault(require("../core/vector"));

var bit_math_1 = __importDefault(require("../core/bit-math"));

var Browser = /*#__PURE__*/function () {
  function Browser() {
    _classCallCheck(this, Browser);

    this._statsDisplay = document.createElement('div');
    this._mouseDown = false;
    this._mousePos = new vector_1.default(0, 0);
    this._oldWindowWidth = window.innerWidth;
    this._oldWindowHeight = window.innerHeight;

    this.onScroll = function (delta) {};

    this.onMouseDown = function (pos) {};

    this.onMouseUp = function (pos) {};

    this.onMouseMove = function (pos) {};

    this.onMouseDrag = function (pos) {};

    this.onMouseClick = function (pos) {};

    this.onResize = function (width, height, oldWidth, oldHeight) {};

    this.setupDOM();
    this.setupEvents();
  }

  _createClass(Browser, [{
    key: "mouseDown",
    get: function get() {
      return this._mouseDown;
    }
  }, {
    key: "mousePos",
    get: function get() {
      return this._mousePos;
    }
  }, {
    key: "setupDOM",
    value: function setupDOM() {
      this._statsDisplay.classList.add('gui');

      this._statsDisplay.classList.add('stats-display');

      document.body.append(this._statsDisplay);
    }
  }, {
    key: "setupEvents",
    value: function setupEvents() {
      var _this = this;

      var supportsWheel = false;

      var wheelHandler = function wheelHandler(e) {
        if (e.type == 'wheel') supportsWheel = true;else if (supportsWheel) return;
        var delta = (e.deltaY || -e.wheelDelta || e.detail) >> 10 || 1;

        _this.onScroll(delta);
      };

      document.addEventListener('wheel', wheelHandler);
      document.addEventListener('mousewheel', wheelHandler);
      document.addEventListener('DOMMouseScroll', wheelHandler);
      document.addEventListener('mousedown', function (e) {
        _this._mouseDown = true;

        _this.onMouseDown(new vector_1.default(e.screenX, e.screenY));
      });
      document.addEventListener('mouseup', function (e) {
        _this._mouseDown = false;

        _this.onMouseUp(new vector_1.default(e.screenX, e.screenY));
      });
      document.addEventListener('mousemove', function (e) {
        _this._mousePos.x = e.clientX;
        _this._mousePos.y = e.clientY;

        _this.onMouseMove(new vector_1.default(e.clientX, e.clientY));

        if (_this._mouseDown) {
          _this.onMouseDrag(new vector_1.default(e.clientX, e.clientY));
        }
      });
      document.addEventListener('click', function (e) {
        _this.onMouseClick(_this._mousePos);
      });
      window.addEventListener('load', function () {
        _this._oldWindowWidth = window.innerWidth;
      });
      window.addEventListener('resize', function () {
        _this.onResize(window.innerWidth, window.innerHeight, _this._oldWindowWidth, _this._oldWindowHeight);

        _this._oldWindowWidth = window.innerWidth;
        _this._oldWindowHeight = window.innerHeight;
      });
    }
  }, {
    key: "getParameter",
    value: function getParameter(name) {
      var result = null;
      var tmp = [];
      location.search.substr(1).split("&").forEach(function (item) {
        tmp = item.split('=');

        if (tmp[0] === name) {
          result = decodeURIComponent(tmp[1]);
        }
      });
      return result;
    }
  }, {
    key: "getWorldStatsHTML",
    value: function getWorldStatsHTML(world) {
      return "\n            <strong>Time:</strong> ".concat(bit_math_1.default.floor((Date.now() - world.createdAt) / 1000), "s<br>\n            <strong>Seeds:</strong>: ").concat(world.player.items.wheatSeeds, "<br>\n            <strong>Wheat:</strong> ").concat(world.player.items.opium, "<br>\n            <strong>Money:</strong> ").concat(world.player.items.money, " \u20AC<br>\n        ");
    }
  }, {
    key: "getCameraDebugHTML",
    value: function getCameraDebugHTML(camera) {
      return "\n            <strong>Camera:</strong><br>\n            <strong>X:</strong> ".concat(camera.position.x.toFixed(3), "<br>\n            <strong>Y:</strong> ").concat(camera.position.y.toFixed(3), "<br>\n            <strong>Zoom:</strong> ").concat(camera.zoomAmount.toFixed(3), "\n\n        ");
    }
  }, {
    key: "getMouseDebugHTML",
    value: function getMouseDebugHTML(camera) {
      var worldPos = camera.worldPosFromScreen(this._mousePos);
      return "\n            <strong>Mouse".concat(this._mouseDown ? ' (down)' : '', ":</strong><br>\n            <strong>X:</strong> ").concat(this._mousePos.x, "<br>\n            <strong>Y:</strong> ").concat(this._mousePos.y, "<br>\n            <strong>World X:</strong> ").concat(worldPos.x.toFixed(3), "<br>\n            <strong>World Y:</strong> ").concat(worldPos.y.toFixed(3), "\n        ");
    }
  }, {
    key: "getRendererDebugHTML",
    value: function getRendererDebugHTML(renderer) {
      var camera = renderer.camera;
      var xStart = bit_math_1.default.floor(camera.position.x / (renderer.SQUARE_SIZE * camera.zoomAmount));
      var xEnd = Math.ceil((camera.position.x + window.innerWidth) / (renderer.SQUARE_SIZE * camera.zoomAmount));
      var yStart = bit_math_1.default.floor(camera.position.y / (renderer.SQUARE_SIZE * camera.zoomAmount));
      var yEnd = Math.ceil((camera.position.y + window.innerHeight) / (renderer.SQUARE_SIZE * camera.zoomAmount));
      return "\n            <strong>Renderer:</strong><br>\n            <strong>X-start:</strong> ".concat(xStart, "<br> \n            <strong>X-end:</strong> ").concat(xEnd, "<br>\n            <strong>Y-start:</strong> ").concat(yStart, "<br>\n            <strong>Y-end:</strong> ").concat(yEnd, "\n        ");
    }
  }, {
    key: "getMiscDebugHTML",
    value: function getMiscDebugHTML(world) {
      return "\n            <strong>Tiles/Min:</strong> ".concat(world.tilesPlantedPerMin, "\n        ");
    }
  }, {
    key: "renderStats",
    value: function renderStats(world) {
      this._statsDisplay.innerHTML = "<div class=\"gui-item\">".concat(this.getWorldStatsHTML(world), "</div>");
    }
  }, {
    key: "renderDebug",
    value: function renderDebug(camera, renderer, world) {
      var debugHTMLParts = [this.getWorldStatsHTML(world), this.getCameraDebugHTML(camera), this.getMouseDebugHTML(camera), this.getRendererDebugHTML(renderer), this.getMiscDebugHTML(world)];
      this._statsDisplay.innerHTML = '<div class="gui-item">' + debugHTMLParts.join('</div><hr><div class="gui-item">') + '</div>';
    }
  }]);

  return Browser;
}();

exports.default = Browser;

},{"../core/bit-math":7,"../core/vector":12}],2:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = __importDefault(require("../core/vector"));

var Camera = /*#__PURE__*/function () {
  function Camera(worldSquareSize) {
    _classCallCheck(this, Camera);

    this.DEFAULT_ZOOM = 1;
    this._position = new vector_1.default(0, 0);
    this._zoomAmount = this.DEFAULT_ZOOM;
    this._worldSquareSize = worldSquareSize;
  }

  _createClass(Camera, [{
    key: "position",
    get: function get() {
      return this._position;
    }
  }, {
    key: "zoomAmount",
    get: function get() {
      return this._zoomAmount;
    }
  }, {
    key: "worldSquareSize",
    get: function get() {
      return this._worldSquareSize;
    }
  }, {
    key: "setup",
    value: function setup(worldSize) {
      var renderedWorldSize = worldSize * this._worldSquareSize * this._zoomAmount;
      this._position = new vector_1.default(-window.innerWidth / 2 + renderedWorldSize / 2, -window.innerHeight / 2 + renderedWorldSize / 2);
    }
  }, {
    key: "move",
    value: function move(x, y) {
      this._position = this._position.add(x, y);
    }
  }, {
    key: "zoom",
    value: function zoom(_zoom) {
      if (this._zoomAmount + _zoom < 0.2) {
        this._zoomAmount = 0.2;
        return;
      }

      var halfWindowSize = new vector_1.default(window.innerWidth / 2, window.innerHeight / 2);
      var oldPos = this.worldPosFromScreen(halfWindowSize);
      this._zoomAmount += _zoom;
      var newPos = this.worldPosFromScreen(halfWindowSize);
      this.move(-(newPos.x - oldPos.x) * this.worldSquareSize * this.zoomAmount, -(newPos.y - oldPos.y) * this.worldSquareSize * this.zoomAmount);
    }
  }, {
    key: "worldPosFromScreen",
    value: function worldPosFromScreen(screenPos) {
      return new vector_1.default((screenPos.x + this.position.x) / this.worldSquareSize / this._zoomAmount, (screenPos.y + this.position.y) / this.worldSquareSize / this._zoomAmount);
    }
  }]);

  return Camera;
}();

exports.default = Camera;

},{"../core/vector":12}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var game_loop_1 = __importDefault(require("../core/game-loop"));

var browser_1 = __importDefault(require("./browser"));

var world_1 = __importDefault(require("./world"));

var renderer_1 = __importDefault(require("../core/renderer"));

var vector_1 = __importDefault(require("../core/vector"));

var Game = /*#__PURE__*/function () {
  function Game() {
    _classCallCheck(this, Game);

    this.loop = new game_loop_1.default();
    this.renderer = new renderer_1.default();
    this.world = new world_1.default();
    this.browser = new browser_1.default();
    this._mouseDown = false;
    this._lastClickAt = Date.now();
    this.setupLoop();
    this.setupMouse();
    this.setupWindow();
    this.renderer.camera.setup(this.world.SIZE);
  }

  _createClass(Game, [{
    key: "setupMouse",
    value: function setupMouse() {
      var _this = this;

      this.browser.onScroll = function (delta) {
        _this.renderer.camera.zoom(-delta / 5);
      };

      this.browser.onMouseDown = function (pos) {
        _this._mouseDown = true;
      };

      this.browser.onMouseUp = function (pos) {
        _this._mouseDown = false;
      };

      this.browser.onMouseMove = function (pos) {
        _this.renderer.mousePos = new vector_1.default(pos.x, pos.y);
      };

      this.browser.onMouseClick = function (pos) {
        if (!_this.renderer.titleScreen.hidden) {
          _this.renderer.titleScreen.onClick(pos);

          _this._lastClickAt = Date.now();
          return;
        }

        var worldPos = _this.renderer.camera.worldPosFromScreen(pos);

        _this.world.onTileClicked(worldPos.floor());
      };
    }
  }, {
    key: "setupWindow",
    value: function setupWindow() {
      var _this2 = this;

      this.browser.onResize = function (width, height, oldWidth, oldHeight) {
        var deltaW = oldWidth - width;
        var deltaH = oldHeight - height;

        _this2.renderer.camera.move(deltaW / 2, deltaH / 2);
      };
    }
  }, {
    key: "setupLoop",
    value: function setupLoop() {
      var _this3 = this;

      this.loop.fps = 30;

      this.loop.update = function (delta) {
        if (_this3.renderer.titleScreen.hidden) {
          _this3.world.update(delta);
        }

        if (_this3._mouseDown) {
          if (Date.now() - _this3._lastClickAt > 250) {
            var worldPos = _this3.renderer.camera.worldPosFromScreen(_this3.renderer.mousePos);

            _this3.world.onTileClicked(worldPos.floor());

            _this3._lastClickAt = Date.now();
          }
        }
      };

      this.loop.render = function (interpolation) {
        _this3.renderer.render(_this3.world);

        if (_this3.renderer.titleScreen.hidden) {
          if (_this3.browser.getParameter('debug')) {
            _this3.browser.renderDebug(_this3.renderer.camera, _this3.renderer, _this3.world);
          } else {
            _this3.browser.renderStats(_this3.world);
          }
        }
      };

      this.loop.start();
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!Game._instance) {
        Game._instance = new Game();
      }

      return Game._instance;
    }
  }]);

  return Game;
}();

exports.default = Game;
Game.MOUSE_MOVE_TRESHOLD = 10;

},{"../core/game-loop":9,"../core/renderer":10,"../core/vector":12,"./browser":1,"./world":6}],4:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Inventory = function Inventory() {
  _classCallCheck(this, Inventory);

  this.wheatSeeds = 0;
  this.opium = 0;
  this.money = 0;
};

exports.default = Inventory;

},{}],5:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var inventory_1 = __importDefault(require("./inventory"));

var Player = function Player() {
  _classCallCheck(this, Player);

  this.items = new inventory_1.default();
  this.items.wheatSeeds = 50;
};

exports.default = Player;

},{"./inventory":4}],6:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var empty_1 = __importDefault(require("../tiles/empty"));

var wheat_1 = __importDefault(require("../tiles/wheat"));

var player_1 = __importDefault(require("./player"));

var robot_1 = __importDefault(require("../entities/enemies/robot"));

var vector_1 = __importDefault(require("../core/vector"));

var easings_1 = __importDefault(require("../core/easings"));

var tile_1 = __importDefault(require("../tiles/tile"));

var bit_math_1 = __importDefault(require("../core/bit-math"));

var World = /*#__PURE__*/function () {
  function World() {
    var _this = this;

    _classCallCheck(this, World);

    this.SIZE = 20;
    this.CENTER = new vector_1.default(this.SIZE / 2, this.SIZE / 2).floor();
    this._createdAt = Date.now();
    this._player = new player_1.default();
    this._entities = [];
    this._plantedTilesPerMin = [];
    this._enemyGroupsPerMin = [];
    this._tiles = Array(this.SIZE).fill([]).map(function () {
      return Array(_this.SIZE).fill([]).map(function () {
        return new empty_1.default();
      });
    });
  }

  _createClass(World, [{
    key: "tiles",
    get: function get() {
      return this._tiles;
    }
  }, {
    key: "createdAt",
    get: function get() {
      return this._createdAt;
    }
  }, {
    key: "player",
    get: function get() {
      return this._player;
    }
  }, {
    key: "entities",
    get: function get() {
      return this._entities;
    }
  }, {
    key: "tilesPlantedPerMin",
    get: function get() {
      return this._plantedTilesPerMin.length;
    }
  }, {
    key: "enemyGroupsPerMin",
    get: function get() {
      return this._enemyGroupsPerMin.length;
    }
  }, {
    key: "isValidTilePos",
    value: function isValidTilePos(x, y) {
      return this._tiles[y] != null && this._tiles[y][x] != null;
    }
  }, {
    key: "onTileClicked",
    value: function onTileClicked(pos) {
      if (!this.isValidTilePos(pos.x, pos.y)) {
        return;
      }

      var newTile = null;
      var tile = this._tiles[pos.y][pos.x];
      tile.onClicked();

      if (tile instanceof empty_1.default) {
        if (this._player.items.wheatSeeds > 0) {
          this._player.items.wheatSeeds--;
          newTile = new wheat_1.default();
        }
      }

      if (tile instanceof wheat_1.default) {
        if (tile.growthState >= 1) {
          var seedDrops = null;

          while (seedDrops === null || this._player.items.wheatSeeds + seedDrops === 0) {
            seedDrops = tile.dropSeeds();
          }

          this._player.items.wheatSeeds += seedDrops;
          this._player.items.opium += 1;
          newTile = new empty_1.default();
        }
      }

      if (newTile !== null) {
        newTile.damage = tile.damage;
        this._tiles[pos.y][pos.x] = newTile;

        if (!(newTile instanceof empty_1.default)) {
          this._plantedTilesPerMin.push(newTile.timeCreated);
        }
      }
    }
  }, {
    key: "getSurroundingTileCoords",
    value: function getSurroundingTileCoords(v) {
      var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var includeSelf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var tiles = [];

      for (var y = v.y - Math.ceil(radius); y <= v.y + Math.ceil(radius); y++) {
        if (!this._tiles[y]) {
          continue;
        }

        for (var x = v.x - Math.ceil(radius); x <= v.x + Math.ceil(radius); x++) {
          if (!this._tiles[y][x] || x === v.x && y === v.y && !includeSelf || new vector_1.default(v.x - x, v.y - y).length > Math.ceil(radius)) {
            continue;
          }

          tiles.push(new vector_1.default(x, y));
        }
      }

      return tiles;
    }
  }, {
    key: "getRandomOutsidePos",
    value: function getRandomOutsidePos() {
      var spawnRadius = this.CENTER.length * 3;
      return new vector_1.default(spawnRadius, 0).rotate(Math.random() * 360).add(this.CENTER.x, this.CENTER.y);
    }
  }, {
    key: "spawnEnemy",
    value: function spawnEnemy() {
      var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var randomShift = arguments.length > 1 ? arguments[1] : undefined;

      if (pos === null) {
        pos = this.getRandomOutsidePos();
      }

      if (randomShift) {
        var shiftVector = new vector_1.default(Math.random() * randomShift.x, Math.random() * randomShift.y).rotate(Math.random() * 360);
        pos = pos.add(shiftVector.x, shiftVector.y);
      }

      var enemy = new robot_1.default(pos.x, pos.y);

      this._entities.push(enemy);

      return enemy;
    }
  }, {
    key: "update",
    value: function update(delta) {
      var _this2 = this;

      this._plantedTilesPerMin = this._plantedTilesPerMin.filter(function (timeCreated) {
        return Date.now() - timeCreated < 60 * 1000;
      });
      this._enemyGroupsPerMin = this._enemyGroupsPerMin.filter(function (timeCreated) {
        return Date.now() - timeCreated < 60 * 1000;
      });

      for (var y = 0; y < this._tiles.length; y++) {
        for (var x = 0; x < this._tiles[y].length; x++) {
          this._tiles[y][x].damage -= delta / tile_1.default.DAMAGE_HEAL_TIME;
        }
      }

      var enemieGroups = Math.ceil((this.tilesPlantedPerMin - 40) / 10);

      if (enemieGroups > 0) {
        var spawnableGroupCount = enemieGroups - this.enemyGroupsPerMin;

        if (spawnableGroupCount > 0) {
          for (var groupIndex = 0; groupIndex < spawnableGroupCount; groupIndex++) {
            var groupSize = bit_math_1.default.floor(Math.random() * 3) + 1;
            var spawnPos = this.getRandomOutsidePos();

            for (var enemyIndex = 0; enemyIndex < groupSize; enemyIndex++) {
              var enemy = this.spawnEnemy(spawnPos, new vector_1.default(Math.random() * 3, Math.random() * 3));
              enemy.target = new vector_1.default(Math.random() * this.SIZE, Math.random() * this.SIZE).floor();
            }

            this._enemyGroupsPerMin.push(Date.now());
          }
        }
      }

      var _iterator = _createForOfIteratorHelper(this.entities),
          _step;

      try {
        var _loop = function _loop() {
          var entity = _step.value;

          if (entity instanceof robot_1.default) {
            if (entity.hasExploded) {
              _this2._entities = _this2._entities.filter(function (v) {
                return v != entity;
              });
              var MAX_EXPLOSION_RADIUS = 2;
              var entityWorldPos = entity.position.floor();
              var radius = bit_math_1.default.floor(Math.random() * (MAX_EXPLOSION_RADIUS + 1));

              var surroundingTileCoords = _this2.getSurroundingTileCoords(entityWorldPos, radius);

              var _iterator2 = _createForOfIteratorHelper(surroundingTileCoords),
                  _step2;

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var tilePos = _step2.value;
                  var distance = tilePos.add(0.5, 0.5).add(-(entityWorldPos.x + 0.5), -(entityWorldPos.y + 0.5)).length;
                  var damage = 1 - distance / (MAX_EXPLOSION_RADIUS + 1);
                  var tileDestroyed = Math.random() * MAX_EXPLOSION_RADIUS / (distance + 1) > 0.5;
                  var existingTile = _this2._tiles[tilePos.y][tilePos.x];

                  if (tileDestroyed) {
                    var emptyTile = new empty_1.default();
                    emptyTile.damage = existingTile.damage + damage;
                    _this2._tiles[tilePos.y][tilePos.x] = emptyTile;
                  } else {
                    existingTile.damage = existingTile.damage + damage;
                  }
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }
          }

          if (entity.target !== null) {
            if (!entity.isMoving) {
              entity.isMoving = true;
              entity.initialPosition = new vector_1.default(entity.position.x, entity.position.y);
            }

            var entitySpeed = entity.speed * (delta / 1000);
            var _distance = new vector_1.default(entity.target.x - entity.position.x, entity.target.y - entity.position.y).length;

            if (_distance > 0 && entity.initialPosition) {
              var initialDistance = new vector_1.default(entity.target.x - entity.initialPosition.x, entity.target.y - entity.initialPosition.y).length;
              var distanceProgress = _distance / initialDistance;
              entitySpeed = entitySpeed * (1 + 2 * easings_1.default.easeInOutQuart(1 - distanceProgress));
            }

            if (_distance <= entitySpeed) {
              _distance = entitySpeed;
            }

            entity.position.x += entitySpeed * (entity.target.x - entity.position.x) / _distance;
            entity.position.y += entitySpeed * (entity.target.y - entity.position.y) / _distance;

            if (entity.position.x === entity.target.x && entity.position.y === entity.target.y) {
              if (entity instanceof robot_1.default) {
                entity.explode();
              }

              entity.target = null;
              entity.isMoving = false;
              entity.initialPosition = null;
            }
          }
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);

  return World;
}();

exports.default = World;

},{"../core/bit-math":7,"../core/easings":8,"../core/vector":12,"../entities/enemies/robot":13,"../tiles/empty":15,"../tiles/tile":16,"../tiles/wheat":17,"./player":5}],7:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BitMath = /*#__PURE__*/function () {
  function BitMath() {
    _classCallCheck(this, BitMath);
  }

  _createClass(BitMath, null, [{
    key: "floor",
    value: function floor(n) {
      return n << 0;
    }
  }, {
    key: "round",
    value: function round(n) {
      return 0.5 + n << 0;
    }
  }, {
    key: "abs",
    value: function abs(n) {
      return (n ^ n >> 31) - (n >> 31);
    }
  }]);

  return BitMath;
}();

exports.default = BitMath;

},{}],8:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Easings = /*#__PURE__*/function () {
  function Easings() {
    _classCallCheck(this, Easings);
  }

  _createClass(Easings, null, [{
    key: "easeInCubic",
    value: function easeInCubic(x) {
      return x * x * x;
    }
  }, {
    key: "easeInOutQuart",
    value: function easeInOutQuart(x) {
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }
  }]);

  return Easings;
}();

exports.default = Easings;

},{}],9:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var GameLoop = /*#__PURE__*/function () {
  function GameLoop() {
    _classCallCheck(this, GameLoop);

    this.simulationStep = 1000 / 60;
    this.frameDelta = 0;
    this.lastFrameTimeMs = 0;
    this.fps = 60;
    this.lastFpsUpdate = 0;
    this.framesThisSecond = 0;
    this.numUpdateSteps = 0;
    this.minFrameDelay = 0;
    this.running = false;
    this.started = false;
    this.panic = false;

    this.begin = function (time, delta) {};

    this.end = function (fps, panic) {};

    this.update = function (delta) {};

    this.render = function (interpolation) {};

    this.animate = this.animate.bind(this);
  }

  _createClass(GameLoop, [{
    key: "maxAllowedFps",
    get: function get() {
      return 1000 / this.minFrameDelay;
    },
    set: function set(fps) {
      if (fps == null) {
        fps = Infinity;
      }

      if (fps === 0) {
        this.stop();
      } else {
        this.minFrameDelay = 1000 / fps;
      }
    }
  }, {
    key: "resetFrameDelta",
    value: function resetFrameDelta() {
      var frameDelta = this.frameDelta;
      this.frameDelta = 0;
      return frameDelta;
    }
  }, {
    key: "start",
    value: function start() {
      var _this = this;

      if (this.started) {
        return;
      }

      this.started = true;
      this.rafHandle = requestAnimationFrame(function (timestamp) {
        _this.render(1);

        _this.running = true;
        _this.lastFrameTimeMs = timestamp;
        _this.lastFpsUpdate = timestamp;
        _this.framesThisSecond = 0;
        _this.rafHandle = requestAnimationFrame(_this.animate);
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
      this.started = false;

      if (this.rafHandle) {
        cancelAnimationFrame(this.rafHandle);
      }
    }
  }, {
    key: "animate",
    value: function animate(time) {
      this.rafHandle = requestAnimationFrame(this.animate);

      if (time < this.lastFrameTimeMs + this.minFrameDelay) {
        return;
      }

      this.frameDelta += time - this.lastFrameTimeMs;
      this.lastFrameTimeMs = time;
      this.begin(time, this.frameDelta);

      if (time > this.lastFpsUpdate + 1000) {
        this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;
        this.lastFpsUpdate = time;
        this.framesThisSecond = 0;
      }

      ++this.framesThisSecond;
      this.numUpdateSteps = 0;

      while (this.frameDelta >= this.simulationStep) {
        this.update(this.simulationStep);
        this.frameDelta -= this.simulationStep;

        if (++this.numUpdateSteps >= 240) {
          this.panic = true;
          break;
        }
      }

      this.render(this.frameDelta / this.simulationStep);
      this.end(this.fps, this.panic);
      this.panic = false;
    }
  }]);

  return GameLoop;
}();

exports.default = GameLoop;

},{}],10:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var camera_1 = __importDefault(require("../base/camera"));

var empty_1 = __importDefault(require("../tiles/empty"));

var util_1 = __importDefault(require("./util"));

var vector_1 = __importDefault(require("./vector"));

var title_screen_1 = __importDefault(require("../title-screen/title-screen"));

var bit_math_1 = __importDefault(require("./bit-math"));

var Renderer = /*#__PURE__*/function () {
  function Renderer() {
    _classCallCheck(this, Renderer);

    this.FONT_SIZE = 12;
    this.FONT_EMOJI_SIZE = 16;
    this.SQUARE_SIZE = 32;
    this._canvas = document.createElement('canvas');
    this.camera = new camera_1.default(this.SQUARE_SIZE);
    this.titleScreen = new title_screen_1.default();
    this.mousePos = new vector_1.default(0, 0);
    this.setupCanvas();
  }

  _createClass(Renderer, [{
    key: "width",
    get: function get() {
      return this._canvas.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._canvas.height;
    }
  }, {
    key: "z",
    get: function get() {
      return this.camera.zoomAmount;
    }
  }, {
    key: "setupCanvas",
    value: function setupCanvas() {
      var _this = this;

      this.setToWindowSize();
      window.addEventListener('load', function (e) {
        _this.setToWindowSize();
      });
      window.addEventListener('resize', function (e) {
        _this.setToWindowSize();
      });
      document.body.append(this._canvas);
    }
  }, {
    key: "setToWindowSize",
    value: function setToWindowSize() {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;
    }
  }, {
    key: "paintChar",
    value: function paintChar(ctx, char, charColor, x, y, isHover) {
      if (isHover) {
        ctx.shadowColor = "white";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = bit_math_1.default.floor(5 * this.z);
      }

      var fontSize = this.FONT_SIZE;
      var fontFamily = "Courier New";

      if (!util_1.default.isAlphaNumeric(char)) {
        fontSize = this.FONT_EMOJI_SIZE;
        fontFamily = "OpenMoji";
      }

      var textDrawPos = new vector_1.default((this.SQUARE_SIZE * x + this.SQUARE_SIZE / 2) * this.z - this.camera.position.x, (this.SQUARE_SIZE * y + this.SQUARE_SIZE / 2) * this.z - this.camera.position.y);
      var fontDrawSize = bit_math_1.default.floor(fontSize * this.z);
      ctx.fillStyle = charColor;
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';
      ctx.font = "".concat(fontDrawSize, "px \"").concat(fontFamily, "\"");
      ctx.fillText(char, bit_math_1.default.floor(textDrawPos.x), bit_math_1.default.floor(textDrawPos.y));
      ctx.shadowBlur = 0;
    }
  }, {
    key: "paintSquare",
    value: function paintSquare(ctx, x, y, isHover, fillStyle) {
      var opacity = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
      var char = arguments.length > 6 ? arguments[6] : undefined;
      var charColor = arguments.length > 7 ? arguments[7] : undefined;
      var zoom = this.camera.zoomAmount;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = fillStyle;
      ctx.fillRect(this.SQUARE_SIZE * x * zoom - this.camera.position.x, this.SQUARE_SIZE * y * zoom - this.camera.position.y, this.SQUARE_SIZE * zoom, this.SQUARE_SIZE * zoom);

      if (char) {
        var charFillStyle = charColor ? charColor : 'white';
        this.paintChar(ctx, char, charFillStyle, x, y, isHover);
      }
    }
  }, {
    key: "outlineSquare",
    value: function outlineSquare(ctx, x, y) {
      var borderWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = borderWidth * this.z;
      ctx.strokeRect((this.SQUARE_SIZE * x + borderWidth / 2) * this.z - this.camera.position.x, (this.SQUARE_SIZE * y + borderWidth / 2) * this.z - this.camera.position.y, (this.SQUARE_SIZE - borderWidth) * this.z, (this.SQUARE_SIZE - borderWidth) * this.z);
    }
  }, {
    key: "paintProgressBar",
    value: function paintProgressBar(ctx, x, y, width, height, progress) {
      var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'green';
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = 'white';
      ctx.fillRect(this.SQUARE_SIZE * x * this.z - this.camera.position.x, this.SQUARE_SIZE * y * this.z - this.camera.position.y, this.SQUARE_SIZE * width * this.z, this.SQUARE_SIZE * height * this.z);
      ctx.fillStyle = color;
      ctx.fillRect((this.SQUARE_SIZE * x + 1) * this.z - this.camera.position.x, (this.SQUARE_SIZE * y + 1) * this.z - this.camera.position.y, (this.SQUARE_SIZE * width - 2) * this.z * progress, (this.SQUARE_SIZE * height - 2) * this.z);
      ctx.globalAlpha = 1;
    }
  }, {
    key: "render",
    value: function render(world) {
      var ctx = this._canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      var mouseWorldPos = this.camera.worldPosFromScreen(this.mousePos);
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      var xStart = Math.floor(this.camera.position.x / (this.SQUARE_SIZE * this.camera.zoomAmount));
      var xEnd = Math.ceil((this.camera.position.x + window.innerWidth) / (this.SQUARE_SIZE * this.camera.zoomAmount));
      var yStart = Math.floor(this.camera.position.y / (this.SQUARE_SIZE * this.camera.zoomAmount));
      var yEnd = Math.ceil((this.camera.position.y + window.innerHeight) / (this.SQUARE_SIZE * this.camera.zoomAmount));

      for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
          this.paintSquare(ctx, x, y, false, util_1.default.lightenDarkenColor(empty_1.default.COLOR, 8));
        }
      }

      for (var _y = 0; _y < world.tiles.length; _y++) {
        for (var _x = 0; _x < world.tiles[_y].length; _x++) {
          ctx.globalAlpha = 1;

          var isHover = bit_math_1.default.floor(mouseWorldPos.x) === _x && bit_math_1.default.floor(mouseWorldPos.y) === _y;

          var tile = world.tiles[_y][_x];
          tile.render(this, ctx, _x, _y, isHover);

          if (isHover) {
            this.outlineSquare(ctx, _x, _y);
          }

          tile.renderLatest(this, ctx, _x, _y, isHover);
        }
      }

      var _iterator = _createForOfIteratorHelper(world.entities),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entity = _step.value;
          this.paintChar(ctx, entity.getChar(), 'white', entity.position.x, entity.position.y, false);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.titleScreen.render(this, ctx);
    }
  }]);

  return Renderer;
}();

exports.default = Renderer;

},{"../base/camera":2,"../tiles/empty":15,"../title-screen/title-screen":20,"./bit-math":7,"./util":11,"./vector":12}],11:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Util = /*#__PURE__*/function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: "isAlphaNumeric",
    value: function isAlphaNumeric(text) {
      return Util.alphaNumericRegExp.test(text);
    }
  }, {
    key: "leadZeros",
    value: function leadZeros(value, size) {
      value = value.toString();

      while (value.length < size) {
        value = '0' + value;
      }

      return value;
    }
  }, {
    key: "mixColors",
    value: function mixColors(color1, color2, percent) {
      var red1 = parseInt(color1[1] + color1[2], 16);
      var green1 = parseInt(color1[3] + color1[4], 16);
      var blue1 = parseInt(color1[5] + color1[6], 16);
      var red2 = parseInt(color2[1] + color2[2], 16);
      var green2 = parseInt(color2[3] + color2[4], 16);
      var blue2 = parseInt(color2[5] + color2[6], 16);
      var red = Math.round(Util.mix(red1, red2, percent));
      var green = Math.round(Util.mix(green1, green2, percent));
      var blue = Math.round(Util.mix(blue1, blue2, percent));
      return Util.generateHexFromRGB(red, green, blue);
    }
  }, {
    key: "generateHexFromRGB",
    value: function generateHexFromRGB(r, g, b) {
      var rs = r.toString(16);
      var gs = g.toString(16);
      var bs = b.toString(16);

      while (rs.length < 2) {
        rs = "0" + rs;
      }

      while (gs.length < 2) {
        gs = "0" + gs;
      }

      while (bs.length < 2) {
        bs = "0" + bs;
      }

      return "#" + rs + gs + bs;
    }
  }, {
    key: "mix",
    value: function mix(start, end, percent) {
      return start + percent * (end - start);
    }
  }, {
    key: "lightenDarkenColor",
    value: function lightenDarkenColor(color, amount) {
      var usePound = false;

      if (color[0] == "#") {
        color = color.slice(1);
        usePound = true;
      }

      var num = parseInt(color, 16);
      var r = (num >> 16) + amount;
      if (r > 255) r = 255;else if (r < 0) r = 0;
      var b = (num >> 8 & 0x00FF) + amount;
      if (b > 255) b = 255;else if (b < 0) b = 0;
      var g = (num & 0x0000FF) + amount;
      if (g > 255) g = 255;else if (g < 0) g = 0;
      return (usePound ? "#" : "") + (g | b << 8 | r << 16).toString(16);
    }
  }]);

  return Util;
}();

exports.default = Util;
Util.alphaNumericRegExp = new RegExp("[\\w ]+");

},{}],12:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bit_math_1 = __importDefault(require("./bit-math"));

var Vector = /*#__PURE__*/function () {
  function Vector(x, y) {
    _classCallCheck(this, Vector);

    this.x = x;
    this.y = y;
  }

  _createClass(Vector, [{
    key: "length",
    get: function get() {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
  }, {
    key: "add",
    value: function add(x, y) {
      return new Vector(this.x + x, this.y + y);
    }
  }, {
    key: "floor",
    value: function floor() {
      return new Vector(bit_math_1.default.floor(this.x), bit_math_1.default.floor(this.y));
    }
  }, {
    key: "rotate",
    value: function rotate(deg) {
      var rad = -deg * (Math.PI / 180);
      var cos = Math.cos(rad);
      var sin = Math.sin(rad);
      return new Vector(Math.round(10000 * (this.x * cos - this.y * sin)) / 10000, Math.round(10000 * (this.x * sin + this.y * cos)) / 10000);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Vector (".concat(this.x, ", ").concat(this.y, ")");
    }
  }]);

  return Vector;
}();

exports.default = Vector;

},{"./bit-math":7}],13:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = __importDefault(require("../../core/vector"));

var RobotEntity = /*#__PURE__*/function () {
  function RobotEntity(x, y) {
    _classCallCheck(this, RobotEntity);

    this.EXPLODE_TIME = 3 * 1000;
    this.name = 'Robot';
    this.speed = 2;
    this.initialPosition = null;
    this.target = null;
    this.isHostile = true;
    this.isMoving = false;
    this._explodedAt = null;
    this.position = new vector_1.default(x, y);
  }

  _createClass(RobotEntity, [{
    key: "explosionProgress",
    get: function get() {
      if (this._explodedAt === null) {
        return 0;
      }

      var progress = (Date.now() - this._explodedAt) / this.EXPLODE_TIME;
      return progress > 1 ? 1 : progress;
    }
  }, {
    key: "hasExploded",
    get: function get() {
      return this.explosionProgress === 1;
    }
  }, {
    key: "getChar",
    value: function getChar() {
      if (this.explosionProgress > 0) {
        if (this.explosionProgress <= 0.6) {
          return '💣';
        }

        if (this.explosionProgress > 0.6 && this.explosionProgress < 0.8) {
          return '✨';
        }

        if (this.explosionProgress > 0.8 && this.explosionProgress < 1) {
          return '💥';
        }

        if (this.explosionProgress >= 1) {
          return '🔥';
        }
      }

      return '🤖';
    }
  }, {
    key: "explode",
    value: function explode() {
      this._explodedAt = Date.now();
    }
  }]);

  return RobotEntity;
}();

exports.default = RobotEntity;

},{"../../core/vector":12}],14:[function(require,module,exports){
"use strict";

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var game_1 = __importDefault(require("./base/game"));

game_1.default.instance;

},{"./base/game":3}],15:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var tile_1 = __importDefault(require("./tile"));

var EmptyTile = /*#__PURE__*/function (_tile_1$default) {
  _inherits(EmptyTile, _tile_1$default);

  var _super = _createSuper(EmptyTile);

  function EmptyTile() {
    var _this;

    _classCallCheck(this, EmptyTile);

    _this = _super.apply(this, arguments);
    _this.name = "Empty";
    _this.timeCreated = Date.now();
    return _this;
  }

  _createClass(EmptyTile, [{
    key: "getChar",
    value: function getChar() {
      return 'x';
    }
  }, {
    key: "getHexColor",
    value: function getHexColor() {
      return this.getDamagedHexColor(EmptyTile.COLOR);
    }
  }, {
    key: "getCharColor",
    value: function getCharColor() {
      return '#666666';
    }
  }, {
    key: "onClicked",
    value: function onClicked() {}
  }, {
    key: "renderLatest",
    value: function renderLatest(renderer, ctx, x, y, isHover) {
      _get(_getPrototypeOf(EmptyTile.prototype), "renderLatest", this).call(this, renderer, ctx, x, y, isHover);
    }
  }]);

  return EmptyTile;
}(tile_1.default);

exports.default = EmptyTile;
EmptyTile.COLOR = '#ebb434';

},{"./tile":16}],16:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = __importDefault(require("../core/util"));

var Tile = /*#__PURE__*/function () {
  function Tile() {
    _classCallCheck(this, Tile);

    this.name = "";
    this.timeCreated = Date.now();
    this._damage = 0;
  }

  _createClass(Tile, [{
    key: "damage",
    get: function get() {
      return this._damage;
    },
    set: function set(amount) {
      this._damage = amount > 1 ? 1 : amount < 0 ? 0 : amount;
    }
  }, {
    key: "hasCollision",
    value: function hasCollision() {
      return false;
    }
  }, {
    key: "getChar",
    value: function getChar() {
      return 'x';
    }
  }, {
    key: "getDamagedHexColor",
    value: function getDamagedHexColor(color) {
      var lightenDarkenFactor = -this.damage * 50;
      return util_1.default.lightenDarkenColor(color, lightenDarkenFactor);
    }
  }, {
    key: "getHexColor",
    value: function getHexColor() {
      return '#000000';
    }
  }, {
    key: "getCharColor",
    value: function getCharColor() {
      return '#000000';
    }
  }, {
    key: "onClicked",
    value: function onClicked() {}
  }, {
    key: "paintSquare",
    value: function paintSquare(renderer, ctx, x, y, isHover) {
      var hexColor = this.getHexColor();

      if (!hexColor) {
        return;
      }

      renderer.paintSquare(ctx, x, y, isHover, hexColor, 1, this.getChar(), this.getCharColor());
    }
  }, {
    key: "render",
    value: function render(renderer, ctx, x, y, isHover) {
      this.paintSquare(renderer, ctx, x, y, isHover);
    }
  }, {
    key: "renderLatest",
    value: function renderLatest(renderer, ctx, x, y, isHover) {
      if (isHover && this.damage > 0) {
        renderer.paintProgressBar(ctx, x + 0.25 / 2, y + 0.15, 0.75, 0.15, this.damage, 'red');
      }
    }
  }, {
    key: "update",
    value: function update(delta) {}
  }]);

  return Tile;
}();

exports.default = Tile;
Tile.DAMAGE_HEAL_TIME = 60 * 1000;
Tile.COLOR = '';

},{"../core/util":11}],17:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = __importDefault(require("../core/util"));

var empty_1 = __importDefault(require("./empty"));

var tile_1 = __importDefault(require("./tile"));

var easings_1 = __importDefault(require("../core/easings"));

var bit_math_1 = __importDefault(require("../core/bit-math"));

var WheatTile = /*#__PURE__*/function (_tile_1$default) {
  _inherits(WheatTile, _tile_1$default);

  var _super = _createSuper(WheatTile);

  function WheatTile() {
    var _this;

    _classCallCheck(this, WheatTile);

    _this = _super.apply(this, arguments);
    _this.GROWTH_TIME = 7.5 * 1000;
    _this.MIN_SEED_DROP = 0;
    _this.MAX_SEED_DROP = 3;
    _this.COLOR_GROWN = '#7dbf21';
    _this.name = "Wheat";
    return _this;
  }

  _createClass(WheatTile, [{
    key: "growthState",
    get: function get() {
      var growth = (Date.now() - this.timeCreated) / this.GROWTH_TIME;

      if (growth < 1) {
        return growth * (1 - this.damage);
      }

      return growth > 1 ? 1 : growth;
    }
  }, {
    key: "getChar",
    value: function getChar() {
      var char = '🌿';

      if (this.growthState < 0.4) {
        char = '🌱';
      }

      if (this.growthState >= 1) {
        char = '🌾';
      }

      return char;
    }
  }, {
    key: "getCharColor",
    value: function getCharColor() {
      return '#ffffff';
    }
  }, {
    key: "getHexColor",
    value: function getHexColor() {
      var mixAmount = easings_1.default.easeInCubic(this.growthState);
      var growthColor = util_1.default.mixColors(empty_1.default.COLOR, this.COLOR_GROWN, mixAmount);
      return this.getDamagedHexColor(growthColor);
    }
  }, {
    key: "onClicked",
    value: function onClicked() {}
  }, {
    key: "dropSeeds",
    value: function dropSeeds() {
      return bit_math_1.default.floor(Math.random() * (this.MAX_SEED_DROP - this.MIN_SEED_DROP + 1)) + this.MIN_SEED_DROP;
    }
  }, {
    key: "render",
    value: function render(renderer, ctx, x, y, isHover) {
      _get(_getPrototypeOf(WheatTile.prototype), "render", this).call(this, renderer, ctx, x, y, isHover);
    }
  }, {
    key: "renderLatest",
    value: function renderLatest(renderer, ctx, x, y, isHover) {
      _get(_getPrototypeOf(WheatTile.prototype), "renderLatest", this).call(this, renderer, ctx, x, y, isHover);

      if (isHover && this.growthState < 1) {
        renderer.paintProgressBar(ctx, x + 0.25 / 2, y + 0.7, 0.75, 0.15, this.growthState);
      }
    }
  }]);

  return WheatTile;
}(tile_1.default);

exports.default = WheatTile;

},{"../core/bit-math":7,"../core/easings":8,"../core/util":11,"./empty":15,"./tile":16}],18:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = __importDefault(require("../core/util"));

var TitleScreenLoadSlide = /*#__PURE__*/function () {
  function TitleScreenLoadSlide() {
    _classCallCheck(this, TitleScreenLoadSlide);

    this.music = new Audio('audio/210107blunt164.ogg');
    this.music.loop = true;
  }

  _createClass(TitleScreenLoadSlide, [{
    key: "render",
    value: function render(renderer, ctx) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, renderer.width, renderer.height);
      ctx.fillStyle = '#f3bc3c';
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';
      ctx.font = "".concat(20 * 1, "px \"Courier New\"");
      ctx.shadowColor = util_1.default.lightenDarkenColor("#f3bc3c", 20);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 7;
      ctx.fillText("Load".toUpperCase().split('').join(' '), renderer.width / 2, renderer.height / 2);
      ctx.shadowBlur = 0;
    }
  }, {
    key: "update",
    value: function update(delta) {}
  }, {
    key: "onClick",
    value: function onClick(pos) {
      if (this.music.paused) {
        this.music.play();
      }
    }
  }]);

  return TitleScreenLoadSlide;
}();

exports.default = TitleScreenLoadSlide;

},{"../core/util":11}],19:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = __importDefault(require("../core/util"));

var TitleScreenLogoSlide = /*#__PURE__*/function () {
  function TitleScreenLogoSlide() {
    _classCallCheck(this, TitleScreenLogoSlide);

    this._logo = [' __     __     __  __     ______     ______     ______      ______   ______     ______     __    __     ______     ______    ', '/\\ \\  _ \\ \\   /\\ \\_\\ \\   /\\  ___\\   /\\  __ \\   /\\__  _\\    /\\  ___\\ /\\  __ \\   /\\  == \\   /\\ "-./  \\   /\\  ___\\   /\\  == \\   ', '\\ \\ \\/ ".\\ \\  \\ \\  __ \\  \\ \\  __\\   \\ \\  __ \\  \\/_/\\ \\/    \\ \\  __\\ \\ \\  __ \\  \\ \\  __<   \\ \\ \\-./\\ \\  \\ \\  __\\   \\ \\  __<   ', ' \\ \\__/".~\\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\     \\ \\_\\    \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\ ', '  \\/_/   \\/_/   \\/_/\\/_/   \\/_____/   \\/_/\\/_/     \\/_/      \\/_/     \\/_/\\/_/   \\/_/ /_/   \\/_/  \\/_/   \\/_____/   \\/_/ /_/ '];
    this._description = ["Plant wheat seeds, harvest crops and sell them.", "", "Avoid robot attacks at all costs."];
  }

  _createClass(TitleScreenLogoSlide, [{
    key: "render",
    value: function render(renderer, ctx) {
      var longestLineWidth = this._logo.reduce(function (a, b) {
        return a.length > b.length ? a : b;
      }).length;

      var targetLogoWidth = 0.75;
      var fontSize = renderer.width / (20 * longestLineWidth) * 1.65 * targetLogoWidth;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, renderer.width, renderer.height);
      ctx.fillStyle = '#f3bc3c';
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';
      ctx.font = "".concat(20 * fontSize, "px \"Courier New\"");
      ctx.shadowColor = util_1.default.lightenDarkenColor("#f3bc3c", 20);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 7;
      var yShift = Math.sin(Date.now() / 1000 % 4) * 20;

      for (var line = 0; line < this._logo.length; line++) {
        var lineOffset = 20 * fontSize * (line - this._logo.length);
        ctx.fillText(this._logo[line], renderer.width / 2, renderer.height / 2 + lineOffset + yShift);
      }

      fontSize = 20;
      ctx.textBaseline = 'top';
      ctx.font = "".concat(fontSize, "px \"Courier New\"");

      for (var dLine = 0; dLine < this._description.length; dLine++) {
        var descriptionOffset = 1.5 * fontSize * (dLine + 3);
        ctx.fillText(this._description[dLine], renderer.width / 2, renderer.height / 2 + descriptionOffset);
      }

      ctx.shadowBlur = 0;
    }
  }, {
    key: "update",
    value: function update(delta) {}
  }, {
    key: "onClick",
    value: function onClick(pos) {}
  }]);

  return TitleScreenLogoSlide;
}();

exports.default = TitleScreenLogoSlide;

},{"../core/util":11}],20:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var title_screen_logo_slide_1 = __importDefault(require("./title-screen-logo-slide"));

var title_screen_load_1 = __importDefault(require("./title-screen-load"));

var TitleScreen = /*#__PURE__*/function () {
  function TitleScreen() {
    _classCallCheck(this, TitleScreen);

    this._hidden = false;
    this._slideId = 0;
    this._slides = [new title_screen_load_1.default(), new title_screen_logo_slide_1.default()];
    this._clickedAt = null;
  }

  _createClass(TitleScreen, [{
    key: "hidden",
    get: function get() {
      return this._hidden;
    }
  }, {
    key: "onClick",
    value: function onClick(pos) {
      if (this._clickedAt === null) {
        this._clickedAt = Date.now();
      }

      this._slides[this._slideId].onClick(pos);

      if (this._slideId + 1 > this._slides.length - 1) {
        var _iterator = _createForOfIteratorHelper(this._slides),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var slide = _step.value;

            if (slide instanceof title_screen_load_1.default) {
              slide.music.volume = 0.25;
              break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this._hidden = true;
        return;
      }

      this._slideId++;
    }
  }, {
    key: "update",
    value: function update(delta) {
      if (this._slides[this._slideId]) {
        this._slides[this._slideId].update(delta);
      }
    }
  }, {
    key: "render",
    value: function render(renderer, ctx) {
      if (this._hidden) {
        return;
      }

      if (this._slides[this._slideId]) {
        this._slides[this._slideId].render(renderer, ctx);
      }
    }
  }]);

  return TitleScreen;
}();

exports.default = TitleScreen;

},{"./title-screen-load":18,"./title-screen-logo-slide":19}]},{},[14])

//# sourceMappingURL=index.js.map
