export enum TokenType {
	number,
	string,
	identifier,
	boolean,
	operator,
	keyword,
	comment,
	paren, // ()
	comma, // ,
	// special tokens
	if,
	else,
	let,
	fn,
	end,
	nan,
}

export type JSRuntimeFn = (args?: any) => void;

export interface Token {
	type: TokenType;
	value: string;
	line: number;
	column: number;
}

export const Keywords = {
	NaN: TokenType.nan,
	true: TokenType.boolean,
	false: TokenType.boolean,
	if: TokenType.if,
	else: TokenType.else,
	let: TokenType.let,
	fn: TokenType.fn,
	end: TokenType.end,
};
