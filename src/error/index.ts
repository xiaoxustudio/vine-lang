import Environment from "@/environment";
import { Token } from "@/keywords";
import { Literal } from "@/node";

export enum ErrorType {
	// 通用错误
	UNKNOWN = "UNKNOWN",
	// 变量无法找到
	VARIABLE_NOT_FOUND = "VARIABLE_NOT_FOUND"
}

export enum ErrorCode {
	// 解释器错误
	INTERPRETER_ERROR = "INTERPRETER_ERROR",
	// 语法错误
	SYNTAX_ERROR = "SYNTAX_ERROR",
	// 运行时错误
	RUNTIME_ERROR = "RUNTIME_ERROR"
}

export class ErrorStack extends Error {
	code: ErrorCode;
	constructor(
		public message: string,
		env?: Environment,
		token?: Token | Literal
	) {
		super(message);
		this.name = ErrorCode.INTERPRETER_ERROR;
		this.code = ErrorCode.INTERPRETER_ERROR;
		if (process.env.NODE_ENV === "production") this.stack = "";
		let pos = { line: null, column: null };
		if (token) {
			if (token.type === "Literal") {
				pos.column = (token as Literal).value.column;
				pos.line = (token as Literal).value.line;
			} else {
				pos.column = token.column;
				pos.line = token.line;
			}
		}
		if (!env) this.setCode(ErrorCode.SYNTAX_ERROR);
		this.cause = {
			filePath: env?.filePath || null,
			line: pos.line,
			column: pos.column
		};
	}
	setCode(code: ErrorCode) {
		this.name = code || ErrorCode.INTERPRETER_ERROR;
		this.code = code || ErrorCode.INTERPRETER_ERROR;
	}
}

export class ErrorStackManager {
	private errorStacks: ErrorStack[] = [];
	addError(error: ErrorStack) {
		this.errorStacks.push(error);
		return this;
	}
	queryError() {
		return this.errorStacks;
	}
	throw() {
		if (this.errorStacks.length === 0) {
			return;
		}
		throw this.errorStacks[this.errorStacks.length - 1];
	}
	throwAll() {
		if (this.errorStacks.length === 0) {
			return;
		}
		this.errorStacks.forEach((error) => {
			throw error;
		});
	}
}
