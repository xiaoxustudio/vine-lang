import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";
const isExE = process.env.NODE_EXE === "true";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/test/**/*"],
	outDir: "dist",
	format: isProduction && !isExE ? ["cjs", "esm"] : ["cjs"],
	splitting: false,
	treeshake: false,
	dts: isProduction,
	target: "es2020",
	clean: true,
	bundle: false,
	define: {
		"process.env.NODE_ENV": JSON.stringify(
			isProduction ? "production" : "development"
		),
		"process.env.NODE_EXE": isExE ? "true" : "false"
	}
});
