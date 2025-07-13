import path from "node:path";
import fs from "node:fs";
import Environment, { ModuleList } from "@/environment";
import {
	ProgramStmt,
	Node,
	ExpressionStmt,
	Expr,
	BinaryExpr,
	Literal,
	VariableDecl,
	CallExpr,
	FunctionDecl,
	BlockStmt,
	AssignmentExpr,
	IfStmt,
	CompareExpr,
	EqualExpr,
	ForStmt,
	RangeExpr,
	ArrayExpr,
	ObjectExpr,
	LambdaFunctionDecl,
	SwitchStmt,
	ReturnStmt,
	MemberExpr,
	UseDecl,
	ExposeStmt,
	UseDefaultSpecifier,
	UseSpecifier,
	TernaryExpr,
	TaskStmt,
	RunStmt,
	ToExpr,
	WaitStmt,
} from "@/node";
import { Token, TokenType } from "@/keywords";
import LiteralFn from "@/utils/LiteralFn";
import mapToObject from "@/utils/mapToObject";
import toRealValue from "@/utils/toRealValue";
import Parser from "@/parser";
import { tokenlize } from "@/token";
import { BaseDataTag } from "@/utils";
import TokenUnit from "@/utils/TokenUnit";
import setObjectData from "@/utils/setObjectData";

export default class Interpreter {
	private readonly _context: Environment;

	constructor(context: any) {
		this._context = context;
	}

	async interpret(expression: ProgramStmt) {
		const body = expression.body;
		let returnVal;
		for (const stmt of body) {
			returnVal = await this.interpretStmt(stmt, this._context);
		}
		return returnVal;
	}

	interpretStmt(stmt: Node, env: Environment) {
		switch (stmt.type) {
			case "VariableDeclaration":
				return this.interpretVariableDeclaration(stmt as VariableDecl, env);
			case "FunctionDeclaration":
				return this.interpretFunctionDeclaration(stmt as FunctionDecl, env);
			case "UseDeclaration":
				return this.interpretUseDeclaration(stmt as UseDecl, env);
			case "CallExpression":
				return this.interpretCallExpression(stmt as CallExpr, env);
			case "MemberExpression":
				return this.interpretMemberExpression(stmt as MemberExpr, env);
			case "AssignmentExpression":
				return this.interpretAssignmentExpression(stmt as AssignmentExpr, env);
			case "IfStatement":
				return this.interpretIfStatement(stmt as IfStmt, env);
			case "ForStatement":
				return this.interpretForStatement(stmt as ForStmt, env);
			case "SwitchStmtement":
				return this.interpretSwitchStatement(stmt as SwitchStmt, env);
			case "ReturnStatement":
				return this.interpretReturnStatement(stmt as ReturnStmt, env);
			case "BlockStatement":
				return this.interpretBlockStatement(stmt as BlockStmt, env);
			case "ExpressionStatement":
				return this.interpretExpressionStatement(stmt as ExpressionStmt, env);
			case "ExposeStmtement":
				return this.interpretExposeStatement(stmt as ExposeStmt, env);
			case "TaskStatement":
				return this.interpretTaskStatement(stmt as TaskStmt, env);
			case "RunStatement":
				return this.interpretRunStatement(stmt as RunStmt, env);
			case "WaitStatement":
				return this.interpretWaitStatement(stmt as WaitStmt, env);
			default:
				return this.interpretExpression(stmt as ExpressionStmt, env);
		}
	}

	async interpretWaitStatement(stmt: WaitStmt, env: Environment) {
		const wait = await this.interpretRunStatement(stmt.async, env);
		return wait;
	}

	async interpretRunStatement(stmt: RunStmt, env: Environment) {
		// 异步执行
		return await Promise.resolve().then(async () => {
			if (stmt?.to) {
				// @ts-ignore
				const res = await this.interpretStmt(stmt.callee, env);
				let resVal;
				for (let i of stmt.to) {
					const context = new Environment(env);
					context.declareVariable((i.arguments as any)?.[0], res);
					resVal = await this.interpretStmt(i, context);
				}
				return resVal;
			} else {
				return await this.interpretStmt(stmt.callee, env);
			}
		});
	}

