import { defineConfig } from "rollup";
import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";

const customResolver = resolve({
	extensions: [".mjs", ".js", ".jsx", ".json", ".sass", ".scss"],
});
const projectRootDir = path.resolve(__dirname);

export default defineConfig({
	input: "./src/index.ts",
	output: {
		dir: "output",
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
					find: "@/",
					replacement: path.resolve(projectRootDir, "src"),
				},
			],
			customResolver: customResolver as any,
		}),
		resolve(),
	],
});
