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
	TemplateElement,
	TemplateLiteralExpr,
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
import { ErrorStackManager, ErrorStack } from "@/error";
import Debugger from "@/debug";

export default class Interpreter {
	private readonly _context: Environment;
	private errStackManager = new ErrorStackManager();
	private debuger: Debugger;

	constructor(context: any, debug?: Debugger) {
		this._context = context;
		this.debuger = debug;
	}

	// 从语句中获取行号
	private getLineFromStmt(stmt: Node): number | null {
		// 尝试从不同类型的节点中获取行号
		if (
			stmt.id &&
			typeof stmt.id === "object" &&
			"value" in stmt.id &&
			typeof stmt.id.value === "object" &&
			"line" in stmt.id.value
		) {
			return stmt.id.value.line || null;
		}

		// 对于不同类型的语句，尝试获取行号
		switch (stmt.type) {
			case "VariableDeclaration":
				const varDecl = stmt as VariableDecl;
				return varDecl.id?.value?.line || null;
			case "CallExpression":
				const callExpr = stmt as CallExpr;
				return this.getLineFromExpr(callExpr.callee);
			case "ExpressionStatement":
				const exprStmt = stmt as ExpressionStmt;
				return this.getLineFromExpr(exprStmt.expression);
			default:
				return null;
		}
	}

	// 从表达式中获取行号
	private getLineFromExpr(expr: Expr): number | null {
		if (expr.type === "Literal") {
			const literal = expr as Literal;
			return literal.value?.line || null;
		}
		return null;
	}

	async interpret(expression: ProgramStmt) {
		const body = expression.body;
		let returnVal: any;

		// 如果有debugger，在开始时暂停
		if (this.debuger && this.debuger.paused) {
			await new Promise<void>(resolve => {
				this.debuger.on("resume", resolve);
				this.debuger.setResumeCallback(() => resolve());
			});
		}

		try {
			for (const stmt of body) {
				// 通知debugger当前执行的行号和环境
				const lineNumber = this.getLineFromStmt(stmt);
				if (this.debuger && lineNumber) {
					this.debuger.setCurrentLine(lineNumber);
					this.debuger.setCurrentEnvironment(this._context);
				}

				if (!this.debuger?.paused || !this.debuger) {
					returnVal = await this.interpretStmt(stmt, this._context);
				} else {
					await new Promise<void>(resolve => {
						this.debuger.on("resume", resolve);
						this.debuger.setResumeCallback(() => resolve());
					});
					// 暂停后继续执行当前语句
					returnVal = await this.interpretStmt(stmt, this._context);
				}
			}
		} catch {
			this.errStackManager.throwAll();
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
			case "CommentStatement": {
				return;
			}
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
		return this.interpretFunctionDeclaration(stmt.fn, env, BaseDataTag.FN_TASK);
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
			const parser = new Parser();
			parser.parse(tokenlize(text.toString()));
			const program = parser.parse();
			const interpreter = new Interpreter(context);
			interpreter.interpret(program);
		}
	}

	interpretReturnStatement(stmt: ReturnStmt, env: Environment) {
		const value = this.interpretExpression(stmt.value, env);
		return value;
	}

	async interpretSwitchStatement(stmt: SwitchStmt, env: Environment) {
		const test = this.interpretExpression(stmt.test, env);
		for (const case_ of stmt.cases) {
			if (!case_.test) {
				return await this.interpretBlockStatement(case_.body, env);
			}
			const test_ = this.interpretExpression(case_.test, env) as Token;
			if (test_?.type === test.type && test_?.value === test.value) {
				return await this.interpretBlockStatement(case_.body, env);
			}
		}
		return null;
	}

