import {
	ArrayExpr,
	AssignmentExpr,
	BinaryExpr,
	BlockStmt,
	CallExpr,
	CaseBlockStmt,
	CommentStmt,
	CompareExpr,
	DefaultCaseBlockStmt,
	EqualExpr,
	ExposeStmt,
	Expr,
	ForStmt,
	FunctionDecl,
	IfStmt,
	LambdaFunctionDecl,
	MemberExpr,
	ObjectExpr,
	ProgramStmt,
	Property,
	RangeExpr,
	ReturnStmt,
	RunStmt,
	SwitchStmt,
	TaskStmt,
	TemplateElement,
	TemplateLiteralExpr,
	TernaryExpr,
	ToExpr,
	UseDecl,
	UseDefaultSpecifier,
	UseSpecifier,
	VariableDecl,
	WaitStmt,
} from "@/node";
import { Token, TokenType } from "@/keywords";
import { Literal } from "../node/index";
import LiteralFn from "@/utils/LiteralFn";
import { ErrorStack, ErrorStackManager } from "@/error";

export default class Parser {
	private errStackManager = new ErrorStackManager();
	tokens: Token[];

	/**
	 * @description: code push this stack tokens
	 */
	pushStack(token: Token[]) {
		this.tokens.push(...token);
	}

	at(index = 0): Token | undefined {
		return this.tokens[index];
	}

	eat() {
		return this.tokens.shift();
	}