	interpretTaskStatement(stmt: TaskStmt, env: Environment) {
		return this.interpretFunctionDeclaration(
			stmt.fn,
			env,
			BaseDataTag.FN_ASYNC
		);
	}

	interpretExposeStatement(stmt: ExposeStmt, env: Environment) {
		const name = (() => {
			switch (stmt.body.type) {
				case "FunctionDeclaration":
					return (stmt.body as FunctionDecl).id;
				case "VariableDeclaration":
					return (stmt.body as VariableDecl).id;
				default:
					return null;
			}
		})();
		if (name) {
			this.interpretStmt(stmt.body, env);
			env.setExpose(name);
		}
	}

	interpretUseDeclaration(stmt: UseDecl, env: Environment) {
		const origin = stmt.source;
		const pathName = path.join(
			path.dirname(env.getFilePath()),
			toRealValue(origin)
		);
		const context = new Environment();
		if (stmt.specifiers.length) {
			for (const i of stmt.specifiers) {
				switch (i.type) {
					case "UseDefaultSpecifier": {
						env.link(toRealValue(i.local), context);
					}
					case "UseSpecifier": {
						const useVal = this.interpretStmt(i, env);
						// 存储别名键值
						env.link(toRealValue(useVal.local), context);
						if (useVal.remote) {
							// 存储别名键值
							env.setAsMap(
								toRealValue(useVal.remote),
								toRealValue(useVal.local)
							);
						}
					}
				}
			}
		} else {
			// 全局链接
			env.link("*", context);
		}
		// 判断是否是内置模块
		const moduleName = path.basename(pathName);
		const insideModule = moduleName.startsWith("vine:");
		if (insideModule) {
			// 内置模块
			if (Object.keys(ModuleList).includes(moduleName)) {
				env.registerGlobalModule(moduleName, context);
			}
		} else {
			// 外部模块
			const text = fs.readFileSync(
				pathName.endsWith(".vine") ? pathName : `${pathName}.vine`
			);
			const parser = new Parser(tokenlize(text.toString()));
			const program = parser.parse();
			const interpreter = new Interpreter(context);
			interpreter.interpret(program);
		}
	}

	interpretReturnStatement(stmt: ReturnStmt, env: Environment) {
		const value = this.interpretExpression(stmt.value, env);
		return value;
	}

	interpretSwitchStatement(stmt: SwitchStmt, env: Environment) {
		const test = this.interpretExpression(stmt.test, env);
		for (const case_ of stmt.cases) {
			if (!case_.test) {
				return this.interpretBlockStatement(case_.body, env);
			}
			const test_ = this.interpretExpression(case_.test, env) as Token;
			if (test_?.type === test.type && test_?.value === test.value) {
				return this.interpretBlockStatement(case_.body, env);
			}
		}
		return null;
	}

	interpretForStatement(stmt: ForStmt, env: Environment) {
		const id = stmt.init;
		const value = stmt.value;
		const range = this.interpretExpression(stmt.range, env);
		const body = stmt.body;
		if (range.type === BaseDataTag.RANGE) {
			const step = range?.step.value === ".." ? 1 : Number(range[2].value);
			const start = toRealValue(range.start);
			const end = toRealValue(range.end);
			for (let i = start; i <= end; i += step) {
				const context = new Environment(env);
				context.declareVariable(id as Literal, LiteralFn(i));
				this.interpretBlockStatement(body, context);
			}
		} else if (range instanceof Map) {
			const iterable = Array.isArray(range)
				? range
				: mapToObject(range, toRealValue);
			for (const key in iterable) {
				const val = iterable[key];
				const context = new Environment(env);
				context.declareVariable(id as Literal, LiteralFn(key));
				if (value) context.declareVariable(value as Literal, val);
				this.interpretBlockStatement(body, context);
			}
		}
	}