	async interpretForStatement(stmt: ForStmt, env: Environment) {
		const id = stmt.init;
		const value = stmt.value;
		const range = await this.interpretExpression(stmt.range, env);
		const body = stmt.body;
		if (range.type === BaseDataTag.RANGE) {
			const step = range?.step.value === ".." ? 1 : Number(range[2].value);
			const start = toRealValue(range.start);
			const end = toRealValue(range.end);
			for (let i = start; i <= end; i += step) {
				const context = new Environment(env);
				context.declareVariable(id as Literal, LiteralFn(i));
				await this.interpretBlockStatement(body, context);
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
				await this.interpretBlockStatement(body, context);
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
		this.errStackManager
			.addError(new ErrorStack("Condition must be a boolean", env))
			.throw();
	}

	async interpretAssignmentExpression(stmt: AssignmentExpr, env: Environment) {
		const value = await this.interpretExpression(stmt.right, env);
		try {
			env.setVariable(stmt.left, value);
		} catch (e) {
			this.errStackManager
				.addError(
					new ErrorStack(
						`AssignmentExpression error: ${e}`,
						env,
						stmt.left.value
					)
				)
				.throw();
		}
	}
	async interpretBlockStatement(stmt: BlockStmt, env: Environment) {
		let returnVal: any;
		for (const s of stmt.body) {
			// 通知debugger当前执行的行号和环境
			const lineNumber = this.getLineFromStmt(s);
			if (this.debuger && lineNumber) {
				this.debuger.setCurrentLine(lineNumber);
				this.debuger.setCurrentEnvironment(env);
			}

			if (!this.debuger?.paused || !this.debuger) {
				returnVal = await this.interpretStmt(s, env);
				if (s.type === "ReturnStatement") {
					break;
				}
			} else {
				await new Promise<void>(resolve => {
					this.debuger.on("resume", resolve);
					this.debuger.setResumeCallback(() => resolve());
				});
				// 暂停后继续执行当前语句
				returnVal = await this.interpretStmt(s, env);
				if (s.type === "ReturnStatement") {
					break;
				}
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
		const fn = async (args: Expr[]) => {
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
			return await this.interpretBlockStatement(body, context);
		};
		setObjectData(fn, "type", type); // 设置类型
		env.declareVariable(stmt.id, fn);
	}

	async interpretCallExpression(stmt: CallExpr, env: Environment) {
		const callee = await this.interpretExpression(stmt.callee, env);
		const args = await Promise.all(
			stmt.arguments.map(async arg => this.interpretExpression(arg, env))
		);
		let res: any;
		try {
			res = typeof callee === "function" ? callee.apply(env, args) : callee;
		} catch (e) {
			this.errStackManager
				.addError(
					new ErrorStack(`CallExpression error: ${e}`, env, stmt.callee.value)
				)
				.throw();
		}
		return res;
	}
	async interpretVariableDeclaration(stmt: VariableDecl, env: Environment) {
		const value = await this.interpretExpression(stmt.value, env);
		env.declareVariable(stmt.id, value, stmt.is_const);
	}
	async interpretMemberExpression(e: MemberExpr, env: Environment) {
		const object = await this.interpretExpression(e.object, env);
		const prop_val = toRealValue(e.property as Literal);
		if (object instanceof Map) {
			const fromEntries = Object.fromEntries(object);
			if (!fromEntries["[object Object]"]) {
				return fromEntries[prop_val];
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
				try {
					if (e.value.type === TokenType.identifier) {
						const val = env.getVariable(e) as any; // 可能拿到的是Literal
						if (val.type === "Literal") {
							return val.value;
						}
						return val;
					}
				} catch (err) {
					this.errStackManager
						.addError(new ErrorStack(`Literal error: ${err}`, env, e))
						.throw();
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
					let key;
					try {
						// 找不到则识别为字符串
						key = await this.interpretExpression(target.key, env);
					} catch {
						key = LiteralFn(target.key.value.value);
					}
					obj.set(key, await this.interpretExpression(target.value, env));
				}
				setObjectData(obj, "type", BaseDataTag.OBJECT); // 设置类型
				return obj;
			}
			case "AssignmentExpression": {
				return this.interpretAssignmentExpression(
					expression as AssignmentExpr,
					env
				);
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
					this.errStackManager
						.addError(
							new ErrorStack(
								`Condition must have a consequent or alternate`,
								env
							)
						)
						.throw();
				}
				this.errStackManager
					.addError(new ErrorStack(`Condition must be a boolean`, env))
					.throw();
			}
			case "EqualExpression": {
				const e = expression as EqualExpr;
				const left = this.interpretExpression(e.left, env);
				const right = this.interpretExpression(e.right, env);
				return new TokenUnit(left).logicOperate(e.operator, right).getToken();
			}
			case "RangeExpression": {
				const e = expression as RangeExpr;
				const start = await this.interpretExpression(e.start, env);
				const end = await this.interpretExpression(e.end, env);
				return { type: BaseDataTag.RANGE, start, end, step: e.step };
			}
			case "TemplateElement": {
				const e = expression as TemplateElement;
				const data = await this.interpretExpression(e.value, env);
				return data;
			}
			case "TemplateLiteralExpression": {
				const e = expression as TemplateLiteralExpr;
				const values = await Promise.all(
					e.quotes.map(async q => await this.interpretExpression(q, env))
				);
				return values.map(v => v.value).join("");
			}
			case "LambdaFunctionDecl": {
				const e = expression as LambdaFunctionDecl;
				const fn = async (args: Expr[]) => {
					const context = new Environment(env);
					for (const i in args) {
						context.declareVariable(e.arguments[i] as any, args[i]);
					}
					const v = await this.interpretBlockStatement(e.body, context);
					return v;
				};
				setObjectData(fn, "type", BaseDataTag.FN_LAMBDA);
				return fn;
			}
			case "MemberExpression": {
				return await this.interpretMemberExpression(
					expression as MemberExpr,
					env
				);
			}
			case "UseDefaultSpecifier": {
				const e = expression as UseDefaultSpecifier;
				const val = e.local;
				if (e.local.type !== "Literal") {
					this.errStackManager
						.addError(
							new ErrorStack("UseDefaultSpecifier local must be a literal", env)
						)
						.throw();
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
				} catch (err) {
					this.errStackManager
						.addError(new ErrorStack(`ToExpression error: ${err}`, env))
						.throw();
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
				this.errStackManager
					.addError(
						new ErrorStack(
							`Unknown expression type: ${JSON.stringify(expression)}`,
							env
						)
					)
					.throw();
		}
	}
}
