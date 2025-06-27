import { Expr, Literal } from "@/node";
import { JSRuntimeFn, Token, TokenType } from "@/keywords";
import {
	builInObjectToString,
	isBuilInObject,
	isNil,
	isNilLiteral,
	LiteralFn,
	TokenExEnvironment,
	toRealValue,
	UseEnvFn,
} from "@/utils";

export class Environment {
	private Variable: Map<string, Expr | JSRuntimeFn | TokenExEnvironment>;
	private staticVariable: Set<string>;
	private parent?: Environment;
	private filePath?: string;
	private expose: Set<string>;
	private asMap: Map<string, string>; // for expose as
	constructor(parent?: Environment) {
		this.filePath = parent?.getFilePath() || __dirname;
		this.parent = parent;
		this.Variable = new Map();
		this.asMap = new Map();
		this.staticVariable = new Set();
		this.expose = new Set();
		this.setup();
	}
	link(name: string, env: Environment) {
		this.Variable.set(name, UseEnvFn(env));
	}
	setAsMap(name: string, as: string) {
		this.asMap.set(name, as);
	}
	setFilePath(filePath: string) {
		this.filePath = filePath;
	}
	getFilePath() {
		return this.filePath;
	}
	setExpose(expose: Literal) {
		if (expose.type !== "Literal") throw new Error("expose must be Literal");
		this.expose.add(toRealValue(expose));
	}
	getExpose() {
		return this.expose;
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
							: isBuilInObject(output)
							? builInObjectToString(output)
							: output;
					})
				);
			},
			true
		);
	}
	resolveVariableEnv(name: string): Environment | undefined {
		if (this.Variable.has(name)) {
			const target = this.Variable.get(name) as TokenExEnvironment;
			if (
				target?.type === TokenType.env &&
				target.value instanceof Environment
			) {
				return target.value.resolveVariableEnv(name);
			}
			return this;
		}
		if (this.parent == undefined) {
			throw new Error(`Resolve variable ${name} not declared`);
		}
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
		const real_name = this.asMap.get(toRealValue(name)) || toRealValue(name);
		const resolveEnv = this.resolveVariableEnv(real_name);
		return resolveEnv?.Variable.get(real_name);
	}
	setVariable(name: Literal, value: Expr) {
		if (name.type !== "Literal") throw new Error("name must be Literal");
		const real_name = toRealValue(name);
		if (this.staticVariable.has(real_name))
			throw new Error(`Variable ${real_name} is static`);
		if (!this.Variable.has(real_name))
			throw new Error(`Variable ${real_name} not declared`);
		return this.resolveVariableEnv(real_name)?.Variable.set(real_name, value);
	}
	deleteVariable(name: Literal) {
		if (name.type !== "Literal") throw new Error("name must be Literal");
		const real_name = toRealValue(name);
		if (this.staticVariable.has(real_name))
			throw new Error(`Variable ${real_name} is static`);
		if (!this.Variable.has(real_name))
			throw new Error(`Variable ${real_name} not declared and can't delete`);
		return this.Variable.delete(real_name);
	}
}
