import { Literal } from "@/node";
import { TokenType } from "@/types";

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

export function toRealValue(expr: Literal) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	switch (token?.type) {
		case TokenType.number:
			return Number(token.value);
		case TokenType.string:
			return `${token.value}`;
		case TokenType.boolean:
			return !!token.value;
		default:
			return expr?.value ? token : expr;
	}
}