	interpretIfStatement(stmt: IfStmt, env: Environment) {
		const condition = this.interpretExpression(stmt.test, env) as Token;
		const realValue = toRealValue(condition);
		if (typeof realValue === "boolean") {
			if (realValue) {
				return this.interpretStmt(stmt.consequent, env);
			} else if (stmt.alternate) {
				return this.interpretStmt(stmt.alternate, env);
			}
		}
		throw new Error("Condition must be a boolean");
	}

	interpretAssignmentExpression(stmt: AssignmentExpr, env: Environment) {
		env.setVariable(stmt.left, this.interpretExpression(stmt.right, env));
	}
	interpretBlockStatement(stmt: BlockStmt, env: Environment) {
		let returnVal;
		for (const s of stmt.body) {
			returnVal = this.interpretStmt(s, env);
			if (s.type === "ReturnStatement") {
				break;
			}
		}
		return returnVal;
	}
	interpretFunctionDeclaration(
		stmt: FunctionDecl,
		env: Environment,
		type = BaseDataTag.FN
	) {
		const body = stmt.body;
		const args_out = stmt.arguments;
		const fn = (args: Expr[]) => {
			const context = new Environment(env);
			if (args) {
				if (!Array.isArray(args)) {
					context.declareVariable(args_out?.[0] as any, args);
				} else {
					for (const i in args) {
						if (args_out[i])
							context.declareVariable(args_out[i] as any, args[i]);
					}
				}
			}
			return this.interpretBlockStatement(body, context);
		};
		setObjectData(fn, "type", type); // 设置类型
		env.declareVariable(stmt.id, fn);
	}