	match(tag: string | TokenType, match_value?: string) {
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
				if (count > 1000000) {
					this.errStackManager
						.addError(
							new ErrorStack(
								`Infinite loop to Match ${tag}，${JSON.stringify(token)}`
							)
						)
						.throw();
				}
			}
		}
		this.errStackManager
			.addError(new ErrorStack(`Unexpected token: ${tag}`))
			.throw();
	}

	parse(tokens?: Token[]): ProgramStmt {
		if (tokens) this.tokens = tokens;
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
			case TokenType.use:
				return this.parseUse();
			case TokenType.comment:
				return this.parseComment();
			case TokenType.task:
				return this.parseTask();
			case TokenType.let:
			case TokenType.cst:
				return this.parseVariable();
			case TokenType.if:
				return this.parseIf();
			case TokenType.fn:
				return this.parseFunction();
			case TokenType.for:
				return this.parseFor();
			case TokenType.switch:
				return this.parseSwitch();
			case TokenType.return:
				return this.parseReturn();
			case TokenType.expose:
				return this.parseExpose();
			case TokenType.run:
				return this.parseRun();
			case TokenType.wait:
				return this.parseWait();
			default:
				return this.parseExpression();
		}
	}

	parseComment() {
		return { type: "CommentStatement", value: this.eat() } as CommentStmt;
	}

	parseWait() {
		this.match(TokenType.wait);
		return {
			type: "WaitStatement",
			async: this.parseRun(),
		} as WaitStmt;
	}

	parseTo() {
		this.match(TokenType.to);
		const args = this.parseArgs();
		const body = this.parseBlock(true);
		return { type: "ToExpression", arguments: args, body } as ToExpr;
	}

	parseRun() {
		this.match(TokenType.run);
		const callee = this.parseCall();
		let to: ToExpr[] = [];
		if (this.at().type === TokenType.to) {
			while (this.at().type === TokenType.to) {
				to.push(this.parseTo());
			}
			this.match(TokenType.end);
		}
		return {
			type: "RunStatement",
			callee,
			to,
		} as RunStmt;
	}

	parseTask() {
		this.match(TokenType.task);
		const fn = this.parseFunction();
		return {
			type: "TaskStatement",
			fn,
		} as TaskStmt;
	}

	parseExpose() {
		this.match(TokenType.expose);
		return {
			type: "ExposeStmtement",
			body: this.parseStatement(),
		} as ExposeStmt;
	}

	parseAs() {
		const specifiers = [];
		this.match(TokenType.paren, "(");
		while (this.at().type !== TokenType.paren) {
			const specifier = this.parseIdentifier();
			let remote;
			if (this.at().type === TokenType.as) {
				this.match(TokenType.as);
				remote = this.parseIdentifier();
			}
			specifiers.push({
				type: "UseSpecifier",
				local: specifier,
				remote,
			} as UseSpecifier);
			if (this.at().type === TokenType.comma) this.eat();
		}
		this.match(TokenType.paren, ")");
		return specifiers;
	}

	parseDefaultAs() {
		this.match(TokenType.as);
		return {
			type: "UseDefaultSpecifier",
			local: this.parseIdentifier(),
		} as UseDefaultSpecifier;
	}

	parseUse() {
		this.match(TokenType.use);
		const source = this.parseString();
		const specifiers = [];
		if (this.at().type === TokenType.as) {
			const specifier = this.parseDefaultAs();
			specifiers.push(specifier);
		}
		if (this.at().type === TokenType.pick) {
			this.match(TokenType.pick);
			const specifiersToAs = this.parseAs();
			specifiers.push(...specifiersToAs);
		}
		return {
			type: "UseDeclaration",
			source,
			specifiers,
		} as UseDecl;
	}

	parseReturn() {
		this.match(TokenType.return);
		const value = this.parseExpression();
		return {
			type: "ReturnStatement",
			value,
		} as ReturnStmt;
	}

	parseSwitch() {
		this.match(TokenType.switch); // eat the 'switch' token
		const test = this.parseExpression();
		this.match(TokenType.colon);
		const cases: (CaseBlockStmt | DefaultCaseBlockStmt)[] = [];
		while (this.at().type !== TokenType.end) {
			const caseesBlock = this.parseSwitchCase();
			cases.push(caseesBlock);
		}
		this.match(TokenType.end);
		return {
			type: "SwitchStmtement",
			test,
			cases,
		} as SwitchStmt;
	}

	parseSwitchCase() {
		const token = this.eat();
		if ([TokenType.case, TokenType.default].includes(token.type)) {
			let test = null;
			let isDefault = false;
			if (token.type !== TokenType.default) {
				test = this.parseExpression();
				isDefault = true;
			}
			this.match(TokenType.colon, ":"); // eat the ':' token
			let bodyStmt;
			const body: Expr[] = [];
			while (
				this.tokens.length > 0 &&
				![
					TokenType.break,
					TokenType.case,
					TokenType.default,
					TokenType.end,
				].includes(this.at().type)
			) {
				const stmt = this.parseStatement();
				body.push(stmt);
			}
			bodyStmt = { body, type: "BlockStatement" } as BlockStmt;
			if (body[body.length - 1].type !== "ReturnStatement")
				this.match(TokenType.break);
			return isDefault
				? ({
						test,
						body: bodyStmt,
						type: "DefaultCaseBlockStatement",
				  } as DefaultCaseBlockStmt)
				: ({
						test,
						body: bodyStmt,
						type: "CaseBlockStatement",
				  } as CaseBlockStmt);
		}
		this.errStackManager
			.addError(new ErrorStack(`Unexpected case token: ${token.type}`))
			.throw();
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
			this.errStackManager
				.addError(new ErrorStack(`Unexpected token: ${token.type}`))
				.throw();
		}
		return { value: this.eat(), type: "Literal" } as Literal;
	}

	parseString() {
		const token = this.at();
		if (token.type !== TokenType.string) {
			this.errStackManager
				.addError(new ErrorStack(`Unexpected token: ${token.type}`))
				.throw();
		}
		return { value: this.eat(), type: "Literal" } as Literal;
	}

	parseVariable() {
		let is_const = false;
		if (this.at().type === TokenType.cst) {
			is_const = true;
		}
		this.eat();
		const identifier = this.parseIdentifier();
		const token = this.at();
		if (token.type === TokenType.operator && token.value === "=") {
			this.eat();
			const value = this.parseExpression();
			return {
				id: identifier,
				value,
				type: "VariableDeclaration",
				is_const,
			} as VariableDecl;
		} else {
			this.errStackManager
				.addError(new ErrorStack(`Unexpected token: ${token.type}`))
				.throw();
		}
	}

	parseIf() {
		this.match(TokenType.if); // eat the 'if' token
		const condition = this.parseExpression();
		const consequent = this.parseBlock(true);
		const token = this.at();
		let alternate = { body: [], type: "BlockStatement" } as BlockStmt;
		if (token.type === TokenType.else) {
			this.match(TokenType.else);
			alternate = this.parseBlock();
		} else {
			this.match(TokenType.end);
		}
		return {
			type: "IfStatement",
			test: condition,
			consequent,
			alternate,
		} as IfStmt;
	}

	parseFor() {
		this.match(TokenType.for); // eat the 'for' token
		const identifier = this.parseIdentifier();
		const token = this.at();
		let value;
		if (token.type === TokenType.comma) {
			this.match(TokenType.comma);
			value = this.parseIdentifier();
		}
		this.match(TokenType.in); // eat the 'for' token
		const range = this.parseExpression() as RangeExpr;
		const body = this.parseBlock();
		return {
			init: identifier,
			value,
			range,
			body,
			update: LiteralFn(1),
			type: "ForStatement",
		} as ForStmt;
	}

	parseBlock(noEnd: boolean = false) {
		this.match(TokenType.colon, ":"); // eat the ':' token
		const body = [];
		while (
			this.tokens.length > 0 &&
			![TokenType.end, TokenType.else].includes(this.at().type)
		) {
			const stmt = this.parseStatement();
			body.push(stmt);
		}
		if (!noEnd) this.match(TokenType.end); // eat the 'end' token
		return { body, type: "BlockStatement" } as BlockStmt;
	}

	parseTemplateString(token: Token) {
		const tmpExpr = {
			type: "TemplateLiteralExpression",
			quotes: [],
		} as TemplateLiteralExpr;
		const text = token.value as string;
		const reg = /\{\{([^\}]+)\}\}/g;
		let lastIndex = 0; // 记录上一次匹配结束的位置
		let match: RegExpExecArray;

		while ((match = reg.exec(text)) !== null) {
			// 处理匹配前的普通文本
			if (match.index > lastIndex) {
				const literalText = text.substring(lastIndex, match.index);
				tmpExpr.quotes.push({
					type: "TemplateElement",
					value: {
						type: "Literal",
						value: {
							...token,
							column: match.index,
							type: TokenType.string,
							value: literalText,
						},
					},
				} as TemplateElement);
			}

			// 处理匹配到的插值表达式
			const tmpElem = {
				type: "TemplateElement",
				value: {
					value: {
						...token,
						column: match.index,
						type: TokenType.identifier,
						value: match[1],
					},
					type: "Literal",
				} as Literal,
			} as TemplateElement;
			tmpExpr.quotes.push(tmpElem);

			// 更新最后匹配位置（当前匹配结束位置）
			lastIndex = match.index + match[0].length;
		}

		// 处理末尾的普通文本
		if (lastIndex < text.length) {
			const literalText = text.substring(lastIndex);
			tmpExpr.quotes.push({
				type: "TemplateElement",
				value: {
					type: "Literal",
					value: {
						...token,
						column: lastIndex,
						type: TokenType.string,
						value: literalText,
					},
				},
			} as TemplateElement);
		}
		return tmpExpr;
	}

	parseExpression(): Expr {
		return this.parseTernay();
	}

	parseTernay() {
		const left = this.parseComparisonExpr();
		if (this.at()?.type === TokenType.question) {
			this.eat();
			const consequent = this.parseExpression();
			this.match(TokenType.colon);
			const alternate = this.parseExpression();
			return {
				type: "TernayExpression",
				condition: left,
				consequent,
				alternate,
			} as TernaryExpr;
		}
		return left;
	}

	parseObjectLiteral() {
		if (this.at().type !== TokenType.curly) {
			return this.parseArrayLiteral();
		}
		this.match(TokenType.curly, "{");
		const properties: Property[] = [];
		while (this.at().type !== TokenType.curly && this.at().value !== "}") {
			const key = this.parseIdentifier();
			// {key}
			if (this.at().type == TokenType.comma) {
				// {key ,}
				this.eat();
				properties.push({
					key,
					value: key,
					type: "Property",
				} as Property);
				continue;
			} else if (this.at().type == TokenType.curly && this.at(1).value == "}") {
				// {key}
				properties.push({
					key,
					value: key,
					type: "Property",
				} as Property);
				continue;
			}
			//{key : val}
			this.match(TokenType.colon);
			const value = this.parseExpression();
			properties.push({ key, value, type: "Property" } as Property);
			if (this.at().type == TokenType.comma) this.match(TokenType.comma);
		}
		this.match(TokenType.curly, "}");
		return { properties, type: "ObjectExpression" } as ObjectExpr;
	}

	parseArrayLiteral(): ArrayExpr {
		if (this.at().type !== TokenType.bracket) {
			return this.parseEqualExpr();
		}
		this.match(TokenType.bracket, "[");
		const elements: Expr[] = [];
		// 处理空数组情况
		if (this.at().value === "]") {
			this.eat();
			return {
				items: elements,
				type: "ArrayExpression",
			} as ArrayExpr;
		}
		let index = 0;
		while (this.tokens.length > 0 && this.at().value !== "]") {
			const expr = this.parseExpression();
			elements.push({
				type: "Property",
				key: LiteralFn(index),
				value: expr,
			} as Property);
			if (this.at().type === TokenType.comma) {
				this.eat();
			}
			index++;
		}
		this.match(TokenType.bracket, "]");
		return {
			items: elements,
			type: "ArrayExpression",
		} as ArrayExpr;
	}

	parseComparisonExpr() {
		const left = this.parseObjectLiteral();
		const token = this.at();
		const op = ["<", ">"];
		if (
			token &&
			token.type === TokenType.operator &&
			op.includes(token.value)
		) {
			const operator = this.eat();
			const target = {
				left,
				operator,
				right: null,
				type: "CompareExpression",
			} as CompareExpr;
			if (this.at().type === TokenType.operator && this.at().value === "=") {
				this.eat();
				target.operator = { ...operator, value: operator.value + "=" };
			}
			target.right = this.parseComparisonExpr();
			return target;
		}
		return left;
	}

	parseEqualExpr() {
		const left = this.parseCall();
		const token = this.at();
		const op = ["=", "!"];
		if (
			token &&
			token.type === TokenType.operator &&
			op.includes(token.value)
		) {
			const operator = this.eat();
			if (this.at().type === TokenType.operator && this.at().value === "=") {
				this.eat();
				return {
					left,
					operator: { ...operator, value: operator.value + "=" },
					right: this.parseEqualExpr(),
					type: "EqualExpression",
				} as EqualExpr;
			}
			return {
				left,
				operator,
				right: this.parseEqualExpr(),
				type: "AssignmentExpression",
			} as AssignmentExpr;
		}
		return left;
	}

	parseArgs() {
		if (this.at().type === TokenType.colon) {
			return [];
		}
		const args: Expr[] = [];
		this.match(TokenType.paren, "(");
		if (this.at().value === ")") {
			this.eat();
			return args;
		}
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
		const left = this.parseMemberExpr();
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

	parseMemberExpr() {
		let object = this.parsePrimary();
		if (
			this.at()?.type === TokenType.dot &&
			this.at(1)?.type === TokenType.dot
		) {
			const operator = this.eat();
			operator.value = "..";
			this.eat();
			return {
				start: object,
				step: operator,
				end: this.parseMemberExpr(),
				type: "RangeExpression",
			} as RangeExpr;
		}
		while (this.at()?.value === "[" || this.at()?.type === TokenType.dot) {
			if (this.at().type === TokenType.dot) {
				this.eat();
				const property = this.parseIdentifier();
				object = {
					object,
					property,
					computed: false,
					type: "MemberExpression",
				} as MemberExpr;
			} else if (this.at().type === TokenType.bracket) {
				this.eat();
				const expr = this.parseExpression();
				this.match(TokenType.bracket, "]");
				object = {
					object,
					property: expr,
					computed: true,
					type: "MemberExpression",
				} as MemberExpr;
			} else {
				this.errStackManager
					.addError(
						new ErrorStack(`Unexpected token: ${JSON.stringify(this.at())}`)
					)
					.throw();
			}
		}
		return object;
	}

	parsePrimary(): Expr {
		const token = this.at();
		switch (token.type) {
			case TokenType.number:
			case TokenType.identifier:
			case TokenType.string:
			case TokenType.boolean:
			case TokenType.nan:
			case TokenType.nil:
				this.eat();
				if (/\{\{([^\}]+)\}\}/g.test(token.value))
					return this.parseTemplateString(token);
				return {
					value: token,
					type: "Literal",
				} as Literal;
			case TokenType.paren:
				this.eat();
				const expr = this.parseExpression();
				this.match(TokenType.paren, ")"); // eat the closing paren
				return expr;
			case TokenType.curly:
				return this.parseObjectLiteral();
			case TokenType.bracket:
				return this.parseArrayLiteral();
			case TokenType.fn:
				// lamdada function
				this.match(TokenType.fn);
				const args = this.parseArgs();
				const body = this.parseBlock();
				return {
					arguments: args,
					body,
					type: "LambdaFunctionDecl",
				} as LambdaFunctionDecl;
			case TokenType.run:
				return this.parseRun();
			case TokenType.wait:
				return this.parseWait();
			case TokenType.default:
			case TokenType.case:
				return this.parseSwitchCase();
			default:
				this.errStackManager
					.addError(
						new ErrorStack(`Unexpected token: ${JSON.stringify(token)}`)
					)
					.throw();
		}
	}
}
