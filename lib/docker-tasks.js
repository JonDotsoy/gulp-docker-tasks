"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _gulp = require("gulp");

var _gulp2 = _interopRequireDefault(_gulp);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _gulpUtil = require("gulp-util");

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _child_process = require("child_process");

var _gulpSequence = require("gulp-sequence");

var _gulpSequence2 = _interopRequireDefault(_gulpSequence);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _dockerManager = require("docker-manager");

var _dockerManager2 = _interopRequireDefault(_dockerManager);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var dockerTasks = (function () {
	function dockerTasks() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref$gulp = _ref.gulp;
		var gulp = _ref$gulp === undefined ? _gulp2["default"] : _ref$gulp;
		var _ref$cpexec = _ref.cpexec;
		var cpexec = _ref$cpexec === undefined ? _child_process.exec : _ref$cpexec;
		var _ref$config = _ref.config;
		var config = _ref$config === undefined ? null : _ref$config;
		var _ref$_package = _ref._package;

		var _package = _ref$_package === undefined ? null : _ref$_package;

		var _ref$workDir = _ref.workDir;
		var workDir = _ref$workDir === undefined ? process.cwd() : _ref$workDir;
		var _ref$names = _ref.names;
		var names = _ref$names === undefined ? {} : _ref$names;
		var _ref$dockerManager = _ref.dockerManager;
		var dockerManager = _ref$dockerManager === undefined ? new _dockerManager2["default"]({
			logger: _gulpUtil2["default"].log
		}) : _ref$dockerManager;

		_classCallCheck(this, dockerTasks);

		this.cpexec = cpexec;
		this.gulp = gulp;
		this.config = config;
		this.names = names;
		this.docker = dockerManager;
		this.workDir = workDir;

		if (_package == null) {
			try {
				_package = require(workDir + "/package.json");
			} catch (ex) {
				_package = {};
			}
		}

		this["package"] = _package;

		if (config == null) {
			this.config = _lodash2["default"].get(this["package"], "docker", {});
		}
	}

	_createClass(dockerTasks, [{
		key: "_name",
		value: function _name(name) {
			return _lodash2["default"].get(this.names, name, name);
		}
	}, {
		key: "_package",
		value: function _package(path) {
			var _default = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return _lodash2["default"].get(this["package"], path, _default);
		}
	}, {
		key: "_name_project",
		value: function _name_project() {
			var name = this._package("name", "docker_project");
			return name;
		}
	}, {
		key: "_name_project_version",
		value: function _name_project_version() {
			var name = this._name_project();
			var version = this._package("version", "0.0.0");

			return name + ":" + version;
		}
	}, {
		key: "_get_name_container",
		value: function _get_name_container() {
			var name = this._config("container", this._package("name", "::md5::"));
			if (name == "::md5::") {
				name = _crypto2["default"].createHash('md5').update(this._get_name_image()).digest("hex");
			}

			return name;
		}
	}, {
		key: "_get_name_image",
		value: function _get_name_image() {
			var name = this._config("image", this._package("name", "project_docker_with_gulp_docker_tasks"));
			var version = this._package("version", "0.0.0");

			return name + ":" + version;
		}
	}, {
		key: "_config",
		value: function _config(path) {
			var _default = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return _lodash2["default"].get(this.config, path, _default);
		}
	}, {
		key: "attach",
		value: function attach() {
			var _this = this;

			var gulp = arguments.length <= 0 || arguments[0] === undefined ? this.gulp : arguments[0];

			gulp.task(this._name("build"), function (done) {
				_this.build(done);
			});
			gulp.task(this._name("deploy"), function (done) {
				_this.deploy(done);
			});
			gulp.task(this._name("terminate"), function (done) {
				_this.terminate(done);
			});
			gulp.task(this._name("start"), function (done) {
				_this.start(done);
			});
			gulp.task(this._name("stop"), function (done) {
				_this.stop(done);
			});
			gulp.task(this._name("redeploy"), function (done) {
				_this.redeploy(done);
			});
			gulp.task(this._name("rebuild"), function (done) {
				_this.rebuild(done);
			});
			gulp.task(this._name("logs"), function (done) {
				_this.logs(done);
			});
		}
	}, {
		key: "build",
		value: function build(done) {
			var config = this._config("_.build", {});

			// get image name of config.
			config = _lodash2["default"].set(config, "tag", this._config("image", this._get_name_image()));

			this.docker.build(config, this.workDir).then(function () {
				// gutil.log(m);
				done();
			}, function (err) {
				_gulpUtil2["default"].log(err.message);
				done();
			});
		}
	}, {
		key: "deploy",
		value: function deploy(done) {
			var config = this._config("_.deploy", {});

			config = _lodash2["default"].set(config, "name", this._config("name", this._get_name_container()));
			config = _lodash2["default"].set(config, "detach", true);
			config = _lodash2["default"].set(config, "publish", this._config("ports", []));
			config = _lodash2["default"].set(config, "link", this._config("links", []));

			this.docker.run(config, this._get_name_image()).then(function (containerId) {
				_gulpUtil2["default"].log(containerId);
				done();
			}, function (err) {
				_gulpUtil2["default"].log(err.message);
			});
		}
	}, {
		key: "terminate",
		value: function terminate(done) {
			var config = this._config("_.terminate", {});

			config = _lodash2["default"].set(config, "force", true);

			this.docker.rm(config, this._get_name_container()).then(function (est) {
				// gutil.log(est);
				done();
			}, function (err) {
				// gutil.log(err);
				done();
			});
		}
	}, {
		key: "start",
		value: function start(done) {
			var config = this._config("_.start", {});

			this.docker.start(config, this._get_name_container()).then(function (e) {
				_gulpUtil2["default"].log(e);
				done();
			}, function (err) {
				_gulpUtil2["default"].log(err.message);
			});
		}
	}, {
		key: "stop",
		value: function stop(done) {
			var config = this._config("_.stop", {});

			this.docker.stop(config, this._get_name_container()).then(function (e) {
				_gulpUtil2["default"].log(e);
				done();
			}, function (err) {
				_gulpUtil2["default"].log(err.message);
			});
		}
	}, {
		key: "logs",
		value: function logs(done) {
			var config = this._config("_.logs", {});

			this.docker.logs(config, this._get_name_container()).then(function (e) {
				_gulpUtil2["default"].log(e);
				done();
			}, function (err) {
				_gulpUtil2["default"].log(err.message);
			});
		}
	}, {
		key: "redeploy",
		value: function redeploy(done) {
			var _this2 = this;

			_async2["default"].series([function (cb) {
				_this2.terminate(cb);
			}, function (cb) {
				_this2.deploy(cb);
			}], done);
		}
	}, {
		key: "rebuild",
		value: function rebuild(done) {
			var _this3 = this;

			_async2["default"].series([function (cb) {
				_this3.build(cb);
			}], done);
		}
	}]);

	return dockerTasks;
})();

exports["default"] = dockerTasks;
module.exports = exports["default"];