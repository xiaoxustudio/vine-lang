import * as fs from "fs";
import { tokenlize } from "../token/index";
import path from "path";
import { Parser } from "@/parser";
import { Environment } from "@/environment";
import { Interpreter } from "@/interpreter";

export default function runFile(pathFile: string) {
	try {
		const absPath = path.resolve(__dirname, pathFile);
		const sourceCode = fs.readFileSync(absPath, "utf8");
		const tokens = tokenlize(sourceCode);
		const ast = new Parser(tokens).parse();
		const env = new Environment();
		const ipt = new Interpreter(env);
		ipt.interpret(ast);
	} catch (err) {
		console.error("running error:", err);
	}
}
