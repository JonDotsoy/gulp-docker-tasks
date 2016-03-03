var path = require("path");
var fs = require("fs");
var babel = require("babel-core");

var pathSoruceFile = path.normalize(__dirname + "/src/docker-tasks.js");
var pathBuildFile = path.normalize(__dirname + "/lib/docker-tasks.js");

fs.statSync(pathSoruceFile);

var builend = babel.transformFileSync(pathSoruceFile, {});

try {
	fs.mkdirSync(path.normalize(__dirname + "/lib"));
} catch (err) {}
fs.writeFileSync(pathBuildFile, builend.code, 'utf8');

