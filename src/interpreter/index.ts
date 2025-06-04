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
} from "@/node";
import { Token, TokenType } from "@/types";

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
			default:
				return this.interpretExpression(stmt as ExpressionStmt, env);
		}
	}
	interpretAssignmentExpression(stmt: AssignmentExpr, env: Environment) {
		env.setVariable(stmt.left, stmt.right);
	}
	interpretBlockStatement(stmt: BlockStmt, env: Environment) {
		for (const s of stmt.body) {
			this.interpretStmt(s, env);
		}
	}
	interpretFunctionDeclaration(stmt: FunctionDecl, env: Environment) {
		const body = stmt.body;
		env.declareVariable(stmt.id, (args: Expr[]) => {
			const context = new Environment(env);
			this.interpretBlockStatement(body, context);
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
	interpretExpressionStatement(stmt: ExpressionStmt, env: Environment) {
		this.interpretExpression(stmt.expression, env);
	}
	interpretExpression(expression: Expr, env: Environment) {
		switch (expression.type) {
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

				switch (e.operator.value) {
					case "+":
						return new TokenUnit(left).add(right).getToken();
					case "-":
						return new TokenUnit(left).sub(right).getToken();
					case "*":
						return new TokenUnit(left).mul(right).getToken();
					case "/":
						return new TokenUnit(left).div(right).getToken();
				}
				break;
			}
			default:
				throw new Error(
					`Unknown expression type: ${JSON.stringify(expression)}`
				);
		}
	}
}
