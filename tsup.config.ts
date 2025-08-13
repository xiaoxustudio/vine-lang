import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/test/**/*"],
	outDir: "dist",
	format: isProduction ? ["cjs", "esm"] : ["cjs"],
	splitting: false,
	treeshake: false,
	dts: isProduction,
	target: "es2020",
	clean: true,
	bundle: false,
	define: {
		"process.env.NODE_ENV": JSON.stringify(
			isProduction ? "production" : "development"
		)
	}
});
