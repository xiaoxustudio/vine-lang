import runFile from "./runtime";
import { replProgram } from "./repl";

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
