import Gulp from "gulp";
import _ from "lodash";
import gutil from "gulp-util";
import { exec as Exec } from "child_process";
import gulpSequence from "gulp-sequence";
import async from "async";
import DockerManager from "docker-manager";
import crypto from "crypto";


export default class dockerTasks {
	constructor({
		gulp = Gulp,
		cpexec = Exec,
		config = null,
		_package = null,
		workDir = process.cwd(),
		names = {},
		dockerManager = (new DockerManager({
			logger: gutil.log,
		})),
	} = {}) {
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

		this.package = _package;

		if (config == null) {
			this.config = _.get(this.package, "docker", {});
		}
	}

	_name(name) {
		return _.get(this.names, name, name);
	}

	_package(path, _default = null) {
		return _.get(this.package, path, _default);
	}

	_name_project() {
		let name = this._package("name", "docker_project");
		return name;
	}
	_name_project_version() {
		let name = this._name_project();
		let version = this._package("version", "0.0.0");

		return `${name}:${version}`;
	}

	_get_name_container() {
		let name = this._config("container", this._package("name", "::md5::"));
		if (name == "::md5::") {
			name = crypto.createHash('md5').update(this._get_name_image()).digest("hex");
		}

		return name;
	}

	_get_name_image() {
		let name = this._config("image", this._package("name", "project_docker_with_gulp_docker_tasks"));
		let version = this._package("version", "0.0.0");

		return `${name}:${version}`;
	}

	_config(path, _default = null) {
		return _.get(this.config, path, _default);
	}

	attach(gulp = this.gulp) {
		gulp.task(this._name("build"), (done) => { this.build(done); });
		gulp.task(this._name("deploy"), (done) => { this.deploy(done); });
		gulp.task(this._name("terminate"), (done) => { this.terminate(done); });
		gulp.task(this._name("start"), (done) => { this.start(done); });
		gulp.task(this._name("stop"), (done) => { this.stop(done); });
		gulp.task(this._name("redeploy"), (done) => { this.redeploy(done); });
		gulp.task(this._name("rebuild"), (done) => { this.rebuild(done); });
		gulp.task(this._name("logs"), (done) => { this.logs(done); });
	}

	build(done) {
		let config = this._config("_.build", {});

		// get image name of config.
		config = _.set(config, "tag", this._config("image", this._get_name_image()));

		this.docker
			.build(config, this.workDir)
			.then(function() {
				// gutil.log(m);
				done();
			}, function(err) {
				gutil.log(err.message);
				done();
			});
	}

	deploy(done) {
		let config = this._config("_.deploy", {});

		config = _.set(config, "name", this._config("name", this._get_name_container()));
		config = _.set(config, "detach", true);
		config = _.set(config, "publish", this._config("ports", []));
		config = _.set(config, "link", this._config("links", []));

		this.docker
			.run(config, this._get_name_image())
			.then(function(containerId) {
				gutil.log(containerId);
				done();
			}, function(err) {
				gutil.log(err.message);
			});
	}
	terminate(done) {
		let config = this._config("_.terminate", {});

		config = _.set(config, "force", true);

		this.docker
			.rm(config, this._get_name_container())
			.then(function(est) {
				// gutil.log(est);
				done();
			}, function(err) {
				// gutil.log(err);
				done();
			});

	}
	start(done) {
		let config = this._config("_.start", {});

		this.docker
			.start(config, this._get_name_container())
			.then(function(e) {
				gutil.log(e);
				done();
			}, function(err) {
				gutil.log(err.message);
			})
	}
	stop(done) {
		let config = this._config("_.stop", {});

		this.docker
			.stop(config, this._get_name_container())
			.then(function(e) {
				gutil.log(e);
				done();
			}, function(err) {
				gutil.log(err.message);
			})
	}
	logs(done) {
		let config = this._config("_.logs", {});

		this.docker
			.logs(config, this._get_name_container())
			.then(function(e) {
				gutil.log(e);
				done();
			}, function(err) {
				gutil.log(err.message);
			})
	}
	redeploy(done) {
		async.series([
			(cb) => { this.terminate(cb) },
			(cb) => { this.deploy(cb) },
		], done);
	}
	rebuild(done) {
		async.series([
			(cb) => { this.build(cb) },
		], done);
	}

}
