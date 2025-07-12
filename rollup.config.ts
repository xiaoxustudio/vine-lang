import { defineConfig } from "rollup";
import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs"; // 新增
import resolve from "@rollup/plugin-node-resolve";
import path from "path";

export default defineConfig({
	input: "./src/index.ts",
	output: {
		dir: "dist",
		format: "cjs",
		preserveModules: true, // 保留模块结构
		exports: "named",
	},
	plugins: [
		alias({
			entries: [
				{
					find: "@",
					replacement: path.resolve(__dirname, "src"),
				},
			],
		}),
		resolve({
			extensions: [".ts", ".js"],
		}),
		commonjs(),
		typescript({
			tsconfig: "tsconfig.json",
			useTsconfigDeclarationDir: true,
			clean: true,
			exclude: ["node_modules/**", "dist/**"],
		}),
	],
});
