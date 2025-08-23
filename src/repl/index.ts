/* repl program */
import * as repl from "node:repl";
import { tokenlize } from "@/token";
import Parser from "@/parser";
import Environment from "@/environment";
import Interpreter from "@/interpreter";
import builInObjectToString from "@/utils/builInObjectToString";
import toRealValue from "@/utils/toRealValue";

export function replProgram() {
	const env = new Environment();
	console.log("\x1B[32m", "Welcome to Vine REPL!", "\x1b[0m");
	const replServer = repl.start({
		prompt: "Vine> ",
		eval: (cmd, context, filename, callback) => {
			try {
				const tk = tokenlize(cmd);
				const parse = new Parser();
				const ipt = new Interpreter(env);
				const ast = parse.parse(tk);
				let res = ipt.interpret(ast) as any;
				callback(null, res);
			} catch (err) {
				callback(err, null);
			}
		},
		writer: (res: any) => {
			const output = toRealValue(res);
			const strOutput = builInObjectToString(output);
			return strOutput;
		}
	});

	replServer.defineCommand("exit", {
		help: "Exit the Vine REPL",
		action: () => {
			replServer.close();
		}
	});
}
