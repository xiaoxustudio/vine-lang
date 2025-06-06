// const rcedit = require("rcedit");
const { exec } = require("pkg");

async function build() {
	await exec([
		"output/index.js",
		"--target",
		"node18",
		"--output",
		"output/vine",
	]);
	// await rcedit("output/vine.exe", {
	// 	icon: "resources/icon.ico",
	// });
}
build();
