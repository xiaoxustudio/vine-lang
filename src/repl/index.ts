/* repl program */
import * as repl from "repl";
import { tokenlize } from "@/token";
import { Parser } from "@/parser";
import { Environment } from "@/environment";
import { Interpreter } from "@/interpreter";
import { isNil, isNilLiteral, toRealValue } from "@/utils";

export function replProgram() {
	const env = new Environment();
	console.log("\x1B[32m", "Welcome to Vine REPL!", "\x1b[0m");
	const replServer = repl.start({
		prompt: "Vine> ",
		eval: (cmd, context, filename, callback) => {
			try {
				const tk = tokenlize(cmd);
				const parse = new Parser(tk);
				const ipt = new Interpreter(env);
				const ast = parse.parse();
				let res = ipt.interpret(ast) as any;
				callback(null, res);
			} catch (err) {
				callback(err, null);
			}
		},
		writer: (res: any) => {
			const output = toRealValue(res);
			return isNilLiteral(res) && isNil(output)
				? "\x1b[36mnil\x1b[0m"
				: (output as string);
		},
	});

	replServer.defineCommand("exit", {
		help: "Exit the Vine REPL",
		action: () => {
			replServer.close();
		},
	});
}
