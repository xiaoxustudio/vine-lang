import runFile from "./runtime";
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
const args = process.argv;

if (args.length > 2) {
	const type = args[2];
	if (type === "repl") {
		replProgram();
	}
	if (type === "ipt") {
		const path = args[3];
		runFile(path);
	}
}

export {
	Interpreter,
	Parser,
	Environment,
	tokenlize,
	runFile,
	replProgram,
	mapToObject,
	toRealValue,
	builInObjectToString,
	LiteralFn,
	UseEnvFn,
};
