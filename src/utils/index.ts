import { Expr, Literal } from "@/node";
import { Token, TokenType } from "@/keywords";
import { Environment } from "@/environment";

export interface TokenExEnvironment extends Omit<Token, "value"> {
	value: Environment;
}

export function UseEnvFn(env: Environment) {
	return {
		type: TokenType.env,
		value: env,
		line: 0,
		column: 0,
	} as TokenExEnvironment;
}

export function LiteralFn(s: string | number | boolean | null | Literal) {
	if (s && (s as any)?.type === "Literal") {
		return s as Literal;
	}
	const type = (() => {
		switch (typeof s) {
			case "number":
				return TokenType.number;
			case "string":
				return TokenType.string;
			case "boolean":
				return TokenType.boolean;
			case "object":
				// object 则必定是 nil
				return TokenType.nil;
			default:
				return TokenType.nil;
		}
	})();
	return {
		type: "Literal",
		value: { column: 0, line: 0, value: s, type },
	} as Literal;
}

export function toRealValue(expr: Literal | Token) {
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

export function isToken(expr: Expr) {
	return Object.keys(TokenType).includes(expr?.type);
}

export function mapToObject(obj: Map<Literal, Expr>, fn: (v: any) => any) {
	const isArray =
		obj.entries().next().value[0]?.value?.type === TokenType.index;
	const result = isArray ? [] : {};
	for (const [key, value] of obj) {
		const rKey = toRealValue(key);
		if (value instanceof Map) {
			if (Array.isArray(result)) {
				result.push(mapToObject(value, fn));
			} else {
				result[rKey.value ?? rKey] = mapToObject(value, fn);
			}
		} else {
			if (Array.isArray(result)) {
				result.push(fn(value));
			} else {
				result[rKey.value ?? rKey] = fn(value);
			}
		}
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