	async interpretCallExpression(stmt: CallExpr, env: Environment) {
		const callee = await this.interpretExpression(stmt.callee, env);
		const args = await Promise.all(
			stmt.arguments.map(async arg => await this.interpretExpression(arg, env))
		);
		let res: any;
		try {
			res = typeof callee === "function" ? callee.apply(env, args) : callee;
		} catch (e) {
			throw new Error(`CallExpression error: ${e}`);
		}
		return res;
	}
	async interpretVariableDeclaration(stmt: VariableDecl, env: Environment) {
		const value = await this.interpretExpression(stmt.value, env);
		env.declareVariable(stmt.id, value);
	}
	interpretMemberExpression(e: MemberExpr, env: Environment) {
		const object = this.interpretExpression(e.object, env);
		const prop_val = toRealValue(e.property as Literal);
		if (object instanceof Map) {
			if (!Object.fromEntries(object)["[object Object]"]) {
				return Object.fromEntries(object)[prop_val];
			} else {
				const targetObject = mapToObject(object, toRealValue);
				return targetObject[prop_val];
			}
		} else if (
			object?.type === TokenType.env &&
			object.value instanceof Environment
		) {
			const useImport = object.value as Environment;
			const val = useImport.getVariable(LiteralFn(prop_val));
			return val;
		} else {
			return object[prop_val];
		}
	}
	interpretExpressionStatement(stmt: ExpressionStmt, env: Environment) {
		return this.interpretExpression(stmt.expression, env);
	}
	async interpretExpression(expression: Expr, env: Environment) {
		switch (expression.type) {
			case "CallExpression": {
				const e = expression as CallExpr;
				return this.interpretCallExpression(e, env);
			}
			case "Literal": {
				const e = expression as Literal;
				if (e.value.type === TokenType.identifier) {
					const val = env.getVariable(e) as any; // 可能拿到的是Literal
					if (val.type === "Literal") {
						return val.value;
					}
					return val;
				}
				return e.value;
			}
			case "BinaryExpression": {
				const e = expression as BinaryExpr;
				let left = await this.interpretExpression(e.left, env);
				let right = await this.interpretExpression(e.right, env);

				const tk_unit = new TokenUnit(left);

				switch (e.operator.value) {
					case "+":
						return tk_unit.add(right).getToken();
					case "-":
						return tk_unit.sub(right).getToken();
					case "*":
						return tk_unit.mul(right).getToken();
					case "/":
						return tk_unit.div(right).getToken();
				}
				return tk_unit.getToken();
			}
			case "ArrayExpression": {
				const e = expression as ArrayExpr;
				const obj = new Map<Literal, Expr>();
				for (const target of e.items) {
					const key = target.key;
					key.value.type = TokenType.index;
					obj.set(key, await this.interpretExpression(target.value, env));
				}
				setObjectData(obj, "type", BaseDataTag.ARRAY); // 设置类型
				return obj;
			}
			case "ObjectExpression": {
				const e = expression as ObjectExpr;
				const obj = new Map<Literal, Expr>();
				for (const target of e.properties) {
					obj.set(
						target.key,
						await this.interpretExpression(target.value, env)
					);
				}
				setObjectData(obj, "type", BaseDataTag.OBJECT); // 设置类型
				return obj;
			}
			case "CompareExpression": {
				const e = expression as CompareExpr;
				const left = this.interpretExpression(e.left, env);
				const right = this.interpretExpression(e.right, env);
				return new TokenUnit(left).logicOperate(e.operator, right).getToken();
			}
			case "TernayExpression": {
				const e = expression as TernaryExpr;
				const condition = this.interpretExpression(e.condition, env);
				if (condition.type === TokenType.boolean) {
					if (condition.value === "true") {
						return this.interpretStmt(e.consequent, env);
					} else if (e.alternate) {
						return this.interpretStmt(e.alternate, env);
					}
					throw new Error("Condition must have a consequent or alternate");
				}
				throw new Error("Condition must be a boolean");
			}
			case "EqualExpression": {
				const e = expression as EqualExpr;
				const left = this.interpretExpression(e.left, env);
				const right = this.interpretExpression(e.right, env);
				return new TokenUnit(left).logicOperate(e.operator, right).getToken();
			}
			case "RangeExpression": {
				const e = expression as RangeExpr;
				const start = this.interpretExpression(e.start, env);
				const end = this.interpretExpression(e.end, env);
				return { type: BaseDataTag.RANGE, start, end, step: e.step };
			}
			case "LambdaFunctionDecl": {
				const e = expression as LambdaFunctionDecl;
				const fn = (args: Expr[]) => {
					const context = new Environment(env);
					for (const i in args) {
						context.declareVariable(e.arguments[i] as any, args[i]);
					}
					const v = this.interpretBlockStatement(e.body, context);
					return v;
				};
				setObjectData(fn, "type", BaseDataTag.FN_LAMBDA);
				return fn;
			}
			case "MemberExpression": {
				return this.interpretMemberExpression(expression as MemberExpr, env);
			}
			case "UseDefaultSpecifier": {
				const e = expression as UseDefaultSpecifier;
				const val = e.local;
				if (e.local.type !== "Literal") {
					throw new Error("UseDefaultSpecifier local must be a literal");
				}
				return val;
			}
			case "UseSpecifier": {
				const e = expression as UseSpecifier;
				return { remote: e.remote, local: e.local };
			}
			case "ToExpression": {
				const e = expression as ToExpr;
				try {
					const res = await this.interpretBlockStatement(e.body, env);
					return res;
				} catch (e) {
					throw new Error(`ToExpression error: ${e}`);
				}
			}
			case "RunStatement": {
				return this.interpretRunStatement(expression as RunStmt, env);
			}
			case "WaitStatement": {
				const e = expression as WaitStmt;
				const res = await this.interpretWaitStatement(e, env);
				return res;
			}
			default:
				throw new Error(
					`Unknown expression type: ${JSON.stringify(expression)}`
				);
		}
	}
}
