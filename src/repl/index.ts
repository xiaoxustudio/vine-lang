/* repl program */
import * as repl from "repl";
import { tokenlize } from "@/token";
import { Parser } from "@/parser";
import { Environment } from "@/environment";
import { Interpreter } from "@/interpreter";
import { toRealValue } from "@/utils";

export function replProgram() {
	const env = new Environment();
	const replServer = repl.start({
		prompt: "Vine> ",
		eval: (cmd, context, filename, callback) => {
			try {
				const tk = tokenlize(cmd);
				const parse = new Parser(tk);
				const ipt = new Interpreter(env);
				const ast = parse.parse();
				let res = ipt.interpret(ast) as any;
				callback(null, toRealValue(res));
			} catch (err) {
				callback(err, null);
			}
		},
	});

	replServer.defineCommand("exit", {
		help: "Exit the Vine REPL",
		action: () => {
			replServer.close();
		},
	});
}
