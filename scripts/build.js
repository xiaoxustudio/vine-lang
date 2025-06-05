const rcedit = require("rcedit");
const { exec } = require("pkg");
exec([
	"output/index.js",
	"--target",
	"node18",
	"--platform",
	"windows",
	"--output",
	"output/vine",
]).then(() => {
	rcedit("output/vine.exe", {
		icon: "resources/icon.ico",
	});
});
