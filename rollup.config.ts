import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs"; // 新增
import resolve from "@rollup/plugin-node-resolve";

export default defineConfig({
	input: "./src/index.ts",
	output: {
		dir: "dist",
		format: "cjs",
		preserveModules: true, // 保留模块结构
		exports: "named",
	},
	plugins: [
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
