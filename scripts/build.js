// const rcedit = require("rcedit");
const { exec } = require("@yao-pkg/pkg");
const { copyFileSync } = require("fs");

async function build() {
	await exec(["dist/index.js", "--target", "--output", "dist/vine"]);
	copyFileSync("README.md", "dist/README.md");
	copyFileSync("README_CN.md", "dist/README_CN.md");
	copyFileSync("package.json", "dist/package.md");
	copyFileSync("LICENSE", "dist/LICENSE");
	// await rcedit("output/vine.exe", {
	// 	icon: "resources/icon.ico",
	// });
}
build();
