const rcedit = require("rcedit");
const { exec } = require("@yao-pkg/pkg");

async function build() {
	await exec(["output/index.js", "--target", "--output", "output/vine"]);
	await rcedit("output/vine.exe", {
		icon: "resources/icon.ico",
	});
}
build();
