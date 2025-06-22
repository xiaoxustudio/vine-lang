export enum TokenType {
	number,
	string,
	identifier,
	boolean,
	operator,
	keyword,
	comment,
	paren, // ()
	bracket, // []
	curly, // {}
	comma, // ,
	colon, // :
	dot, // .
	// built-in  tokens
	index,
	// special tokens
	use,
	expose,
	as,
	if,
	else,
	let,
	fn,
	return,
	end,
	nan,
	nil,
	for,
	in,
	range,
	switch,
	case,
	default,
	break,
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
	nil: TokenType.nil,
	true: TokenType.boolean,
	false: TokenType.boolean,
	expose: TokenType.expose,
	use: TokenType.use,
	as: TokenType.as,
	if: TokenType.if,
	else: TokenType.else,
	let: TokenType.let,
	fn: TokenType.fn,
	return: TokenType.return,
	end: TokenType.end,
	for: TokenType.for,
	in: TokenType.in,
	range: TokenType.range,
	switch: TokenType.switch,
	case: TokenType.case,
	default: TokenType.default,
	break: TokenType.break,
};
