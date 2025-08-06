export enum TokenType {
	number,
	string,
	identifier,
	boolean,
	operator,
	keyword,
	comment,
	emptyLine,
	paren, // ()
	bracket, // []
	curly, // {}
	comma, // ,
	colon, // :
	question, // ?
	dot, // .
	// built-in  tokens
	index,
	env, // this tag inject to current environment variable list when use keyword
	// special tokens
	use,
	expose,
	pick,
	as,
	task, // signifies a task (like async function)
	wait, // wait for a task to finish (like await)
	to, // (like then)
	run, // used to carry out the tasks we have defined
	if,
	else,
	let,
	cst, // const keyword
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
	break
}

export type JSRuntimeFn = (args?: any) => void;
export type JSRuntimeClass = { new (...args: any[]): any };

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
	pick: TokenType.pick,
	use: TokenType.use,
	as: TokenType.as,
	task: TokenType.task,
	to: TokenType.to,
	run: TokenType.run,
	wait: TokenType.wait,
	if: TokenType.if,
	else: TokenType.else,
	let: TokenType.let,
	cst: TokenType.cst,
	fn: TokenType.fn,
	return: TokenType.return,
	end: TokenType.end,
	for: TokenType.for,
	in: TokenType.in,
	range: TokenType.range,
	switch: TokenType.switch,
	case: TokenType.case,
	default: TokenType.default,
	break: TokenType.break
};
