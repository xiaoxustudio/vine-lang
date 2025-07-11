import { defineConfig } from "rollup";
import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";

export default defineConfig({
	input: "./src/index.ts",
	output: {
		dir: "dist",
		format: "cjs",
		assetFileNames: "[name]-[hash][extname].js",
	},
	plugins: [
		typescript({
			exclude: ["node_modules/**"],
		}),
		alias({
			entries: [
				{
					find: "@",
					replacement: path.resolve(__dirname, "src"),
				},
			],
		}),
		resolve(),
	],
});
