import { Expr, Literal } from "@/node";
import { Token, TokenType } from "@/keywords";
import Environment from "@/environment";

export function isToken(expr: Expr) {
	return Object.keys(TokenType).includes(expr?.type);
}

export function isNilLiteral(expr: Literal) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	return token?.type === TokenType.nil;
}

export function isNil(input: any) {
	return input === null || typeof input === "undefined" || input === "nil";
}

export function isBuilInObject(expr: Token | Expr) {
	return expr instanceof Environment || expr.type === TokenType.env;
}
