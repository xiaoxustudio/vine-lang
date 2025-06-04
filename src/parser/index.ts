import {
	AssignmentExpr,
	BinaryExpr,
	BlockStmt,
	CallExpr,
	Expr,
	FunctionDecl,
	IfStmt,
	ProgramStmt,
	VariableDecl,
} from "@/node";
import { Token, TokenType } from "@/types";
import { Literal } from "../node/index";

export class Parser {
	tokens: Token[];
	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	at() {
		return this.tokens[0];
	}

	eat() {
		return this.tokens.shift();
	}

	match(tag: string | TokenType, match_value?: string | undefined) {
		if (typeof tag === "string") {
			while (this.tokens.length > 0) {
				const token = this.at();
				if (token.value === tag) {
					return this.eat();
				}
			}
		} else {
			let count = 0;
			while (this.tokens.length > 0) {
				const token = this.at();
				if (
					token.type === tag &&
					(match_value === token.value || match_value === undefined)
				) {
					return this.eat();
				}
				count++;
				if (count > 10000) {
					throw new Error(`Infinite loop to Match ${tag}`);
				}
			}
		}
		throw new Error(`Unexpected token: ${tag}`);
	}

	parse(): ProgramStmt {
		const body = [];
		if (this.tokens.length === 0) {
			return { type: "Program", body } as ProgramStmt;
		}
		while (this.tokens.length > 0) {
			const stmt = this.parseStatement();
			body.push(stmt);
		}
		return { type: "Program", body } as ProgramStmt;
	}

	parseStatement() {
		const token = this.at();
		switch (token.type) {
			case TokenType.comment:
				this.eat();
				return this.parseStatement();
			case TokenType.let:
				return this.parseLet();
			case TokenType.if:
				return this.parseIf();
			case TokenType.fn:
				return this.parseFunction();
			default:
				return this.parseExpression();
		}
	}

	parseFunction() {
		this.match(TokenType.fn);
		const id = this.parseIdentifier();
		const args = this.parseArgs();
		const body = this.parseBlock();
		return {
			id,
			arguments: args,
			body,
			type: "FunctionDeclaration",
		} as FunctionDecl;
	}

	parseIdentifier(): Expr {
		const token = this.at();
		if (token.type !== TokenType.identifier) {
			throw new Error(`Unexpected token: ${token.type}`);
		}
		return { value: this.eat(), type: "Literal" } as Literal;
	}
	parseLet() {
		this.match(TokenType.let); // eat the 'let' token
		const identifier = this.parseIdentifier();
		const token = this.at();
		if (token.type === TokenType.operator && token.value === "=") {
			this.eat();
			const value = this.parseExpression();
			return {
				id: identifier,
				value,
				type: "VariableDeclaration",
			} as VariableDecl;
		} else {
			throw new Error(`Unexpected token: ${token.type}`);
		}
	}

	parseIf() {
		this.match(TokenType.if); // eat the 'if' token
		const condition = this.parseExpression();
		const consequent = this.parseBlock();
		const token = this.at();
		let alternate = { body: [], type: "BlockStatement" } as BlockStmt;
		if (token.type === TokenType.else) {
			this.match(TokenType.else);
			alternate = this.parseBlock();
		}
		return {
			type: "IfStatement",
			test: condition,
			consequent,
			alternate,
		} as IfStmt;
	}

	parseBlock() {
		this.match(TokenType.operator, ":"); // eat the ':' token
		const body = [];
		while (this.tokens.length > 0 && this.at().type !== TokenType.end) {
			const stmt = this.parseStatement();
			body.push(stmt);
		}
		this.match(TokenType.end); // eat the 'end' token
		return { body, type: "BlockStatement" } as BlockStmt;
	}
	parseExpression(): Expr {
		return this.parseCall();
	}

	parseArgs() {
		const args: Expr[] = [];
		this.match(TokenType.paren, "(");
		while (this.tokens.length > 0 && this.at().type !== TokenType.paren) {
			const expr = this.parseExpression();
			args.push(expr);
			if (this.at().type === TokenType.comma) {
				this.eat();
			}
		}
		this.match(TokenType.paren, ")"); // eat the closing paren
		return args;
	}
	parseCall() {
		const left = this.parseBinaryExpr();
		const token = this.at();
		if (token && token.type === TokenType.paren && token.value === "(") {
			const args = this.parseArgs();
			return {
				callee: left,
				arguments: args,
				type: "CallExpression",
			} as CallExpr;
		}
		return left;
	}
	parseBinaryExpr() {
		const left = this.parseAssignment();
		const token = this.at();
		const op = ["+", "-", "*", "/"];
		if (
			token &&
			token.type === TokenType.operator &&
			op.includes(token.value)
		) {
			const operator = this.eat();
			return {
				left,
				operator,
				right: this.parseBinaryExpr(),
				type: "BinaryExpression",
			} as BinaryExpr;
		}
		return left;
	}

	parseAssignment(): Expr {
		const left = this.parsePrimary();
		const token = this.at();
		if (token && token.type === TokenType.operator && token.value === "=") {
			return {
				left,
				operator: this.eat(),
				right: this.parsePrimary(),
				type: "AssignmentExpression",
			} as AssignmentExpr;
		}
		return left as Expr;
	}
	parsePrimary(): Expr {
		const token = this.at();
		switch (token.type) {
			case TokenType.number:
			case TokenType.identifier:
			case TokenType.string:
			case TokenType.boolean:
				this.eat();
				return {
					value: token,
					type: "Literal",
				} as Literal;
			case TokenType.paren:
				this.eat();
				const expr = this.parseExpression();
				this.eat(); // eat the closing paren
				return expr;
			default:
				throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
		}
	}
}
