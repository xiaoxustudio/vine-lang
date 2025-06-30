const { exec } = require("@yao-pkg/pkg");

async function build() {
	await exec(["dist/index.js", "--target", "--output", "dist/vine"]);
}
build();
