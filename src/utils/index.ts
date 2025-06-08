import { Expr, Literal } from "@/node";
import { Token, TokenType } from "@/keywords";

export function LiteralFn(s: string | number | boolean) {
	const type =
		typeof s === "string"
			? TokenType.string
			: typeof s === "boolean"
			? TokenType.boolean
			: TokenType.number;
	return {
		type: "Literal",
		value: { column: 0, line: 0, value: s, type },
	} as Literal;
}

export function toRealValue(expr: Literal | Token, isRepl = false) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	switch (token?.type) {
		case TokenType.number:
			return Number(token.value);
		case TokenType.string:
			return `${token.value}`;
		case TokenType.boolean:
			return !!token.value;
		case TokenType.nan:
			return Number.NaN;
		case TokenType.nil:
			return null;
		default:
			return expr?.value
				? token
				: Array.isArray(expr)
				? expr.map(v => toRealValue(v))
				: typeof expr === "object"
				? mapToObject(expr as any, toRealValue)
				: expr;
	}
}

export function mapToObject(obj: Map<Literal, Expr>, fn: (v: any) => any) {
	const result = {};
	for (const [key, value] of obj) {
		result[toRealValue(key).value] = fn(value);
	}
	return result;
}

export function isNilLiteral(expr: Literal) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	return token?.type === TokenType.nil;
}

export function isNil(input: any) {
	return input === null || typeof input === "undefined" || input === "nil";
}
