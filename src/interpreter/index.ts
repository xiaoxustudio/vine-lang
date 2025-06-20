import { Environment } from "@/environment";
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
} from "@/node";
import { Token, TokenType } from "@/keywords";
import { LiteralFn, mapToObject, toRealValue } from "@/utils";

export class TokenUnit {
	_token: Token;
	constructor(token: Token) {
		this._token = token;
	}
	vaildBaseType(token: Token) {
		if (typeof token !== "object") return token;
		const baseType = [TokenType.number, TokenType.string, TokenType.boolean];
		const isBase = baseType.includes(token.type);
		if (!isBase)
			throw new Error(`Unknown literal type: ${JSON.stringify(token)}`);
		return isBase;
	}
	add(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: left + right };
		return this;
	}
	sub(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: (left - right).toString() };
		return this;
	}
	mul(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: (left * right).toString() };
		return this;
	}
	div(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}
		this._token = { ...this._token, value: (left / right).toString() };
		return this;
	}
	logicOperate(operator: Token, rightToken: Literal) {
		const left = toRealValue(this._token);
		const right = toRealValue(rightToken);
		const res = ((): boolean => {
			switch (operator.value) {
				case "==":
					return left == right;
				case "!=":
					return left != right;
				case ">":
					return left > right;
				case "<":
					return left < right;
				case ">=":
					return left >= right;
				case "<=":
					return left >= right;
			}
		})();

		this._token = {
			...this._token,
			type: TokenType.boolean,
			value: res.toString(),
		};
		return this;
	}
	getToken() {
		return this._token;
	}
}

export class Interpreter {
	private readonly _context: Environment;

	constructor(context: any) {
		this._context = context;
	}

	interpret(expression: ProgramStmt) {
		const body = expression.body;
		let returnVal;
		for (const stmt of body) {
			returnVal = this.interpretStmt(stmt, this._context);
		}
		return returnVal;
	}

	interpretStmt(stmt: Node, env: Environment) {
		switch (stmt.type) {
			case "ExpressionStatement":
				return this.interpretExpressionStatement(stmt as ExpressionStmt, env);
			case "VariableDeclaration":
				return this.interpretVariableDeclaration(stmt as VariableDecl, env);
			case "FunctionDeclaration":
				return this.interpretFunctionDeclaration(stmt as FunctionDecl, env);
			case "CallExpression":
				return this.interpretCallExpression(stmt as CallExpr, env);
			case "BlockStatement":
				return this.interpretBlockStatement(stmt as BlockStmt, env);
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
			case "MemberExpression":
				return this.interpretMemberExpression(stmt as MemberExpr, env);
			default:
				return this.interpretExpression(stmt as ExpressionStmt, env);
		}
	}

	interpretReturnStatement(stmt: ReturnStmt, env: Environment) {
		const value = this.interpretExpression(stmt.value, env);
		return value;
	}

	interpretSwitchStatement(stmt: SwitchStmt, env: Environment) {
		const test = this.interpretExpression(stmt.test, env);
		for (const case_ of stmt.cases) {
			const test_ = this.interpretExpression(case_.test, env);
			if (test_.type === test.type && test_.value === test.value) {
				this.interpretBlockStatement(case_.body, env);
				return;
			}
		}
	}

	interpretForStatement(stmt: ForStmt, env: Environment) {
		const id = stmt.init;
		const value = stmt.value;
		const range = this.interpretExpression(stmt.range, env);
		const body = stmt.body;
		if (range.type === "range") {
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
		if (condition.type === TokenType.boolean) {
			if (condition.value === "true") {
				return this.interpretStmt(stmt.consequent, env);
			} else if (stmt.alternate) {
				return this.interpretStmt(stmt.alternate, env);
			}
		}
		throw new Error("Condition must be a boolean");
	}

	interpretAssignmentExpression(stmt: AssignmentExpr, env: Environment) {
		env.setVariable(stmt.left, stmt.right);
	}
	interpretBlockStatement(stmt: BlockStmt, env: Environment) {
		let returnVal;
		for (const s of stmt.body) {
			if (s.type === "ReturnStatement") {
				returnVal = this.interpretStmt(s, env);
				break;
			} else {
				this.interpretStmt(s, env);
			}
		}
		return returnVal;
	}
	interpretFunctionDeclaration(stmt: FunctionDecl, env: Environment) {
		const body = stmt.body;
		const args_out = stmt.arguments;
		env.declareVariable(stmt.id, (args: Expr[]) => {
			const context = new Environment(env);
			for (const i in args) {
				context.declareVariable(args_out[i] as any, args[i]);
			}
			return this.interpretBlockStatement(body, context);
		});
	}
	interpretCallExpression(stmt: CallExpr, env: Environment) {
		const callee = this.interpretExpression(stmt.callee, env);
		const args = stmt.arguments.map(arg => this.interpretExpression(arg, env));
		return typeof callee === "function" ? callee(args) : callee;
	}
	interpretVariableDeclaration(stmt: VariableDecl, env: Environment) {
		const value = this.interpretExpression(stmt.value, env);
		env.declareVariable(stmt.id, value);
	}
	interpretMemberExpression(e: MemberExpr, env: Environment) {
		const object = this.interpretExpression(e.object, env);
		const prop_val = toRealValue(e.property as Literal);
		if (object instanceof Map) {
			const targetObject = mapToObject(object, toRealValue);
			return targetObject[prop_val];
		} else {
			return object[prop_val];
		}
	}
	interpretExpressionStatement(stmt: ExpressionStmt, env: Environment) {
		this.interpretExpression(stmt.expression, env);
	}
	interpretExpression(expression: Expr, env: Environment) {
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
				const left = this.interpretExpression(e.left, env);
				const right = this.interpretExpression(e.right, env);

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
					obj.set(key, this.interpretExpression(target.value, env));
				}
				return obj;
			}
			case "ObjectExpression": {
				const e = expression as ObjectExpr;
				const obj = new Map<Literal, Expr>();
				for (const target of e.properties) {
					obj.set(target.key, this.interpretExpression(target.value, env));
				}
				return obj;
			}
			case "CompareExpression": {
				const e = expression as CompareExpr;
				const left = this.interpretExpression(e.left, env);
				const right = this.interpretExpression(e.right, env);
				return new TokenUnit(left).logicOperate(e.operator, right).getToken();
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
				return { type: "range", start, end, step: e.step };
			}
			case "LambdaFunctionDecl": {
				const e = expression as LambdaFunctionDecl;
				return (args: Expr[]) => {
					const context = new Environment(env);
					for (const i in args) {
						context.declareVariable(e.arguments[i] as any, args[i]);
					}
					return this.interpretBlockStatement(e.body, context);
				};
			}
			case "MemberExpression": {
				return this.interpretMemberExpression(expression as MemberExpr, env);
			}
			default:
				throw new Error(
					`Unknown expression type: ${JSON.stringify(expression)}`
				);
		}
	}
}
