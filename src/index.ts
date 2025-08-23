import runFile from "./runFile";
import { replProgram } from "./repl";
import { tokenlize } from "./token/index";
import Interpreter from "./interpreter";
import Parser from "./parser";
import Environment from "./environment";
import mapToObject from "./utils/mapToObject";
import toRealValue from "./utils/toRealValue";
import builInObjectToString from "./utils/builInObjectToString";
import LiteralFn from "./utils/LiteralFn";
import UseEnvFn from "./utils/UseEnvFn";
import Vine from "./runtime";
import Debugger from "./debug";

const args = process.argv;

if (args[1] === __filename) {
	if (args.length > 2) {
		const type = args[2];
		if (type === "repl") {
			replProgram();
		} else if (type === "ipt") {
			const path = args[3];
			runFile(path);
		} else if (type === "debug") {
			const debug = new Debugger();
			const path = args[3];
			debug.setFile(path);

			debug.setResetCallback(() => {
				setTimeout(() => {
					runFile(path, debug);
				}, 100);
			});

			debug.start();

			setTimeout(() => {
				runFile(path, debug);
			}, 100);
		}
	}
}

export {
	Vine,
	Interpreter,
	Parser,
	Environment,
	Debugger,
	tokenlize,
	runFile,
	replProgram,
	mapToObject,
	toRealValue,
	builInObjectToString,
	LiteralFn,
	UseEnvFn
};
