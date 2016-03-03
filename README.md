Docker Tasks
============

Tasks to Gulp with Docker. This is to Tasks easy work in Develop and Ops of project.

Actions List:

 - build `gulp build`
 - deploy `gulp deploy`
 - terminate `gulp terminate`
 - start `gulp start`
 - stop `gulp stop`
 - redeploy `gulp redeploy`
 - rebuild `gulp rebuild`
 - logs `gulp logs`

Installation
------------

'[NPM](https://www.npmjs.com/)' is used for installing this component.

```bash
npm install --save gulp-docker-tasks
```

Usage
-----

Initialize all tasks using the `.attach ()`.

```javascript
var gulp = require("gulp");
var Docker = require("gulp-docker-tasks");

var docker = new Docker();

docker.attach();
```

API
---

### attach

Initializes all methods. for gulp command.

```javascript
gulp.task("myLogs", function (done) {
	docker.attach(done);
});
```


### build

It is equivalent to using `docker build`. Build an image from a Dockerfile.

```javascript
gulp.task("myLogs", function (done) {
	docker.build(done);
});
```


### deploy

It is equivalent to using `docker run`. Run a command in a new container.

```javascript
gulp.task("myLogs", function (done) {
	docker.deploy(done);
});
```


### terminate

It is equivalent to using `docker rm -f`. Remove one or more containers.

```javascript
gulp.task("myLogs", function (done) {
	docker.terminate(done);
});
```


### start

It is equivalent to using `docker start`. Start one or more stopped containers.

```javascript
gulp.task("myLogs", function (done) {
	docker.start(done);
});
```


### stop

It is equivalent to using `docker stop`. Stop a running container.

```javascript
gulp.task("myLogs", function (done) {
	docker.stop(done);
});
```


### redeploy

It is equivalent to using `docker rm -f` and `docker run`.

```javascript
gulp.task("myLogs", function (done) {
	docker.redeploy(done);
});
```


### rebuild

It is equivalent to using `docker build`.

```javascript
gulp.task("myLogs", function (done) {
	docker.build(done);
});
```

### logs

It is equivalent to using `docker logs`. Fetch the logs of a container.

```javascript
gulp.task("myLogs", function (done) {
	docker.logs(done);
});
```
