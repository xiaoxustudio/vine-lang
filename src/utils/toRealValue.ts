import { Token, TokenType } from "@/keywords";
import { Literal } from "@/node";
import mapToObject from "./mapToObject";

export default function toRealValue(expr: Literal | Token) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	switch (token?.type) {
		case TokenType.index:
		case TokenType.number:
			return Number(token.value);
		case TokenType.string:
		case TokenType.identifier:
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
