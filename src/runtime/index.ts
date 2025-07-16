import Environment from "@/environment";
import Interpreter from "@/interpreter";
import Parser from "@/parser";
import { tokenlize } from "@/token";
import toRealValue from "@/utils/toRealValue";

class Vine {
	parser: Parser;
	interpreter: Interpreter;
	env: Environment;
	constructor() {
		this.parser = new Parser();
		this.interpreter = new Interpreter(new Environment());
		this.env = new Environment();
	}
	async run(code: string) {
		this.parser.pushStack(tokenlize(code));
		const program = this.parser.parse();
		return toRealValue(await this.interpreter.interpret(program));
	}
}

export default Vine;
