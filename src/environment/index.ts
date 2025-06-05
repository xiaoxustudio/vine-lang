import { Expr, Literal } from "@/node";
import { JSRuntimeFn, Token } from "@/types";
import { isNil, isNilLiteral, LiteralFn, toRealValue } from "@/utils";

export class Environment {
	private Variable: Map<string, Expr | JSRuntimeFn>;
	private staticVariable: Set<string>;
	private parent?: Environment;
	constructor(parent?: Environment) {
		this.parent = parent;
		this.Variable = new Map();
		this.staticVariable = new Set();
		this.setup();
	}
	setup() {
		this.declareVariable(LiteralFn("true"), LiteralFn(true), true);
		this.declareVariable(LiteralFn("false"), LiteralFn(false), true);
		this.declareVariable(
			LiteralFn("print"),
			(args: Token[]) => {
				console.log(
					...args.map(e => {
						const output = toRealValue(e as unknown as Literal);
						return isNilLiteral(e as unknown as Literal) && isNil(output)
							? "\x1b[36mnil\x1b[0m"
							: output;
					})
				);
			},
			true
		);
	}
	resolveVariableEnv(name: string): Environment | undefined {
		if (this.Variable.has(name)) return this;
		if (this.parent == undefined)
			throw new Error(`Variable ${name} not declared`);
		return this.parent.resolveVariableEnv(name);
	}
	declareVariable(name: Literal, value: Expr | JSRuntimeFn, is_static = false) {
		if (name.type !== "Literal") throw new Error("name must be Literal");
		const real_name = name.value.value;
		if (this.Variable.has(real_name))
			throw new Error(`Variable ${real_name} already declared`);
		if (is_static) this.staticVariable.add(real_name);
		return this.Variable.set(real_name, value);
	}
	getVariable(name: Literal) {
		if (name.type !== "Literal") throw new Error("name must be Literal");
		const real_name = name.value.value;
		return this.resolveVariableEnv(real_name)?.Variable.get(real_name);
	}
	setVariable(name: Literal, value: Expr) {
		if (name.type !== "Literal") throw new Error("name must be Literal");
		const real_name = name.value.value;
		if (this.staticVariable.has(real_name))
			throw new Error(`Variable ${real_name} is static`);
		if (!this.Variable.has(real_name))
			throw new Error(`Variable ${real_name} not declared`);
		return this.resolveVariableEnv(real_name)?.Variable.set(real_name, value);
	}
}
