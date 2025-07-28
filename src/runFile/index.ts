import * as fs from "fs";
import path from "path";
import Parser from "@/parser";
import Environment from "@/environment";
import Interpreter from "@/interpreter";
import { tokenlize } from "../token/index";
import Debugger from "@/debug";

const cwd = process.cwd();

// 检查是否为打包环境
const isPackaged = typeof process.env.PKG_EXECPATH !== "undefined";

export default async function runFile(pathFile: string, d?: Debugger) {
	try {
		const absPath = isPackaged
			? path.join(__dirname, pathFile) // 虚拟文件系统
			: path.join(cwd, pathFile); // 开发环境
		const sourceCode = fs.readFileSync(absPath, "utf8");
		const tokens = tokenlize(sourceCode);
		const ast = new Parser().parse(tokens);
		const env = new Environment();
		env.setFilePath(absPath);
		const ipt = new Interpreter(env, d);
		return await ipt.interpret(ast);
	} catch (err) {
		console.error("running error:", err);
	}
	return;
}
